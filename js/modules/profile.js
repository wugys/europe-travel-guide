/**
 * User Profile Module
 * 會員與個人化系統 - v3.0
 */

class UserProfile {
  constructor() {
    // 預設設定
    this.defaults = {
      // 語言
      preferredLanguage: 'zh-TW',
      
      // 導遊人格
      guidePersonality: 'professional', // professional, casual, secret
      
      // 旅遊節奏
      travelPace: 'moderate', // slow, moderate, fast
      
      // 體力設定
      energyLevel: 'normal', // relaxed, normal, high
      walkingTolerance: 5, // 1-10
      
      // 拍照偏好
      photoPriority: false,
      preferredPhotoTypes: ['landscape', 'architecture'],
      
      // 聯繫設定
      contactCompanyEnabled: true,
      emergencyContact: null,
      
      // 通知偏好
      notificationPrefs: {
        timeReminders: true,
        gpsReminders: true,
        weatherAlerts: true,
        dailySummary: false,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      },
      
      // 語音偏好
      voicePrefs: {
        enabled: true,
        autoPlay: false,
        speed: 0.9,
        voice: 'default'
      },
      
      // 進階設定
      accessibilityMode: false,
      highContrastMode: false,
      fontSize: 'normal', // small, normal, large
      
      // 訂閱資訊
      subscriptionTier: 'free', // free, premium
      subscriptionExpiry: null
    };
    
    // 當前設定
    this.data = { ...this.defaults };
    
    // 是否有未儲存的變更
    this.hasChanges = false;
    
    // 監聽器
    this.listeners = [];
  }

  /**
   * 初始化
   */
  async init() {
    console.log('[UserProfile] Initializing...');
    
    // 從本地載入
    await this.loadFromLocal();
    
    // 從雲端同步（如果有登入）
    if (navigator.onLine) {
      await this.syncFromCloud();
    }
    
    // 套用設定
    this.applySettings();
    
    console.log('[UserProfile] Initialized:', this.data);
  }

  /**
   * 從 LocalStorage 載入
   */
  async loadFromLocal() {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = { ...this.defaults, ...parsed };
      }
    } catch (error) {
      console.error('[UserProfile] Error loading from local:', error);
    }
  }

  /**
   * 儲存到 LocalStorage
   */
  async saveToLocal() {
    try {
      localStorage.setItem('user_profile', JSON.stringify(this.data));
      this.hasChanges = false;
    } catch (error) {
      console.error('[UserProfile] Error saving to local:', error);
    }
  }

  /**
   * 從雲端同步
   */
  async syncFromCloud() {
    try {
      // 檢查是否有 Supabase 客戶端
      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        return;
      }
      
      // 取得當前使用者
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return;
      }
      
      // 從 Supabase 讀取
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // 如果記錄不存在，創建一個
        if (error.code === 'PGRST116') {
          await this.createCloudProfile(user.id);
        } else {
          throw error;
        }
        return;
      }
      
      // 合併雲端資料（雲端優先）
      if (data) {
        this.data = { ...this.data, ...data.settings };
        await this.saveToLocal();
      }
      
    } catch (error) {
      console.error('[UserProfile] Error syncing from cloud:', error);
    }
  }

  /**
   * 儲存到雲端
   */
  async saveToCloud() {
    try {
      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        return false;
      }
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return false;
      }
      
      const { error } = await supabaseClient
        .from('user_profiles')
        .upsert({
          id: user.id,
          settings: this.data,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      return true;
      
    } catch (error) {
      console.error('[UserProfile] Error saving to cloud:', error);
      return false;
    }
  }

  /**
   * 創建雲端記錄
   */
  async createCloudProfile(userId) {
    try {
      await supabaseClient
        .from('user_profiles')
        .insert({
          id: userId,
          settings: this.data,
          subscription_tier: 'free'
        });
    } catch (error) {
      console.error('[UserProfile] Error creating cloud profile:', error);
    }
  }

  /**
   * 取得設定值
   */
  get(key) {
    return this.data[key];
  }

  /**
   * 設定值
   */
  async set(key, value) {
    const oldValue = this.data[key];
    this.data[key] = value;
    this.hasChanges = true;
    
    // 觸發事件
    this.notifyListeners(key, value, oldValue);
    
    // 自動儲存
    await this.saveToLocal();
    
    // 如果是重要設定，同步到雲端
    if (this.shouldSyncToCloud(key)) {
      await this.saveToCloud();
    }
  }

  /**
   * 批次設定
   */
  async setMultiple(settings) {
    Object.keys(settings).forEach(key => {
      this.data[key] = settings[key];
    });
    this.hasChanges = true;
    
    await this.saveToLocal();
    await this.saveToCloud();
    
    // 套用設定
    this.applySettings();
  }

  /**
   * 是否需要同步到雲端
   */
  shouldSyncToCloud(key) {
    const syncKeys = [
      'preferredLanguage',
      'guidePersonality',
      'travelPace',
      'energyLevel',
      'subscriptionTier'
    ];
    return syncKeys.includes(key);
  }

  /**
   * 套用設定到 UI
   */
  applySettings() {
    // 套用語言
    if (typeof i18n !== 'undefined') {
      i18n.setLanguage(this.data.preferredLanguage);
    }
    
    // 套用無障礙模式
    if (this.data.accessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
    
    // 套用高對比
    if (this.data.highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // 套用字體大小
    document.body.classList.remove('font-small', 'font-normal', 'font-large');
    document.body.classList.add(`font-${this.data.fontSize}`);
  }

  /**
   * 監聽設定變更
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知監聽器
   */
  notifyListeners(key, newValue, oldValue) {
    this.listeners.forEach(callback => {
      try {
        callback(key, newValue, oldValue);
      } catch (error) {
        console.error('[UserProfile] Error in listener:', error);
      }
    });
    
    // 觸發全局事件
    window.dispatchEvent(new CustomEvent('profile:changed', {
      detail: { key, newValue, oldValue }
    }));
  }

  /**
   * 重設為預設值
   */
  async reset() {
    this.data = { ...this.defaults };
    this.hasChanges = true;
    await this.saveToLocal();
    await this.saveToCloud();
    this.applySettings();
  }

  /**
   * 匯出設定
   */
  export() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * 匯入設定
   */
  async import(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.data = { ...this.defaults, ...parsed };
      this.hasChanges = true;
      await this.saveToLocal();
      await this.saveToCloud();
      this.applySettings();
      return true;
    } catch (error) {
      console.error('[UserProfile] Error importing settings:', error);
      return false;
    }
  }

  /**
   * 產生個人化 AI Context
   */
  getAIContext() {
    const personalityDescriptions = {
      'professional': '專業嚴謹的導遊，提供詳盡準確的資訊',
      'casual': '輕鬆幽默的朋友，像在地人般分享旅遊心得',
      'secret': '秘境探索者，專長發現隱藏景點和當地人才知道的玩法'
    };
    
    const paceDescriptions = {
      'slow': '從容不迫的步調，留出充足時間享受每個景點',
      'moderate': '適中的步調，平衡深度與效率',
      'fast': '緊湊的步調，專注必看重點，高效利用時間'
    };
    
    const energyDescriptions = {
      'relaxed': '偏好輕鬆行程，避免過多步行，多建議休息點',
      'normal': '正常的步行量，適度的活動安排',
      'high': '可以應付高強度的行程，長時間步行沒問題'
    };
    
    return {
      language: this.data.preferredLanguage,
      personality: personalityDescriptions[this.data.guidePersonality],
      pace: paceDescriptions[this.data.travelPace],
      energy: energyDescriptions[this.data.energyLevel],
      photoPriority: this.data.photoPriority,
      accessibility: this.data.accessibilityMode
    };
  }

  /**
   * 檢查功能權限
   */
  canUseFeature(feature) {
    const tier = this.data.subscriptionTier;
    
    const featureMatrix = {
      'free': [
        'basic_guide',
        'rule_based_ai',
        'offline_mode',
        'favorites',
        'basic_map'
      ],
      'premium': [
        'basic_guide',
        'rule_based_ai',
        'llm_guide',
        'unlimited_chat',
        'itinerary_planner',
        'voice_guide',
        'offline_mode',
        'favorites',
        'advanced_map',
        'content_all_versions',
        'custom_personality',
        'realtime_sync'
      ]
    };
    
    return tier === 'premium' || tier === 'free' && featureMatrix.free.includes(feature);
  }

  /**
   * 升級到付費版
   */
  async upgradeToPremium(expiryDate = null) {
    this.data.subscriptionTier = 'premium';
    this.data.subscriptionExpiry = expiryDate;
    await this.saveToLocal();
    await this.saveToCloud();
  }

  /**
   * 檢查是否為付費用戶
   */
  isPremium() {
    if (this.data.subscriptionTier !== 'premium') {
      return false;
    }
    
    // 檢查是否過期
    if (this.data.subscriptionExpiry) {
      return new Date(this.data.subscriptionExpiry) > new Date();
    }
    
    return true;
  }

  /**
   * 取得設定摘要（用於顯示）
   */
  getSummary() {
    return {
      language: this.data.preferredLanguage,
      personality: this.getPersonalityLabel(),
      pace: this.getPaceLabel(),
      energy: this.getEnergyLabel(),
      photoPriority: this.data.photoPriority,
      tier: this.data.subscriptionTier,
      isPremium: this.isPremium()
    };
  }

  /**
   * 取得導遊風格標籤
   */
  getPersonalityLabel() {
    const labels = {
      'professional': '專業導遊',
      'casual': '輕鬆好友',
      'secret': '秘境探索者'
    };
    return labels[this.data.guidePersonality] || this.data.guidePersonality;
  }

  /**
   * 取得節奏標籤
   */
  getPaceLabel() {
    const labels = {
      'slow': '慢遊',
      'moderate': '適中',
      'fast': '快閃'
    };
    return labels[this.data.travelPace] || this.data.travelPace;
  }

  /**
   * 取得體力標籤
   */
  getEnergyLabel() {
    const labels = {
      'relaxed': '輕鬆',
      'normal': '正常',
      'high': '高體力'
    };
    return labels[this.data.energyLevel] || this.data.energyLevel;
  }

  /**
   * 檢查是否在勿擾時段
   */
  isQuietHours() {
    if (!this.data.notificationPrefs.quietHours.enabled) {
      return false;
    }
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const { start, end } = this.data.notificationPrefs.quietHours;
    
    return currentTime >= start || currentTime <= end;
  }
}

// 建立全域實例
const userProfile = new UserProfile();
window.userProfile = userProfile;

export default userProfile;