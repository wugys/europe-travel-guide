/**
 * 歐洲旅行導遊 - 主要應用程式 (Supabase 版本)
 */

// 全局狀態
const AppState = {
    currentView: 'today',
    checklistProgress: {},
    isOffline: false,
    dataLoaded: false
};

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // 設定日期顯示
    updateDateDisplay();
    
    // 載入航班資訊
    await loadFlightInfo();
    
    // 載入每日行程
    await loadTodayItinerary();
    
    // 載入完整行程
    await loadFullItinerary();
    
    // 載入景點
    await loadAttractions();
    
    // 載入提醒
    await loadTips();
    
    // 載入清單
    await loadChecklist();
    
    // 設定事件監聽
    setupEventListeners();
    
    // 檢查網路狀態
    checkOnlineStatus();
    
    AppState.dataLoaded = true;
}

// 載入航班資訊
async function loadFlightInfo() {
    const outboundContainer = document.getElementById('outbound-flights');
    const returnContainer = document.getElementById('return-flights');
    
    if (!outboundContainer || !returnContainer) return;
    
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB && window.SupabaseDB.cache.tripInfo) {
            const flights = window.SupabaseDB.cache.flights;
            
            let outboundHtml = '';
            flights.outbound.forEach(flight => {
                outboundHtml += renderFlightItem(flight);
            });
            outboundContainer.innerHTML = outboundHtml;
            
            let returnHtml = '';
            flights.return.forEach(flight => {
                returnHtml += renderFlightItem(flight);
            });
            returnContainer.innerHTML = returnHtml;
        } else {
            // 使用本地資料
            let outboundHtml = '';
            FLIGHT_INFO.outbound.forEach(flight => {
                outboundHtml += renderFlightItem(flight);
            });
            outboundContainer.innerHTML = outboundHtml;
            
            let returnHtml = '';
            FLIGHT_INFO.return.forEach(flight => {
                returnHtml += renderFlightItem(flight);
            });
            returnContainer.innerHTML = returnHtml;
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        // 使用本地資料作為備援
        let outboundHtml = '';
        FLIGHT_INFO.outbound.forEach(flight => {
            outboundHtml += renderFlightItem(flight);
        });
        outboundContainer.innerHTML = outboundHtml;
        
        let returnHtml = '';
        FLIGHT_INFO.return.forEach(flight => {
            returnHtml += renderFlightItem(flight);
        });
        returnContainer.innerHTML = returnHtml;
    }
}

// 渲染單一班機資訊
function renderFlightItem(flight) {
    return `
        <div class="flight-item">
            <div class="flight-number">${flight.flight}</div>
            <div class="flight-date">${flight.date}</div>
            <div class="flight-route">
                <div class="flight-departure">
                    <div class="flight-time">${flight.depTime}</div>
                    <div class="flight-airport">${flight.depAirport}</div>
                </div>
                <div class="flight-arrow">
                    ✈️
                    <span class="flight-duration">${flight.duration}</span>
                </div>
                <div class="flight-arrival" style="text-align: right;">
                    <div class="flight-time">${flight.arrTime}</div>
                    <div class="flight-airport">${flight.arrAirport}</div>
                </div>
            </div>
        </div>
    `;
}

// 切換航班資訊顯示/隱藏
function toggleFlightInfo() {
    const card = document.getElementById('flight-info-card');
    card.classList.toggle('collapsed');
}

// 更新日期顯示
function updateDateDisplay() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-TW', options);
    
    // 更新今日日期顯示
    const todayDisplay = document.getElementById('today-date-display');
    if (todayDisplay) {
        todayDisplay.textContent = now.toLocaleDateString('zh-TW', options);
    }
    
    // 計算旅行天數
    updateTripDayInfo();
}

// 計算旅行天數資訊
function updateTripDayInfo() {
    const today = new Date();
    const startDate = new Date(TRIP_INFO.startDate);
    const endDate = new Date(TRIP_INFO.endDate);
    
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const tripInfo = document.getElementById('trip-day-info');
    
    if (today < startDate) {
        const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        tripInfo.textContent = `還有 ${daysUntil} 天出發 ✈️`;
    } else if (today > endDate) {
        tripInfo.textContent = `旅行已結束 🏠`;
    } else {
        tripInfo.textContent = `第 ${diffDays} 天 / 共 ${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} 天`;
    }
}

// 載入今日行程
async function loadTodayItinerary() {
    const container = document.getElementById('today-content');
    if (!container) return;
    
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB) {
            const todayData = await window.SupabaseDB.getTodayItinerary();
            
            if (todayData.isBeforeTrip || todayData.isAfterTrip) {
                container.innerHTML = renderNoTripMessage(new Date(), todayData.message);
            } else if (todayData) {
                container.innerHTML = renderDayCard(todayData, true);
            } else {
                container.innerHTML = renderNoTripMessage(new Date());
            }
            return;
        }
    } catch (error) {
        console.error('Error loading from Supabase:', error);
    }
    
    // 使用本地資料作為備援
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayData = ITINERARY_DATA.find(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === today.getTime();
    });
    
    if (todayData) {
        container.innerHTML = renderDayCard(todayData, true);
    } else {
        container.innerHTML = renderNoTripMessage(today);
    }
}

// 渲染無行程訊息
function renderNoTripMessage(today, customMessage = null) {
    if (customMessage) {
        return `
            <div class="day-card">
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🗓️</div>
                    <p style="font-size: 1.1rem; color: var(--text-secondary);">${customMessage}</p>
                </div>
            </div>
        `;
    }
    
    const startDate = new Date(TRIP_INFO.startDate);
    const endDate = new Date(TRIP_INFO.endDate);
    
    let message = '';
    
    if (today < startDate) {
        const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        message = NO_TODAY_TRIP_MESSAGE.before.replace('{days}', daysUntil);
    } else if (today > endDate) {
        message = NO_TODAY_TRIP_MESSAGE.after;
    } else {
        message = NO_TODAY_TRIP_MESSAGE.gap;
    }
    
    return `
        <div class="day-card">
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🗓️</div>
                <p style="font-size: 1.1rem; color: var(--text-secondary);">${message}</p>
            </div>
        </div>
    `;
}

// 載入完整行程
async function loadFullItinerary() {
    const container = document.getElementById('full-itinerary');
    if (!container) return;
    
    let html = '';
    
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB && window.SupabaseDB.cache.itineraryDays.length > 0) {
            window.SupabaseDB.cache.itineraryDays.forEach(day => {
                html += renderDayCard(day, false);
            });
        } else {
            // 使用本地資料
            ITINERARY_DATA.forEach(day => {
                html += renderDayCard(day, false);
            });
        }
    } catch (error) {
        console.error('Error loading full itinerary:', error);
        // 使用本地資料
        ITINERARY_DATA.forEach(day => {
            html += renderDayCard(day, false);
        });
    }
    
    container.innerHTML = html;
}

// 渲染單日行程卡片
function renderDayCard(day, isToday) {
    const countryClass = day.country || '';
    
    let routeHtml = '';
    if (day.route && day.route.length > 0) {
        routeHtml = '<div class="day-route">';
        day.route.forEach((city, index) => {
            routeHtml += `<span class="route-city">${city}</span>`;
            if (index < day.route.length - 1) {
                routeHtml += '<span class="route-arrow">→</span>';
            }
        });
        routeHtml += '</div>';
    }
    
    let activitiesHtml = '';
    if (day.activities && day.activities.length > 0) {
        activitiesHtml = '<div class="activity-list">';
        day.activities.forEach(activity => {
            activitiesHtml += `
                <div class="activity-item">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-desc">${activity.desc}</div>
                        ${activity.type ? `<span class="activity-type ${activity.type}">${getTypeLabel(activity.type)}</span>` : ''}
                    </div>
                </div>
            `;
        });
        activitiesHtml += '</div>';
    }
    
    return `
        <div class="day-card ${isToday ? 'today' : ''}" data-country="${countryClass}">
            <div class="day-header">
                <div class="day-number">Day ${day.day} - ${day.title}</div>
                <div class="day-date">${formatDate(day.date)}</div>
            </div>
            ${routeHtml}
            ${activitiesHtml}
            ${day.accommodation ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color); font-size: 0.9rem; color: var(--text-secondary);">🏨 ${day.accommodation}</div>` : ''}
            ${day.notes ? `<div style="margin-top: 8px; font-size: 0.85rem; color: var(--accent-color);">💡 ${day.notes}</div>` : ''}
        </div>
    `;
}

// 獲取類型標籤
function getTypeLabel(type) {
    const labels = {
        'food': '美食',
        'attraction': '景點',
        'transport': '交通',
        'shopping': '購物'
    };
    return labels[type] || type;
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
}

// 載入景點
async function loadAttractions() {
    const container = document.getElementById('spots-content');
    if (!container) return;
    
    let html = '';
    
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB && window.SupabaseDB.cache.attractions.length > 0) {
            window.SupabaseDB.cache.attractions.forEach(spot => {
                html += renderAttractionCard(spot);
            });
        } else {
            // 使用本地資料
            ATTRACTIONS_DATA.forEach(spot => {
                html += renderAttractionCard(spot);
            });
        }
    } catch (error) {
        console.error('Error loading attractions:', error);
        // 使用本地資料
        ATTRACTIONS_DATA.forEach(spot => {
            html += renderAttractionCard(spot);
        });
    }
    
    container.innerHTML = html;
}

// 渲染景點卡片
function renderAttractionCard(spot) {
    const countryClass = spot.country || '';
    
    let highlightsHtml = '';
    if (spot.highlights && spot.highlights.length > 0) {
        highlightsHtml = '<ul style="margin: 0; padding-left: 20px;">';
        spot.highlights.forEach(h => {
            highlightsHtml += `<li>${h}</li>`;
        });
        highlightsHtml += '</ul>';
    }
    
    let tipsHtml = '';
    if (spot.tips) {
        tipsHtml = `
            <div class="attraction-tips">
                <h4>💡 實用資訊</h4>
                ${spot.tips.bestTime ? `<p><strong>最佳時間：</strong>${spot.tips.bestTime}</p>` : ''}
                ${spot.tips.duration ? `<p><strong>建議時長：</strong>${spot.tips.duration}</p>` : ''}
                ${spot.tips.tickets ? `<p><strong>門票：</strong>${spot.tips.tickets}</p>` : ''}
                ${spot.tips.booking ? `<p><strong>預約：</strong>${spot.tips.booking}</p>` : ''}
                ${spot.tips.photo ? `<p><strong>拍照：</strong>${spot.tips.photo}</p>` : ''}
            </div>
        `;
    }
    
    return `
        <div class="attraction-card" data-country="${countryClass}">
            <div class="attraction-image" style="background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                ${spot.icon || '📷'}
            </div>
            <div class="attraction-content">
                <div class="attraction-name">${spot.name}</div>
                <div class="attraction-location">
                    📍 ${spot.city} <span class="country-badge ${countryClass}">${getCountryName(countryClass)}</span>
                </div>
                <div class="attraction-desc">${spot.description}</div>
                ${spot.highlights ? `<div style="margin: 12px 0;"><strong>✨ 亮點：</strong>${highlightsHtml}</div>` : ''}
                ${tipsHtml}
                ${spot.openingHours ? `<p style="margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary);">🕐 ${spot.openingHours}</p>` : ''}
                ${spot.howToGet ? `<p style="font-size: 0.85rem; color: var(--text-secondary);">🚇 ${spot.howToGet}</p>` : ''}
            </div>
        </div>
    `;
}

// 獲取國家名稱
function getCountryName(code) {
    const names = {
        'austria': '奧地利',
        'slovakia': '斯洛伐克',
        'czech': '捷克',
        'germany': '德國'
    };
    return names[code] || code;
}

// 載入提醒
async function loadTips() {
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB && window.SupabaseDB.cache.tipCategories.length > 0) {
            window.SupabaseDB.cache.tipCategories.forEach(tip => {
                const container = document.getElementById(`tip-${tip.category_key}`);
                if (container && tip.items) {
                    let html = '';
                    
                    // 按 subcategory 分組
                    const groupedItems = {};
                    tip.items.forEach(item => {
                        const subcategory = item.subcategory || '一般';
                        if (!groupedItems[subcategory]) {
                            groupedItems[subcategory] = [];
                        }
                        groupedItems[subcategory].push(item.tip_text);
                    });
                    
                    for (const [category, tips] of Object.entries(groupedItems)) {
                        html += `<div style="margin-bottom: 16px;">`;
                        html += `<h4 style="color: var(--primary-color); margin-bottom: 8px;">${category}</h4>`;
                        html += `<ul>`;
                        tips.forEach(t => {
                            html += `<li>${t}</li>`;
                        });
                        html += `</ul></div>`;
                    }
                    container.innerHTML = html;
                }
            });
            return;
        }
    } catch (error) {
        console.error('Error loading tips from Supabase:', error);
    }
    
    // 使用本地資料
    Object.keys(TRAVEL_TIPS).forEach(key => {
        const tip = TRAVEL_TIPS[key];
        const container = document.getElementById(`tip-${key}`);
        if (container) {
            let html = '';
            tip.items.forEach(item => {
                html += `<div style="margin-bottom: 16px;">`;
                html += `<h4 style="color: var(--primary-color); margin-bottom: 8px;">${item.category}</h4>`;
                html += `<ul>`;
                item.tips.forEach(t => {
                    html += `<li>${t}</li>`;
                });
                html += `</ul></div>`;
            });
            container.innerHTML = html;
        }
    });
}

// 載入清單
async function loadChecklist() {
    // 從 localStorage 載入進度
    const saved = localStorage.getItem('travel-checklist');
    if (saved) {
        AppState.checklistProgress = JSON.parse(saved);
    }
    
    try {
        // 嘗試從 Supabase 載入
        if (window.SupabaseDB && window.SupabaseDB.cache.checklistCategories.length > 0) {
            window.SupabaseDB.cache.checklistCategories.forEach(cat => {
                const container = document.getElementById(`${cat.category_key}-items`);
                if (container && cat.items) {
                    let html = '';
                    cat.items.forEach((item, index) => {
                        const itemId = `db-${cat.category_key}-${index}`;
                        const isChecked = AppState.checklistProgress[itemId] || false;
                        html += `
                            <div class="checklist-item ${isChecked ? 'checked' : ''}" data-id="${itemId}">
                                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${itemId}')">
                                <span class="item-text">${item.item_text || item.text}</span>
                                ${item.important ? '<span class="item-important">重要</span>' : ''}
                            </div>
                        `;
                    });
                    container.innerHTML = html;
                }
            });
            updateChecklistProgress();
            return;
        }
    } catch (error) {
        console.error('Error loading checklist from Supabase:', error);
    }
    
    // 使用本地資料
    Object.keys(CHECKLIST_DATA).forEach(key => {
        const category = CHECKLIST_DATA[key];
        const container = document.getElementById(`${key}-items`);
        if (container) {
            let html = '';
            category.items.forEach((item, index) => {
                const itemId = `${key}-${index}`;
                const isChecked = AppState.checklistProgress[itemId] || false;
                html += `
                    <div class="checklist-item ${isChecked ? 'checked' : ''}" data-id="${itemId}">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${itemId}')">
                        <span class="item-text">${item.text}</span>
                        ${item.important ? '<span class="item-important">重要</span>' : ''}
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    });
    
    updateChecklistProgress();
}

// 切換清單項目
function toggleChecklistItem(itemId) {
    AppState.checklistProgress[itemId] = !AppState.checklistProgress[itemId];
    
    // 儲存到 localStorage
    localStorage.setItem('travel-checklist', JSON.stringify(AppState.checklistProgress));
    
    // 更新UI
    const item = document.querySelector(`[data-id="${itemId}"]`);
    if (item) {
        item.classList.toggle('checked');
    }
    
    updateChecklistProgress();
}

// 更新清單進度
function updateChecklistProgress() {
    let total = 0;
    
    // 嘗試從 Supabase 快取計算總數
    if (window.SupabaseDB && window.SupabaseDB.cache.checklistCategories.length > 0) {
        window.SupabaseDB.cache.checklistCategories.forEach(cat => {
            if (cat.items) {
                total += cat.items.length;
            }
        });
    } else {
        // 使用本地資料
        total = Object.keys(CHECKLIST_DATA).reduce((sum, key) => {
            return sum + CHECKLIST_DATA[key].items.length;
        }, 0);
    }
    
    const checked = Object.values(AppState.checklistProgress).filter(v => v).length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    const progressBar = document.getElementById('checklist-progress');
    const progressText = document.getElementById('checklist-progress-text');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
}

// 設定事件監聽
function setupEventListeners() {
    // 導航切換
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
    
    // 篩選按鈕
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // 更新按鈕狀態
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 篩選行程
            filterItinerary(filter);
        });
    });
    
    // 景點搜尋
    const searchInput = document.getElementById('spot-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchAttractions(this.value);
        });
    }
    
    // FAB 選單
    const fabMenu = document.getElementById('fab-menu');
    const fabActions = document.getElementById('fab-actions');
    if (fabMenu && fabActions) {
        fabMenu.addEventListener('click', function() {
            fabActions.classList.toggle('show');
        });
    }
    
    // Modal 關閉
    const modal = document.getElementById('modal');
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => modal.classList.remove('show'));
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
}

// 切換視圖
function switchView(view) {
    AppState.currentView = view;
    
    // 更新導航
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    // 更新視圖
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${view}`);
    });
    
    // 捲動到頂部
    window.scrollTo(0, 0);
}

// 篩選行程
function filterItinerary(filter) {
    const cards = document.querySelectorAll('#full-itinerary .day-card');
    
    cards.forEach(card => {
        if (filter === 'all' || card.dataset.country === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 搜尋景點
function searchAttractions(keyword) {
    const cards = document.querySelectorAll('#spots-content .attraction-card');
    const lowerKeyword = keyword.toLowerCase();
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(lowerKeyword) ? 'block' : 'none';
    });
}

// 檢查網路狀態
function checkOnlineStatus() {
    AppState.isOffline = !navigator.onLine;
    
    window.addEventListener('online', () => {
        AppState.isOffline = false;
        console.log('🟢 已連線');
    });
    
    window.addEventListener('offline', () => {
        AppState.isOffline = true;
        console.log('🔴 離線模式');
    });
}

// 捲動到頂部
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 顯示緊急資訊
function showEmergencyInfo() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>🆘 緊急資訊</h2>
        
        <div class="emergency-section">
            <h3>緊急電話</h3>
            <div class="emergency-item">
                <span>歐盟通用緊急電話</span>
                <strong>112</strong>
            </div>
            <div class="emergency-item">
                <span>外交部急難救助</span>
                <strong>+886-2-2343-2888</strong>
            </div>
        </div>
        
        <div class="emergency-section">
            <h3>駐外館處</h3>
            <div class="emergency-item">
                <span>駐德國代表處</span>
                <strong>+49-30-29028-0</strong>
            </div>
            <div class="emergency-item">
                <span>駐奧地利代表處</span>
                <strong>+43-1-713-2688</strong>
            </div>
            <div class="emergency-item">
                <span>駐捷克代表處</span>
                <strong>+420-2-3302-7888</strong>
            </div>
        </div>
        
        <div class="emergency-section">
            <h3>重要提醒</h3>
            <ul>
                <li>護照影本與正本分開存放</li>
                <li>記下旅遊保險理賠專線</li>
                <li>信用卡掛失電話</li>
                <li>緊急聯絡人資訊</li>
            </ul>
        </div>
    `;
    
    modal.classList.add('show');
}

// 切換離線模式
function toggleOfflineMode() {
    AppState.isOffline = !AppState.isOffline;
    alert(AppState.isOffline ? '📴 已切換至離線模式' : '🌐 已恢復連線模式');
}
