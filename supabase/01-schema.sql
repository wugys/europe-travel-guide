-- Europe Travel Guide - Schema Only
-- 在 Supabase SQL Editor 執行此檔案

-- 啟用 UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 行程基本資訊
CREATE TABLE trip_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subtitle TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration TEXT,
    leader_name TEXT,
    leader_phone TEXT,
    countries JSONB,
    cities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 航班資訊
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trip_info(id) ON DELETE CASCADE,
    flight_type TEXT NOT NULL CHECK (flight_type IN ('outbound', 'return')),
    flight_number TEXT NOT NULL,
    flight_date TEXT NOT NULL,
    dep_time TEXT NOT NULL,
    dep_airport TEXT NOT NULL,
    arr_time TEXT NOT NULL,
    arr_airport TEXT NOT NULL,
    duration TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 每日行程
CREATE TABLE itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trip_info(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    route JSONB,
    country TEXT NOT NULL,
    highlight TEXT,
    breakfast TEXT,
    lunch TEXT,
    dinner TEXT,
    accommodation TEXT,
    hotel_name TEXT,
    hotel_address TEXT,
    hotel_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 每日活動
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('transport', 'attraction', 'food', 'shopping', 'other')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 景點詳情
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attraction_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    icon TEXT,
    description TEXT NOT NULL,
    highlights JSONB,
    tips_best_time TEXT,
    tips_duration TEXT,
    tips_tickets TEXT,
    tips_booking TEXT,
    tips_photo TEXT,
    opening_hours TEXT,
    location TEXT,
    how_to_get TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 提醒分類
CREATE TABLE tip_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 提醒項目
CREATE TABLE tip_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES tip_categories(id) ON DELETE CASCADE,
    subcategory TEXT,
    tip_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 清單分類
CREATE TABLE checklist_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 清單項目
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES checklist_categories(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    important BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 使用者勾選狀態
CREATE TABLE user_checklist_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
    checked BOOLEAN DEFAULT FALSE,
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- 索引
CREATE INDEX idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX idx_itinerary_days_date ON itinerary_days(date);
CREATE INDEX idx_activities_day_id ON activities(day_id);
CREATE INDEX idx_flights_trip_id ON flights(trip_id);
CREATE INDEX idx_attractions_country ON attractions(country);

-- 公開讀取權限
ALTER TABLE trip_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON trip_info FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON flights FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON itinerary_days FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON attractions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tip_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tip_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON checklist_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON checklist_items FOR SELECT USING (true);

-- 預設分類資料
INSERT INTO tip_categories (category_key, title, icon, display_order) VALUES
('luggage', '🎒 行李準備', '🎒', 1),
('food', '🍽️ 飲食建議', '🍽️', 2),
('money', '💰 金錢與支付', '💰', 3),
('health', '🏥 健康與安全', '🏥', 4),
('photo', '📸 拍照技巧', '📸', 5),
('culture', '🤝 文化禮儀', '🤝', 6),
('transport', '🚇 交通與移動', '🚇', 7),
('special', '⚠️ 特殊提醒', '⚠️', 8);

INSERT INTO checklist_categories (category_key, title, icon, display_order) VALUES
('documents', '📄 證件與文件', '📄', 1),
('luggage', '🎒 行李物品', '🎒', 2),
('electronics', '🔌 電子用品', '🔌', 3),
('health', '💊 健康藥品', '💊', 4),
('money', '💳 財務準備', '💳', 5),
('toiletries', '🧴 盥洗用品', '🧴', 6),
('clothing', '👕 衣物配件', '👕', 7),
('apps', '📱 APP與工具', '📱', 8);
