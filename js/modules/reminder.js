/**
 * Reminder System - Europe Travel Guide
 * Time-based, GPS-based, and Status-based reminders
 */

const ReminderSystem = {
    // 設定
    config: {
        checkInterval: 60000,      // 每分鐘檢查一次
        preReminderMinutes: 15,    // 提前 15 分鐘提醒
        gpsReminderDistance: 0.5,  // GPS 提醒距離 (km)
        snoozeMinutes: 10          // 暫停時間
    },
    
    // 狀態
    state: {
        isRunning: false,
        timerId: null,
        lastCheck: null,
        activeReminders: [],
        snoozedReminders: []
    },
    
    // ==================== 初始化 ====================
    
    async init() {
        console.log('[Reminder] Initializing...');
        
        // 從 IndexedDB 載入待處理提醒
        const pending = await travelDB.getPendingReminders();
        this.state.activeReminders = pending;
        
        // 開始定時檢查
        this.start();
        
        // 監聽事件
        window.addEventListener('gps:arrival', (e) => {
            this.handleArrival(e.detail);
        });
        
        console.log(`[Reminder] Initialized with ${pending.length} pending reminders`);
    },
    
    // ==================== 啟動/停止 ====================
    
    start() {
        if (this.state.isRunning) return;
        
        console.log('[Reminder] Starting reminder loop...');
        
        // 立即檢查一次
        this.checkReminders();
        
        // 定時檢查
        this.state.timerId = setInterval(() => {
            this.checkReminders();
        }, this.config.checkInterval);
        
        this.state.isRunning = true;
    },
    
    stop() {
        if (!this.state.isRunning) return;
        
        clearInterval(this.state.timerId);
        this.state.timerId = null;
        this.state.isRunning = false;
        
        console.log('[Reminder] Stopped');
    },
    
    // ==================== 檢查提醒 ====================
    
    async checkReminders() {
        const now = new Date();
        this.state.lastCheck = now;
        
        // 1. 檢查時間提醒
        await this.checkTimeReminders(now);
        
        // 2. 檢查 GPS 提醒（由 GPS 模組觸發）
        await this.checkGPSReminders();
        
        // 3. 檢查狀態提醒
        await this.checkStatusReminders(now);
    },
    
    // ==================== 時間提醒 ====================
    
    async checkTimeReminders(now) {
        const today = ITINERARY_DATA.find(d => d.day === AppState.currentDay);
        if (!today) return;
        
        for (const activity of today.activities || []) {
            // 解析活動時間
            const activityTime = this.parseTime(activity.time);
            if (!activityTime) continue;
            
            // 檢查是否該提醒
            const reminderTime = new Date(activityTime.getTime() - 
                this.config.preReminderMinutes * 60000);
            
            // 如果現在在提醒時間範圍內（前後 1 分鐘）
            const diff = now - reminderTime;
            if (diff >= 0 && diff < 60000) {
                const reminderKey = `time_${today.day}_${activity.time}`;
                
                // 檢查是否已觸發
                const triggered = await travelDB.getUserState(reminderKey, false);
                
                if (!triggered) {
                    // 標記為已觸發
                    await travelDB.setUserState(reminderKey, true);
                    
                    // 觸發提醒
                    this.triggerReminder({
                        type: 'time',
                        title: '即將開始',
                        message: `${activity.title} 將在 ${this.config.preReminderMinutes} 分鐘後開始`,
                        data: activity,
                        actions: [
                            { label: '查看', action: 'view' },
                            { label: '暫停', action: 'snooze' }
                        ]
                    });
                }
            }
            
            // 檢查「該離開了」提醒（活動結束前）
            const duration = this.parseDuration(activity.duration) || 60;
            const endTime = new Date(activityTime.getTime() + duration * 60000);
            const leaveReminderTime = new Date(endTime.getTime() - 10 * 60000);
            
            const leaveDiff = now - leaveReminderTime;
            if (leaveDiff >= 0 && leaveDiff < 60000) {
                const leaveKey = `leave_${today.day}_${activity.time}`;
                const leaveTriggered = await travelDB.getUserState(leaveKey, false);
                
                if (!leaveTriggered) {
                    await travelDB.setUserState(leaveKey, true);
                    
                    this.triggerReminder({
                        type: 'time',
                        title: '該離開了',
                        message: `${activity.title} 即將結束，準備前往下一站`,
                        data: activity
                    });
                }
            }
        }
    },
    
    // ==================== GPS 提醒 ====================
    
    async checkGPSReminders() {
        // 由 GPS 模組定期檢查附近的景點
        const nearby = await GPS.checkArrivals();
        
        for (const attraction of nearby) {
            const reminderKey = `gps_${attraction.id}`;
            const triggered = await travelDB.getUserState(reminderKey, false);
            
            if (!triggered) {
                await travelDB.setUserState(reminderKey, true);
                
                this.triggerReminder({
                    type: 'gps',
                    title: '接近景點',
                    message: `您距離 ${attraction.name} 還有 ${GPS.formatDistance(attraction.distance)}`,
                    data: attraction,
                    actions: [
                        { label: '查看詳情', action: 'detail' },
                        { label: '導航', action: 'navigate' }
                    ]
                });
            }
        }
    },
    
    handleArrival(attraction) {
        this.triggerReminder({
            type: 'arrival',
            title: '到達景點',
            message: `您已到達 ${attraction.name}`,
            data: attraction,
            actions: [
                { label: '查看導覽', action: 'guide' },
                { label: '拍照建議', action: 'photo' }
            ]
        });
    },
    
    // ==================== 狀態提醒 ====================
    
    async checkStatusReminders(now) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // 1. 太晚提醒
        if (currentHour >= 21) {
            const lateKey = `status_late_${now.toDateString()}`;
            const triggered = await travelDB.getUserState(lateKey, false);
            
            if (!triggered) {
                await travelDB.setUserState(lateKey, true);
                
                this.triggerReminder({
                    type: 'status',
                    title: '時間提醒',
                    message: '已經晚上 9 點了，注意安全並確認明天的行程',
                    priority: 'low'
                });
            }
        }
        
        // 2. 午餐時間提醒
        if (currentHour === 12 && currentMinute < 5) {
            const lunchKey = `status_lunch_${now.toDateString()}`;
            const triggered = await travelDB.getUserState(lunchKey, false);
            
            if (!triggered) {
                await travelDB.setUserState(lunchKey, true);
                
                this.triggerReminder({
                    type: 'status',
                    title: '午餐時間',
                    message: '該吃午餐了！附近可能有推薦餐廳',
                    actions: [{ label: '查看推薦', action: 'restaurants' }]
                });
            }
        }
        
        // 3. 天氣提醒（使用假資料，未來可接 API）
        await this.checkWeatherReminder(now);
    },
    
    async checkWeatherReminder(now) {
        // 簡單的天氣提醒邏輯（模擬）
        const hour = now.getHours();
        const weatherKey = `weather_${now.toDateString()}`;
        
        // 早上 8 點提醒一次天氣
        if (hour === 8 && now.getMinutes() < 5) {
            const triggered = await travelDB.getUserState(weatherKey, false);
            
            if (!triggered) {
                await travelDB.setUserState(weatherKey, true);
                
                // 模擬天氣資料
                const weatherTypes = ['晴天', '多雲', '小雨'];
                const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
                const temp = Math.floor(Math.random() * 10) + 15; // 15-25度
                
                let message = `今天${weather}，${temp}°C。`;
                if (weather === '小雨') {
                    message += '記得帶雨具！';
                }
                
                this.triggerReminder({
                    type: 'weather',
                    title: '今日天氣',
                    message: message,
                    priority: 'low'
                });
            }
        }
    },
    
    // ==================== 觸發提醒 ====================
    
    triggerReminder(reminder) {
        console.log('[Reminder] Triggering:', reminder.title);
        
        // 儲存到歷史
        this.saveReminderHistory(reminder);
        
        // 顯示 UI 提醒
        this.showUIReminder(reminder);
        
        // 嘗試發送系統通知
        this.sendNotification(reminder);
        
        // 發布事件
        window.dispatchEvent(new CustomEvent('reminder:trigger', {
            detail: reminder
        }));
    },
    
    showUIReminder(reminder) {
        // 建立提醒卡片
        const card = document.createElement('div');
        card.className = 'reminder-card';
        card.innerHTML = `
            <div class="reminder-header">
                <span class="reminder-type">${this.getTypeIcon(reminder.type)}</span>
                <h4>${reminder.title}</h4>
                <button class="reminder-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <p class="reminder-message">${reminder.message}</p>
            ${reminder.actions ? `
                <div class="reminder-actions">
                    ${reminder.actions.map(a => `
                        <button class="reminder-btn" data-action="${a.action}"
                        >${a.label}</button>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        // 新增到頁面
        let container = document.getElementById('reminder-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'reminder-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(card);
        
        // 動畫進入
        requestAnimationFrame(() => {
            card.classList.add('show');
        });
        
        // 自動關閉
        setTimeout(() => {
            card.classList.remove('show');
            setTimeout(() => card.remove(), 300);
        }, 10000);
        
        // 綁定按鈕事件
        card.querySelectorAll('.reminder-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleReminderAction(reminder, btn.dataset.action);
                card.remove();
            });
        });
    },
    
    async sendNotification(reminder) {
        // 檢查 Notification API
        if (!('Notification' in window)) return;
        
        // 檢查權限
        if (Notification.permission === 'granted') {
            try {
                new Notification(reminder.title, {
                    body: reminder.message,
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: reminder.type,
                    requireInteraction: reminder.priority !== 'low'
                });
            } catch (e) {
                console.warn('[Reminder] Notification failed:', e);
            }
        } else if (Notification.permission !== 'denied') {
            // 請求權限
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.sendNotification(reminder);
            }
        }
    },
    
    // ==================== 動作處理 ====================
    
    handleReminderAction(reminder, action) {
        console.log('[Reminder] Action:', action, reminder);
        
        switch (action) {
            case 'view':
                navigateTo('today');
                break;
            case 'detail':
                if (reminder.data?.id) {
                    showAttractionDetail(reminder.data.id);
                }
                break;
            case 'navigate':
                if (reminder.data?.id) {
                    navigateTo('map');
                    setTimeout(() => MapModule.flyToAttraction(reminder.data.id), 500);
                }
                break;
            case 'guide':
                if (reminder.data?.id) {
                    showAttractionDetail(reminder.data.id);
                }
                break;
            case 'photo':
                if (reminder.data?.id) {
                    showAttractionDetail(reminder.data.id);
                    // 滾動到拍照建議區
                    setTimeout(() => {
                        const photoSection = document.querySelector('.photo-list');
                        if (photoSection) photoSection.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
                break;
            case 'snooze':
                this.snoozeReminder(reminder);
                break;
            case 'restaurants':
                // 未來可連接到美食推薦
                alert('美食推薦功能開發中');
                break;
        }
    },
    
    async snoozeReminder(reminder) {
        const snoozeTime = new Date(Date.now() + this.config.snoozeMinutes * 60000);
        
        await travelDB.addReminder({
            type: 'snoozed',
            title: reminder.title,
            message: reminder.message,
            time: snoozeTime.toISOString(),
            data: reminder.data,
            originalType: reminder.type
        });
        
        console.log('[Reminder] Snoozed until:', snoozeTime);
    },
    
    // ==================== 提醒歷史 ====================
    
    async saveReminderHistory(reminder) {
        const history = await travelDB.getUserState('reminderHistory', []);
        history.unshift({
            ...reminder,
            timestamp: new Date().toISOString()
        });
        
        // 只保留最近 50 筆
        if (history.length > 50) {
            history.length = 50;
        }
        
        await travelDB.setUserState('reminderHistory', history);
    },
    
    async getReminderHistory() {
        return travelDB.getUserState('reminderHistory', []);
    },
    
    // ==================== 輔助方法 ====================
    
    parseTime(timeStr) {
        if (!timeStr) return null;
        
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!match) return null;
        
        const now = new Date();
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    },
    
    parseDuration(durationStr) {
        if (!durationStr) return 60;
        
        const match = durationStr.match(/(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        return 60;
    },
    
    getTypeIcon(type) {
        const icons = {
            time: '⏰',
            gps: '📍',
            arrival: '🎯',
            status: '💡',
            weather: '🌤',
            snoozed: '💤'
        };
        return icons[type] || '🔔';
    },
    
    // 手動新增提醒
    async addReminder(title, message, time, type = 'custom') {
        return travelDB.addReminder({
            title,
            message,
            time: time.toISOString(),
            type
        });
    }
};

// 暴露到全域
window.ReminderSystem = ReminderSystem;
