-- ============================================
-- TravelMind AI v3.0 - CMS 資料表
-- 第二批：內容管理系統
-- ============================================

-- ============================================
-- 1. ATTRACTIONS_ADMIN (景點管理表)
-- ============================================
CREATE TABLE IF NOT EXISTS attractions_admin (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    type TEXT, -- museum, landmark, nature, food, etc.
    
    -- 位置資訊
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    
    -- 營運資訊
    opening_hours JSONB,
    ticket_price JSONB,
    website TEXT,
    phone TEXT,
    
    -- 媒體
    images TEXT[],
    cover_image TEXT,
    
    -- 分類標籤
    tags TEXT[],
    interests TEXT[], -- culture, food, nature, shopping, etc.
    
    -- 狀態
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    priority INTEGER DEFAULT 0,
    
    -- 元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_attractions_admin_city ON attractions_admin(city);
CREATE INDEX IF NOT EXISTS idx_attractions_admin_country ON attractions_admin(country);
CREATE INDEX IF NOT EXISTS idx_attractions_admin_status ON attractions_admin(status);
CREATE INDEX IF NOT EXISTS idx_attractions_admin_type ON attractions_admin(type);

-- RLS
ALTER TABLE attractions_admin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attractions are publicly readable"
    ON attractions_admin FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify attractions"
    ON attractions_admin FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'editor')
    ));

-- ============================================
-- 2. CONTENT_VERSIONS (內容版本表)
-- ============================================
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    attraction_id TEXT REFERENCES attractions_admin(id) ON DELETE CASCADE,
    version TEXT NOT NULL, -- guide, secret, light, voice
    language TEXT NOT NULL DEFAULT 'zh-TW',
    
    -- 內容
    content JSONB NOT NULL,
    
    -- 狀態流程: draft -> pending_review -> approved/rejected -> published
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'published')),
    
    -- 審核資訊
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    feedback TEXT,
    
    -- 發布資訊
    published_at TIMESTAMPTZ,
    
    -- 元資料
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一約束：每個景點每個版本每個語言只能有一個發布的內容
    UNIQUE(attraction_id, version, language, status)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_content_versions_attraction ON content_versions(attraction_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_status ON content_versions(status);
CREATE INDEX IF NOT EXISTS idx_content_versions_language ON content_versions(language);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);

-- RLS
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published content is publicly readable"
    ON content_versions FOR SELECT
    USING (status = 'published');

CREATE POLICY "Creators can read their own content"
    ON content_versions FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Admins can read all content"
    ON content_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'editor')
    ));

CREATE POLICY "Creators can modify their drafts"
    ON content_versions FOR UPDATE
    USING (created_by = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can modify all content"
    ON content_versions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'editor')
    ));

-- ============================================
-- 3. REVIEW_TASKS (審核任務表)
-- ============================================
CREATE TABLE IF NOT EXISTS review_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    content_id UUID REFERENCES content_versions(id) ON DELETE CASCADE,
    
    -- 分配
    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,
    
    -- 狀態: pending, in_review, approved, rejected
    status TEXT DEFAULT 'pending',
    
    -- 審核結果
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    feedback TEXT,
    
    -- 優先級
    priority INTEGER DEFAULT 0, -- 0: normal, 1: high, 2: urgent
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_review_tasks_status ON review_tasks(status);
CREATE INDEX IF NOT EXISTS idx_review_tasks_assigned ON review_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_review_tasks_content ON review_tasks(content_id);

-- RLS
ALTER TABLE review_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can see their tasks"
    ON review_tasks FOR SELECT
    USING (assigned_to = auth.uid() OR 
           EXISTS (
               SELECT 1 FROM user_profiles 
               WHERE user_id = auth.uid() 
               AND role IN ('admin', 'editor')
           ));

CREATE POLICY "Reviewers can update their tasks"
    ON review_tasks FOR UPDATE
    USING (assigned_to = auth.uid());

-- ============================================
-- 4. CHANGE_LOGS (變更記錄表)
-- ============================================
CREATE TABLE IF NOT EXISTS change_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entity_type TEXT NOT NULL, -- attraction, content, user, etc.
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- create, update, delete, publish
    details JSONB,
    
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    ip_address INET,
    user_agent TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_change_logs_entity ON change_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_time ON change_logs(changed_at);

-- RLS
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
    ON change_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'editor')
    ));

-- ============================================
-- 5. SAVED_ITINERARIES (使用者儲存行程)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 行程資料
    title TEXT,
    destination TEXT,
    days INTEGER,
    start_date DATE,
    
    itinerary JSONB NOT NULL,
    
    -- 元資料
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user ON saved_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_public ON saved_itineraries(is_public);

-- RLS
ALTER TABLE saved_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itineraries"
    ON saved_itineraries FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can modify own itineraries"
    ON saved_itineraries FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- 6. 更新 USER_PROFILES 添加角色欄位
-- ============================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'editor', 'admin'));

-- ============================================
-- 7. CONTENT_CACHE 內容快取表 (前台使用)
-- ============================================
CREATE TABLE IF NOT EXISTS attraction_content (
    id TEXT PRIMARY KEY, -- attraction_id:version
    
    attraction_id TEXT REFERENCES attractions_admin(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'zh-TW',
    
    content JSONB NOT NULL,
    
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES auth.users(id),
    
    expires_at TIMESTAMPTZ, -- 快取過期時間
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_attraction_content_attraction ON attraction_content(attraction_id);
CREATE INDEX IF NOT EXISTS idx_attraction_content_version ON attraction_content(version);
CREATE INDEX IF NOT EXISTS idx_attraction_content_language ON attraction_content(language);

-- RLS
ALTER TABLE attraction_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is publicly readable"
    ON attraction_content FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify content"
    ON attraction_content FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'editor')
    ));

-- ============================================
-- 8. 建立觸發器
-- ============================================

-- content_versions 自動更新 updated_at
CREATE TRIGGER update_content_versions_updated_at
    BEFORE UPDATE ON content_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- review_tasks 自動更新 updated_at
CREATE TRIGGER update_review_tasks_updated_at
    BEFORE UPDATE ON review_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- saved_itineraries 自動更新 updated_at
CREATE TRIGGER update_saved_itineraries_updated_at
    BEFORE UPDATE ON saved_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. 建立視圖
-- ============================================

-- 公開景點列表視圖
CREATE OR REPLACE VIEW public_attractions AS
SELECT 
    id,
    name,
    name_en,
    description,
    city,
    country,
    type,
    latitude,
    longitude,
    cover_image,
    tags,
    interests,
    status
FROM attractions_admin
WHERE status = 'active';

-- 審核統計視圖
CREATE OR REPLACE VIEW review_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600) FILTER (WHERE reviewed_at IS NOT NULL) as avg_review_hours
FROM review_tasks
GROUP BY DATE(created_at);

-- ============================================
-- 註解
-- ============================================
COMMENT ON TABLE attractions_admin IS '景點管理表，供 CMS 使用';
COMMENT ON TABLE content_versions IS '內容版本控制表';
COMMENT ON TABLE review_tasks IS '審核任務追蹤表';
COMMENT ON TABLE change_logs IS '變更記錄表';
COMMENT ON TABLE saved_itineraries IS '使用者儲存的行程';
COMMENT ON TABLE attraction_content IS '前台內容快取表';