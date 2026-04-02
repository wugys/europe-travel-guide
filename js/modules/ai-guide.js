/**
 * AI Guide Engine - Europe Travel Guide
 * Rule-based AI system for travel guidance
 * Lightweight, offline-first, context-aware
 */

const AIGuide = {
    // 狀態
    state: {
        lastSuggestion: null,
        suggestionCount: 0,
        userContext: {
            completedActivities: [],
            skippedActivities: [],
            currentMood: 'normal' // normal, rushed, relaxed, tired
        }
    },
    
    // 時間區段定義
    timeSegments: {
        earlyMorning: { start: 5, end: 8, label: '清晨' },
        morning: { start: 8, end: 12, label: '上午' },
        noon: { start: 12, end: 14, label: '中午' },
        afternoon: { start: 14, end: 18, label: '下午' },
        evening: { start: 18, end: 21, label: '傍晚' },
        night: { start: 21, end: 24, label: '晚上' },
        lateNight: { start: 0, end: 5, label: '深夜' }
    },
    
    // ==================== 初始化 ====================
    
    async init() {
        console.log('[AI] Initializing Guide Engine...');
        
        // 載入使用者進度
        const savedProgress = await travelDB.getUserState('activityProgress', {});
        this.state.userContext.completedActivities = savedProgress.completed || [];
        this.state.userContext.skippedActivities = savedProgress.skipped || [];
        
        // 設定定時更新 (每分鐘重新評估)
        setInterval(() => {
            this.evaluateAndSuggest();
        }, 60000);
        
        // 監聽事件
        window.addEventListener('gps:arrival', (e) => {
            this.onArrival(e.detail);
        });
        
        window.addEventListener('gps:cityChange', (e) => {
            this.onCityChange(e.detail.newCity, e.detail.oldCity);
        });
        
        console.log('[AI] Guide Engine ready');
    },
    
    // ==================== 核心評估邏輯 ====================
    
    async evaluateAndSuggest(force = false) {
        // 收集上下文
        const context = await this.gatherContext();
        
        // 評估情境
        const evaluation = this.evaluateContext(context);
        
        // 生成建議
        const suggestion = this.generateSuggestion(context, evaluation);
        
        // 檢查是否需要更新
        if (force || this.shouldUpdateSuggestion(suggestion)) {
            this.state.lastSuggestion = suggestion;
            this.state.suggestionCount++;
            
            // 觸發事件
            window.dispatchEvent(new CustomEvent('ai:suggestion', {
                detail: suggestion
            }));
            
            // 儲存到狀態
            await travelDB.setUserState('lastAiSuggestion', {
                ...suggestion,
                timestamp: new Date().toISOString()
            });
        }
        
        return suggestion;
    },
    
    // ==================== 收集上下文 ====================
    
    async gatherContext() {
        const now = new Date();
        const currentCity = AppState.currentCity || '布達佩斯';
        const timezone = GPS.cityCoordinates[currentCity]?.timezone || 'Europe/Budapest';
        const localTime = TimeModule.convertToTimezone(now, timezone);
        
        // 取得今日行程
        const todayData = ITINERARY_DATA.find(d => d.day === AppState.currentDay);
        
        // 取得 GPS 位置
        const lastLocation = await travelDB.getLastLocation();
        const currentPosition = GPS.getCurrentPositionSync();
        
        // 取得近距離景點
        const nearbyAttractions = currentPosition 
            ? await GPS.getNearbyAttractions(2) 
            : [];
        
        // 取得天氣 (模擬)
        const weather = this.getSimulatedWeather(currentCity, localTime);
        
        // 計算行程進度
        const progress = this.calculateProgress(todayData, localTime);
        
        // 取得下一個活動
        const nextActivity = this.findNextActivity(todayData, localTime);
        
        // 取得進行中活動
        const currentActivity = this.findCurrentActivity(todayData, localTime);
        
        // 台北聯繫狀態
        const taipeiStatus = TimeModule.getTaipeiContactStatus(
            TimeModule.convertToTimezone(now, 'Asia/Taipei')
        );
        
        return {
            timestamp: now.toISOString(),
            localTime: localTime,
            hour: localTime.getHours(),
            minute: localTime.getMinutes(),
            timeSegment: this.getTimeSegment(localTime.getHours()),
            city: currentCity,
            day: AppState.currentDay,
            weather: weather,
            position: currentPosition,
            nearbyAttractions: nearbyAttractions,
            todayData: todayData,
            progress: progress,
            nextActivity: nextActivity,
            currentActivity: currentActivity,
            taipeiStatus: taipeiStatus,
            completedActivities: this.state.userContext.completedActivities,
            mood: this.state.userContext.currentMood
        };
    },
    
    // ==================== 情境評估 ====================
    
    evaluateContext(context) {
        const evaluations = [];
        
        // 1. 時間評估
        evaluations.push(this.evaluateTime(context));
        
        // 2. 位置評估
        evaluations.push(this.evaluateLocation(context));
        
        // 3. 行程評估
        evaluations.push(this.evaluateItinerary(context));
        
        // 4. 天氣評估
        evaluations.push(this.evaluateWeather(context));
        
        // 5. 緊急程度評估
        evaluations.push(this.evaluateUrgency(context));
        
        // 合併評估結果
        return this.mergeEvaluations(evaluations);
    },
    
    evaluateTime(context) {
        const { hour, timeSegment } = context;
        
        // 判斷是否為用餐時間
        const isMealTime = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
        
        // 判斷是否為休息時間
        const isRestTime = hour >= 22 || hour < 6;
        
        // 判斷是否接近活動時間
        let approachingActivity = null;
        if (context.nextActivity) {
            const activityTime = this.parseHour(context.nextActivity.time);
            const timeDiff = activityTime - hour;
            if (timeDiff > 0 && timeDiff <= 1) {
                approachingActivity = context.nextActivity;
            }
        }
        
        return {
            type: 'time',
            priority: approachingActivity ? 'high' : 'normal',
            isMealTime,
            isRestTime,
            approachingActivity,
            message: approachingActivity 
                ? `即將開始：${approachingActivity.title}` 
                : `${timeSegment.label}時段`
        };
    },
    
    evaluateLocation(context) {
        const { nearbyAttractions, position } = context;
        
        if (!position) {
            return {
                type: 'location',
                priority: 'low',
                hasLocation: false,
                message: '無定位資訊'
            };
        }
        
        // 檢查是否在某個景點內
        const atAttraction = nearbyAttractions.find(a => a.distance < 0.1); // 100m內
        
        // 檢查附近景點
        const nearby = nearbyAttractions.filter(a => a.distance < 0.5); // 500m內
        
        return {
            type: 'location',
            priority: atAttraction ? 'high' : (nearby.length > 0 ? 'medium' : 'low'),
            hasLocation: true,
            atAttraction: atAttraction || null,
            nearbyAttractions: nearby,
            message: atAttraction 
                ? `正在：${atAttraction.name}` 
                : (nearby.length > 0 ? `附近：${nearby[0].name}` : '移動中')
        };
    },
    
    evaluateItinerary(context) {
        const { progress, currentActivity, nextActivity } = context;
        
        let priority = 'normal';
        let message = '';
        
        if (progress.isBehind) {
            priority = 'high';
            message = '行程稍有延誤';
        } else if (progress.isAhead) {
            priority = 'low';
            message = '行程進度良好';
        }
        
        if (currentActivity) {
            priority = 'high';
            message = `進行中：${currentActivity.title}`;
        }
        
        return {
            type: 'itinerary',
            priority,
            progress,
            currentActivity,
            nextActivity,
            message
        };
    },
    
    evaluateWeather(context) {
        const { weather } = context;
        
        let priority = 'low';
        let warning = null;
        
        if (weather.condition === 'rain') {
            priority = 'medium';
            warning = '可能下雨，記得帶傘';
        } else if (weather.temperature < 10) {
            priority = 'medium';
            warning = '天氣寒冷，注意保暖';
        } else if (weather.temperature > 30) {
            priority = 'medium';
            warning = '天氣炎熱，多補充水分';
        }
        
        return {
            type: 'weather',
            priority,
            weather,
            warning,
            message: warning || `${weather.condition}，${weather.temperature}°C`
        };
    },
    
    evaluateUrgency(context) {
        const { hour, taipeiStatus, nextActivity } = context;
        
        let priority = 'low';
        let urgency = 'normal';
        
        // 檢查是否快到下一個活動時間
        if (nextActivity) {
            const activityTime = this.parseHour(nextActivity.time);
            const timeDiff = activityTime - hour;
            
            if (timeDiff <= 0.5 && timeDiff > 0) {
                priority = 'high';
                urgency = 'urgent';
            } else if (timeDiff <= 1) {
                priority = 'medium';
                urgency = 'approaching';
            }
        }
        
        // 檢查是否錯過活動
        if (context.progress.missedActivities > 0) {
            priority = 'high';
            urgency = 'missed';
        }
        
        return {
            type: 'urgency',
            priority,
            urgency,
            canContactTaiwan: taipeiStatus.status === 'available',
            message: urgency === 'urgent' ? '時間緊迫' : 
                     urgency === 'missed' ? '已錯過部分行程' : '時間充裕'
        };
    },
    
    mergeEvaluations(evaluations) {
        // 找出最高優先級
        const priorityOrder = { high: 3, medium: 2, normal: 1, low: 0 };
        
        const sorted = evaluations.sort((a, b) => 
            priorityOrder[b.priority] - priorityOrder[a.priority]
        );
        
        const highestPriority = sorted[0].priority;
        const highPriorityItems = sorted.filter(e => e.priority === highestPriority);
        
        return {
            overallPriority: highestPriority,
            factors: evaluations,
            primaryFactor: highPriorityItems[0],
            allMessages: evaluations.map(e => e.message).filter(Boolean)
        };
    },
    
    // ==================== 生成建議 ====================
    
    generateSuggestion(context, evaluation) {
        const { timeSegment, city, weather, progress, nextActivity, 
                currentActivity, taipeiStatus, nearbyAttractions } = context;
        
        // 基礎建議物件
        const suggestion = {
            timestamp: new Date().toISOString(),
            context: {
                time: timeSegment.label,
                city: city,
                weather: weather.condition
            },
            action: '',
            next: '',
            warning: '',
            alternative: '',
            contactTaiwan: '',
            priority: evaluation.overallPriority,
            type: evaluation.primaryFactor?.type || 'general'
        };
        
        // 根據情境生成建議
        if (currentActivity) {
            // 正在進行活動
            suggestion.action = `正在進行：${currentActivity.title}`;
            suggestion.next = this.getNextStep(currentActivity, nextActivity);
            suggestion.warning = this.getActivityWarning(currentActivity, context);
            suggestion.alternative = this.getAlternative(currentActivity, nearbyAttractions, context);
            
        } else if (evaluation.primaryFactor.type === 'time' && evaluation.primaryFactor.approachingActivity) {
            // 即將開始活動
            const activity = evaluation.primaryFactor.approachingActivity;
            suggestion.action = `準備前往：${activity.title}`;
            suggestion.next = `預計時間：${activity.time}`;
            suggestion.warning = this.getTimeWarning(activity, context);
            suggestion.alternative = this.getAlternative(null, nearbyAttractions, context);
            
        } else if (evaluation.primaryFactor.type === 'location' && evaluation.primaryFactor.atAttraction) {
            // 在景點內
            const attraction = evaluation.primaryFactor.atAttraction;
            suggestion.action = `您正在：${attraction.name}`;
            suggestion.next = nextActivity 
                ? `下一個行程：${nextActivity.title} (${nextActivity.time})`
                : '今日行程已結束，可以自由活動';
            suggestion.warning = attraction.tips?.bestTime 
                ? `最佳參觀時間：${attraction.tips.bestTime}` 
                : '';
            suggestion.alternative = '如果時間充裕，可以慢慢欣賞或拍照留念';
            
        } else if (evaluation.factors.find(f => f.type === 'time' && f.isMealTime)) {
            // 用餐時間
            suggestion.action = '現在是用餐時間';
            suggestion.next = nextActivity 
                ? `用餐後前往：${nextActivity.title}`
                : '可以自由選擇餐廳';
            suggestion.warning = '注意用餐時間，避免影響後續行程';
            suggestion.alternative = '如果附近沒有合適餐廳，可以買簡單食物帶著吃';
            
        } else if (progress.isComplete) {
            // 行程完成
            suggestion.action = '今日行程已順利完成！';
            suggestion.next = '可以自由活動或早點休息';
            suggestion.warning = '整理今日照片和回憶';
            suggestion.alternative = '如果還有體力，可以探索附近的商店或夜景';
            
        } else {
            // 一般情況
            suggestion.action = this.getGeneralAction(context);
            suggestion.next = nextActivity 
                ? `下一個行程：${nextActivity.title} (${nextActivity.time})`
                : '按照行程時間表進行';
            suggestion.warning = evaluation.factors.find(f => f.warning)?.warning || '';
            suggestion.alternative = this.getAlternative(null, nearbyAttractions, context);
        }
        
        // 聯繫台北建議
        suggestion.contactTaiwan = this.getContactSuggestion(taipeiStatus, context);
        
        return suggestion;
    },
    
    // ==================== 輔助方法 ====================
    
    getNextStep(currentActivity, nextActivity) {
        if (!nextActivity) return '這是今日最後一個行程';
        
        const timeDiff = this.parseHour(nextActivity.time) - this.parseHour(currentActivity.time);
        
        if (timeDiff <= 1) {
            return `結束後立即前往：${nextActivity.title}`;
        } else if (timeDiff <= 2) {
            return `有 ${Math.floor(timeDiff)} 小時空檔，然後前往：${nextActivity.title}`;
        }
        return `下一個行程：${nextActivity.title} (${nextActivity.time})`;
    },
    
    getActivityWarning(activity, context) {
        const warnings = [];
        
        // 檢查時間
        const duration = this.parseDuration(activity.duration);
        if (duration > 120) {
            warnings.push('這個活動較長，注意時間分配');
        }
        
        // 檢查天氣
        if (context.weather.condition === 'rain' && activity.type === 'attraction') {
            warnings.push('下雨可能影响戶外活動體驗');
        }
        
        return warnings.join('；') || '';
    },
    
    getAlternative(currentActivity, nearbyAttractions, context) {
        // 如果有錯過行程，建議替代方案
        if (context.progress.missedActivities > 0) {
            const missed = context.progress.missedList[0];
            if (missed) {
                // 檢查是否可以之後補
                if (missed.canReschedule) {
                    return `建議：${missed.title}可以之後找時間補上`;
                } else {
                    return `建議：${missed.title}如果時間不夠，可以跳過`;
                }
            }
        }
        
        // 如果附近有其他景點
        if (nearbyAttractions.length > 0 && !currentActivity) {
            const nearby = nearbyAttractions[0];
            return `附近有：${nearby.name}，時間夠的話可以順路看看`;
        }
        
        // 根據時間建議
        if (context.timeSegment.label === '晚上') {
            return '如果累了可以早點回酒店休息';
        }
        
        return '按照行程進行是最保險的方案';
    },
    
    getTimeWarning(activity, context) {
        const warnings = [];
        
        // 檢查是否需要預訂
        if (activity.needsBooking) {
            warnings.push('記得確認是否有預訂');
        }
        
        // 檢查天氣
        if (context.weather.condition !== 'sunny') {
            warnings.push(`天氣${context.weather.conditionText}，注意準備`);
        }
        
        return warnings.join('；') || '';
    },
    
    getGeneralAction(context) {
        const { timeSegment, progress } = context;
        
        if (progress.isBehind) {
            return '行程稍有延誤，建議加快腳步';
        } else if (progress.isAhead) {
            return `時間還早，可以從容欣賞${context.city}的風景`;
        }
        
        return `現在是${timeSegment.label}，按照行程表進行`;
    },
    
    getContactSuggestion(taipeiStatus, context) {
        if (taipeiStatus.status === 'available') {
            const { hour } = context;
            if (hour >= 12 && hour < 14) {
                return '台北午休時間，如有急事仍可聯繫';
            }
            return '台北上班時間，可以正常聯繫公司';
        } else {
            const taipeiTime = TimeModule.convertToTimezone(new Date(), 'Asia/Taipei');
            const nextAvailable = taipeiTime.getHours() < 9 
                ? '明天早上 9 點'
                : '明天早上 9 點';
            return `台北休息中，如有急事可留言，${nextAvailable}會回覆`;
        }
    },
    
    // ==================== 進度計算 ====================
    
    calculateProgress(todayData, localTime) {
        if (!todayData || !todayData.activities) {
            return { percent: 0, isBehind: false, isAhead: false };
        }
        
        const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
        const activities = todayData.activities;
        
        let completed = 0;
        let missed = 0;
        let missedList = [];
        let current = null;
        
        activities.forEach(activity => {
            const activityHour = this.parseHour(activity.time);
            const duration = this.parseDuration(activity.duration) / 60; // 轉小時
            const endHour = activityHour + duration;
            
            // 檢查是否已完成
            if (this.state.userContext.completedActivities.includes(activity.id)) {
                completed++;
            }
            // 檢查是否錯過
            else if (endHour < currentHour - 0.5) {
                missed++;
                missedList.push({
                    ...activity,
                    canReschedule: activity.type === 'attraction' && activity.flexible
                });
            }
            // 檢查是否進行中
            else if (currentHour >= activityHour && currentHour < endHour) {
                current = activity;
            }
        });
        
        const total = activities.length;
        const percent = Math.round((completed / total) * 100);
        
        // 判斷是否落後或超前
        const expectedProgress = this.getExpectedProgress(activities, currentHour);
        const isBehind = completed < expectedProgress - 1;
        const isAhead = completed > expectedProgress + 1;
        
        return {
            percent,
            completed,
            total,
            missed,
            missedList,
            current,
            isBehind,
            isAhead,
            isComplete: completed === total
        };
    },
    
    getExpectedProgress(activities, currentHour) {
        const completedActivities = activities.filter(a => {
            const activityHour = this.parseHour(a.time);
            const duration = this.parseDuration(a.duration) / 60;
            return activityHour + duration < currentHour;
        });
        return completedActivities.length;
    },
    
    // ==================== 活動查找 ====================
    
    findNextActivity(todayData, localTime) {
        if (!todayData || !todayData.activities) return null;
        
        const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
        
        return todayData.activities.find(activity => {
            const activityHour = this.parseHour(activity.time);
            return activityHour > currentHour;
        });
    },
    
    findCurrentActivity(todayData, localTime) {
        if (!todayData || !todayData.activities) return null;
        
        const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
        
        return todayData.activities.find(activity => {
            const activityHour = this.parseHour(activity.time);
            const duration = this.parseDuration(activity.duration) / 60;
            return currentHour >= activityHour && currentHour < activityHour + duration;
        });
    },
    
    // ==================== 天氣模擬 ====================
    
    getSimulatedWeather(city, date) {
        // 簡單的偽隨機天氣生成（基於日期和城市）
        const seed = date.getDate() + city.length;
        const conditions = ['sunny', 'cloudy', 'cloudy', 'sunny', 'rain'];
        const condition = conditions[seed % conditions.length];
        
        const baseTemp = 15 + (seed % 10); // 15-25度
        
        const conditionText = {
            sunny: '晴朗',
            cloudy: '多雲',
            rain: '有雨'
        };
        
        return {
            condition,
            conditionText: conditionText[condition],
            temperature: baseTemp,
            humidity: 50 + (seed % 30)
        };
    },
    
    // ==================== 事件處理 ====================
    
    async onArrival(attraction) {
        // 到達景點時生成特定建議
        const suggestion = {
            type: 'arrival',
            action: `歡迎來到 ${attraction.name}！`,
            next: '建議停留時間：' + (attraction.tips?.duration || '1-2小時'),
            warning: attraction.secrets?.avoid?.[0] || '',
            alternative: '如果想避開人潮，可以參考「旅遊秘訣」',
            contactTaiwan: '',
            priority: 'high'
        };
        
        window.dispatchEvent(new CustomEvent('ai:suggestion', {
            detail: suggestion
        }));
    },
    
    async onCityChange(newCity, oldCity) {
        // 城市切換時生成建議
        const suggestion = {
            type: 'cityChange',
            action: `歡迎來到 ${newCity}！`,
            next: `時區已切換，當地時間顯示中`,
            warning: '',
            alternative: '',
            contactTaiwan: '',
            priority: 'medium'
        };
        
        window.dispatchEvent(new CustomEvent('ai:suggestion', {
            detail: suggestion
        }));
    },
    
    // ==================== 工具方法 ====================
    
    getTimeSegment(hour) {
        for (const [key, segment] of Object.entries(this.timeSegments)) {
            if (hour >= segment.start && hour < segment.end) {
                return { key, ...segment };
            }
        }
        return { key: 'night', label: '晚上', start: 21, end: 24 };
    },
    
    parseHour(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes || 0) / 60;
    },
    
    parseDuration(durationStr) {
        if (!durationStr) return 60;
        const match = durationStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 60;
    },
    
    shouldUpdateSuggestion(newSuggestion) {
        if (!this.state.lastSuggestion) return true;
        
        // 檢查主要內容是否改變
        const last = this.state.lastSuggestion;
        
        if (last.action !== newSuggestion.action) return true;
        if (last.type !== newSuggestion.type) return true;
        if (last.priority !== newSuggestion.priority) return true;
        
        // 如果已經顯示很久 (超過10分鐘)，強制更新
        const lastTime = new Date(last.timestamp);
        const now = new Date();
        if (now - lastTime > 10 * 60 * 1000) return true;
        
        return false;
    },
    
    // ==================== 公開 API ====================
    
    async getCurrentSuggestion() {
        if (this.state.lastSuggestion) {
            return this.state.lastSuggestion;
        }
        return this.evaluateAndSuggest(true);
    },
    
    async markActivityComplete(activityId) {
        if (!this.state.userContext.completedActivities.includes(activityId)) {
            this.state.userContext.completedActivities.push(activityId);
            await travelDB.setUserState('activityProgress', {
                completed: this.state.userContext.completedActivities,
                skipped: this.state.userContext.skippedActivities
            });
        }
    },
    
    setMood(mood) {
        this.state.userContext.currentMood = mood;
    },
    
    async speakCurrentSuggestion() {
        const suggestion = await this.getCurrentSuggestion();
        const text = `${suggestion.action}。${suggestion.next}。${suggestion.warning || ''}`;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-TW';
            utterance.rate = 1.0;
            speechSynthesis.speak(utterance);
        }
    }
};

// 暴露到全域
window.AIGuide = AIGuide;
