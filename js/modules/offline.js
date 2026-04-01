/**
 * Offline Module - Europe Travel Guide
 * PWA registration and offline status management
 */

const OfflineModule = {
    state: {
        isOnline: navigator.onLine,
        isRegistered: false,
        syncPending: false
    },
    
    // ==================== 初始化 ====================
    
    async init() {
        console.log('[Offline] Initializing...');
        
        // 監聽網路狀態
        this.setupNetworkListeners();
        
        // 註冊 Service Worker
        await this.registerServiceWorker();
        
        // 初始化 IndexedDB
        await this.initDatabase();
        
        console.log('[Offline] Initialized. Online:', this.state.isOnline);
    },
    
    // ==================== Service Worker ====================
    
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[Offline] Service Worker not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('[Offline] Service Worker registered:', registration.scope);
            
            this.state.isRegistered = true;
            
            // 監聽更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[Offline] Service Worker update found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 有新版本可用
                        console.log('[Offline] New version available');
                        this.showUpdateNotification();
                    }
                });
            });
            
            // 監聽訊息
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data === 'SW_ACTIVATED') {
                    console.log('[Offline] Service Worker activated');
                }
            });
            
        } catch (error) {
            console.error('[Offline] Service Worker registration failed:', error);
        }
    },
    
    // ==================== 資料庫初始化 ====================
    
    async initDatabase() {
        try {
            // 初始化 IndexedDB
            await travelDB.init();
            
            // 載入初始資料
            await travelDB.initializeData();
            
            console.log('[Offline] Database ready');
        } catch (error) {
            console.error('[Offline] Database initialization failed:', error);
        }
    },
    
    // ==================== 網路監聽 ====================
    
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('[Offline] Gone online');
            this.state.isOnline = true;
            this.onOnline();
        });
        
        window.addEventListener('offline', () => {
            console.log('[Offline] Gone offline');
            this.state.isOnline = false;
            this.onOffline();
        });
    },
    
    onOnline() {
        // 同步資料
        this.syncData();
        
        // 顯示通知
        this.showStatusNotification('已連線', '資料將自動同步');
        
        // 觸發事件
        window.dispatchEvent(new CustomEvent('network:online'));
    },
    
    onOffline() {
        // 顯示通知
        this.showStatusNotification('離線模式', '部分功能可能無法使用');
        
        // 觸發事件
        window.dispatchEvent(new CustomEvent('network:offline'));
    },
    
    // ==================== 資料同步 ====================
    
    async syncData() {
        if (this.state.syncPending) return;
        
        this.state.syncPending = true;
        console.log('[Offline] Syncing data...');
        
        try {
            // 同步收藏
            await this.syncFavorites();
            
            // 同步提醒
            await this.syncReminders();
            
            // 同步使用者狀態
            await this.syncUserState();
            
            console.log('[Offline] Sync complete');
        } catch (error) {
            console.error('[Offline] Sync failed:', error);
        } finally {
            this.state.syncPending = false;
        }
    },
    
    async syncFavorites() {
        // 未來可實作與 Supabase 的同步
        // const favorites = await travelDB.getAllFavorites();
        // await supabaseClient.from('favorites').upsert(favorites);
    },
    
    async syncReminders() {
        // 同步提醒歷史
        // const history = await ReminderSystem.getReminderHistory();
        // await supabaseClient.from('reminders').upsert(history);
    },
    
    async syncUserState() {
        // 同步使用者狀態
        // const location = await travelDB.getLastLocation();
        // if (location) {
        //     await supabaseClient.from('user_locations').upsert(location);
        // }
    },
    
    // ==================== 通知 ====================
    
    showStatusNotification(title, message) {
        // 簡單的狀態通知
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.state.isOnline ? '🌐' : '📴'}</span>
                <div class="notification-text">
                    <strong>${title}</strong>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 動畫進入
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 自動關閉
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✨</span>
                <div class="notification-text">
                    <strong>有新版本</strong>
                    <span>點擊更新至最新版本</span>
                </div>
                <button class="notification-btn" onclick="OfflineModule.updateApp()">更新</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    },
    
    async updateApp() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // 發送訊息給 SW 跳過等待
            navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
            
            // 重新載入頁面
            window.location.reload();
        }
    },
    
    // ==================== 輔助方法 ====================
    
    isOnline() {
        return this.state.isOnline;
    },
    
    async checkConnectivity() {
        // 嘗試 ping 一個端點
        try {
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
};
