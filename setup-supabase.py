import requests
import json

# Supabase 設定
SUPABASE_URL = "https://xbwibudbaqhxbuyjhouc.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3Mjc4NCwiZXhwIjoyMDkwNTQ4Nzg0fQ.-Glmjn-wFRv72dHjqfw_V2PygeuxHF9wOHPYGL-H9VI"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# SQL 要分批執行，因為有外鍵約束
sql_statements = [
    # 1. 啟用 UUID
    "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
    
    # 2. 行程基本資訊
    """CREATE TABLE IF NOT EXISTS trip_info (
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
    );""",
    
    # 3. 航班資訊
    """CREATE TABLE IF NOT EXISTS flights (
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
    );""",
    
    # 4. 每日行程
    """CREATE TABLE IF NOT EXISTS itinerary_days (
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
    );""",
    
    # 5. 每日活動
    """CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('transport', 'attraction', 'food', 'shopping', 'other')),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );""",
    
    # 6. 景點詳情
    """CREATE TABLE IF NOT EXISTS attractions (
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
    );""",
    
    # 7. 提醒分類
    """CREATE TABLE IF NOT EXISTS tip_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );""",
    
    # 8. 提醒項目
    """CREATE TABLE IF NOT EXISTS tip_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_id UUID REFERENCES tip_categories(id) ON DELETE CASCADE,
        subcategory TEXT,
        tip_text TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );""",
    
    # 9. 清單分類
    """CREATE TABLE IF NOT EXISTS checklist_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );""",
    
    # 10. 清單項目
    """CREATE TABLE IF NOT EXISTS checklist_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_id UUID REFERENCES checklist_categories(id) ON DELETE CASCADE,
        item_text TEXT NOT NULL,
        important BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );""",
    
    # 11. 使用者勾選狀態
    """CREATE TABLE IF NOT EXISTS user_checklist_status (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
        checked BOOLEAN DEFAULT FALSE,
        checked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, item_id)
    );""",
]

def execute_sql(sql):
    """執行單個 SQL 語句"""
    url = f"{SUPABASE_URL}/rest/v1/"
    # 使用 pg 函數執行 SQL
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=headers,
        json={"sql_query": sql}
    )
    return response

print("開始建立表格...")
for i, sql in enumerate(sql_statements, 1):
    print(f"執行第 {i}/{len(sql_statements)} 個語句...")
    try:
        response = execute_sql(sql)
        if response.status_code in [200, 201, 204]:
            print(f"  ✅ 成功")
        else:
            print(f"  ⚠️ 狀態碼: {response.status_code}")
            if response.text:
                print(f"  回應: {response.text[:200]}")
    except Exception as e:
        print(f"  ❌ 錯誤: {e}")

print("\n完成！")
