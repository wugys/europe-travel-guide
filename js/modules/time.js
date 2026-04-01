/**
 * Time Module - Europe Travel Guide
 * Dual timezone system with contact status
 */

const TimeModule = {
    // 城市時區對照
    timezones: {
        '布達佩斯': 'Europe/Budapest',
        '布拉提斯拉瓦': 'Europe/Bratislava',
        '維也納': 'Europe/Vienna',
        '布爾諾': 'Europe/Prague',
        '布拉格': 'Europe/Prague',
        '庫倫洛夫': 'Europe/Prague',
        '薩爾斯堡': 'Europe/Vienna',
        '哈修塔特': 'Europe/Vienna',
        '國王湖': 'Europe/Berlin',
        '慕尼黑': 'Europe/Berlin'
    },
    
    // 台北聯繫時間
    contactHours: {
        weekday: [
            { start: '09:00', end: '12:00', status: 'available', text: '可聯繫公司' },
            { start: '13:30', end: '18:00', status: 'available', text: '可聯繫公司' },
            { start: '18:00', end: '09:00', status: 'unavailable', text: '台北休息中' }
        ]
    },
    
    // ==================== 初始化 ====================
    
    init() {
        console.log('[Time] Initializing...');
        
        // 立即更新
        this.updateDisplay();
        
        // 每秒更新
        setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        console.log('[Time] Initialized');
    },
    
    // ==================== 時間更新 ====================
    
    updateDisplay() {
        const now = new Date();
        
        // 更新當地時間
        this.updateLocalTime(now);
        
        // 更新台北時間
        this.updateTaipeiTime(now);
        
        // 更新聯繫狀態
        this.updateContactStatus(now);
    },
    
    updateLocalTime(now) {
        const currentCity = AppState.currentCity || '布達佩斯';
        const timezone = this.timezones[currentCity] || 'Europe/Budapest';
        
        // 取得當地時間
        const localTime = this.convertToTimezone(now, timezone);
        
        // 更新顯示
        const timeEl = document.getElementById('local-time');
        if (timeEl) {
            timeEl.textContent = this.formatTime(localTime);
        }
        
        // 更新狀態文字
        const statusEl = document.querySelector('.time-card.local .time-status');
        if (statusEl) {
            statusEl.textContent = this.getLocalStatus(localTime);
        }
    },
    
    updateTaipeiTime(now) {
        // 台北時間
        const taipeiTime = this.convertToTimezone(now, 'Asia/Taipei');
        
        // 更新顯示
        const timeEl = document.getElementById('taipei-time');
        if (timeEl) {
            timeEl.textContent = this.formatTime(taipeiTime);
        }
        
        // 更新聯繫狀態
        const status = this.getTaipeiContactStatus(taipeiTime);
        const statusEl = document.querySelector('.time-card.taipei .time-status');
        if (statusEl) {
            statusEl.textContent = status.text;
            statusEl.className = `time-status ${status.status}`;
        }
    },
    
    updateContactStatus(now) {
        // 更新 AI 導遊卡片的聯繫狀態
        const taipeiTime = this.convertToTimezone(now, 'Asia/Taipei');
        const status = this.getTaipeiContactStatus(taipeiTime);
        
        // 更新 AI 卡片的提醒內容
        const aiReminder = document.querySelector('.ai-reminder span:last-child');
        if (aiReminder && status.status === 'unavailable') {
            // 如果台北休息中，顯示在 AI 卡片
            // 這裡可以根據需要調整
        }
    },
    
    // ==================== 時區轉換 ====================
    
    convertToTimezone(date, timezone) {
        // 使用 Intl API 取得時區時間
        const options = {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        };
        
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        
        const year = parseInt(this.getPart(parts, 'year'));
        const month = parseInt(this.getPart(parts, 'month')) - 1;
        const day = parseInt(this.getPart(parts, 'day'));
        const hour = parseInt(this.getPart(parts, 'hour'));
        const minute = parseInt(this.getPart(parts, 'minute'));
        const second = parseInt(this.getPart(parts, 'second'));
        
        return new Date(year, month, day, hour, minute, second);
    },
    
    getPart(parts, type) {
        return parts.find(p => p.type === type)?.value || '0';
    },
    
    // ==================== 格式 ====================
    
    formatTime(date) {
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    },
    
    formatDate(date) {
        return date.toLocaleDateString('zh-TW', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    },
    
    // ==================== 狀態判斷 ====================
    
    getLocalStatus(localTime) {
        const hour = localTime.getHours();
        
        if (hour >= 6 && hour < 12) {
            return '上午時段';
        } else if (hour >= 12 && hour < 18) {
            return '下午時段';
        } else if (hour >= 18 && hour < 22) {
            return '晚間時段';
        } else {
            return '夜間時段';
        }
    },
    
    getTaipeiContactStatus(taipeiTime) {
        const hour = taipeiTime.getHours();
        const minute = taipeiTime.getMinutes();
        const timeValue = hour * 60 + minute;
        
        // 09:00 = 540, 12:00 = 720
        // 13:30 = 810, 18:00 = 1080
        
        // 檢查是否在可聯繫時段
        const morningStart = 9 * 60;      // 09:00
        const morningEnd = 12 * 60;       // 12:00
        const afternoonStart = 13 * 60 + 30; // 13:30
        const afternoonEnd = 18 * 60;     // 18:00
        
        if ((timeValue >= morningStart && timeValue < morningEnd) ||
            (timeValue >= afternoonStart && timeValue < afternoonEnd)) {
            return {
                status: 'available',
                text: '可聯繫公司'
            };
        }
        
        return {
            status: 'unavailable',
            text: '台北休息中'
        };
    },
    
    // ==================== 輔助方法 ====================
    
    // 取得兩地時差（小時）
    getTimeDifference(city1, city2) {
        const now = new Date();
        const tz1 = this.timezones[city1] || 'Europe/Budapest';
        const tz2 = this.timezones[city2] || 'Asia/Taipei';
        
        const time1 = this.convertToTimezone(now, tz1);
        const time2 = this.convertToTimezone(now, tz2);
        
        const diff = (time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
        return Math.round(diff);
    },
    
    // 取得當前城市時間
    getCurrentCityTime() {
        const city = AppState.currentCity || '布達佩斯';
        const timezone = this.timezones[city];
        return this.convertToTimezone(new Date(), timezone);
    },
    
    // 判斷是否營業時間
    isBusinessHours(timezone = 'Asia/Taipei') {
        const time = this.convertToTimezone(new Date(), timezone);
        const status = this.getTaipeiContactStatus(time);
        return status.status === 'available';
    },
    
    // 格式化時差顯示
    formatTimeDifference(city) {
        const diff = this.getTimeDifference(city, '台北');
        
        if (diff === 0) {
            return '與台北同時區';
        } else if (diff > 0) {
            return `比台北快 ${diff} 小時`;
        } else {
            return `比台北慢 ${Math.abs(diff)} 小時`;
        }
    }
};
