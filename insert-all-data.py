import requests
import json

SUPABASE_URL = "https://xbwibudbaqhxbuyjhouc.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3Mjc4NCwiZXhwIjoyMDkwNTQ4Nzg0fQ.-Glmjn-wFRv72dHjqfw_V2PygeuxHF9wOHPYGL-H9VI"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# 航班資料
flights = [
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "outbound", "flight_number": "MU5006", "flight_date": "2026/04/01(三)", "dep_time": "18:40", "dep_airport": "桃園機場", "arr_time": "20:40", "arr_airport": "上海浦東機場", "duration": "02:00", "display_order": 1},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "outbound", "flight_number": "FM869", "flight_date": "2026/04/02(四)", "dep_time": "01:50", "dep_airport": "上海浦東機場", "arr_time": "08:05", "arr_airport": "布達佩斯機場", "duration": "12:15", "display_order": 2},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "return", "flight_number": "FM870", "flight_date": "2026/04/09(四)", "dep_time": "12:30", "dep_airport": "布達佩斯機場", "arr_time": "05:35(+1)", "arr_airport": "上海浦東機場", "duration": "11:05", "display_order": 1},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "return", "flight_number": "MU5007", "flight_date": "2026/04/10(五)", "dep_time": "12:20", "dep_airport": "上海浦東機場", "arr_time": "14:25", "arr_airport": "桃園機場", "duration": "02:05", "display_order": 2},
]

print("插入航班資料...")
for flight in flights:
    url = f"{SUPABASE_URL}/rest/v1/flights"
    response = requests.post(url, headers=headers, json=flight)
    if response.status_code in [200, 201, 204]:
        print(f"  ✅ {flight['flight_number']}")
    else:
        print(f"  ❌ {flight['flight_number']}: {response.status_code}")

# 每日行程
days = [
    {"id": "11111111-1111-1111-1111-111111111101", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 1, "date": "2026-04-01", "title": "台北 → 上海", "route": ["台北", "上海"], "country": "taiwan", "highlight": "出發日", "dinner": "機上簡餐", "accommodation": "機上过夜"},
    {"id": "11111111-1111-1111-1111-111111111102", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 2, "date": "2026-04-02", "title": "上海 → 布達佩斯 → 維也納", "route": ["上海", "布達佩斯", "布拉提斯拉瓦", "維也納"], "country": "hungary", "highlight": "抵達歐洲，四國首都巡禮開始", "dinner": "維也納特選炸豬排", "accommodation": "VOCO VIENNA PRATER"},
    {"id": "11111111-1111-1111-1111-111111111103", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 3, "date": "2026-04-03", "title": "維也納 → 布爾諾", "route": ["維也納", "布爾諾"], "country": "austria", "highlight": "維也納藝術巡禮", "dinner": "當地特色西式料理", "accommodation": "OREA CONGRESS HOTEL BRNO"},
    {"id": "11111111-1111-1111-1111-111111111104", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 4, "date": "2026-04-04", "title": "布爾諾 → 布拉格", "route": ["布爾諾", "布拉格"], "country": "czech", "highlight": "金色布拉格", "dinner": "中式六菜一湯", "accommodation": "OCCIDENTAL PRAHA"},
    {"id": "11111111-1111-1111-1111-111111111105", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 5, "date": "2026-04-05", "title": "布拉格 → 庫倫洛夫", "route": ["布拉格", "庫倫洛夫"], "country": "czech", "highlight": "中世紀童話小鎮", "dinner": "特選地窖豬肋排料理", "accommodation": "HOTEL GRAND"},
    {"id": "11111111-1111-1111-1111-111111111106", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 6, "date": "2026-04-06", "title": "庫倫洛夫 → 國王湖 → 薩爾斯堡", "route": ["庫倫洛夫", "國王湖", "薩爾斯堡"], "country": "germany", "highlight": "德國最美湖泊", "dinner": "中式六菜一湯", "accommodation": "FOURSIDE HOTEL SALZBURG"},
    {"id": "11111111-1111-1111-1111-111111111107", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 7, "date": "2026-04-07", "title": "薩爾斯堡 → 哈修塔特 → 維也納", "route": ["薩爾斯堡", "哈修塔特", "維也納"], "country": "austria", "highlight": "莫札特故鄉與世界最美小鎮", "dinner": "中式六菜一湯", "accommodation": "AUSTRIA TREND PYRAMIDE"},
    {"id": "11111111-1111-1111-1111-111111111108", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 8, "date": "2026-04-08", "title": "維也納 → 布達佩斯", "route": ["維也納", "布達佩斯"], "country": "hungary", "highlight": "多瑙河雙子城", "dinner": "匈牙利當地特色料理", "accommodation": "TRIBE BUDAPEST STADIUM"},
    {"id": "11111111-1111-1111-1111-111111111109", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 9, "date": "2026-04-09", "title": "布達佩斯 → 上海", "route": ["布達佩斯", "上海"], "country": "hungary", "highlight": "回程日", "dinner": "機上餐食", "accommodation": "機上过夜"},
    {"id": "11111111-1111-1111-1111-111111111110", "trip_id": "00000000-0000-0000-0000-000000000001", "day_number": 10, "date": "2026-04-10", "title": "上海 → 台北", "route": ["上海", "台北"], "country": "taiwan", "highlight": "回到溫暖的家", "dinner": None, "accommodation": "溫暖的家"},
]

print("\n插入每日行程...")
for day in days:
    url = f"{SUPABASE_URL}/rest/v1/itinerary_days"
    response = requests.post(url, headers=headers, json=day)
    if response.status_code in [200, 201, 204]:
        print(f"  ✅ Day {day['day_number']}")
    else:
        print(f"  ❌ Day {day['day_number']}: {response.status_code}")

# 景點
attractions = [
    {"attraction_id": "budapest-parliament", "name": "匈牙利國會大廈", "city": "布達佩斯", "country": "hungary", "icon": "🏛️", "description": "布達佩斯最具代表性的建築，歐洲最大的國會建築之一", "highlights": ["黃金圓頂", "圓頂大廳", "多瑙河畔夜景"]},
    {"attraction_id": "fishermans-bastion", "name": "漁人堡", "city": "布達佩斯", "country": "hungary", "icon": "🏰", "description": "位於布達城堡山，新羅馬式風格觀景台", "highlights": ["觀景台", "馬提亞教堂", "日出日落"]},
    {"attraction_id": "schoenbrunn", "name": "美泉宮", "city": "維也納", "country": "austria", "icon": "🏛️", "description": "哈布斯堡王朝夏宮，世界文化遺產", "highlights": ["鏡廳", "皇家花園", "凱旋門"]},
    {"attraction_id": "st-stephen", "name": "聖史蒂芬大教堂", "city": "維也納", "country": "austria", "icon": "⛪", "description": "維也納地標，哥德式建築傑作", "highlights": ["南塔", "彩色屋頂", "地下墓穴"]},
    {"attraction_id": "prague-castle", "name": "布拉格城堡", "city": "布拉格", "country": "czech", "icon": "🏰", "description": "全球最大古城堡建築群", "highlights": ["聖維特大教堂", "黃金巷", "衛兵交接"]},
    {"attraction_id": "charles-bridge", "name": "查理大橋", "city": "布拉格", "country": "czech", "icon": "🌉", "description": "14世紀石橋，30座巴洛克雕像", "highlights": ["聖約翰雕像", "街頭藝人", "30座雕像"]},
    {"attraction_id": "old-town-square", "name": "老城廣場", "city": "布拉格", "country": "czech", "icon": "⛲", "description": "布拉格心臟地帶，天文鐘是亮點", "highlights": ["天文鐘", "泰恩教堂", "胡斯紀念碑"]},
    {"attraction_id": "hallstatt", "name": "哈修塔特湖區", "city": "哈修塔特", "country": "austria", "icon": "🏔️", "description": "世界最美小鎮，世界文化遺產", "highlights": ["明信片角度", "鹽礦", "天空步道"]},
    {"attraction_id": "konigssee", "name": "國王湖", "city": "貝希特斯加登", "country": "germany", "icon": "🏔️", "description": "德國最美高山湖泊", "highlights": ["紅頂教堂", "Obersee湖", "回音壁"]},
    {"attraction_id": "bratislava-castle", "name": "布拉提斯拉瓦城堡", "city": "布拉提斯拉瓦", "country": "slovakia", "icon": "🏰", "description": "多瑙河畔小山上的城堡", "highlights": ["城堡博物館", "頂樓觀景台", "四大塔樓"]},
]

print("\n插入景點資料...")
for att in attractions:
    url = f"{SUPABASE_URL}/rest/v1/attractions"
    response = requests.post(url, headers=headers, json=att)
    if response.status_code in [200, 201, 204]:
        print(f"  ✅ {att['name']}")
    else:
        print(f"  ❌ {att['name']}: {response.status_code}")

print("\n✅ 所有資料匯入完成！")
