/**
 * Content Engine Module
 * 內容生成引擎 - v3.0
 * 
 * 功能：生成景點多版本內容 (Guide/Secret/Light/Voice)
 */

class ContentEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = {
      'guide': 7 * 24 * 60 * 60 * 1000,    // 7 days
      'secret': 7 * 24 * 60 * 60 * 1000,   // 7 days
      'light': 30 * 24 * 60 * 60 * 1000,   // 30 days
      'voice': 7 * 24 * 60 * 60 * 1000     // 7 days
    };
    
    this.generating = new Set(); // 追蹤正在生成的內容
  }

  /**
   * 初始化
   */
  async init() {
    console.log('[ContentEngine] Initializing...');
    
    // 從 IndexedDB 載入快取
    await this.loadCacheFromDB();
    
    // 定期清理過期快取
    setInterval(() => this.cleanupCache(), 60 * 60 * 1000); // 每小時
    
    console.log('[ContentEngine] Initialized');
  }

  /**
   * 載入快取
   */
  async loadCacheFromDB() {
    try {
      if (typeof travelDB === 'undefined') return;
      
      const cached = await travelDB.getAll('content_cache');
      const now = Date.now();
      
      cached.forEach(item => {
        if (item.expiresAt > now) {
          this.cache.set(item.key, item);
        }
      });
      
      console.log(`[ContentEngine] Loaded ${this.cache.size} cached items`);
    } catch (e) {
      console.warn('[ContentEngine] Could not load cache:', e);
    }
  }

  /**
   * 取得內容 (快取優先)
   */
  async getContent(attractionId, version, forceRefresh = false) {
    const cacheKey = `${attractionId}:${version}:${i18n?.getCurrentLanguage?.() || 'zh-TW'}`;
    
    // 檢查快取
    if (!forceRefresh) {
      const cached = this.getCachedContent(cacheKey);
      if (cached) return cached;
      
      // 檢查 IndexedDB
      const dbCached = await this.getContentFromDB(attractionId, version);
      if (dbCached) return dbCached;
    }
    
    // 檢查是否正在生成
    if (this.generating.has(cacheKey)) {
      console.log('[ContentEngine] Content is being generated, waiting...');
      await this.waitForGeneration(cacheKey);
      return this.getCachedContent(cacheKey);
    }

    // 生成新內容
    this.generating.add(cacheKey);
    
    try {
      const content = await this.generateContent(attractionId, version);
      
      // 快取結果
      this.cacheContent(cacheKey, content);
      await this.saveContentToDB(attractionId, version, content);
      
      return content;
      
    } finally {
      this.generating.delete(cacheKey);
    }
  }

  /**
   * 生成內容
   */
  async generateContent(attractionId, version) {
    // 取得基礎景點資料
    const attraction = await this.getAttractionData(attractionId);
    if (!attraction) {
      throw new Error(`Attraction not found: ${attractionId}`);
    }

    // 檢查是否可以使用 AI
    const canUseAI = userProfile?.isPremium?.() && navigator.onLine 
&& AIRouter?.canMakeRequest?.('content');

    if (canUseAI) {
      try {
        return await this.generateWithAI(attraction, version);
      } catch (e) {
        console.warn('[ContentEngine] AI generation failed, using fallback:', e);
      }
    }

    // 回退到模板生成
    return this.generateWithTemplate(attraction, version);
  }

  /**
   * 使用 AI 生成
   */
  async generateWithAI(attraction, version) {
    const userContext = userProfile?.getAIContext?.() || {};
    const language = i18n?.getCurrentLanguage?.() || 'zh-TW';
    
    const response = await AIRouter.request('content', {
      attraction: {
        id: attraction.id,
        name: attraction.name,
        description: attraction.description,
        type: attraction.type,
        location: attraction.location
      },
      version,
      language,
      userContext
    });

    if (!response?.content) {
      throw new Error('Invalid AI response');
    }

    return {
      ...response.content,
      generatedBy: 'ai',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 使用模板生成
   */
  generateWithTemplate(attraction, version) {
    const generators = {
      'guide': () => this.generateGuideVersion(attraction),
      'secret': () => this.generateSecretVersion(attraction),
      'light': () => this.generateLightVersion(attraction),
      'voice': () => this.generateVoiceVersion(attraction)
    };

    const generator = generators[version];
    if (!generator) {
      throw new Error(`Unknown version: ${version}`);
    }

    return {
      ...generator(),
      generatedBy: 'template',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 生成導覽版 (Guide)
   * 專業、詳盡、深度
   */
  generateGuideVersion(attraction) {
    return {
      version: 'guide',
      title: attraction.name,
      headline: `${attraction.name} - 深度導覽`,
      
      description: `${attraction.description}\n\n這座建築代表了${attraction.country || '當地'}最具特色的${attraction.type || '文化'}遺產，值得您花時間細細品味。`,
      
      highlights: [
        { title: '歷史背景', content: `建於${attraction.builtYear || '古代'}，見證了${attraction.historicalPeriod || '重要歷史時期'}。` },
        { title: '建築特色', content: attraction.architecture || '融合多種建築風格的傑作。' },
        { title: '必看重點', content: `✦ 主要展覽\n✦ 建築細節\n✦ 周邊景觀` }
      ],
      
      practicalInfo: {
        duration: attraction.duration || '建議停留 2-3 小時',
        bestTime: attraction.bestTime || '早上 9:00-11:00 或下午 15:00-17:00',
        tickets: attraction.tickets || '建議提前線上購票',
        crowd: attraction.crowdLevel || '週末較擁擠，平日較佳'
      },
      
      tips: [
        '建議租借語音導覽，了解更多背景故事',
        '穿著舒適的鞋子，需要走較多路',
        '館內允許拍照，但請關閉閃光燈',
        '附近有幾家不錯的咖啡館可以休息'
      ],
      
      relatedAttractions: attraction.nearby || [],
      
      readingTime: 5
    };
  }

  /**
   * 生成秘境版 (Secret)
   * 在地視角、隱藏資訊、獨特體驗
   */
  generateSecretVersion(attraction) {
    return {
      version: 'secret',
      title: attraction.name,
      headline: `在地人帶路：${attraction.name} 不為人知的一面`,
      
      description: `大家都去${attraction.name}，但很少人知道...`,
      
      insiderTips: [
        { 
          title: '最佳拍照點', 
          content: '從東側小巷進去，有一個觀景平台，遊客少但視野絕佳。',
          location: { lat: 0, lng: 0 } // 可選座標
        },
        { 
          title: '在地美食', 
          content: '出口右手邊第三家店，老闆做了 40 年傳統點心，只有當地人知道。'
        },
        { 
          title: '避開人潮', 
          content: '週二、週四早上 8:30 開門時入場，幾乎沒有團客。'
        }
      ],
      
      localExperience: [
        '跟著導覽員問問題，他們通常很樂意分享不為人知的故事',
        '留意建築角落的雕刻細節，每個都有寓意',
        '如果有機會，參加晚上的特別導覽活動'
      ],
      
      hiddenGems: [
        { name: '秘密花園', description: '後方小徑通往的隱藏庭院' },
        { name: '老照片牆', description: '地下室展示的早期歷史照片' }
      ],
      
      nearbySecrets: attraction.secretNearby || [],
      
      readingTime: 4
    };
  }

  /**
   * 生成輕量版 (Light)
   * 簡潔、快速、重點
   */
  generateLightVersion(attraction) {
    return {
      version: 'light',
      title: attraction.name,
      headline: attraction.name,
      
      oneLiner: this.generateOneLiner(attraction),
      
      quickFacts: {
        duration: attraction.duration || '2小時',
        price: attraction.price || '€15',
        mustSee: attraction.mustSee || '主展覽廳',
        bestFor: attraction.bestFor || '文化愛好者'
      },
      
      whyVisit: attraction.whyVisit || `體驗${attraction.country || '當地'}獨特的${attraction.type || '文化'}魅力。`,
      
      quickTips: [
        `⏱️ ${attraction.duration || '2小時'}`,
        `💰 ${attraction.price || '€15'}`,
        `📸 ${attraction.photoSpot || '入口廣場'}`,
        `🎯 ${attraction.highlight || '必看：主建築'}`
      ],
      
      skipIf: attraction.skipIf || '時間很趕或對歷史沒興趣',
      
      readingTime: 1
    };
  }

  /**
   * 生成語音版 (Voice)
   * 口語化、聆聽友善、段落短
   */
  generateVoiceVersion(attraction) {
    const guideVersion = this.generateGuideVersion(attraction);
    
    return {
      version: 'voice',
      title: attraction.name,
      
      script: this.convertToVoiceScript(guideVersion),
      
      segments: [
        {
          timestamp: 0,
          text: `歡迎來到${attraction.name}。我是你的 AI 導遊。`,
          highlight: 'entrance'
        },
        {
          timestamp: 15,
          text: `這裡最重要的看點是...`,
          highlight: 'main_feature'
        },
        {
          timestamp: 45,
          text: `讓我告訴你一個有趣的故事...`,
          highlight: 'story'
        }
      ],
      
      totalDuration: 180, // 3 minutes
      
      pausePoints: [
        { at: 60, text: '你可以在這裡稍作停留，欣賞周圍的景色。' },
        { at: 120, text: '接下來我們往下一個景點移動。' }
      ]
    };
  }

  /**
   * 轉換為語音腳本
   */
  convertToVoiceScript(content) {
    // 簡化文字，適合語音播報
    return content.description
      .replace(/\n/g, ' ')
      .replace(/[（(][^）)]+[）)]/g, '') // 移除括號內容
      .replace(/[•・]/g, '，') // 列表符號改為逗號
      .substring(0, 500) + '...'; // 限制長度
  }

  /**
   * 生成一句話描述
   */
  generateOneLiner(attraction) {
    const templates = [
      `${attraction.name}是${attraction.country || '當地'}最具代表性的${attraction.type || '景點'}。`,
      `來到${attraction.country || '這裡'}，沒看過${attraction.name}等於白來。`,
      `${attraction.name}：${attraction.highlight || '歷史與藝術的完美結合'}。`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 取得景點資料
   */
  async getAttractionData(attractionId) {
    // 從 ATTRACTIONS 全域變數
    if (typeof ATTRACTIONS !== 'undefined') {
      return ATTRACTIONS.find(a => a.id === attractionId);
    }
    
    // 從 IndexedDB
    if (typeof travelDB !== 'undefined') {
      return await travelDB.get('attractions', attractionId);
    }
    
    return null;
  }

  /**
   * 快取管理
   */
  getCachedContent(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // 更新最後存取時間
    cached.lastAccessed = Date.now();
    return cached.content;
  }

  cacheContent(key, content) {
    const [attractionId, version] = key.split(':');
    const ttl = this.cacheTTL[version] || 7 * 24 * 60 * 60 * 1000;
    
    this.cache.set(key, {
      key,
      content,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now()
    });
  }

  async saveContentToDB(attractionId, version, content) {
    try {
      if (typeof travelDB === 'undefined') return;
      
      await travelDB.put('content_cache', {
        id: `${attractionId}:${version}`,
        attractionId,
        version,
        content,
        language: i18n?.getCurrentLanguage?.() || 'zh-TW',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[ContentEngine] Could not save to DB:', e);
    }
  }

  async getContentFromDB(attractionId, version) {
    try {
      if (typeof travelDB === 'undefined') return null;
      
      const cached = await travelDB.get('content_cache', `${attractionId}:${version}`);
      if (cached) {
        return cached.content;
      }
    } catch (e) {
      console.warn('[ContentEngine] Could not read from DB:', e);
    }
    return null;
  }

  /**
   * 等待生成完成
   */
  waitForGeneration(key) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.generating.has(key)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // 超時處理
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000); // 30秒超時
    });
  }

  /**
   * 清理過期快取
   */
  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ContentEngine] Cleaned ${cleaned} expired cache items`);
    }
  }

  /**
   * 預載內容
   */
  async preloadContents(attractionIds, versions = ['light']) {
    console.log('[ContentEngine] Preloading contents...');
    
    const promises = attractionIds.flatMap(id => 
      versions.map(version => this.getContent(id, version).catch(() => null))
    );
    
    await Promise.all(promises);
    console.log('[ContentEngine] Preload complete');
  }

  /**
   * 取得內容統計
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      generatingCount: this.generating.size,
      versions: {
        guide: Array.from(this.cache.keys()).filter(k => k.includes(':guide:')).length,
        secret: Array.from(this.cache.keys()).filter(k => k.includes(':secret:')).length,
        light: Array.from(this.cache.keys()).filter(k => k.includes(':light:')).length,
        voice: Array.from(this.cache.keys()).filter(k => k.includes(':voice:')).length
      }
    };
  }
}

// 建立全域實例
const contentEngine = new ContentEngine();
window.contentEngine = contentEngine;

export default contentEngine;