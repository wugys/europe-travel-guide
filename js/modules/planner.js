/**
 * Trip Planner Module
 * 行程生成器 - v3.0
 * 
 * 功能：AI 驅動的行程規劃，支援個人化偏好
 */

class TripPlanner {
  constructor() {
    this.state = {
      step: 0, // 0: 未開始, 1: 目的地, 2: 天數/日期, 3: 興趣, 4: 預算/節奏, 5: 生成中, 6: 完成
      preferences: {
        destination: null,
        days: 3,
        startDate: null,
        interests: [],
        budget: 'medium', // low, medium, high
        pace: 'moderate', // slow, moderate, fast
        travelStyle: 'balanced', // culture, food, shopping, nature, balanced
        accessibility: false
      },
      generatedItinerary: null,
      isGenerating: false
    };
    
    this.interestOptions = [
      { id: 'culture', label: '文化歷史', icon: '🏛️', description: '博物館、古蹟、藝術' },
      { id: 'food', label: '美食探索', icon: '🍜', description: '在地料理、餐廳、小吃' },
      { id: 'nature', label: '自然景觀', icon: '🏔️', description: '公園、山水、戶外' },
      { id: 'shopping', label: '購物娛樂', icon: '🛍️', description: '商場、市集、夜景' },
      { id: 'local', label: '在地體驗', icon: '🎭', description: '民俗、手工藝、生活' }
    ];
    
    this.destinationOptions = [
      { id: 'budapest', name: '布達佩斯', country: '匈牙利', days: '3-5', image: 'budapest.jpg' },
      { id: 'vienna', name: '維也納', country: '奧地利', days: '2-4', image: 'vienna.jpg' },
      { id: 'prague', name: '布拉格', country: '捷克', days: '3-4', image: 'prague.jpg' },
      { id: 'salzburg', name: '薩爾斯堡', country: '奧地利', days: '2-3', image: 'salzburg.jpg' },
      { id: 'hallstatt', name: '哈修塔特', country: '奧地利', days: '1-2', image: 'hallstatt.jpg' },
      { id: 'bratislava', name: '布拉提斯拉瓦', country: '斯洛伐克', days: '1-2', image: 'bratislava.jpg' }
    ];
  }

  /**
   * 初始化
   */
  init() {
    console.log('[TripPlanner] Initialized');
    this.loadSavedPreferences();
  }

  /**
   * 載入儲存的偏好設定
   */
  loadSavedPreferences() {
    try {
      const saved = localStorage.getItem('planner_preferences');
      if (saved) {
        this.state.preferences = { ...this.state.preferences, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[TripPlanner] Could not load preferences:', e);
    }
  }

  /**
   * 儲存偏好設定
   */
  savePreferences() {
    try {
      localStorage.setItem('planner_preferences', JSON.stringify(this.state.preferences));
    } catch (e) {
      console.warn('[TripPlanner] Could not save preferences:', e);
    }
  }

  /**
   * 設定偏好
   */
  setPreference(key, value) {
    this.state.preferences[key] = value;
    this.savePreferences();
    
    // 觸發事件
    window.dispatchEvent(new CustomEvent('planner:preferenceChanged', {
      detail: { key, value }
    }));
  }

  /**
   * 取得當前狀態
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 驗證是否可以進入下一步
   */
  canProceedToStep(step) {
    const prefs = this.state.preferences;
    
    switch(step) {
      case 1:
        return true; // 第一步總是可以
      case 2:
        return !!prefs.destination;
      case 3:
        return !!prefs.destination && prefs.days >= 1;
      case 4:
        return prefs.interests.length > 0;
      case 5:
        return prefs.interests.length > 0 && prefs.budget && prefs.pace;
      default:
        return false;
    }
  }

  /**
   * 生成行程
   */
  async generateItinerary() {
    if (this.state.isGenerating) {
      console.warn('[TripPlanner] Already generating');
      return;
    }

    this.state.isGenerating = true;
    this.state.step = 5;

    // 觸發開始事件
    window.dispatchEvent(new CustomEvent('planner:generationStarted', {
      detail: { preferences: this.state.preferences }
    }));

    try {
      // 檢查是否可以使用 LLM
      const canUseLLM = userProfile?.isPremium?.() && navigator.onLine;
      
      let itinerary;
      
      if (canUseLLM && AIRouter?.canMakeRequest?.('planner')) {
        // 使用 AI 生成
        itinerary = await this.generateWithAI();
      } else {
        // 使用模板生成
        itinerary = this.generateWithTemplate();
      }

      this.state.generatedItinerary = itinerary;
      this.state.step = 6;
      this.state.isGenerating = false;

      // 儲存到本地
      this.saveItinerary(itinerary);

      // 觸發完成事件
      window.dispatchEvent(new CustomEvent('planner:generationCompleted', {
        detail: { itinerary }
      }));

      return itinerary;

    } catch (error) {
      console.error('[TripPlanner] Generation failed:', error);
      this.state.isGenerating = false;
      
      window.dispatchEvent(new CustomEvent('planner:generationFailed', {
        detail: { error }
      }));
      
      throw error;
    }
  }

  /**
   * 使用 AI 生成行程
   */
  async generateWithAI() {
    const prefs = this.state.preferences;
    const userContext = userProfile?.getAIContext?.() || {};
    
    const request = {
      destination: prefs.destination,
      days: prefs.days,
      startDate: prefs.startDate,
      interests: prefs.interests,
      budget: prefs.budget,
      pace: prefs.pace,
      travelStyle: prefs.travelStyle,
      accessibility: prefs.accessibility,
      userContext
    };

    const response = await AIRouter.request('planner', request);
    
    if (!response?.itinerary) {
      throw new Error('Invalid AI response');
    }

    return this.enrichItinerary(response.itinerary);
  }

  /**
   * 使用模板生成行程
   */
  generateWithTemplate() {
    const prefs = this.state.preferences;
    const dest = this.destinationOptions.find(d => d.id === prefs.destination);
    
    // 基礎行程模板
    const templates = this.getDestinationTemplates(prefs.destination);
    
    // 根據興趣篩選和排序
    const filteredDays = templates.map(day => ({
      ...day,
      activities: this.filterActivitiesByInterests(day.activities, prefs.interests)
    }));

    // 根據節奏調整
    const adjustedDays = this.adjustForPace(filteredDays, prefs.pace);

    // 根據預算調整
    const budgetAdjusted = this.adjustForBudget(adjustedDays, prefs.budget);

    return {
      id: `trip_${Date.now()}`,
      destination: dest,
      preferences: prefs,
      days: budgetAdjusted.slice(0, prefs.days),
      generatedAt: new Date().toISOString(),
      isTemplate: true
    };
  }

  /**
   * 取得目的地模板
   */
  getDestinationTemplates(destinationId) {
    // 預設模板資料（實際應從資料庫或 API 取得）
    const templates = {
      'budapest': [
        {
          day: 1,
          theme: '布達區探索',
          activities: [
            { time: '09:00', name: '漁人堡', type: 'attraction', duration: 120, cost: 'low', interest: 'culture' },
            { time: '11:30', name: '馬加什教堂', type: 'attraction', duration: 60, cost: 'medium', interest: 'culture' },
            { time: '13:00', name: '布達城堡', type: 'attraction', duration: 90, cost: 'free', interest: 'culture' },
            { time: '15:00', name: '塞切尼溫泉', type: 'activity', duration: 180, cost: 'high', interest: 'local' },
            { time: '19:00', name: '多瑙河遊船晚餐', type: 'dining', duration: 120, cost: 'high', interest: 'food' }
          ]
        },
        {
          day: 2,
          theme: '佩斯區與美食',
          activities: [
            { time: '09:00', name: '國會大廈導覽', type: 'attraction', duration: 120, cost: 'medium', interest: 'culture' },
            { time: '12:00', name: '中央市場午餐', type: 'dining', duration: 90, cost: 'low', interest: 'food' },
            { time: '14:00', name: '聖伊什特萬聖殿', type: 'attraction', duration: 60, cost: 'free', interest: 'culture' },
            { time: '16:00', name: '安德拉什大街購物', type: 'shopping', duration: 120, cost: 'variable', interest: 'shopping' },
            { time: '19:00', name: '廢墟酒吧體驗', type: 'nightlife', duration: 180, cost: 'medium', interest: 'local' }
          ]
        },
        {
          day: 3,
          theme: '深度體驗',
          activities: [
            { time: '10:00', name: '匈牙利料理課程', type: 'activity', duration: 180, cost: 'high', interest: 'food' },
            { time: '14:00', name: '英雄廣場與城市公園', type: 'attraction', duration: 120, cost: 'free', interest: 'nature' },
            { time: '17:00', name: '蓋勒特溫泉', type: 'activity', duration: 120, cost: 'medium', interest: 'local' }
          ]
        }
      ],
      'vienna': [
        {
          day: 1,
          theme: '皇室風華',
          activities: [
            { time: '09:00', name: '熊布朗宮', type: 'attraction', duration: 180, cost: 'high', interest: 'culture' },
            { time: '13:00', name: '中央咖啡館', type: 'dining', duration: 90, cost: 'medium', interest: 'food' },
            { time: '15:00', name: '霍夫堡皇宮', type: 'attraction', duration: 120, cost: 'high', interest: 'culture' },
            { time: '18:00', name: '國家歌劇院', type: 'activity', duration: 180, cost: 'high', interest: 'culture' }
          ]
        },
        {
          day: 2,
          theme: '藝術與音樂',
          activities: [
            { time: '09:00', name: '藝術史博物館', type: 'attraction', duration: 180, cost: 'medium', interest: 'culture' },
            { time: '13:00', name: '納許市場', type: 'dining', duration: 90, cost: 'low', interest: 'food' },
            { time: '15:00', name: '聖史帝芬大教堂', type: 'attraction', duration: 90, cost: 'free', interest: 'culture' },
            { time: '17:00', name: '格拉本大街', type: 'shopping', duration: 120, cost: 'variable', interest: 'shopping' }
          ]
        }
      ]
    };

    return templates[destinationId] || templates['budapest'];
  }

  /**
   * 根據興趣篩選活動
   */
  filterActivitiesByInterests(activities, interests) {
    if (!interests || interests.length === 0) return activities;
    
    // 給每個活動打分
    const scored = activities.map(activity => {
      const score = interests.includes(activity.interest) ? 10 : 5;
      return { ...activity, score };
    });

    // 依分數排序，但保持時間順序
    return scored.sort((a, b) => {
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return b.score - a.score;
    });
  }

  /**
   * 根據節奏調整
   */
  adjustForPace(days, pace) {
    const paceMultipliers = {
      'slow': 0.7,    // 減少 30% 活動
      'moderate': 1,  // 保持原樣
      'fast': 1.3     // 增加緊湊活動（這裡簡化處理）
    };

    const multiplier = paceMultipliers[pace] || 1;

    return days.map(day => ({
      ...day,
      activities: day.activities.slice(0, Math.ceil(day.activities.length * multiplier))
    }));
  }

  /**
   * 根據預算調整
   */
  adjustForBudget(days, budget) {
    const budgetFilters = {
      'low': activity => activity.cost !== 'high',
      'medium': activity => true,
      'high': activity => true // 高預算可以體驗所有
    };

    const filter = budgetFilters[budget] || budgetFilters.medium;

    return days.map(day => ({
      ...day,
      activities: day.activities.filter(filter)
    }));
  }

  /**
   * 豐富行程資訊（添加圖片、詳細描述等）
   */
  enrichItinerary(itinerary) {
    // 這裡可以添加更多景點資訊、圖片、地圖座標等
    return {
      ...itinerary,
      enrichedAt: new Date().toISOString(),
      version: '3.0'
    };
  }

  /**
   * 儲存行程
   */
  async saveItinerary(itinerary) {
    try {
      // 儲存到本地
      const saved = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
      saved.push(itinerary);
      localStorage.setItem('saved_itineraries', JSON.stringify(saved));

      // 如果有登入，同步到雲端
      if (typeof supabaseClient !== 'undefined' && navigator.onLine) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('saved_itineraries').insert({
            user_id: user.id,
            itinerary: itinerary,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn('[TripPlanner] Could not save itinerary:', e);
    }
  }

  /**
   * 取得已儲存的行程
   */
  async getSavedItineraries() {
    try {
      // 先從本地取得
      const local = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
      
      // 如果有登入，合併雲端資料
      if (typeof supabaseClient !== 'undefined' && navigator.onLine) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          const { data } = await supabaseClient
            .from('saved_itineraries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (data) {
            return [...data.map(d => d.itinerary), ...local];
          }
        }
      }
      
      return local;
    } catch (e) {
      console.warn('[TripPlanner] Could not get saved itineraries:', e);
      return [];
    }
  }

  /**
   * 調整已生成的行程
   */
  adjustItinerary(dayIndex, changes) {
    if (!this.state.generatedItinerary) return;

    const days = [...this.state.generatedItinerary.days];
    days[dayIndex] = { ...days[dayIndex], ...changes };

    this.state.generatedItinerary = {
      ...this.state.generatedItinerary,
      days,
      adjustedAt: new Date().toISOString()
    };

    this.saveItinerary(this.state.generatedItinerary);

    window.dispatchEvent(new CustomEvent('planner:itineraryAdjusted', {
      detail: { itinerary: this.state.generatedItinerary }
    }));
  }

  /**
   * 重設規劃器
   */
  reset() {
    this.state = {
      step: 0,
      preferences: {
        destination: null,
        days: 3,
        startDate: null,
        interests: [],
        budget: 'medium',
        pace: 'moderate',
        travelStyle: 'balanced',
        accessibility: false
      },
      generatedItinerary: null,
      isGenerating: false
    };
    
    window.dispatchEvent(new CustomEvent('planner:reset'));
  }
}

// 建立全域實例
const tripPlanner = new TripPlanner();
window.tripPlanner = tripPlanner;

export default tripPlanner;