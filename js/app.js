/**
 * Europe Travel Guide v2.0
 * Mobile First | App-like Experience
 * Simple SPA Navigation
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
    currentPage: 'home',
    currentDay: 1,
    favorites: [],
    aiCardOpen: false
};

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = page;
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
}

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
            cityElement.textContent = todayData.route[todayData.route.length - 1] || '布達佩斯';
        }
        
        // Update AI guide content
        updateAiGuide(todayData);
        
        // Update next stop card
        updateNextStop(todayData);
    }
}

function updateAiGuide(dayData) {
    // Simple AI suggestions based on day
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
    // Find next attraction
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
    // Simple logic: compare with current time
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const activityTime = new Date();
    activityTime.setHours(hours, minutes, 0);
    
    // Add 1 hour buffer for "active" status
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
    // Default durations based on type
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
    // For now, just log. In Phase 2, this can open a modal
    console.log('Activity clicked:', day, activityIndex);
}

// ============================================
// ATTRACTIONS LIST PAGE
// ============================================
let currentFilter = 'all';

function loadAttractionsList() {
    const container = document.getElementById('attractions-list');
    if (!container) return;
    
    // Filter attractions
    const filtered = currentFilter === 'all' 
        ? ATTRACTIONS_DATA 
        : ATTRACTIONS_DATA.filter(a => a.country === currentFilter);
    
    // Generate list
    let html = '';
    filtered.forEach(attraction => {
        html += `
            <div class="attraction-item" onclick="showAttractionDetail('${attraction.id}')"
            >
                <div class="attraction-thumb">${attraction.icon}</div>
                <div class="attraction-info">
                    <h3>${attraction.name}</h3>
                    <p>${truncateText(attraction.description, 40)}</p>
                    <span class="location">📍 ${attraction.city}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-message">此分類暫無景點</p>';
}

// Filter chip click handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-chip')) {
        // Update active state
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Update filter and reload
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
    
    // Populate detail page
    document.getElementById('attraction-country').textContent = getCountryName(attraction.country);
    document.getElementById('attraction-name').textContent = attraction.name;
    document.getElementById('attraction-tagline').textContent = attraction.description;
    document.getElementById('attraction-duration').textContent = `建議停留 ${attraction.tips?.duration || '1-2小時'}`;
    
    // Hero icon
    const heroPlaceholder = document.querySelector('.hero-placeholder');
    if (heroPlaceholder) {
        heroPlaceholder.textContent = attraction.icon;
    }
    
    // Highlights
    const highlightsList = document.getElementById('attraction-highlights');
    if (highlightsList && attraction.highlights) {
        highlightsList.innerHTML = attraction.highlights
            .slice(0, 3)
            .map(h => `<li>${h}</li>`)
            .join('');
    }
    
    // Best experience
    const experienceEl = document.getElementById('attraction-experience');
    if (experienceEl && attraction.secrets?.localTips) {
        experienceEl.textContent = attraction.secrets.localTips[0] || attraction.description;
    }
    
    // Tips
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
    
    // Photo guide
    const photoList = document.getElementById('attraction-photos');
    if (photoList && attraction.secrets?.photoGuide) {
        photoList.innerHTML = attraction.secrets.photoGuide
            .map(p => `<li>${p.replace(/^📷\s*/, '')}</li>`)
            .join('');
    }
    
    // Navigate to detail page
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
    
    // Local time
    const localTimeStr = now.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    // Taipei time
    const taipeiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
    const taipeiTimeStr = taipeiTime.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    // Update display
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialize time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    
    // Load initial page data
    loadHomeData();
    
    console.log('✨ Europe Travel Guide v2.0 loaded');
});

// Handle browser back button
window.addEventListener('popstate', function(e) {
    // Simple back handling - go to home if not already there
    if (AppState.currentPage !== 'home') {
        navigateTo('home');
    }
});
