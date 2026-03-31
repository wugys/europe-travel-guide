import requests

SUPABASE_URL = "https://xbwibudbaqhxbuyjhouc.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3Mjc4NCwiZXhwIjoyMDkwNTQ4Nzg0fQ.-Glmjn-wFRv72dHjqfw_V2PygeuxHF9wOHPYGL-H9VI"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# 嘗試插入航班（不使用 display_order）
flights = [
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "outbound", "flight_number": "MU5006", "flight_date": "2026/04/01(三)", "dep_time": "18:40", "dep_airport": "桃園機場", "arr_time": "20:40", "arr_airport": "上海浦東機場", "duration": "02:00"},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "outbound", "flight_number": "FM869", "flight_date": "2026/04/02(四)", "dep_time": "01:50", "dep_airport": "上海浦東機場", "arr_time": "08:05", "arr_airport": "布達佩斯機場", "duration": "12:15"},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "return", "flight_number": "FM870", "flight_date": "2026/04/09(四)", "dep_time": "12:30", "dep_airport": "布達佩斯機場", "arr_time": "05:35(+1)", "arr_airport": "上海浦東機場", "duration": "11:05"},
    {"trip_id": "00000000-0000-0000-0000-000000000001", "flight_type": "return", "flight_number": "MU5007", "flight_date": "2026/04/10(五)", "dep_time": "12:20", "dep_airport": "上海浦東機場", "arr_time": "14:25", "arr_airport": "桃園機場", "duration": "02:05"},
]

print("插入航班資料...")
for flight in flights:
    url = f"{SUPABASE_URL}/rest/v1/flights"
    response = requests.post(url, headers=headers, json=flight)
    if response.status_code in [200, 201, 204]:
        print(f"  ✅ {flight['flight_number']}")
    else:
        print(f"  ❌ {flight['flight_number']}: {response.status_code} - {response.text[:200]}")

print("\n檢查已匯入的資料...")

# 檢查各表格資料
for table in ["trip_info", "flights", "itinerary_days", "attractions"]:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {table}: {len(data)} 筆資料")
    else:
        print(f"❌ {table}: 查詢失敗 {response.status_code}")

print("\n🎉 資料庫設定完成！")
