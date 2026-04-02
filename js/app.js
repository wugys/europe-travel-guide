/**
 * Europe Travel Guide v3.0 Batch 2
 * TravelMind AI - 隨行智遊
 * PWA + Offline + GPS + AI Guide + Trip Planner + Content Engine
 * Build: 2026-04-02-v3.0.1
 */

// ============================================
// EMERGENCY FALLBACK - Must work even if everything else fails
// ============================================
window.navigateTo = function(page) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    var target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        document.title = 'TravelMind AI | ' + page;
    }
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
        if (navItems[i].dataset.page === page) {
            navItems[i].classList.add('active');
        }
    }
};

window.toggleAiCard = function() {
    var card = document.getElementById('ai-card-popup');
    if (card) {
        card.style.display = card.style.display === 'block' ? 'none' : 'block';
    }
};

window.speakAIGuide = function() {
    if (window.speechSynthesis) {
        var msg = new SpeechSynthesisUtterance('AI導遊建議');
        msg.lang = 'zh-TW';
        window.speechSynthesis.speak(msg);
    }
};

// ============================================
// DEBUG MODE & VERSION
// ============================================
window.APP_DEBUG = true;
window.APP_VERSION = 'v3.0.1';
window.BUILD_TIME = '2026-04-02-1830';

console.log('[APP] ====== STARTING ======');
console.log('[APP] Version:', window.APP_VERSION);
console.log('[APP] Build:', window.BUILD_TIME);

// ============================================
// GLOBAL ERROR HANDLING
// ============================================
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('[Global Error]', msg, 'at', url + ':' + lineNo);
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('[Unhandled Promise Rejection]', event.reason);
});

// ============================================
// APP STATE
// ============================================
const AppState = {
    currentPage: 'home',
    currentDay: 1,
    currentCity: '布達佩斯',
    favorites: [],
    aiCardOpen: false,
    mapFollowUser: false,
    remindersEnabled: true,
    aiSuggestion: null,
    initialized: false
};

// 常數
const STORES = {
    ATTRACTIONS: 'attractions',
    ITINERARY: 'itinerary',
    FAVORITES: 'favorites',
    REMINDERS: 'reminders',
    USER_STATE: 'userState',
    OFFLINE_TILES: 'offlineTiles'
};

// ============================================
// DOM READY GUARANTEE
// ============================================
function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    console.log('[Navigate] Navigating to:', page);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = page;
    } else {
        console.error('[Navigate] Page not found:', `page-${page}`);
        return;
    }
    
    // Update bottom nav
    updateBottomNav(page);
    
    // Close AI card if open
    if (AppState.aiCardOpen) {
        toggleAiCard();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Load page data
    loadPageData(page);
    
    // Special handling for map page
    if (page === 'map') {
        setTimeout(() => {
            if (typeof MapModule !== 'undefined' && MapModule.init) {
                MapModule.init('map-container');
            } else {
                console.error('[Navigate] MapModule not available');
            }
        }, 100);
    }
}

// Expose to global scope for HTML onclick handlers
window.navigateTo = navigateTo;

function updateBottomNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
}

// ============================================
// PAGE DATA LOADING
// ============================================
function loadPageData(page) {
    switch(page) {
        case 'home':
            loadHomeData();
            break;
        case 'today':
            loadTodayData();
            break;
        case 'attractions':
            loadAttractionsList();
            break;
        case 'favorites':
            loadFavoritesList();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// ============================================
// HOME PAGE
// ============================================
function loadHomeData() {
    // Get current trip day
    const today = new Date();
    const startDate = new Date(TRIP_INFO.startDate);
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    AppState.currentDay = Math.max(1, Math.min(diffDays, 10));
    
    // Update day badge
    const dayBadge = document.getElementById('current-day');
    if (dayBadge) {
        dayBadge.textContent = `Day ${AppState.currentDay}`;
    }
    
    // Get current city from itinerary
    const todayData = ITINERARY_DATA.find(d => d.day === AppState.currentDay);
    if (todayData) {
        const cityElement = document.getElementById('current-city');
        if (cityElement && todayData.route) {
            const city = todayData.route[todayData.route.length - 1] || '布達佩斯';
            cityElement.textContent = city;
            AppState.currentCity = city;
        }
        
        // Update AI guide content
        updateAiGuide(todayData);
        
        // Update next stop card
        updateNextStop(todayData);
    }
}

function updateAiGuide(dayData) {
    const suggestions = {
        morning: getMorningSuggestion(dayData),
        next: getNextSuggestion(dayData),
        reminder: getReminder(dayData)
    };
    
    // Update AI card popup content
    const popup = document.getElementById('ai-card-popup');
    if (popup) {
        const suggestionDivs = popup.querySelectorAll('.ai-suggestion');
        if (suggestionDivs[0]) {
            suggestionDivs[0].querySelector('p').textContent = suggestions.morning;
        }
        if (suggestionDivs[1]) {
            suggestionDivs[1].querySelector('p').textContent = suggestions.next;
        }
        if (suggestionDivs[2]) {
            suggestionDivs[2].querySelector('p').textContent = suggestions.reminder;
        }
    }
    
    // Update home page AI card
    const aiNow = document.querySelector('.ai-now');
    const aiNext = document.querySelector('.ai-next');
    const aiReminder = document.querySelector('.ai-reminder span:last-child');
    
    if (aiNow) aiNow.textContent = `現在：${suggestions.morning}`;
    if (aiNext) aiNext.textContent = `下一步：${suggestions.next}`;
    if (aiReminder) aiReminder.textContent = suggestions.reminder;
}

function getMorningSuggestion(dayData) {
    const firstActivity = dayData.activities?.[0];
    if (firstActivity) {
        return firstActivity.title;
    }
    return `今日行程：${dayData.title}`;
}

function getNextSuggestion(dayData) {
    const secondActivity = dayData.activities?.[1];
    if (secondActivity) {
        return `接下來：${secondActivity.title}`;
    }
    return '按照行程時間表進行';
}

function getReminder(dayData) {
    const reminders = [
        '記得攜帶護照和電子機票',
        '別忘了在機場換一點當地貨幣',
        '檢查相機電池是否充滿',
        '穿著舒適的鞋子，今天步行較多',
        '攜帶輕便雨具以備不時之需'
    ];
    return reminders[dayData.day % reminders.length];
}

function updateNextStop(dayData) {
    const attractionActivity = dayData.activities?.find(a => a.type === 'attraction');
    
    if (attractionActivity) {
        const timeEl = document.querySelector('.next-time');
        const titleEl = document.querySelector('.next-title');
        const descEl = document.querySelector('.next-desc');
        
        if (timeEl) timeEl.textContent = attractionActivity.time;
        if (titleEl) titleEl.textContent = attractionActivity.title;
        if (descEl) descEl.textContent = attractionActivity.desc || '';
    }
}

// ============================================
// TODAY PAGE - Timeline
// ============================================
function loadTodayData() {
    const container = document.getElementById('timeline-content');
    if (!container) return;
    
    const todayData = ITINERARY_DATA.find(d => d.day === AppState.currentDay);
    if (!todayData) {
        container.innerHTML = '<p class="empty-message">今日無行程資料</p>';
        return;
    }
    
    // Update header date
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
        dateEl.textContent = formatDate(todayData.date);
    }
    
    // Generate timeline cards
    let html = '';
    
    todayData.activities?.forEach((activity, index) => {
        const status = getActivityStatus(activity.time, index);
        
        html += `
            <div class="timeline-card ${status}" onclick="showActivityDetail(${AppState.currentDay}, ${index})"
                 data-activity-id="${index}"
            >
                <div class="time-badge">${activity.time}</div>
                <div class="card-content">
                    <div class="card-status ${status}">${getStatusText(status)}</div>
                    <h3 class="card-title">${activity.title}</h3>
                    <p class="card-summary">${activity.desc || ''}</p>
                    <div class="card-meta">
                        <span class="duration">${getDuration(activity)}</span>
                        ${activity.type ? `<span class="type">${getTypeLabel(activity.type)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-message">今日暫無活動安排</p>';
}

function getActivityStatus(timeStr, index) {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const activityTime = new Date();
    activityTime.setHours(hours, minutes, 0);
    
    const bufferTime = new Date(activityTime.getTime() + 60 * 60 * 1000);
    
    if (now > bufferTime) {
        return 'done';
    } else if (now >= activityTime && now <= bufferTime) {
        return 'active';
    }
    return 'pending';
}

function getStatusText(status) {
    const texts = {
        done: '已完成',
        active: '進行中',
        pending: '即將開始'
    };
    return texts[status] || '';
}

function getDuration(activity) {
    const durations = {
        transport: '1-2小時',
        attraction: '1-3小時',
        food: '1小時',
        shopping: '1-2小時'
    };
    return durations[activity.type] || '1小時';
}

function getTypeLabel(type) {
    const labels = {
        transport: '交通',
        attraction: '景點',
        food: '美食',
        shopping: '購物'
    };
    return labels[type] || type;
}

function showActivityDetail(day, activityIndex) {
    console.log('Activity clicked:', day, activityIndex);
    // Future: Show activity detail modal
}

// ============================================
// ATTRACTIONS LIST PAGE
// ============================================
let currentFilter = 'all';

function loadAttractionsList() {
    const container = document.getElementById('attractions-list');
    if (!container) return;
    
    const filtered = currentFilter === 'all' 
        ? ATTRACTIONS_DATA 
        : ATTRACTIONS_DATA.filter(a => a.country === currentFilter);
    
    let html = '';
    filtered.forEach(attraction => {
        html += `
            <div class="attraction-item" onclick="showAttractionDetail('${attraction.id}')">
                <div class="attraction-thumb">${attraction.icon}</div>
                <div class="attraction-info">
                    <h3>${attraction.name}</h3>
                    <p>${truncateText(attraction.description, 40)}</p>
                    <span class="location">📍 ${attraction.city}</span>
                </div>
                <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${attraction.id}')">
                    ${AppState.favorites.includes(attraction.id) ? '❤️' : '🤍'}
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-message">此分類暫無景點</p>';
}

// Filter chip click handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-chip')) {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        e.target.classList.add('active');
        
        currentFilter = e.target.dataset.filter;
        loadAttractionsList();
    }
});

// ============================================
// ATTRACTION DETAIL PAGE
// ============================================
function showAttractionDetail(attractionId) {
    const attraction = ATTRACTIONS_DATA.find(a => a.id === attractionId);
    if (!attraction) return;
    
    document.getElementById('attraction-country').textContent = getCountryName(attraction.country);
    document.getElementById('attraction-name').textContent = attraction.name;
    document.getElementById('attraction-tagline').textContent = attraction.description;
    document.getElementById('attraction-duration').textContent = `建議停留 ${attraction.tips?.duration || '1-2小時'}`;
    
    const heroPlaceholder = document.querySelector('.hero-placeholder');
    if (heroPlaceholder) {
        heroPlaceholder.textContent = attraction.icon;
    }
    
    const highlightsList = document.getElementById('attraction-highlights');
    if (highlightsList && attraction.highlights) {
        highlightsList.innerHTML = attraction.highlights
            .slice(0, 3)
            .map(h => `<li>${h}</li>`)
            .join('');
    }
    
    const experienceEl = document.getElementById('attraction-experience');
    if (experienceEl && attraction.secrets?.localTips) {
        experienceEl.textContent = attraction.secrets.localTips[0] || attraction.description;
    }
    
    const tipsGrid = document.getElementById('attraction-tips');
    if (tipsGrid && attraction.tips) {
        tipsGrid.innerHTML = `
            <div class="tip-item">
                <span class="tip-icon">🕐</span>
                <div class="tip-content">
                    <h4>最佳時間</h4>
                    <p>${attraction.tips.bestTime || '全日皆宜'}</p>
                </div>
            </div>
            <div class="tip-item">
                <span class="tip-icon">🎫</span>
                <div class="tip-content">
                    <h4>門票</h4>
                    <p>${attraction.tips.tickets || '免費'}</p>
                </div>
            </div>
        `;
    }
    
    const photoList = document.getElementById('attraction-photos');
    if (photoList && attraction.secrets?.photoGuide) {
        photoList.innerHTML = attraction.secrets.photoGuide
            .map(p => `<li>${p.replace(/^📷\s*/, '')}</li>`)
            .join('');
    }
    
    navigateTo('attraction-detail');
}

function getCountryName(code) {
    const names = {
        hungary: '匈牙利',
        slovakia: '斯洛伐克',
        austria: '奧地利',
        czech: '捷克',
        germany: '德國'
    };
    return names[code] || code;
}

// ============================================
// FAVORITES
// ============================================
async function toggleFavorite(attractionId) {
    const isFav = await travelDB.toggleFavorite(attractionId);
    
    if (isFav) {
        AppState.favorites.push(attractionId);
        ReminderSystem.triggerReminder({
            type: 'status',
            title: '已收藏',
            message: '景點已加入收藏清單',
            priority: 'low'
        });
    } else {
        AppState.favorites = AppState.favorites.filter(id => id !== attractionId);
    }
    
    // Refresh current page if needed
    if (AppState.currentPage === 'attractions') {
        loadAttractionsList();
    }
}

async function loadFavoritesList() {
    const container = document.querySelector('.favorites-list');
    if (!container) return;
    
    const favorites = await travelDB.getAllFavorites();
    AppState.favorites = favorites.map(f => f.attractionId);
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="favorites-empty">
                <div class="empty-icon">⭐</div>
                <h2>還沒有收藏</h2>
                <p>在景點頁面點擊愛心圖示即可收藏</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (const fav of favorites) {
        const attraction = ATTRACTIONS_DATA.find(a => a.id === fav.attractionId);
        if (attraction) {
            html += `
                <div class="attraction-item" onclick="showAttractionDetail('${attraction.id}')">
                    <div class="attraction-thumb">${attraction.icon}</div>
                    <div class="attraction-info">
                        <h3>${attraction.name}</h3>
                        <p>${truncateText(attraction.description, 40)}</p>
                        <span class="location">📍 ${attraction.city}</span>
                    </div>
                    <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${attraction.id}')">❤️</button>
                </div>
            `;
        }
    }
    container.innerHTML = html;
}

// ============================================
// SETTINGS
// ============================================
function loadSettingsData() {
    const networkStatus = document.getElementById('network-status');
    const gpsStatus = document.getElementById('gps-status');
    const syncStatus = document.getElementById('sync-status');
    
    if (networkStatus) {
        networkStatus.textContent = OfflineModule.isOnline() ? '已連線' : '離線模式';
        networkStatus.className = OfflineModule.isOnline() ? 'online' : 'offline';
    }
    
    if (gpsStatus) {
        gpsStatus.textContent = GPS.state.isTracking ? '定位中' : '未啟動';
    }
    
    if (syncStatus) {
        syncStatus.textContent = OfflineModule.isOnline() ? '同步完成' : '離線可用';
    }
}

// ============================================
// AI FAB & CARD
// ============================================
function toggleAiCard() {
    const popup = document.getElementById('ai-card-popup');
    if (!popup) return;
    
    AppState.aiCardOpen = !AppState.aiCardOpen;
    
    if (AppState.aiCardOpen) {
        popup.classList.add('show');
    } else {
        popup.classList.remove('show');
    }
}

// ============================================
// TIME DISPLAY
// ============================================
function updateTimeDisplay() {
    const now = new Date();
    
    const localTimeStr = now.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const taipeiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
    const taipeiTimeStr = taipeiTime.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const localEl = document.getElementById('local-time');
    const taipeiEl = document.getElementById('taipei-time');
    
    if (localEl) localEl.textContent = localTimeStr;
    if (taipeiEl) taipeiEl.textContent = taipeiTimeStr;
}

// ============================================
// UTILITIES
// ============================================
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✨ Europe Travel Guide v2.2 initializing...');
    
    try {
        // 1. Initialize offline module (PWA + Service Worker)
        if (typeof OfflineModule !== 'undefined') {
            await OfflineModule.init();
            console.log('✅ OfflineModule initialized');
        }
        
        // 2. Initialize database
        if (typeof travelDB !== 'undefined') {
            await travelDB.init();
            await travelDB.initializeData();
            console.log('✅ Database initialized');
        }
        
        // 3. Initialize AI Guide
        if (typeof AIGuide !== 'undefined') {
            await AIGuide.init();
            console.log('✅ AIGuide initialized');
        }
        
        // 4. Initialize AI Router (v3.0)
        if (typeof AIRouter !== 'undefined') {
            console.log('✅ AIRouter loaded');
        }
        
        // 5. Initialize time display
        if (typeof TimeModule !== 'undefined') {
            TimeModule.init();
            console.log('✅ TimeModule initialized');
        }
        
        // 6. Initialize GPS
        if (typeof GPS !== 'undefined') {
            await GPS.init();
            console.log('✅ GPS initialized');
        }
        
        // 7. Initialize reminders
        if (typeof ReminderSystem !== 'undefined') {
            await ReminderSystem.init();
            console.log('✅ ReminderSystem initialized');
        }
        
        // 8. Load favorites
        if (typeof travelDB !== 'undefined') {
            const favorites = await travelDB.getAllFavorites();
            AppState.favorites = favorites.map(f => f.attractionId);
            console.log('✅ Favorites loaded:', AppState.favorites.length);
        }
        
        // 9. Load initial page data
        loadHomeData();
        
        // 10. Start GPS tracking
        if (typeof GPS !== 'undefined') {
            GPS.startTracking();
        }
        
        // 11. Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // 12. Listen for AI suggestions
        window.addEventListener('ai:suggestion', (e) => {
            AppState.aiSuggestion = e.detail;
            updateAIGuideCard(e.detail);
        });
        
        // 13. Get initial AI suggestion
        if (typeof AIGuide !== 'undefined') {
            try {
                const initialSuggestion = await AIGuide.getCurrentSuggestion();
                updateAIGuideCard(initialSuggestion);
            } catch (e) {
                console.warn('Could not get initial AI suggestion:', e);
            }
        }
        
        // 14. Initialize i18n (v3.0)
        if (typeof i18n !== 'undefined') {
            await i18n.init();
            console.log('✅ i18n initialized');
        }
        
        // 15. Initialize User Profile (v3.0)
        if (typeof userProfile !== 'undefined') {
            await userProfile.init();
            console.log('✅ UserProfile initialized');
        }
        
        // 16. Initialize AI Router (v3.0)
        if (typeof AIRouter !== 'undefined') {
            await AIRouter.init();
            console.log('✅ AIRouter initialized');
            
            // Listen for AI responses
            window.addEventListener('ai:response', (e) => {
                console.log('[App] AI Response received:', e.detail);
                handleAIResponse(e.detail);
            });
            
            // Listen for AI errors
            window.addEventListener('ai:error', (e) => {
                console.error('[App] AI Error:', e.detail);
                showAIError(e.detail);
            });
        }
        
        // 17. Initialize enhanced AI Guide with LLM support
        initEnhancedAIGuide();
        
        // 18. Initialize Trip Planner (v3.0 Batch 2)
        if (typeof tripPlanner !== 'undefined') {
            tripPlanner.init();
            console.log('✅ TripPlanner initialized');
        }
        
        // 19. Initialize Content Engine (v3.0 Batch 2)
        if (typeof contentEngine !== 'undefined') {
            await contentEngine.init();
            console.log('✅ ContentEngine initialized');
        }
        
        // 20. Initialize CMS Admin (v3.0 Batch 2)
        if (typeof cmsAdmin !== 'undefined') {
            await cmsAdmin.init();
            console.log('✅ CMS Admin initialized');
        }
        
        AppState.initialized = true;
        console.log('✅ Europe Travel Guide v3.0 Batch 2 ready');
        
        // Bind bottom nav buttons explicitly
        bindBottomNavButtons();
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        // Even if some modules fail, we can still show the basic UI
        loadHomeData();
        // Still bind buttons even if init fails
        bindBottomNavButtons();
    }
});

/**
 * Bind bottom nav buttons - handles both click and touch
 */
function bindBottomNavButtons() {
    console.log('[App] Binding bottom nav buttons...');
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        const page = btn.dataset.page;
        if (!page) return;
        
        // Remove existing listeners to avoid duplicates
        btn.removeEventListener('click', handleNavClick);
        btn.removeEventListener('touchend', handleNavTouch);
        
        // Add click listener
        btn.addEventListener('click', handleNavClick);
        
        // Add touch listener for mobile
        btn.addEventListener('touchend', handleNavTouch);
        
        console.log(`[App] Bound nav button: ${page}`);
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const page = this.dataset.page;
    if (page) {
        console.log(`[App] Nav click: ${page}`);
        navigateTo(page);
    }
}

function handleNavTouch(e) {
    e.preventDefault();
    const page = this.dataset.page;
    if (page) {
        console.log(`[App] Nav touch: ${page}`);
        navigateTo(page);
    }
}

// Handle browser back button
window.addEventListener('popstate', function(e) {
    if (AppState.currentPage !== 'home') {
        navigateTo('home');
    }
});

// ============================================
// AI GUIDE UI UPDATES
// ============================================
function updateAIGuideCard(suggestion) {
    if (!suggestion) return;
    
    // Update home page AI card
    const aiNow = document.querySelector('.ai-now');
    const aiNext = document.querySelector('.ai-next');
    const aiWarning = document.querySelector('.ai-warning');
    const aiContact = document.querySelector('.ai-contact');
    
    if (aiNow) aiNow.textContent = suggestion.action || 'AI導遊計算中...';
    if (aiNext) aiNext.textContent = suggestion.next || '';
    
    // Show warning if exists
    if (aiWarning) {
        if (suggestion.warning) {
            aiWarning.style.display = 'flex';
            aiWarning.querySelector('span:last-child').textContent = suggestion.warning;
        } else {
            aiWarning.style.display = 'none';
        }
    }
    
    // Show contact status
    if (aiContact) {
        if (suggestion.contactTaiwan) {
            aiContact.style.display = 'flex';
            aiContact.querySelector('span:last-child').textContent = suggestion.contactTaiwan;
        } else {
            aiContact.style.display = 'none';
        }
    }
    
    // Update AI popup card
    const popup = document.getElementById('ai-card-popup');
    if (popup) {
        const suggestionDivs = popup.querySelectorAll('.ai-suggestion');
        if (suggestionDivs[0] && suggestion.action) {
            suggestionDivs[0].querySelector('p').textContent = suggestion.action;
        }
        if (suggestionDivs[1] && suggestion.next) {
            suggestionDivs[1].querySelector('p').textContent = suggestion.next;
        }
        if (suggestionDivs[2]) {
            const warningText = suggestion.warning || suggestion.alternative || '行程進行中';
            suggestionDivs[2].querySelector('p').textContent = warningText;
        }
        // Add contact info if available
        if (suggestionDivs[3] && suggestion.contactTaiwan) {
            suggestionDivs[3].querySelector('p').textContent = suggestion.contactTaiwan;
        }
    }
}

// Speak current AI suggestion
function speakAIGuide() {
    if (AIGuide && AIGuide.speakCurrentSuggestion) {
        AIGuide.speakCurrentSuggestion();
    }
}

// Mark activity as complete
async function completeActivity(activityId) {
    if (AIGuide && AIGuide.markActivityComplete) {
        await AIGuide.markActivityComplete(activityId);
        // Refresh suggestion
        const suggestion = await AIGuide.evaluateAndSuggest(true);
        updateAIGuideCard(suggestion);
    }
}

// ============================================
// AI ROUTER INTEGRATION (v3.0)
// ============================================
function initEnhancedAIGuide() {
    console.log('[App] Initializing enhanced AI Guide with LLM support...');
    
    // Override AIGuide to use LLM when available
    if (typeof AIGuide !== 'undefined' && typeof AIRouter !== 'undefined') {
        // Store original method
        AIGuide._originalEvaluate = AIGuide.evaluateAndSuggest;
        
        // Enhanced evaluation with LLM
        AIGuide.evaluateAndSuggest = async function(force = false) {
            // Check if user is premium and online
            const canUseLLM = userProfile?.isPremium?.() && navigator.onLine;
            
            if (canUseLLM && AIRouter?.canMakeRequest?.('guide')) {
                try {
                    // Build context for LLM
                    const context = this.buildContext();
                    const userPrefs = userProfile?.getAIContext?.() || {};
                    
                    // Call LLM via AIRouter
                    const response = await AIRouter.request('guide', {
                        context,
                        preferences: userPrefs,
                        language: i18n?.getCurrentLanguage?.() || 'zh-TW'
                    });
                    
                    if (response?.suggestion) {
                        // Update cache and broadcast
                        this.cacheSuggestion(response.suggestion);
                        this.broadcastSuggestion(response.suggestion);
                        return response.suggestion;
                    }
                } catch (error) {
                    console.warn('[AIGuide] LLM request failed, falling back to rule-based:', error);
                }
            }
            
            // Fallback to original rule-based method
            return this._originalEvaluate(force);
        };
    }
}

function handleAIResponse(response) {
    // Handle different AI task responses
    switch (response.task) {
        case 'guide':
            if (response.suggestion) {
                updateAIGuideCard(response.suggestion);
            }
            break;
        case 'planner':
            // Handle itinerary generation response
            if (response.itinerary) {
                showGeneratedItinerary(response.itinerary);
            }
            break;
        case 'chat':
            // Handle chat response
            if (response.message) {
                appendChatMessage(response.message, 'ai');
            }
            break;
        case 'content':
            // Handle content generation
            if (response.content) {
                updateAttractionContent(response.attractionId, response.content);
            }
            break;
    }
}

function showAIError(error) {
    // Show user-friendly error message
    const errorMessages = {
        'rate_limit': i18n?.t?.('errors.rateLimit') || '已達使用限制，請稍後再試',
        'network': i18n?.t?.('errors.networkError') || '網路連線異常',
        'offline': i18n?.t?.('errors.offlineMode') || '目前處於離線模式',
        'unauthorized': i18n?.t?.('errors.unauthorized') || '請先登入',
        'default': i18n?.t?.('errors.aiError') || 'AI 服務暫時無法使用'
    };
    
    const message = errorMessages[error.code] || errorMessages.default;
    showNotification(message, 'error');
}

function showGeneratedItinerary(itinerary) {
    // TODO: Implement itinerary display modal
    console.log('[App] Generated itinerary:', itinerary);
}

function appendChatMessage(message, sender) {
    // TODO: Implement chat UI
    console.log(`[App] Chat [${sender}]:`, message);
}

function updateAttractionContent(attractionId, content) {
    // Update attraction detail with generated content
    console.log('[App] Updated content for', attractionId);
}

function showNotification(message, type = 'info') {
    // Simple notification display
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// GLOBAL EXPORTS (for HTML onclick handlers)
// ============================================
window.toggleAiCard = toggleAiCard;
window.toggleFavorite = toggleFavorite;
window.speakAIGuide = speakAIGuide;
window.completeActivity = completeActivity;
window.updateBottomNav = updateBottomNav;
window.loadPageData = loadPageData;
window.bindBottomNavButtons = bindBottomNavButtons;
window.handleNavClick = handleNavClick;
window.handleNavTouch = handleNavTouch;
