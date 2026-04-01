/**
 * IndexedDB Module - Europe Travel Guide
 * Database: EuropeTravelDB
 * Version: 1
 */

const DB_NAME = 'EuropeTravelDB';
const DB_VERSION = 1;

// 資料表名稱
const STORES = {
    ATTRACTIONS: 'attractions',
    ITINERARY: 'itinerary',
    FAVORITES: 'favorites',
    REMINDERS: 'reminders',
    USER_STATE: 'userState',
    OFFLINE_TILES: 'offlineTiles'
};

// ==================== 初始化 ====================
class TravelDatabase {
    constructor() {
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => {
                console.error('[DB] Failed to open database');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[DB] Database opened successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('[DB] Upgrading database...');
                
                // 1. attractions - 景點資料
                if (!db.objectStoreNames.contains(STORES.ATTRACTIONS)) {
                    const attractionStore = db.createObjectStore(STORES.ATTRACTIONS, { keyPath: 'id' });
                    attractionStore.createIndex('country', 'country', { unique: false });
                    attractionStore.createIndex('city', 'city', { unique: false });
                    console.log('[DB] Created attractions store');
                }
                
                // 2. itinerary - 行程
                if (!db.objectStoreNames.contains(STORES.ITINERARY)) {
                    const itineraryStore = db.createObjectStore(STORES.ITINERARY, { keyPath: 'day' });
                    console.log('[DB] Created itinerary store');
                }
                
                // 3. favorites - 收藏
                if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
                    const favStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'attractionId' });
                    favStore.createIndex('dateAdded', 'dateAdded', { unique: false });
                    console.log('[DB] Created favorites store');
                }
                
                // 4. reminders - 提醒
                if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
                    const reminderStore = db.createObjectStore(STORES.REMINDERS, { keyPath: 'id', autoIncrement: true });
                    reminderStore.createIndex('time', 'time', { unique: false });
                    reminderStore.createIndex('type', 'type', { unique: false });
                    reminderStore.createIndex('triggered', 'triggered', { unique: false });
                    console.log('[DB] Created reminders store');
                }
                
                // 5. userState - 使用者狀態
                if (!db.objectStoreNames.contains(STORES.USER_STATE)) {
                    const stateStore = db.createObjectStore(STORES.USER_STATE, { keyPath: 'key' });
                    console.log('[DB] Created userState store');
                }
                
                // 6. offlineTiles - 離線地圖圖磚
                if (!db.objectStoreNames.contains(STORES.OFFLINE_TILES)) {
                    const tileStore = db.createObjectStore(STORES.OFFLINE_TILES, { keyPath: 'key' });
                    tileStore.createIndex('zoom', 'zoom', { unique: false });
                    console.log('[DB] Created offlineTiles store');
                }
            };
        });
    }
    
    // ==================== 通用 CRUD ====================
    
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // ==================== 景點操作 ====================
    
    async saveAttractions(attractions) {
        const transaction = this.db.transaction(STORES.ATTRACTIONS, 'readwrite');
        const store = transaction.objectStore(STORES.ATTRACTIONS);
        
        for (const attraction of attractions) {
            store.put(attraction);
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    async getAttractionsByCountry(country) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(STORES.ATTRACTIONS, 'readonly');
            const store = transaction.objectStore(STORES.ATTRACTIONS);
            const index = store.index('country');
            const request = index.getAll(country);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // ==================== 收藏操作 ====================
    
    async toggleFavorite(attractionId) {
        const existing = await this.get(STORES.FAVORITES, attractionId);
        
        if (existing) {
            await this.delete(STORES.FAVORITES, attractionId);
            return false; // 已取消收藏
        } else {
            await this.put(STORES.FAVORITES, {
                attractionId: attractionId,
                dateAdded: new Date().toISOString()
            });
            return true; // 已加入收藏
        }
    }
    
    async isFavorite(attractionId) {
        const result = await this.get(STORES.FAVORITES, attractionId);
        return !!result;
    }
    
    async getAllFavorites() {
        return this.getAll(STORES.FAVORITES);
    }
    
    // ==================== 提醒操作 ====================
    
    async addReminder(reminder) {
        const data = {
            ...reminder,
            createdAt: new Date().toISOString(),
            triggered: false
        };
        return this.put(STORES.REMINDERS, data);
    }
    
    async getPendingReminders() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(STORES.REMINDERS, 'readonly');
            const store = transaction.objectStore(STORES.REMINDERS);
            const index = store.index('triggered');
            const request = index.getAll(false);
            
            request.onsuccess = () => {
                const now = new Date();
                const pending = request.result.filter(r => new Date(r.time) > now);
                resolve(pending);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async markReminderTriggered(id) {
        const reminder = await this.get(STORES.REMINDERS, id);
        if (reminder) {
            reminder.triggered = true;
            reminder.triggeredAt = new Date().toISOString();
            await this.put(STORES.REMINDERS, reminder);
        }
    }
    
    // ==================== 使用者狀態 ====================
    
    async setUserState(key, value) {
        await this.put(STORES.USER_STATE, { key, value, updatedAt: new Date().toISOString() });
    }
    
    async getUserState(key, defaultValue = null) {
        const result = await this.get(STORES.USER_STATE, key);
        return result ? result.value : defaultValue;
    }
    
    // GPS 位置
    async saveLocation(lat, lng, accuracy = null) {
        await this.setUserState('lastLocation', {
            lat, lng, accuracy,
            timestamp: new Date().toISOString()
        });
    }
    
    async getLastLocation() {
        return this.getUserState('lastLocation', null);
    }
    
    // 當前城市
    async setCurrentCity(city) {
        await this.setUserState('currentCity', city);
    }
    
    async getCurrentCity() {
        return this.getUserState('currentCity', '布達佩斯');
    }
    
    // ==================== 資料初始化 ====================
    
    async initializeData() {
        console.log('[DB] Initializing data from JS files...');
        
        // 檢查是否已有資料
        const existing = await this.getAll(STORES.ATTRACTIONS);
        if (existing.length > 0) {
            console.log('[DB] Data already exists, skipping initialization');
            return;
        }
        
        // 從全域變數載入資料
        if (typeof ATTRACTIONS_DATA !== 'undefined') {
            await this.saveAttractions(ATTRACTIONS_DATA);
            console.log(`[DB] Saved ${ATTRACTIONS_DATA.length} attractions`);
        }
        
        if (typeof ITINERARY_DATA !== 'undefined') {
            for (const day of ITINERARY_DATA) {
                await this.put(STORES.ITINERARY, day);
            }
            console.log(`[DB] Saved ${ITINERARY_DATA.length} itinerary days`);
        }
        
        console.log('[DB] Data initialization complete');
    }
    
    // ==================== 離線圖磚 ====================
    
    async saveTile(key, blob) {
        await this.put(STORES.OFFLINE_TILES, { key, blob, savedAt: new Date().toISOString() });
    }
    
    async getTile(key) {
        const result = await this.get(STORES.OFFLINE_TILES, key);
        return result ? result.blob : null;
    }
}

// 建立全域實例
const travelDB = new TravelDatabase();
