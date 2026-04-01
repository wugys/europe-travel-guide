/**
 * AI Router Module
 * 統一管理 AI 任務路由，處理離線降級、快取、Token 控制
 * v3.0 - Product Architecture
 */

class AIRouter {
  constructor() {
    this.config = {
      apiUrl: '/functions/v1/ai-proxy',
      fallbackEnabled: true,
      cacheEnabled: true
    };
    
    this.cache = new Map();
    this.maxCacheSize = 100;
    
    // 任務類型對應的本地規則引擎
    this.fallbackHandlers = {
      'guide': this.fallbackToRuleEngine.bind(this),
      'planner': this.fallbackToTemplate.bind(this),
      'chat': this.fallbackToStaticResponse.bind(this),
      'content': this.fallbackToBaseContent.bind(this)
    };
  }

  /**
   * 主要請求方法
   * @param {string} task - 任務類型: guide, planner, chat, content
   * @param {Array} messages - 對話訊息
   * @param {Object} context - 上下文資訊
   * @returns {Promise<Object>}
   */
  async request(task, messages = [], context = {}) {
    try {
      // 1. 檢查網路狀態
      if (!navigator.onLine) {
        console.log('[AI Router] Offline, using fallback');
        return await this.fallbackHandlers[task](messages, context);
      }

      // 2. 檢查本地快取
      if (this.config.cacheEnabled) {
        const cached = this.getCachedResponse(task, messages, context);
        if (cached) {
          console.log('[AI Router] Cache hit');
          return { ...cached, cached: true };
        }
      }

      // 3. 呼叫 Edge Function
      const response = await this.callEdgeFunction(task, messages, context);
      
      // 4. 快取成功回應
      if (this.config.cacheEnabled) {
        this.cacheResponse(task, messages, context, response);
      }

      return response;

    } catch (error) {
      console.error('[AI Router] Request failed:', error);
      
      // 5. 錯誤時降級
      if (this.config.fallbackEnabled) {
        console.log('[AI Router] Falling back to rule engine');
        return await this.fallbackHandlers[task](messages, context);
      }
      
      throw error;
    }
  }

  /**
   * 呼叫 Supabase Edge Function
   */
  async callEdgeFunction(task, messages, context) {
    // 取得 Supabase session
    const { data: { session } } = await window.supabaseClient?.auth.getSession() || {};
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${this.getSupabaseUrl()}${this.config.apiUrl}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        task,
        messages,
        context
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI request failed');
    }

    const data = await response.json();
    
    // 解析回應
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(data.response);
    } catch {
      parsedResponse = { 
        action: data.response,
        next: '',
        warning: null,
        alternative: '',
        contactTaiwan: ''
      };
    }

    return {
      ...parsedResponse,
      model: data.model,
      cost: data.cost,
      cached: data.cached
    };
  }

  /**
   * Guide AI - 降級到規則引擎
   */
  async fallbackToRuleEngine(messages, context) {
    // 使用原有的 AIGuide 規則引擎
    if (window.AIGuide) {
      return await AIGuide.generateSuggestion(context);
    }
    
    // 最基本的回退回應
    return {
      action: '目前處於離線模式，建議參考今日行程',
      next: '請查看「今日」頁面了解接下來的活動',
      warning: '離線模式下 AI 功能受限',
      alternative: '連線後可獲得完整 AI 建議',
      contactTaiwan: this.checkTaipeiContactTime(),
      fallback: true
    };
  }

  /**
   * Planner AI - 降級到模板
   */
  async fallbackToTemplate(messages, context) {
    const { destination, days, preferences } = context;
    
    // 回傳簡化模板
    return {
      title: `${destination} ${days}日遊（離線模板）`,
      description: '離線模式下僅提供基礎模板，連線後可獲得完整 AI 規劃',
      days: this.generateBasicTemplate(days, destination),
      fallback: true
    };
  }

  /**
   * Chat AI - 降級到靜態回應
   */
  async fallbackToStaticResponse(messages, context) {
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // 簡單關鍵字匹配
    const responses = {
      '廁所': '附近通常有公廁，或在咖啡廳消費後可使用',
      '餐廳': '建議查看「今日」頁面的用餐推薦',
      '交通': '可使用 Google Maps 規劃路線，或購買當地交通票券',
      '時間': `現在是 ${new Date().toLocaleTimeString('zh-TW')}`,
      '天氣': '請查看手機天氣 App 獲取即時資訊'
    };
    
    for (const [keyword, response] of Object.entries(responses)) {
      if (userMessage.includes(keyword)) {
        return { response, fallback: true };
      }
    }
    
    return { 
      response: '離線模式下 AI 對話功能受限，請連線後再試',
      fallback: true 
    };
  }

  /**
   * Content AI - 降級到基礎內容
   */
  async fallbackToBaseContent(messages, context) {
    const { attractionId } = context;
    
    // 從本地資料庫取得基礎內容
    const baseData = await window.travelDB?.get('attractions', attractionId);
    
    if (baseData) {
      return {
        hook: baseData.name,
        story: baseData.description || '暫無詳細介紹',
        highlights: baseData.highlights || ['主要景點'],
        experience: '建議親自到訪體驗',
        warnings: ['離線模式下內容較簡略'],
        photos: ['主建築正面', '特色角度'],
        duration: baseData.duration || '建議停留 1-2 小時',
        fallback: true
      };
    }
    
    return {
      hook: '景點資訊',
      story: '離線模式下無法取得詳細內容',
      highlights: ['請連線後獲得完整導覽'],
      experience: '連線後可獲得 AI 生成的深度內容',
      warnings: ['離線模式'],
      fallback: true
    };
  }

  /**
   * 快取管理
   */
  getCachedResponse(task, messages, context) {
    const key = this.generateCacheKey(task, messages, context);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // 檢查過期
    const ttl = this.getCacheTTL(task);
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  cacheResponse(task, messages, context, response) {
    // LRU 清理
    if (this.cache.size >= this.maxCacheSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    
    const key = this.generateCacheKey(task, messages, context);
    this.cache.set(key, {
      data: response,
      timestamp: Date.now()
    });
  }

  generateCacheKey(task, messages, context) {
    const data = JSON.stringify({ task, messages, context });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${task}:${Math.abs(hash).toString(36)}`;
  }

  getCacheTTL(task) {
    const ttl = {
      'guide': 24 * 60 * 60 * 1000,      // 1 天
      'planner': 60 * 60 * 1000,          // 1 小時
      'chat': 5 * 60 * 1000,              // 5 分鐘
      'content': 7 * 24 * 60 * 60 * 1000  // 7 天
    };
    return ttl[task] || 60 * 60 * 1000;
  }

  /**
   * 工具方法
   */
  checkTaipeiContactTime() {
    const now = new Date();
    const taipeiHour = parseInt(now.toLocaleString('en-US', {
      timeZone: 'Asia/Taipei',
      hour: 'numeric',
      hour12: false
    }));
    
    if (taipeiHour >= 9 && taipeiHour < 12) {
      return '台北上班時間（早上），可以正常聯繫';
    } else if (taipeiHour >= 13 && taipeiHour < 18) {
      return '台北上班時間（下午），可以正常聯繫';
    } else if (taipeiHour >= 12 && taipeiHour < 13) {
      return '台北午休時間，如有急事仍可聯繫';
    } else {
      return '台北休息中，如有急事可留言，明天早上9點會回覆';
    }
  }

  generateBasicTemplate(days, destination) {
    const template = [];
    for (let i = 1; i <= days; i++) {
      template.push({
        day: i,
        theme: `第 ${i} 天探索`,
        activities: [
          { time: '09:00', title: '上午景點', type: 'attraction' },
          { time: '12:00', title: '午餐', type: 'food' },
          { time: '14:00', title: '下午景點', type: 'attraction' },
          { time: '18:00', title: '晚餐', type: 'food' }
        ]
      });
    }
    return template;
  }

  getSupabaseUrl() {
    // 從 Supabase client 取得 URL
    return window.supabaseClient?.supabaseUrl || 'https://xbwibudbaqhxbuyjhouc.supabase.co';
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.cache.clear();
    console.log('[AI Router] Cache cleared');
  }

  /**
   * 取得快取統計
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// 建立全域實例
window.AIRouter = new AIRouter();

export default AIRouter;