/**
 * GPS Module - Europe Travel Guide
 * Location tracking and distance calculation
 */

const GPS = {
    // 設定
    config: {
        updateInterval: 30000,  // 30秒更新一次
        highAccuracy: true,
        maxAge: 60000,          // 1分鐘快取
        timeout: 10000          // 10秒超時
    },
    
    // 狀態
    state: {
        currentPosition: null,
        isTracking: false,
        watchId: null,
        lastUpdate: null,
        permission: 'prompt'    // 'granted' | 'denied' | 'prompt'
    },
    
    // 城市座標（用於判斷目前城市）
    cityCoordinates: {
        '布達佩斯': { lat: 47.4979, lng: 19.0402, country: 'hungary', timezone: 'Europe/Budapest' },
        '布拉提斯拉瓦': { lat: 48.1435, lng: 17.1090, country: 'slovakia', timezone: 'Europe/Bratislava' },
        '維也納': { lat: 48.2082, lng: 16.3738, country: 'austria', timezone: 'Europe/Vienna' },
        '布爾諾': { lat: 49.1951, lng: 16.6068, country: 'czech', timezone: 'Europe/Prague' },
        '布拉格': { lat: 50.0755, lng: 14.4378, country: 'czech', timezone: 'Europe/Prague' },
        '庫倫洛夫': { lat: 48.8127, lng: 14.3175, country: 'czech', timezone: 'Europe/Prague' },
        '薩爾斯堡': { lat: 47.8095, lng: 13.0550, country: 'austria', timezone: 'Europe/Vienna' },
        '哈修塔特': { lat: 47.5622, lng: 13.6493, country: 'austria', timezone: 'Europe/Vienna' },
        '國王湖': { lat: 47.5916, lng: 12.9848, country: 'germany', timezone: 'Europe/Berlin' },
        '慕尼黑': { lat: 48.1351, lng: 11.5820, country: 'germany', timezone: 'Europe/Berlin' }
    },
    
    // ==================== 初始化 ====================
    async init() {
        console.log('[GPS] Initializing...');
        
        // 檢查支援性
        if (!navigator.geolocation) {
            console.warn('[GPS] Geolocation not supported');
            return false;
        }
        
        // 檢查權限
        if (navigator.permissions) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                this.state.permission = result.state;
                
                result.addEventListener('change', () => {
                    this.state.permission = result.state;
                    console.log('[GPS] Permission changed:', result.state);
                });
            } catch (e) {
                console.warn('[GPS] Permission API not available');
            }
        }
        
        // 載入上次位置
        const lastLocation = await travelDB.getLastLocation();
        if (lastLocation) {
            this.state.currentPosition = {
                coords: {
                    latitude: lastLocation.lat,
                    longitude: lastLocation.lng,
                    accuracy: lastLocation.accuracy
                },
                timestamp: new Date(lastLocation.timestamp).getTime()
            };
        }
        
        console.log('[GPS] Initialized, permission:', this.state.permission);
        return true;
    },
    
    // ==================== 取得位置 ====================
    
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.state.currentPosition = position;
                    this.state.lastUpdate = new Date();
                    
                    // 儲存到 IndexedDB
                    travelDB.saveLocation(
                        position.coords.latitude,
                        position.coords.longitude,
                        position.coords.accuracy
                    );
                    
                    // 判斷目前城市
                    this.detectCurrentCity();
                    
                    resolve(position);
                },
                error => {
                    console.error('[GPS] Error:', error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: this.config.highAccuracy,
                    timeout: this.config.timeout,
                    maximumAge: this.config.maxAge
                }
            );
        });
    },
    
    // ==================== 持續追蹤 ====================
    
    startTracking() {
        if (this.state.isTracking) {
            console.log('[GPS] Already tracking');
            return;
        }
        
        console.log('[GPS] Starting tracking...');
        
        this.state.watchId = navigator.geolocation.watchPosition(
            position => {
                this.state.currentPosition = position;
                this.state.lastUpdate = new Date();
                
                // 儲存位置
                travelDB.saveLocation(
                    position.coords.latitude,
                    position.coords.longitude,
                    position.coords.accuracy
                );
                
                // 判斷城市
                this.detectCurrentCity();
                
                // 觸發事件
                this.onPositionUpdate(position);
            },
            error => {
                console.error('[GPS] Tracking error:', error.message);
            },
            {
                enableHighAccuracy: this.config.highAccuracy,
                timeout: this.config.timeout,
                maximumAge: this.config.maxAge
            }
        );
        
        this.state.isTracking = true;
    },
    
    stopTracking() {
        if (!this.state.isTracking) return;
        
        navigator.geolocation.clearWatch(this.state.watchId);
        this.state.watchId = null;
        this.state.isTracking = false;
        
        console.log('[GPS] Tracking stopped');
    },
    
    // ==================== 城市偵測 ====================
    
    detectCurrentCity() {
        if (!this.state.currentPosition) return;
        
        const { latitude, longitude } = this.state.currentPosition.coords;
        let closestCity = null;
        let minDistance = Infinity;
        
        for (const [cityName, coords] of Object.entries(this.cityCoordinates)) {
            const distance = this.calculateDistance(
                latitude, longitude,
                coords.lat, coords.lng
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestCity = cityName;
            }
        }
        
        // 如果距離小於 50km，判定為在該城市
        if (closestCity && minDistance < 50) {
            travelDB.setCurrentCity(closestCity);
            
            // 如果距離改變，觸發事件
            const lastCity = AppState.currentCity;
            if (lastCity !== closestCity) {
                AppState.currentCity = closestCity;
                this.onCityChange(closestCity, lastCity);
            }
        }
        
        return closestCity;
    },
    
    // ==================== 距離計算 ====================
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球半徑 (km)
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // 回傳公里
    },
    
    toRad(value) {
        return value * Math.PI / 180;
    },
    
    // ==================== 景點距離 ====================
    
    async getNearbyAttractions(radiusKm = 5) {
        if (!this.state.currentPosition) {
            await this.getCurrentPosition();
        }
        
        const { latitude, longitude } = this.state.currentPosition.coords;
        
        // 從 IndexedDB 取得所有景點
        const attractions = await travelDB.getAll(STORES.ATTRACTIONS);
        
        const nearby = attractions
            .map(attraction => {
                if (!attraction.lat || !attraction.lng) return null;
                
                const distance = this.calculateDistance(
                    latitude, longitude,
                    attraction.lat, attraction.lng
                );
                
                return {
                    ...attraction,
                    distance: distance,
                    distanceText: this.formatDistance(distance)
                };
            })
            .filter(a => a && a.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
        
        return nearby;
    },
    
    formatDistance(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        }
        return `${Math.round(km * 10) / 10}km`;
    },
    
    // ==================== 到達判斷 ====================
    
    async checkArrivals() {
        const nearby = await this.getNearbyAttractions(0.5); // 500m 範圍
        
        for (const attraction of nearby) {
            // 檢查是否已經觸發過
            const triggered = await travelDB.getUserState(`arrived_${attraction.id}`, false);
            
            if (!triggered) {
                // 標記為已到達
                await travelDB.setUserState(`arrived_${attraction.id}`, true);
                
                // 觸發到達事件
                this.onArrival(attraction);
            }
        }
        
        return nearby;
    },
    
    // ==================== 事件回調 ====================
    
    onPositionUpdate(position) {
        // 發布事件供其他模組監聽
        window.dispatchEvent(new CustomEvent('gps:position', {
            detail: position
        }));
        
        console.log('[GPS] Position updated:', 
            position.coords.latitude.toFixed(4),
            position.coords.longitude.toFixed(4)
        );
    },
    
    onCityChange(newCity, oldCity) {
        window.dispatchEvent(new CustomEvent('gps:cityChange', {
            detail: { newCity, oldCity }
        }));
        
        console.log('[GPS] City changed:', oldCity, '->', newCity);
    },
    
    onArrival(attraction) {
        window.dispatchEvent(new CustomEvent('gps:arrival', {
            detail: attraction
        }));
        
        console.log('[GPS] Arrived at:', attraction.name);
    },
    
    // ==================== 取得時區 ====================
    
    getCurrentTimezone() {
        const city = AppState.currentCity || '布達佩斯';
        const cityData = this.cityCoordinates[city];
        return cityData?.timezone || 'Europe/Budapest';
    },
    
    // ==================== 輔助方法 ====================
    
    getCurrentPositionSync() {
        return this.state.currentPosition;
    },
    
    isInCity() {
        if (!this.state.currentPosition) return false;
        
        const city = AppState.currentCity;
        if (!city || !this.cityCoordinates[city]) return false;
        
        const { latitude, longitude } = this.state.currentPosition.coords;
        const cityCoords = this.cityCoordinates[city];
        
        const distance = this.calculateDistance(
            latitude, longitude,
            cityCoords.lat, cityCoords.lng
        );
        
        return distance < 20; // 20km 內視為在該城市
    }
};

// 暴露到全域
window.GPS = GPS;
