-- ============================================
-- TravelMind AI v3.0 - Supabase Database Schema
-- 第一批：會員與 AI 基礎設施
-- ============================================

-- 啟用必要的擴充
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USER PROFILES (會員資料表)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 關聯 auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- 基本資料
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    emergency_contact JSONB DEFAULT '{}',
    
    -- 訂閱資訊
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_start TIMESTAMPTZ,
    subscription_expiry TIMESTAMPTZ,
    
    -- 個人化設定 (JSONB 儲存)
    settings JSONB DEFAULT '{
        "preferredLanguage": "zh-TW",
        "guidePersonality": "professional",
        "travelPace": "moderate",
        "energyLevel": "normal",
        "walkingTolerance": 5,
        "photoPriority": false,
        "preferredPhotoTypes": ["landscape", "architecture"],
        "notificationPrefs": {
            "timeReminders": true,
            "gpsReminders": true,
            "weatherAlerts": true,
            "dailySummary": false,
            "quietHours": {
                "enabled": true,
                "start": "22:00",
                "end": "08:00"
            }
        },
        "voicePrefs": {
            "enabled": true,
            "autoPlay": false,
            "speed": 0.9,
            "voice": "default"
        },
        "accessibilityMode": false,
        "highContrastMode": false,
        "fontSize": "normal"
    }'::jsonb,
    
    -- 元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- 應用內統計
    total_trips INTEGER DEFAULT 0,
    total_activities_completed INTEGER DEFAULT 0,
    favorite_cities TEXT[] DEFAULT '{}'
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_tier);

-- RLS 政策
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用戶只能讀取/修改自己的資料
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 觸發器：自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. AI REQUEST LOGS (AI 請求記錄)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 用戶識別
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 請求資訊
    task_type TEXT NOT NULL CHECK (task_type IN ('guide', 'planner', 'chat', 'content')),
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    
    -- 模型資訊
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    
    -- 成本計算 (USD)
    cost_usd DECIMAL(10, 8),
    
    -- 效能指標
    latency_ms INTEGER,
    cache_hit BOOLEAN DEFAULT FALSE,
    
    -- 狀態
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'cached')),
    error_message TEXT,
    
    -- 元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- 裝置/位置資訊 (用於分析)
    device_info JSONB,
    location_city TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_task_type ON ai_request_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON ai_request_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_date ON ai_request_logs(user_id, created_at);

-- RLS 政策
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的請求記錄
CREATE POLICY "Users can view own request logs"
    ON ai_request_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 只有系統可以寫入
CREATE POLICY "Only service role can insert logs"
    ON ai_request_logs FOR INSERT
    WITH CHECK (false); -- 透過 Edge Function 使用 service_role 寫入

-- ============================================
-- 3. AI RESPONSE CACHE (AI 回應快取)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 快取鍵
    cache_key TEXT UNIQUE NOT NULL,
    
    -- 任務類型
    task_type TEXT NOT NULL CHECK (task_type IN ('guide', 'planner', 'chat', 'content')),
    
    -- 回應內容
    response_payload JSONB NOT NULL,
    
    -- 模型資訊
    model TEXT,
    
    -- 快取控制
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- 使用統計
    hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- 內容雜湊 (用於去重)
    content_hash TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_task_type ON ai_response_cache(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_hash ON ai_response_cache(content_hash);

-- RLS 政策 (快取表可以公開讀取，但只有系統可以寫入)
ALTER TABLE ai_response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache is publicly readable"
    ON ai_response_cache FOR SELECT
    USING (true);

CREATE POLICY "Only service role can modify cache"
    ON ai_response_cache FOR ALL
    USING (false)
    WITH CHECK (false);

-- 清理過期快取函數
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ai_response_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. RATE LIMIT TRACKING (速率限制追蹤)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('guide', 'planner', 'chat', 'content')),
    
    -- 計數 (每日重置)
    request_count INTEGER DEFAULT 0,
    date_key TEXT NOT NULL, -- YYYY-MM-DD 格式
    
    -- 元資料
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一約束
    UNIQUE(user_id, task_type, date_key)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON rate_limit_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_date ON rate_limit_tracking(date_key);

-- RLS 政策
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
    ON rate_limit_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only service role can update rate limits"
    ON rate_limit_tracking FOR ALL
    USING (false)
    WITH CHECK (false);

-- ============================================
-- 5. DAILY USAGE STATS (每日使用統計)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    date DATE UNIQUE NOT NULL,
    
    -- 整體統計
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- 分類統計
    requests_by_task JSONB DEFAULT '{}',
    tokens_by_model JSONB DEFAULT '{}',
    
    -- 快取統計
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    
    -- 效能統計
    avg_latency_ms INTEGER,
    p95_latency_ms INTEGER,
    
    -- 用戶統計
    unique_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON daily_usage_stats(date);

-- ============================================
-- 6. 建立清理過期快取的 Cron Job
-- ============================================
-- 注意：需要在 Supabase Dashboard 的 Cron Jobs 中設定
-- 或者使用 pg_cron 擴充

COMMENT ON TABLE user_profiles IS '用戶個人資料與設定';
COMMENT ON TABLE ai_request_logs IS 'AI 請求記錄與成本追蹤';
COMMENT ON TABLE ai_response_cache IS 'AI 回應快取表';
COMMENT ON TABLE rate_limit_tracking IS '每日速率限制追蹤';
COMMENT ON TABLE daily_usage_stats IS '每日使用統計';

-- ============================================
-- 初始化測試資料 (可選)
-- ============================================
-- 建立匿名用戶範例設定 (用於未登入用戶的預設值)
INSERT INTO user_profiles (id, user_id, subscription_tier, settings)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    NULL,
    'free',
    '{
        "preferredLanguage": "zh-TW",
        "guidePersonality": "professional",
        "travelPace": "moderate",
        "energyLevel": "normal"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;