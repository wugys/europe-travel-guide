import requests
import json

# Supabase 設定
SUPABASE_URL = "https://xbwibudbaqhxbuyjhouc.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3Mjc4NCwiZXhwIjoyMDkwNTQ4Nzg0fQ.-Glmjn-wFRv72dHjqfw_V2PygeuxHF9wOHPYGL-H9VI"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# 要執行的 SQL 語句
sql_statements = [
    # 1. 行程基本資訊
    """INSERT INTO trip_info (id, name, subtitle, start_date, end_date, duration, leader_name, leader_phone, countries, cities) 
    VALUES ('00000000-0000-0000-0000-000000000001', '🏰 奧捷斯匈四國之旅', '國王湖遊船．四國首都．維也納．布拉格．布達佩斯．庫倫洛夫．哈修塔特湖區', '2026-04-01', '2026-04-10', '10天', '林孜璟', '+886 0913573121', '["🇭🇺 匈牙利", "🇸🇰 斯洛伐克", "🇦🇹 奧地利", "🇨🇿 捷克", "🇩🇪 德國"]', '["布達佩斯", "布拉提斯拉瓦", "維也納", "布爾諾", "布拉格", "庫倫洛夫", "薩爾斯堡", "哈修塔特"]');""",
    
    # 2. 航班資訊
    """INSERT INTO flights (trip_id, flight_type, flight_number, flight_date, dep_time, dep_airport, arr_time, arr_airport, duration) 
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'outbound', 'MU5006', '2026/04/01(三)', '18:40', '桃園機場', '20:40', '上海浦東機場', '02:00'),
    ('00000000-0000-0000-0000-000000000001', 'outbound', 'FM869', '2026/04/02(四)', '01:50', '上海浦東機場', '08:05', '布達佩斯機場', '12:15'),
    ('00000000-0000-0000-0000-000000000001', 'return', 'FM870', '2026/04/09(四)', '12:30', '布達佩斯機場', '05:35(+1)', '上海浦東機場', '11:05'),
    ('00000000-0000-0000-0000-000000000001', 'return', 'MU5007', '2026/04/10(五)', '12:20', '上海浦東機場', '14:25', '桃園機場', '02:05');""",
    
    # 3. 每日行程
    """INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, dinner, accommodation) 
    VALUES 
    ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 1, '2026-04-01', '台北 → 上海', '["台北", "上海"]', 'taiwan', '出發日', '機上簡餐', '機上过夜'),
    ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 2, '2026-04-02', '上海 → 布達佩斯 → 維也納', '["上海", "布達佩斯", "布拉提斯拉瓦", "維也納"]', 'hungary', '抵達歐洲，四國首都巡禮開始', '維也納特選炸豬排', 'VOCO VIENNA PRATER'),
    ('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 3, '2026-04-03', '維也納 → 布爾諾', '["維也納", "布爾諾"]', 'austria', '維也納藝術巡禮', '當地特色西式料理', 'OREA CONGRESS HOTEL BRNO'),
    ('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 4, '2026-04-04', '布爾諾 → 布拉格', '["布爾諾", "布拉格"]', 'czech', '金色布拉格', '中式六菜一湯', 'OCCIDENTAL PRAHA'),
    ('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000001', 5, '2026-04-05', '布拉格 → 庫倫洛夫', '["布拉格", "庫倫洛夫"]', 'czech', '中世紀童話小鎮', '特選地窖豬肋排料理', 'HOTEL GRAND'),
    ('11111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000001', 6, '2026-04-06', '庫倫洛夫 → 國王湖 → 薩爾斯堡', '["庫倫洛夫", "國王湖", "薩爾斯堡"]', 'germany', '德國最美湖泊', '中式六菜一湯', 'FOURSIDE HOTEL SALZBURG'),
    ('11111111-1111-1111-1111-111111111107', '00000000-0000-0000-0000-000000000001', 7, '2026-04-07', '薩爾斯堡 → 哈修塔特 → 維也納', '["薩爾斯堡", "哈修塔特", "維也納"]', 'austria', '莫札特故鄉與世界最美小鎮', '中式六菜一湯', 'AUSTRIA TREND PYRAMIDE'),
    ('11111111-1111-1111-1111-111111111108', '00000000-0000-0000-0000-000000000001', 8, '2026-04-08', '維也納 → 布達佩斯', '["維也納", "布達佩斯"]', 'hungary', '多瑙河雙子城', '匈牙利當地特色料理', 'TRIBE BUDAPEST STADIUM'),
    ('11111111-1111-1111-1111-111111111109', '00000000-0000-0000-0000-000000000001', 9, '2026-04-09', '布達佩斯 → 上海', '["布達佩斯", "上海"]', 'hungary', '回程日', '機上餐食', '機上过夜'),
    ('11111111-1111-1111-1111-111111111110', '00000000-0000-0000-0000-000000000001', 10, '2026-04-10', '上海 → 台北', '["上海", "台北"]', 'taiwan', '回到溫暖的家', NULL, '溫暖的家');""",
    
    # 4. 景點資料
    """INSERT INTO attractions (attraction_id, name, city, country, icon, description, highlights) 
    VALUES 
    ('budapest-parliament', '匈牙利國會大廈', '布達佩斯', 'hungary', '🏛️', '布達佩斯最具代表性的建築，歐洲最大的國會建築之一', '["黃金圓頂", "圓頂大廳", "多瑙河畔夜景"]'),
    ('fishermans-bastion', '漁人堡', '布達佩斯', 'hungary', '🏰', '位於布達城堡山，新羅馬式風格觀景台', '["觀景台", "馬提亞教堂", "日出日落"]'),
    ('schoenbrunn', '美泉宮', '維也納', 'austria', '🏛️', '哈布斯堡王朝夏宮，世界文化遺產', '["鏡廳", "皇家花園", "凱旋門"]'),
    ('st-stephen', '聖史蒂芬大教堂', '維也納', 'austria', '⛪', '維也納地標，哥德式建築傑作', '["南塔", "彩色屋頂", "地下墓穴"]'),
    ('prague-castle', '布拉格城堡', '布拉格', 'czech', '🏰', '全球最大古城堡建築群', '["聖維特大教堂", "黃金巷", "衛兵交接"]'),
    ('charles-bridge', '查理大橋', '布拉格', 'czech', '🌉', '14世紀石橋，30座巴洛克雕像', '["聖約翰雕像", "街頭藝人", "30座雕像"]'),
    ('old-town-square', '老城廣場', '布拉格', 'czech', '⛲', '布拉格心臟地帶，天文鐘是亮點', '["天文鐘", "泰恩教堂", "胡斯紀念碑"]'),
    ('hallstatt', '哈修塔特湖區', '哈修塔特', 'austria', '🏔️', '世界最美小鎮，世界文化遺產', '["明信片角度", "鹽礦", "天空步道"]'),
    ('konigssee', '國王湖', '貝希特斯加登', 'germany', '🏔️', '德國最美高山湖泊', '["紅頂教堂", "Obersee湖", "回音壁"]'),
    ('bratislava-castle', '布拉提斯拉瓦城堡', '布拉提斯拉瓦', 'slovakia', '🏰', '多瑙河畔小山上的城堡', '["城堡博物館", "頂樓觀景台", "四大塔樓"]');"""
]

print("開始匯入資料到 Supabase...")
print(f"專案: {SUPABASE_URL}")
print()

# 使用 REST API 執行 SQL
# 嘗試使用 pg 函數來執行 SQL
success_count = 0
error_count = 0

for i, sql in enumerate(sql_statements, 1):
    print(f"執行第 {i}/{len(sql_statements)} 個語句...")
    
    # 嘗試透過 REST API 插入資料
    # 提取表格名稱和資料
    if "trip_info" in sql:
        table = "trip_info"
    elif "flights" in sql:
        table = "flights"
    elif "itinerary_days" in sql:
        table = "itinerary_days"
    elif "attractions" in sql:
        table = "attractions"
    else:
        continue
    
    print(f"  表格: {table}")

print()
print("嘗試使用直接 REST API 插入...")

# 直接使用 REST API 插入資料
tables_data = [
    ("trip_info", {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "🏰 奧捷斯匈四國之旅",
        "subtitle": "國王湖遊船．四國首都．維也納．布拉格．布達佩斯．庫倫洛夫．哈修塔特湖區",
        "start_date": "2026-04-01",
        "end_date": "2026-04-10",
        "duration": "10天",
        "leader_name": "林孜璟",
        "leader_phone": "+886 0913573121",
        "countries": ["🇭🇺 匈牙利", "🇸🇰 斯洛伐克", "🇦🇹 奧地利", "🇨🇿 捷克", "🇩🇪 德國"],
        "cities": ["布達佩斯", "布拉提斯拉瓦", "維也納", "布爾諾", "布拉格", "庫倫洛夫", "薩爾斯堡", "哈修塔特"]
    }),
]

for table, data in tables_data:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201, 204]:
        print(f"✅ {table}: 成功")
        success_count += 1
    else:
        print(f"❌ {table}: 失敗 - {response.status_code} - {response.text[:200]}")
        error_count += 1

print()
print(f"結果: {success_count} 成功, {error_count} 失敗")
