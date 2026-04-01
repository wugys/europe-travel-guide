/**
 * Europe Travel Guide - Supabase Database Module
 * 使用 Supabase JavaScript Client 連接資料庫
 * 
 * 設定方式:
 * 1. 在 Supabase (https://supabase.com) 建立專案
 * 2. 執行 supabase/schema.sql 和 supabase/seed.sql 建立資料表
 * 3. 將下方的 YOUR_PROJECT_ID 和 YOUR_ANON_KEY 替換為你的 Supabase 資訊
 */

// ============================================
// Supabase 設定 - europe-travel 專案
// ============================================
const SUPABASE_URL = 'https://xbwibudbaqhxbuyjhouc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzI3ODQsImV4cCI6MjA5MDU0ODc4NH0.dPvnWaDrA0vJaR5rd6uuzEYbXSXyNjTi0GJMjke1Gr8';
// ============================================

// 全域 Supabase 客戶端 - 使用不同名稱避免衝突
let supabaseClient = null;

// 是否啟用 Supabase（設為 false 可強制使用本地資料）
const ENABLE_SUPABASE = true;

// 快取資料
const DataCache = {
    tripInfo: null,
    flights: { outbound: [], return: [] },
    itineraryDays: [],
    attractions: [],
    tipCategories: [],
    checklistCategories: [],
    lastFetch: null
};

// 快取有效期（毫秒）
const CACHE_TTL = 5 * 60 * 1000; // 5 分鐘

/**
 * 初始化 Supabase 連線
 */
function initSupabase() {
    // 檢查是否啟用 Supabase
    if (!ENABLE_SUPABASE) {
        console.log('Supabase disabled, using local data');
        return false;
    }
    
    // 檢查是否已經載入 Supabase JS 庫
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase library not loaded');
        return false;
    }
    
    // 檢查是否已設定正確的 URL
    if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
        console.warn('Supabase URL not configured, using local data');
        return false;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

/**
 * 檢查快取是否有效
 */
function isCacheValid() {
    if (!DataCache.lastFetch) return false;
    const now = Date.now();
    return (now - DataCache.lastFetch) < CACHE_TTL;
}

/**
 * 載入所有行程資料
 */
async function loadAllData() {
    // 如果快取有效，直接返回
    if (isCacheValid() && DataCache.tripInfo) {
        console.log('Using cached data');
        return DataCache;
    }
    
    // 檢查 supabaseClient 是否已初始化
    if (!supabaseClient) {
        console.warn('Supabase client not initialized, using local data');
        return loadLocalData();
    }
    
    try {
        // 載入行程基本資訊
        const { data: tripInfo, error: tripError } = await supabaseClient
            .from('trip_info')
            .select('*')
            .single();
        
        if (tripError) throw tripError;
        DataCache.tripInfo = tripInfo;
        
        // 載入航班資訊
        const { data: flights, error: flightError } = await supabaseClient
            .from('flights')
            .select('*')
            .eq('trip_id', tripInfo.id)
            .order('display_order');
        
        if (flightError) throw flightError;
        DataCache.flights.outbound = flights.filter(f => f.flight_type === 'outbound');
        DataCache.flights.return = flights.filter(f => f.flight_type === 'return');
        
        // 載入每日行程
        const { data: days, error: daysError } = await supabaseClient
            .from('itinerary_days')
            .select('*')
            .eq('trip_id', tripInfo.id)
            .order('day_number');
        
        if (daysError) throw daysError;
        
        // 載入每日活動
        for (const day of days) {
            const { data: activities, error: actError } = await supabaseClient
                .from('activities')
                .select('*')
                .eq('day_id', day.id)
                .order('display_order');
            
            if (actError) throw actError;
            day.activities = activities || [];
            
            // 格式化餐食資訊
            day.meals = {
                breakfast: day.breakfast,
                lunch: day.lunch,
                dinner: day.dinner
            };
            
            // 格式化飯店資訊
            if (day.hotel_name) {
                day.hotelInfo = {
                    name: day.hotel_name,
                    address: day.hotel_address,
                    phone: day.hotel_phone
                };
            }
        }
        
        DataCache.itineraryDays = days;
        
        // 載入景點資訊
        const { data: attractions, error: attrError } = await supabaseClient
            .from('attractions')
            .select('*')
            .order('name');
        
        if (attrError) throw attrError;
        DataCache.attractions = attractions;
        
        // 載入提醒分類
        const { data: tipCats, error: tipCatError } = await supabaseClient
            .from('tip_categories')
            .select('*')
            .order('display_order');
        
        if (tipCatError) throw tipCatError;
        
        // 載入提醒項目
        for (const cat of tipCats) {
            const { data: items, error: itemsError } = await supabaseClient
                .from('tip_items')
                .select('*')
                .eq('category_id', cat.id)
                .order('display_order');
            
            if (itemsError) throw itemsError;
            cat.items = items || [];
        }
        
        DataCache.tipCategories = tipCats;
        
        // 載入清單分類
        const { data: checkCats, error: checkCatError } = await supabaseClient
            .from('checklist_categories')
            .select('*')
            .order('display_order');
        
        if (checkCatError) throw checkCatError;
        
        // 載入清單項目
        for (const cat of checkCats) {
            const { data: items, error: itemsError } = await supabaseClient
                .from('checklist_items')
                .select('*')
                .eq('category_id', cat.id)
                .order('display_order');
            
            if (itemsError) throw itemsError;
            cat.items = items || [];
        }
        
        DataCache.checklistCategories = checkCats;
        DataCache.lastFetch = Date.now();
        
        console.log('All data loaded from Supabase');
        return DataCache;
        
    } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // 如果載入失敗，嘗試使用本地資料
        return loadLocalData();
    }
}

/**
 * 如果 Supabase 載入失敗，回退到本地資料
 */
function loadLocalData() {
    console.log('Falling back to local data');
    
    DataCache.tripInfo = {
        name: TRIP_INFO.name,
        subtitle: TRIP_INFO.subtitle,
        start_date: TRIP_INFO.startDate,
        end_date: TRIP_INFO.endDate,
        duration: TRIP_INFO.duration,
        leader_name: TRIP_INFO.leader.name,
        leader_phone: TRIP_INFO.leader.phone,
        countries: TRIP_INFO.countries,
        cities: TRIP_INFO.cities
    };
    
    DataCache.flights = FLIGHT_INFO;
    DataCache.itineraryDays = ITINERARY_DATA;
    DataCache.attractions = ATTRACTIONS_DATA;
    
    // 轉換本地提示資料
    const tipCategories = [];
    for (const [key, value] of Object.entries(TRAVEL_TIPS)) {
        tipCategories.push({
            category_key: key,
            title: value.title,
            icon: value.icon,
            items: value.items.map(item => ({
                subcategory: item.category,
                tip_text: item.tips
            }))
        });
    }
    DataCache.tipCategories = tipCategories;
    
    // 轉換本地清單資料
    const checklistCategories = [];
    for (const [key, value] of Object.entries(CHECKLIST_DATA)) {
        checklistCategories.push({
            category_key: key,
            title: value.title,
            items: value.items
        });
    }
    DataCache.checklistCategories = checklistCategories;
    
    // 設定快取時間，避免重複載入
    DataCache.lastFetch = Date.now();
    
    return DataCache;
}

/**
 * 取得今日行程
 */
async function getTodayItinerary() {
    const data = await loadAllData();
    const today = new Date().toISOString().split('T')[0];
    
    const todayData = data.itineraryDays.find(day => day.date === today);
    
    if (todayData) {
        return todayData;
    }
    
    // 檢查是否在行程前
    const startDate = new Date(data.tripInfo.start_date);
    const todayDate = new Date(today);
    
    if (todayDate < startDate) {
        const diffTime = startDate - todayDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            isBeforeTrip: true,
            message: `🎒 旅行尚未開始！還有 ${diffDays} 天就要出發了，準備好了嗎？`
        };
    }
    
    // 檢查是否在行程後
    const endDate = new Date(data.tripInfo.end_date);
    if (todayDate > endDate) {
        return {
            isAfterTrip: true,
            message: '🏠 旅行已經結束了！希望這趟旅程留下了美好的回憶。'
        };
    }
    
    return null;
}

/**
 * 搜尋景點
 */
async function searchAttractions(keyword) {
    const data = await loadAllData();
    
    if (!keyword) return data.attractions;
    
    const lowerKeyword = keyword.toLowerCase();
    return data.attractions.filter(attraction => 
        attraction.name.toLowerCase().includes(lowerKeyword) ||
        attraction.city.toLowerCase().includes(lowerKeyword) ||
        attraction.description.toLowerCase().includes(lowerKeyword)
    );
}

/**
 * 依國家篩選景點
 */
async function getAttractionsByCountry(country) {
    const data = await loadAllData();
    return data.attractions.filter(attraction => attraction.country === country);
}

/**
 * 更新清單項目勾選狀態
 */
async function updateChecklistStatus(itemId, checked) {
    const userId = getUserId();
    
    // 如果 supabaseClient 未初始化，直接儲存到本地
    if (!supabaseClient) {
        saveChecklistToLocal(itemId, checked);
        return false;
    }
    
    try {
        const { error } = await supabaseClient
            .from('user_checklist_status')
            .upsert({
                user_id: userId,
                item_id: itemId,
                checked: checked,
                checked_at: checked ? new Date().toISOString() : null
            });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating checklist status:', error);
        // 儲存到本地儲存空間
        saveChecklistToLocal(itemId, checked);
        return false;
    }
}

/**
 * 取得使用者勾選狀態
 */
async function getUserChecklistStatus() {
    const userId = getUserId();
    
    // 如果 supabaseClient 未初始化，直接返回本地資料
    if (!supabaseClient) {
        return getChecklistFromLocal();
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('user_checklist_status')
            .select('item_id, checked')
            .eq('user_id', userId);
        
        if (error) throw error;
        
        const statusMap = {};
        data.forEach(item => {
            statusMap[item.item_id] = item.checked;
        });
        
        return statusMap;
    } catch (error) {
        console.error('Error getting checklist status:', error);
        return getChecklistFromLocal();
    }
}

/**
 * 取得使用者 ID（使用裝置識別碼或產生新的）
 */
function getUserId() {
    let userId = localStorage.getItem('europe_travel_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('europe_travel_user_id', userId);
    }
    return userId;
}

/**
 * 儲存勾選狀態到本地
 */
function saveChecklistToLocal(itemId, checked) {
    const key = 'checklist_' + itemId;
    localStorage.setItem(key, checked ? 'true' : 'false');
}

/**
 * 從本地取得勾選狀態
 */
function getChecklistFromLocal() {
    const statusMap = {};
    const prefix = 'checklist_';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            const itemId = key.substring(prefix.length);
            statusMap[itemId] = localStorage.getItem(key) === 'true';
        }
    }
    
    return statusMap;
}

/**
 * 清除快取（用於強制重新載入）
 */
function clearCache() {
    DataCache.tripInfo = null;
    DataCache.flights = { outbound: [], return: [] };
    DataCache.itineraryDays = [];
    DataCache.attractions = [];
    DataCache.tipCategories = [];
    DataCache.checklistCategories = [];
    DataCache.lastFetch = null;
    console.log('Cache cleared');
}

/**
 * 檢查 Supabase 連線狀態
 */
async function checkSupabaseConnection() {
    if (!supabaseClient) {
        return { connected: false, error: 'Supabase not initialized' };
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('trip_info')
            .select('id')
            .limit(1);
        
        if (error) throw error;
        
        return { connected: true, data };
    } catch (error) {
        return { connected: false, error: error.message };
    }
}

// 匯出函式供全域使用
window.SupabaseDB = {
    init: initSupabase,
    loadAllData,
    getTodayItinerary,
    searchAttractions,
    getAttractionsByCountry,
    updateChecklistStatus,
    getUserChecklistStatus,
    clearCache,
    checkConnection: checkSupabaseConnection,
    get cache() { return DataCache; }
};

console.log('Supabase DB Module loaded');
