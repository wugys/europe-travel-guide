/**
 * Internationalization (i18n) Module
 * 多語系支援系統 - v3.0
 * 
 * 支援: zh-TW (繁體中文), en (English), ja (日本語)
 */

class I18nManager {
  constructor() {
    // 預設語言
    this.currentLang = localStorage.getItem('app_language') || 'zh-TW';
    this.fallbackLang = 'en';
    
    // 載入翻譯資料
    this.translations = {};
    this.contentCache = new Map();
    
    // 支援的語言
    this.supportedLangs = ['zh-TW', 'en', 'ja'];
    
    // 語言顯示名稱
    this.langNames = {
      'zh-TW': '繁體中文',
      'en': 'English',
      'ja': '日本語'
    };
  }

  /**
   * 初始化 i18n
   */
  async init() {
    console.log('[i18n] Initializing...');
    
    // 載入當前語言的翻譯
    await this.loadTranslations(this.currentLang);
    
    // 套用翻譯到 UI
    this.applyTranslations();
    
    console.log('[i18n] Initialized with language:', this.currentLang);
  }

  /**
   * 載入翻譯檔
   */
  async loadTranslations(lang) {
    try {
      // 先檢查 IndexedDB 快取
      const cached = await this.getCachedTranslations(lang);
      if (cached) {
        this.translations[lang] = cached;
        return;
      }
      
      // 從 JSON 檔載入
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      
      const translations = await response.json();
      this.translations[lang] = translations;
      
      // 快取到 IndexedDB
      await this.cacheTranslations(lang, translations);
      
    } catch (error) {
      console.error(`[i18n] Error loading translations for ${lang}:`, error);
      
      // 如果是非預設語言，回退到預設語言
      if (lang !== this.fallbackLang) {
        console.log(`[i18n] Falling back to ${this.fallbackLang}`);
        await this.loadTranslations(this.fallbackLang);
      }
    }
  }

  /**
   * 取得翻譯文字
   */
  t(key, replacements = {}) {
    // 取得當前語言的翻譯
    let text = this.getNestedValue(this.translations[this.currentLang], key);
    
    // 如果找不到，嘗試回退語言
    if (!text && this.currentLang !== this.fallbackLang) {
      text = this.getNestedValue(this.translations[this.fallbackLang], key);
    }
    
    // 如果還是找不到，回傳 key
    if (!text) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }
    
    // 替換變數
    Object.keys(replacements).forEach(key => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
    });
    
    return text;
  }

  /**
   * 切換語言
   */
  async setLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) {
      console.error(`[i18n] Unsupported language: ${lang}`);
      return;
    }
    
    if (lang === this.currentLang) {
      return;
    }
    
    console.log(`[i18n] Switching language from ${this.currentLang} to ${lang}`);
    
    // 載入新語言
    await this.loadTranslations(lang);
    
    // 更新當前語言
    this.currentLang = lang;
    localStorage.setItem('app_language', lang);
    
    // 更新 HTML lang 屬性
    document.documentElement.lang = lang;
    
    // 重新套用翻譯
    this.applyTranslations();
    
    // 觸發語言變更事件
    window.dispatchEvent(new CustomEvent('language:changed', { 
      detail: { language: lang } 
    }));
    
    console.log('[i18n] Language switched to:', lang);
  }

  /**
   * 取得當前語言
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * 取得語言顯示名稱
   */
  getLanguageName(lang) {
    return this.langNames[lang] || lang;
  }

  /**
   * 取得所有支援的語言
   */
  getSupportedLanguages() {
    return this.supportedLangs.map(lang => ({
      code: lang,
      name: this.langNames[lang]
    }));
  }

  /**
   * 套用翻譯到 DOM
   */
  applyTranslations() {
    // 處理 data-i18n 屬性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // 檢查是否有屬性指定 (e.g., data-i18n="placeholder:common.search")
      if (key.includes(':')) {
        const [attr, translationKey] = key.split(':');
        el.setAttribute(attr, this.t(translationKey));
      } else {
        el.textContent = translation;
      }
    });
    
    // 處理 data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // 處理 data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    
    // 更新頁面標題
    const titleKey = document.body.getAttribute('data-i18n-title');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
  }

  /**
   * 取得景點多語言內容
   */
  async getAttractionContent(attractionId, version = 'light') {
    const cacheKey = `attraction:${attractionId}:${this.currentLang}:${version}`;
    
    // 檢查快取
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }
    
    try {
      // 從 IndexedDB 讀取
      if (typeof travelDB !== 'undefined') {
        const cached = await travelDB.get('attraction_content', cacheKey);
        if (cached) {
          this.contentCache.set(cacheKey, cached);
          return cached;
        }
      }
      
      // 從遠端讀取 (如果連線)
      if (navigator.onLine && typeof supabaseClient !== 'undefined') {
        const { data } = await supabaseClient
          .from('attraction_content')
          .select('*')
          .eq('attraction_id', attractionId)
          .eq('language', this.currentLang)
          .eq('version', version)
          .single();
        
        if (data) {
          // 快取到 IndexedDB
          if (typeof travelDB !== 'undefined') {
            await travelDB.put('attraction_content', {
              id: cacheKey,
              ...data
            });
          }
          this.contentCache.set(cacheKey, data);
          return data;
        }
      }
      
      // 回退：使用基礎景點資料
      const baseData = await this.getBaseAttractionData(attractionId);
      return this.convertToLocalizedContent(baseData);
      
    } catch (error) {
      console.error('[i18n] Error getting attraction content:', error);
      // 回退到基礎資料
      return this.getBaseAttractionData(attractionId);
    }
  }

  /**
   * 取得基礎景點資料
   */
  async getBaseAttractionData(attractionId) {
    // 從 ATTRACTIONS 全域變數取得
    if (typeof ATTRACTIONS !== 'undefined') {
      return ATTRACTIONS.find(a => a.id === attractionId);
    }
    return null;
  }

  /**
   * 轉換為多語言內容格式
   */
  convertToLocalizedContent(baseData) {
    if (!baseData) return null;
    
    return {
      id: baseData.id,
      name: baseData.name,
      description: baseData.description,
      highlights: baseData.highlights || [],
      tips: baseData.tips || '',
      duration: baseData.duration,
      language: this.currentLang,
      version: 'base'
    };
  }

  /**
   * 取得 AI 使用的語言名稱
   */
  getAILanguage() {
    const langMap = {
      'zh-TW': '繁體中文',
      'en': 'English',
      'ja': '日本語'
    };
    return langMap[this.currentLang] || 'English';
  }

  /**
   * 取得語音合成語言代碼
   */
  getVoiceLanguage() {
    const langMap = {
      'zh-TW': 'zh-TW',
      'en': 'en-US',
      'ja': 'ja-JP'
    };
    return langMap[this.currentLang] || 'en-US';
  }

  /**
   * 快取管理
   */
  async getCachedTranslations(lang) {
    try {
      if (typeof travelDB !== 'undefined') {
        const cached = await travelDB.get('i18n_cache', `translations:${lang}`);
        return cached?.data;
      }
    } catch (error) {
      console.error('[i18n] Error reading cache:', error);
    }
    return null;
  }

  async cacheTranslations(lang, translations) {
    try {
      if (typeof travelDB !== 'undefined') {
        await travelDB.put('i18n_cache', {
          id: `translations:${lang}`,
          data: translations,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('[i18n] Error caching translations:', error);
    }
  }

  /**
   * 工具函數：取得巢狀物件值
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * 預載語言內容（離線前使用）
   */
  async preloadLanguages(langs = this.supportedLangs) {
    for (const lang of langs) {
      if (!this.translations[lang]) {
        await this.loadTranslations(lang);
      }
    }
    console.log('[i18n] Preloaded languages:', langs);
  }

  /**
   * 清除快取
   */
  async clearCache() {
    this.contentCache.clear();
    
    try {
      if (typeof travelDB !== 'undefined') {
        await travelDB.clear('i18n_cache');
        await travelDB.clear('attraction_content');
      }
    } catch (error) {
      console.error('[i18n] Error clearing cache:', error);
    }
    
    console.log('[i18n] Cache cleared');
  }
}

// 建立全域實例
const i18n = new I18nManager();
window.i18n = i18n;

export default i18n;