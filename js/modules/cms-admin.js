/**
 * CMS Admin Module
 * 內容管理系統 - v3.0
 * 
 * 功能：景點內容管理、版本控制、審核流程
 */

class CMSAdmin {
  constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      currentView: 'dashboard', // dashboard, attractions, content, reviews, settings
      selectedAttraction: null,
      pendingReviews: [],
      contentVersions: new Map()
    };
    
    this.listeners = [];
  }

  /**
   * 初始化
   */
  async init() {
    console.log('[CMS] Initializing...');
    
    // 檢查是否為管理員
    await this.checkAuth();
    
    if (this.state.isAuthenticated) {
      await this.loadPendingReviews();
    }
    
    console.log('[CMS] Initialized, auth:', this.state.isAuthenticated);
  }

  /**
   * 檢查認證
   */
  async checkAuth() {
    try {
      if (typeof supabaseClient === 'undefined') {
        this.state.isAuthenticated = false;
        return;
      }
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        this.state.isAuthenticated = false;
        return;
      }
      
      // 檢查是否為管理員
      const { data: profile } = await supabaseClient
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      this.state.isAuthenticated = profile?.role === 'admin' || profile?.role === 'editor';
      this.state.user = user;
      
    } catch (e) {
      console.warn('[CMS] Auth check failed:', e);
      this.state.isAuthenticated = false;
    }
  }

  /**
   * 登入
   */
  async login(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      await this.checkAuth();
      return this.state.isAuthenticated;
      
    } catch (e) {
      console.error('[CMS] Login failed:', e);
      throw e;
    }
  }

  /**
   * 取得景點列表
   */
  async getAttractions(filters = {}) {
    try {
      let query = supabaseClient
        .from('attractions_admin')
        .select('*');
      
      // 套用篩選
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data || [];
      
    } catch (e) {
      console.error('[CMS] Failed to get attractions:', e);
      // 回退到本地資料
      return typeof ATTRACTIONS !== 'undefined' ? ATTRACTIONS : [];
    }
  }

  /**
   * 更新景點資料
   */
  async updateAttraction(attractionId, updates) {
    try {
      const { data, error } = await supabaseClient
        .from('attractions_admin')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: this.state.user?.id
        })
        .eq('id', attractionId)
        .select()
        .single();
      
      if (error) throw error;
      
      // 記錄變更
      await this.logChange('attraction', attractionId, 'update', updates);
      
      return data;
      
    } catch (e) {
      console.error('[CMS] Failed to update attraction:', e);
      throw e;
    }
  }

  /**
   * 建立內容版本
   */
  async createContentVersion(attractionId, version, content) {
    try {
      const { data, error } = await supabaseClient
        .from('content_versions')
        .insert({
          attraction_id: attractionId,
          version,
          content,
          language: content.language || 'zh-TW',
          created_by: this.state.user?.id,
          status: 'draft' // draft, pending_review, approved, published
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
      
    } catch (e) {
      console.error('[CMS] Failed to create content version:', e);
      throw e;
    }
  }

  /**
   * 提交審核
   */
  async submitForReview(contentId) {
    try {
      const { data, error } = await supabaseClient
        .from('content_versions')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // 建立審核任務
      await supabaseClient.from('review_tasks').insert({
        content_id: contentId,
        status: 'pending',
        assigned_to: null // 待分配
      });
      
      return data;
      
    } catch (e) {
      console.error('[CMS] Failed to submit for review:', e);
      throw e;
    }
  }

  /**
   * 載入待審核項目
   */
  async loadPendingReviews() {
    try {
      const { data, error } = await supabaseClient
        .from('review_tasks')
        .select(`
          *,
          content:content_id (*),
          attraction:content_id (attraction_id (*))
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      this.state.pendingReviews = data || [];
      return this.state.pendingReviews;
      
    } catch (e) {
      console.error('[CMS] Failed to load pending reviews:', e);
      return [];
    }
  }

  /**
   * 審核內容
   */
  async reviewContent(taskId, decision, feedback = '') {
    try {
      // 更新審核任務
      const { data: task } = await supabaseClient
        .from('review_tasks')
        .update({
          status: decision, // approved, rejected
          reviewed_by: this.state.user?.id,
          reviewed_at: new Date().toISOString(),
          feedback
        })
        .eq('id', taskId)
        .select()
        .single();
      
      // 更新內容狀態
      await supabaseClient
        .from('content_versions')
        .update({
          status: decision === 'approved' ? 'published' : 'rejected'
        })
        .eq('id', task.content_id);
      
      // 如果通過，更新快取
      if (decision === 'approved') {
        await this.publishContent(task.content_id);
      }
      
      // 重新載入待審核列表
      await this.loadPendingReviews();
      
      return task;
      
    } catch (e) {
      console.error('[CMS] Review failed:', e);
      throw e;
    }
  }

  /**
   * 發布內容
   */
  async publishContent(contentId) {
    try {
      // 取得內容
      const { data: content } = await supabaseClient
        .from('content_versions')
        .select('*')
        .eq('id', contentId)
        .single();
      
      if (!content) return;
      
      // 更新到前台資料表
      await supabaseClient
        .from('attraction_content')
        .upsert({
          attraction_id: content.attraction_id,
          version: content.version,
          language: content.language,
          content: content.content,
          published_at: new Date().toISOString(),
          published_by: this.state.user?.id
        });
      
      // 清除前端快取
      if (typeof contentEngine !== 'undefined') {
        const cacheKey = `${content.attraction_id}:${content.version}:${content.language}`;
        contentEngine.cache.delete(cacheKey);
      }
      
    } catch (e) {
      console.error('[CMS] Failed to publish content:', e);
      throw e;
    }
  }

  /**
   * 取得內容統計
   */
  async getStats() {
    try {
      const [
        { count: totalAttractions },
        { count: totalContent },
        { count: pendingReviews },
        { count: publishedContent }
      ] = await Promise.all([
        supabaseClient.from('attractions_admin').select('*', { count: 'exact', head: true }),
        supabaseClient.from('content_versions').select('*', { count: 'exact', head: true }),
        supabaseClient.from('review_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseClient.from('content_versions').select('*', { count: 'exact', head: true }).eq('status', 'published')
      ]);
      
      return {
        totalAttractions: totalAttractions || 0,
        totalContent: totalContent || 0,
        pendingReviews: pendingReviews || 0,
        publishedContent: publishedContent || 0
      };
      
    } catch (e) {
      console.error('[CMS] Failed to get stats:', e);
      return {
        totalAttractions: 0,
        totalContent: 0,
        pendingReviews: 0,
        publishedContent: 0
      };
    }
  }

  /**
   * 記錄變更
   */
  async logChange(entityType, entityId, action, details) {
    try {
      await supabaseClient.from('change_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        action,
        details,
        changed_by: this.state.user?.id,
        changed_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[CMS] Failed to log change:', e);
    }
  }

  /**
   * 批次操作
   */
  async batchUpdate(attractionIds, updates) {
    const results = [];
    
    for (const id of attractionIds) {
      try {
        const result = await this.updateAttraction(id, updates);
        results.push({ id, success: true, data: result });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    
    return results;
  }

  /**
   * 同步前台資料
   */
  async syncToFrontend() {
    try {
      // 取得所有已發布的內容
      const { data } = await supabaseClient
        .from('attraction_content')
        .select('*')
        .eq('language', i18n?.getCurrentLanguage?.() || 'zh-TW');
      
      if (!data) return { synced: 0 };
      
      // 更新到 IndexedDB
      if (typeof travelDB !== 'undefined') {
        for (const item of data) {
          await travelDB.put('attraction_content', {
            id: `${item.attraction_id}:${item.version}`,
            ...item
          });
        }
      }
      
      return { synced: data.length };
      
    } catch (e) {
      console.error('[CMS] Sync failed:', e);
      throw e;
    }
  }

  /**
   * 匯出資料
   */
  async exportData(format = 'json') {
    try {
      const { data: attractions } = await supabaseClient
        .from('attractions_admin')
        .select('*');
      
      const { data: contents } = await supabaseClient
        .from('content_versions')
        .select('*');
      
      const exportData = {
        exported_at: new Date().toISOString(),
        attractions,
        contents
      };
      
      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      }
      
      // TODO: 支援 CSV、Excel 格式
      
      return exportData;
      
    } catch (e) {
      console.error('[CMS] Export failed:', e);
      throw e;
    }
  }

  /**
   * 匯入資料
   */
  async importData(data) {
    // TODO: 實作資料匯入
    console.log('[CMS] Import not yet implemented');
  }

  /**
   * 監聽狀態變更
   */
  onStateChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (e) {
        console.error('[CMS] Listener error:', e);
      }
    });
  }
}

// 建立全域實例
const cmsAdmin = new CMSAdmin();
window.cmsAdmin = cmsAdmin;

export default cmsAdmin;