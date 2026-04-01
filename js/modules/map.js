/**
 * Map Module - Europe Travel Guide
 * Leaflet + Offline Support
 */

const MapModule = {
    // 狀態
    state: {
        map: null,
        markers: [],
        userMarker: null,
        layers: {},
        isInitialized: false
    },
    
    // 設定
    config: {
        defaultZoom: 13,
        minZoom: 5,
        maxZoom: 18,
        offlineZoom: 15,  // 離線快取的最大縮放級別
        tileSize: 256
    },
    
    // 城市中心點
    cityCenters: {
        '布達佩斯': [47.4979, 19.0402],
        '布拉提斯拉瓦': [48.1435, 17.1090],
        '維也納': [48.2082, 16.3738],
        '布拉格': [50.0755, 14.4378],
        '庫倫洛夫': [48.8127, 14.3175],
        '薩爾斯堡': [47.8095, 13.0550],
        '哈修塔特': [47.5622, 13.6493],
        '國王湖': [47.5916, 12.9848],
        '慕尼黑': [48.1351, 11.5820]
    },
    
    // ==================== 初始化 ====================
    
    init(containerId) {
        if (this.state.isInitialized) {
            this.refresh();
            return;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Map] Container not found:', containerId);
            return;
        }
        
        console.log('[Map] Initializing...');
        
        // 取得目前城市
        const currentCity = AppState.currentCity || '布達佩斯';
        const center = this.cityCenters[currentCity] || this.cityCenters['布達佩斯'];
        
        // 建立地圖
        this.state.map = L.map(containerId, {
            zoomControl: false,
            attributionControl: false,
            minZoom: this.config.minZoom,
            maxZoom: this.config.maxZoom
        }).setView(center, this.config.defaultZoom);
        
        // 新增縮放控制到右下
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.state.map);
        
        // 新增底圖圖層
        this.addTileLayer();
        
        // 建立圖層群組
        this.state.layers = {
            attractions: L.layerGroup().addTo(this.state.map),
            favorites: L.layerGroup().addTo(this.state.map),
            today: L.layerGroup().addTo(this.state.map),
            user: L.layerGroup().addTo(this.state.map)
        };
        
        // 監聽 GPS 更新
        window.addEventListener('gps:position', (e) => {
            this.updateUserPosition(e.detail);
        });
        
        this.state.isInitialized = true;
        
        // 載入景點標記
        this.loadAttractionMarkers();
        
        console.log('[Map] Initialized');
    },
    
    // ==================== 底圖圖層 ====================
    
    addTileLayer() {
        // 嘗試多個圖磚來源，確保離線可用性
        const tileSources = [
            {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '© OpenStreetMap'
            },
            {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attribution: '© CARTO'
            }
        ];
        
        // 使用第一個來源
        const source = tileSources[0];
        
        L.tileLayer(source.url, {
            maxZoom: this.config.maxZoom,
            attribution: source.attribution,
            subdomains: 'abc'
        }).addTo(this.state.map);
    },
    
    // ==================== 使用者位置 ====================
    
    updateUserPosition(position) {
        const { latitude, longitude, accuracy } = position.coords;
        
        // 移除舊標記
        if (this.state.userMarker) {
            this.state.layers.user.removeLayer(this.state.userMarker);
        }
        
        // 建立使用者位置標記
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
                <div class="user-marker-inner">
                    <div class="user-marker-dot"></div>
                    <div class="user-marker-pulse"></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        this.state.userMarker = L.marker([latitude, longitude], {
            icon: userIcon,
            zIndexOffset: 1000
        }).addTo(this.state.layers.user);
        
        // 如果有準確度資訊，顯示圓圈
        if (accuracy) {
            const accuracyCircle = L.circle([latitude, longitude], {
                radius: accuracy,
                fillColor: '#4ECDC4',
                fillOpacity: 0.1,
                color: '#4ECDC4',
                weight: 1
            }).addTo(this.state.layers.user);
        }
        
        // 如果追蹤模式開啟，跟隨地圖
        if (AppState.mapFollowUser) {
            this.state.map.panTo([latitude, longitude]);
        }
    },
    
    // ==================== 景點標記 ====================
    
    async loadAttractionMarkers() {
        // 從 IndexedDB 取得景點
        const attractions = await travelDB.getAll(STORES.ATTRACTIONS);
        
        attractions.forEach(attraction => {
            if (!attraction.lat || !attraction.lng) return;
            
            const marker = this.createAttractionMarker(attraction);
            marker.addTo(this.state.layers.attractions);
        });
        
        // 載入今日行程景點
        this.loadTodayMarkers();
    },
    
    async loadTodayMarkers() {
        const todayData = ITINERARY_DATA.find(d => d.day === AppState.currentDay);
        if (!todayData) return;
        
        // 找出今日景點活動
        const attractionActivities = todayData.activities?.filter(a => a.type === 'attraction');
        
        for (const activity of attractionActivities || []) {
            // 根據活動標題找對應景點
            const attraction = ATTRACTIONS_DATA.find(a => 
                activity.title.includes(a.name) || a.name.includes(activity.title)
            );
            
            if (attraction && attraction.lat && attraction.lng) {
                const marker = this.createAttractionMarker(attraction, true);
                marker.addTo(this.state.layers.today);
            }
        }
    },
    
    createAttractionMarker(attraction, isToday = false) {
        const iconClass = isToday ? 'marker-today' : 'marker-default';
        const size = isToday ? 36 : 28;
        
        const icon = L.divIcon({
            className: `attraction-marker ${iconClass}`,
            html: `
                <div class="marker-container"
                     style="width:${size}px;height:${size}px;"
                >
                    <span class="marker-icon">${attraction.icon || '📍'}</span>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
            popupAnchor: [0, -size]
        });
        
        const marker = L.marker([attraction.lat, attraction.lng], { icon });
        
        // 建立 Popup 內容
        const popupContent = this.createPopupContent(attraction);
        marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'attraction-popup'
        });
        
        // 點擊事件
        marker.on('click', () => {
            this.onMarkerClick(attraction);
        });
        
        return marker;
    },
    
    createPopupContent(attraction) {
        return `
            <div class="map-popup">
                <div class="popup-icon">${attraction.icon}</div>
                <h3>${attraction.name}</h3>
                <p class="popup-city">📍 ${attraction.city}</p>
                <p class="popup-desc">${attraction.description?.substring(0, 60)}...</p>
                ${attraction.tips?.duration ? `<p class="popup-duration">⏱ ${attraction.tips.duration}</p>` : ''}
                <button class="popup-btn" onclick="MapModule.openAttractionDetail('${attraction.id}')"
                >
                    查看詳情
                </button>
            </div>
        `;
    },
    
    // ==================== 圖層控制 ====================
    
    showLayer(layerName) {
        if (this.state.layers[layerName]) {
            this.state.map.addLayer(this.state.layers[layerName]);
        }
    },
    
    hideLayer(layerName) {
        if (this.state.layers[layerName]) {
            this.state.map.removeLayer(this.state.layers[layerName]);
        }
    },
    
    toggleLayer(layerName) {
        if (this.state.map.hasLayer(this.state.layers[layerName])) {
            this.hideLayer(layerName);
        } else {
            this.showLayer(layerName);
        }
    },
    
    // ==================== 導航功能 ====================
    
    flyToAttraction(attractionId) {
        travelDB.get(STORES.ATTRACTIONS, attractionId).then(attraction => {
            if (attraction && attraction.lat && attraction.lng) {
                this.state.map.flyTo([attraction.lat, attraction.lng], 16, {
                    duration: 1.5
                });
                
                // 找到對應標記並打開 popup
                this.state.layers.attractions.eachLayer(layer => {
                    const latLng = layer.getLatLng();
                    if (Math.abs(latLng.lat - attraction.lat) < 0.0001 &&
                        Math.abs(latLng.lng - attraction.lng) < 0.0001) {
                        layer.openPopup();
                    }
                });
            }
        });
    },
    
    flyToCity(cityName) {
        const center = this.cityCenters[cityName];
        if (center) {
            this.state.map.flyTo(center, 13, { duration: 1.5 });
        }
    },
    
    // ==================== 離線支援 ====================
    
    async cacheCurrentViewport() {
        if (!this.state.map) return;
        
        const bounds = this.state.map.getBounds();
        const zoom = this.state.map.getZoom();
        
        console.log('[Map] Caching viewport:', zoom, bounds.toBBoxString());
        
        // 儲存當前視圖設定
        await travelDB.setUserState('lastMapView', {
            bounds: bounds.toBBoxString(),
            zoom: zoom,
            city: AppState.currentCity,
            timestamp: new Date().toISOString()
        });
    },
    
    async restoreLastView() {
        const lastView = await travelDB.getUserState('lastMapView');
        if (lastView && this.state.map) {
            const city = lastView.city || '布達佩斯';
            this.flyToCity(city);
        }
    },
    
    // ==================== 事件處理 ====================
    
    onMarkerClick(attraction) {
        window.dispatchEvent(new CustomEvent('map:markerClick', {
            detail: attraction
        }));
    },
    
    openAttractionDetail(attractionId) {
        showAttractionDetail(attractionId);
    },
    
    // ==================== 輔助方法 ====================
    
    refresh() {
        if (this.state.map) {
            this.state.map.invalidateSize();
        }
    },
    
    destroy() {
        if (this.state.map) {
            this.state.map.remove();
            this.state.map = null;
            this.state.isInitialized = false;
        }
    },
    
    // 取得地圖實例（供外部使用）
    getMap() {
        return this.state.map;
    }
};
