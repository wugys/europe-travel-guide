-- Europe Travel Guide - Data Migration
-- 將 JavaScript 資料匯入 Supabase

-- ============================================
-- 1. 插入行程基本資訊
-- ============================================
INSERT INTO trip_info (id, name, subtitle, start_date, end_date, duration, leader_name, leader_phone, countries, cities)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '🏰 奧捷斯匈四國之旅',
    '國王湖遊船．四國首都．維也納．布拉格．布達佩斯．庫倫洛夫．哈修塔特湖區',
    '2026-04-01',
    '2026-04-10',
    '10天',
    '林孜璟',
    '+886 0913573121',
    '["🇭🇺 匈牙利", "🇸🇰 斯洛伐克", "🇦🇹 奧地利", "🇨🇿 捷克", "🇩🇪 德國"]',
    '["布達佩斯", "布拉提斯拉瓦", "維也納", "布爾諾", "布拉格", "庫倫洛夫", "薩爾斯堡", "哈修塔特"]'
);

-- ============================================
-- 2. 插入航班資訊 - 去程
-- ============================================
INSERT INTO flights (trip_id, flight_type, flight_number, flight_date, dep_time, dep_airport, arr_time, arr_airport, duration, display_order)
VALUES
('00000000-0000-0000-0000-000000000001', 'outbound', 'MU5006', '2026/04/01(三)', '18:40', '桃園機場', '20:40', '上海浦東機場', '02:00', 1),
('00000000-0000-0000-0000-000000000001', 'outbound', 'FM869', '2026/04/02(四)', '01:50', '上海浦東機場', '08:05', '布達佩斯機場', '12:15', 2);

-- ============================================
-- 3. 插入航班資訊 - 回程
-- ============================================
INSERT INTO flights (trip_id, flight_type, flight_number, flight_date, dep_time, dep_airport, arr_time, arr_airport, duration, display_order)
VALUES
('00000000-0000-0000-0000-000000000001', 'return', 'FM870', '2026/04/09(四)', '12:30', '布達佩斯機場', '05:35(+1)', '上海浦東機場', '11:05', 1),
('00000000-0000-0000-0000-000000000001', 'return', 'MU5007', '2026/04/10(五)', '12:20', '上海浦東機場', '14:25', '桃園機場', '02:05', 2);

-- ============================================
-- 4. 插入每日行程 (Day 1-10)
-- ============================================

-- Day 1
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, notes)
VALUES 
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 1, '2026-04-01', '台北 → 上海', '["台北", "上海"]', 'taiwan', '出發日', null, null, '機上簡餐', '機上过夜', '請務必準時集合，攜帶護照及電子機票');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111101', '15:30', '桃園機場集合', '第二航廈 東方航空(中華航空代理)櫃台', 'transport', 1),
('11111111-1111-1111-1111-111111111101', '18:40', '航班起飛 MU5006', '台北 → 上海浦東', 'transport', 2),
('11111111-1111-1111-1111-111111111101', '20:40', '抵達上海浦東', '轉機等待', 'transport', 3);

-- Day 2
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 2, '2026-04-02', '上海 → 布達佩斯 → 布拉提斯拉瓦 → 維也納', '["上海", "布達佩斯", "布拉提斯拉瓦", "維也納"]', 'hungary', '抵達歐洲，四國首都巡禮開始', '機上餐食', '中式六菜一湯', '維也納特選炸豬排', 'VOCO VIENNA PRATER 或 AUSTRIA TREND HOTEL LASSALLE', 'VOCO VIENNA PRATER', 'ENGERTHSTRASSE 173-175, VIENNA 1020', '43-1-2144000', '長途飛行後第一天，注意休息');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111102', '01:50', '航班起飛 FM869', '上海浦東 → 布達佩斯', 'transport', 1),
('11111111-1111-1111-1111-111111111102', '08:05', '抵達布達佩斯', '入境、領取行李', 'transport', 2),
('11111111-1111-1111-1111-111111111102', '10:00', '布達佩斯市區觀光', '國會大廈、漁人堡、馬提亞教堂', 'attraction', 3),
('11111111-1111-1111-1111-111111111102', '14:00', '前往布拉提斯拉瓦', '車程約233km', 'transport', 4),
('11111111-1111-1111-1111-111111111102', '16:30', '布拉提斯拉瓦市區', '布拉提斯拉瓦城堡、舊城區', 'attraction', 5),
('11111111-1111-1111-1111-111111111102', '18:00', '前往維也納', '車程約80km', 'transport', 6),
('11111111-1111-1111-1111-111111111102', '19:30', '晚餐', '維也納特選炸豬排', 'food', 7);

-- Day 3
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 3, '2026-04-03', '維也納 → 布爾諾', '["維也納", "布爾諾"]', 'austria', '維也納藝術巡禮', '飯店西式早餐', '中式六菜一湯', '當地特色西式料理', 'OREA CONGRESS HOTEL BRNO', 'OREA CONGRESS HOTEL BRNO', 'KŘIŽKOVSKÉHO 458/47, 603 73 BRNO', '420-530510121', '美泉宮門票已含，請跟隨領隊');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111103', '08:00', '美泉宮', '參觀哈布斯堡王朝夏宮，世界文化遺產', 'attraction', 1),
('11111111-1111-1111-1111-111111111103', '11:00', '聖史蒂芬大教堂', '維也納地標，哥德式建築傑作', 'attraction', 2),
('11111111-1111-1111-1111-111111111103', '12:30', '午餐', '中式六菜一湯', 'food', 3),
('11111111-1111-1111-1111-111111111103', '14:00', '霍夫堡宮', '茜茜公主博物館、皇家銀器館', 'attraction', 4),
('11111111-1111-1111-1111-111111111103', '16:00', '前往布爾諾', '車程約138km', 'transport', 5),
('11111111-1111-1111-1111-111111111103', '19:00', '晚餐', '當地特色西式(豬)料理', 'food', 6);

-- Day 4
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 4, '2026-04-04', '布爾諾 → 布拉格', '["布爾諾", "布拉格"]', 'czech', '金色布拉格', '飯店西式早餐', '捷克烤鴨特選料理', '中式六菜一湯', 'OCCIDENTAL PRAHA', 'OCCIDENTAL PRAHA', 'Na Strzi 32 Prague 140 00', '420-2-96772111', '布拉格城堡門票已含，黃金巷卡夫卡故居');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111104', '08:00', '布爾諾市區觀光', '史畢利伯城堡、彼得羅夫大教堂', 'attraction', 1),
('11111111-1111-1111-1111-111111111104', '11:00', '前往布拉格', '車程約206km', 'transport', 2),
('11111111-1111-1111-1111-111111111104', '13:00', '午餐', '捷克烤鴨特選料理', 'food', 3),
('11111111-1111-1111-1111-111111111104', '15:00', '布拉格城堡', '聖維特大教堂、舊皇宮、黃金巷', 'attraction', 4),
('11111111-1111-1111-1111-111111111104', '18:00', '查理大橋', '日落時分漫步查理大橋', 'attraction', 5),
('11111111-1111-1111-1111-111111111104', '19:30', '晚餐', '中式六菜一湯', 'food', 6);

-- Day 5
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000001', 5, '2026-04-05', '布拉格 → 庫倫洛夫', '["布拉格", "庫倫洛夫"]', 'czech', '中世紀童話小鎮', '飯店西式早餐', '捷克西式料理', '特選地窖豬肋排料理', 'HOTEL GRAND', 'HOTEL GRAND', 'Namesti Svornosti 3 Cesky Krumlov 381 01', '420-38-0711671', '庫倫洛夫世界文化遺產，保持中世紀風貌');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111105', '08:00', '舊城廣場', '天文鐘、泰恩教堂、火藥塔', 'attraction', 1),
('11111111-1111-1111-1111-111111111105', '10:00', '自由活動', '老城區購物、品嚐煙囪捲', 'shopping', 2),
('11111111-1111-1111-1111-111111111105', '12:00', '前往庫倫洛夫', '車程約172km', 'transport', 3),
('11111111-1111-1111-1111-111111111105', '14:00', '午餐', '捷克西式料理', 'food', 4),
('11111111-1111-1111-1111-111111111105', '15:30', '庫倫洛夫城堡', '彩繪塔、城堡花園、巴洛克劇場', 'attraction', 5),
('11111111-1111-1111-1111-111111111105', '18:00', '伏爾塔瓦河遊船', '欣賞小鎮全景', 'attraction', 6),
('11111111-1111-1111-1111-111111111105', '19:30', '晚餐', '特選地窖豬肋排料理', 'food', 7);

-- Day 6
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000001', 6, '2026-04-06', '庫倫洛夫 → 國王湖 → 薩爾斯堡', '["庫倫洛夫", "國王湖", "薩爾斯堡"]', 'germany', '德國最美湖泊', '飯店西式早餐', '當地西式料理', '中式六菜一湯', 'FOURSIDE HOTEL SALZBURG', 'FOURSIDE HOTEL SALZBURG', 'Am Messezentrum 2 Salzburg Salzburg 5020', '43-662-4355460', '國王湖遊船約2小時，準備防風外套');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111106', '07:30', '前往國王湖', '車程約250km，穿越德國邊境', 'transport', 1),
('11111111-1111-1111-1111-111111111106', '12:00', '午餐', '當地西式料理', 'food', 2),
('11111111-1111-1111-1111-111111111106', '13:30', '國王湖遊船', '德國最美湖泊，電動船遊覽', 'attraction', 3),
('11111111-1111-1111-1111-111111111106', '15:00', '紅頂教堂', '聖巴多羅買教堂，經典拍照點', 'attraction', 4),
('11111111-1111-1111-1111-111111111106', '16:30', '前往薩爾斯堡', '車程約40km', 'transport', 5),
('11111111-1111-1111-1111-111111111106', '18:00', '晚餐', '中式六菜一湯', 'food', 6);

-- Day 7
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111107', '00000000-0000-0000-0000-000000000001', 7, '2026-04-07', '薩爾斯堡 → 哈修塔特 → 維也納', '["薩爾斯堡", "哈修塔特", "維也納"]', 'austria', '莫札特故鄉與世界最美小鎮', '飯店西式早餐', '特選湖區鱒魚料理', '中式六菜一湯', 'AUSTRIA TREND EVENTHOTEL PYRAMIDE', 'AUSTRIA TREND EVENTHOTEL PYRAMIDE', 'PARKALLEE 2, VÖSENDORF, 2334', '43-1-69-900', '哈修塔特是絕美拍照點，請準備相機');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111107', '08:00', '薩爾斯堡市區', '莫札特故居、薩爾斯堡要塞', 'attraction', 1),
('11111111-1111-1111-1111-111111111107', '10:00', '前往哈修塔特', '車程約77km', 'transport', 2),
('11111111-1111-1111-1111-111111111107', '11:30', '哈修塔特湖區', '世界文化遺產，絕美湖邊小鎮', 'attraction', 3),
('11111111-1111-1111-1111-111111111107', '13:00', '午餐', '特選湖區鱒魚料理', 'food', 4),
('11111111-1111-1111-1111-111111111107', '15:00', '前往維也納', '車程約300km', 'transport', 5),
('11111111-1111-1111-1111-111111111107', '19:00', '晚餐', '中式六菜一湯', 'food', 6);

-- Day 8
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, hotel_name, hotel_address, hotel_phone, notes)
VALUES 
('11111111-1111-1111-1111-111111111108', '00000000-0000-0000-0000-000000000001', 8, '2026-04-08', '維也納 → 布達佩斯', '["維也納", "布達佩斯"]', 'hungary', '多瑙河雙子城', '飯店西式早餐', '中式六菜一湯', '匈牙利當地特色料理', 'TRIBE BUDAPEST STADIUM', 'TRIBE BUDAPEST STADIUM', 'KÖNYVES KÁLMÁN KRT. 34, BUDAPEST, 1097', '36-1-2389360', '最後一晚在布達佩斯，可享受溫泉');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111108', '08:00', '熊布朗宮', '維也納另一宮殿，皇家花園', 'attraction', 1),
('11111111-1111-1111-1111-111111111108', '10:00', '百水公寓', '維也納藝術建築', 'attraction', 2),
('11111111-1111-1111-1111-111111111108', '11:00', '格拉本大街購物', '黑死病紀念柱、精品街', 'shopping', 3),
('11111111-1111-1111-1111-111111111108', '12:30', '午餐', '中式六菜一湯', 'food', 4),
('11111111-1111-1111-1111-111111111108', '14:00', '前往布達佩斯', '車程約245km', 'transport', 5),
('11111111-1111-1111-1111-111111111108', '18:00', '布達佩斯夜景', '多瑙河遊船夜景', 'attraction', 6),
('11111111-1111-1111-1111-111111111108', '19:30', '晚餐', '匈牙利當地特色(牛)料理', 'food', 7);

-- Day 9
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, notes)
VALUES 
('11111111-1111-1111-1111-111111111109', '00000000-0000-0000-0000-000000000001', 9, '2026-04-09', '布達佩斯 → 上海', '["布達佩斯", "上海"]', 'hungary', '回程日', '飯店西式早餐', '機上餐食', '機上餐食', '機上过夜', '請提前打包行李，確認護照及登機證');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111109', '08:00', '塞切尼溫泉', '匈牙利溫泉體驗（自費選項）', 'attraction', 1),
('11111111-1111-1111-1111-111111111109', '10:00', '中央市場', '購買伴手禮、鵝肝醬', 'shopping', 2),
('11111111-1111-1111-1111-111111111109', '12:00', '前往機場', '集合前往布達佩斯機場', 'transport', 3),
('11111111-1111-1111-1111-111111111109', '12:30', '航班起飛 FM870', '布達佩斯 → 上海', 'transport', 4);

-- Day 10
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, route, country, highlight, breakfast, lunch, dinner, accommodation, notes)
VALUES 
('11111111-1111-1111-1111-111111111110', '00000000-0000-0000-0000-000000000001', 10, '2026-04-10', '上海 → 台北', '["上海", "台北"]', 'taiwan', '回到溫暖的家', '機上餐食', null, null, '溫暖的家', '歡迎回家！記得分享照片');

INSERT INTO activities (day_id, time, title, description, activity_type, display_order) VALUES
('11111111-1111-1111-1111-111111111110', '05:35', '抵達上海浦東', '轉機等待', 'transport', 1),
('11111111-1111-1111-1111-111111111110', '12:20', '航班起飛 MU5007', '上海 → 台北', 'transport', 2),
('11111111-1111-1111-1111-111111111110', '14:25', '抵達桃園機場', '結束美好旅程', 'transport', 3);

-- ============================================
-- 5. 插入景點資訊 (部分示例)
-- ============================================
INSERT INTO attractions (attraction_id, name, city, country, icon, description, highlights, tips_best_time, tips_duration, tips_tickets, tips_booking, tips_photo, opening_hours, location, how_to_get) VALUES
('budapest-parliament', '匈牙利國會大廈 (Hungarian Parliament)', '布達佩斯', 'hungary', '🏛️', '布達佩斯最具代表性的建築，歐洲最大的國會建築之一。新哥德式與新文藝復興風格的完美融合，坐落於多瑙河畔，與漁人堡遙遙相望。', '["黃金圓頂 - 重達4公斤的皇冠", "圓頂大廳 - 96公尺高，象徵896年建國", "階梯大廳 - 紅毯與大理石柱", "多瑙河畔夜景 - 晚上燈光璀璨"]', '早上9點開門即入場，或傍晚拍夜景', '導覽約45分鐘', '導覽團約 €15-20，需提前預約', '領隊已安排團體導覽', '對岸漁人堡是最佳拍攝點', '08:00-18:00（夏季延長）', 'Kossuth Lajos tér 1-3, Budapest', '地鐵M2線 Kossuth Lajos tér 站'),

('fishermans-bastion', '漁人堡 (Fisherman''s Bastion)', '布達佩斯', 'hungary', '🏰', '位於布達城堡山，新羅馬式風格的觀景台。七座尖塔象徵七個馬札爾部落，是欣賞多瑙河與國會大廈的最佳地點。', '["觀景台 - 270度俯瞰布達佩斯", "馬提亞教堂 - 彩色馬賽克屋頂", "拱廊與尖塔 - 童話般的建築", "日出日落 - 金色時刻最美"]', '日出或日落時分', '1-2小時', '下層免費，上層觀景台 €3', '現場購票', '從上層觀景台拍國會大廈', '24小時（觀景台09:00-21:00）', 'Szentháromság tér, Budapest', '布達城堡山纜車或步行'),

('szechenyi-bath', '塞切尼溫泉 (Széchenyi Thermal Bath)', '布達佩斯', 'hungary', '♨️', '歐洲最大的溫泉浴場，新巴洛克風格建築。布達佩斯被稱為「溫泉之都」，這裡有15個室內池和3個室外池。', '["黃色宮殿建築 - 絕美拍照背景", "室外溫泉池 - 冬天泡溫泉最舒服", "溫泉水療 - 富含礦物質", "棋盤遊戲 - 當地人在水中下棋"]', '早上較少人，下午最熱鬧', '2-3小時', '日票約 €20', '現場購票', '黃色建築前或室內泳池', '07:00-20:00', 'Állatkerti krt. 9-11, Budapest', '地鐵M1線 Széchenyi fürdő 站'),

('bratislava-castle', '布拉提斯拉瓦城堡 (Bratislava Castle)', '布拉提斯拉瓦', 'slovakia', '🏰', '坐落於多瑙河畔的小山上，城堡四角各有一座塔樓，外觀像倒置的桌子。可俯瞰多瑙河與奧地利邊境。', '["城堡博物館 - 斯洛伐克歷史文物", "頂樓觀景台 - 360度全景", "皇冠廳 - 復刻匈牙利國王加冕場景", "四大塔樓 - 獨特建築外觀"]', '傍晚時分看夕陽', '2小時', '城堡免費，博物館 €10', '現場購票', '從多瑙河對岸拍攝城堡倒影', '09:00-17:00', 'Hrad, 811 06 Bratislava', '從老城步行15分鐘上坡'),

('schoenbrunn', '美泉宮 (Schönbrunn Palace)', '維也納', 'austria', '🏛️', '美泉宮是哈布斯堡王朝的夏宮，建於18世紀，擁有1441間房間。宮殿結合了巴洛克藝術與皇家氣派，是奧地利最重要的文化遺產之一。', '["鏡廳 (Hall of Mirrors) - 莫扎特6歲時在此演奏", "皇家花園 - 法式庭園設計，有海王星噴泉", "凱旋門觀景台 - 可俯瞰宮殿與維也納市景", "動物園 - 世界最古老的動物園之一"]', '早上9點開門即入場，避開人潮', '建議停留3-4小時', 'Imperial Tour €22 (22間房) 或 Grand Tour €29 (40間房)', '領隊已安排團體導覽', '花園內的凱旋門是最佳拍照點', '08:30 - 17:00 (夏季延長至18:00)', 'Schönbrunner Schloßstraße 47, 1130 Wien', '地鐵U4線 Schönbrunn 站'),

('st-stephen', '聖史蒂芬大教堂 (St. Stephen''s Cathedral)', '維也納', 'austria', '⛪', '維也納的地標與精神象徵，建於12世紀，混合了羅馬式與哥德式建築風格。彩色瓦片屋頂是維也納天際線的標誌。', '["南塔 (South Tower) - 登塔俯瞰維也納", "北塔觀景台 - 電梯直達，適合不想爬樓梯的人", "地下墓穴 - 哈布斯堡家族成員長眠之地", "彩色屋頂 - 雙頭鷹圖案，象徵哈布斯堡王朝"]', '傍晚時分光線最美', '教堂參觀1小時，登塔額外1小時', '教堂免費，北塔電梯 €6，南塔爬樓梯 €5', '現場購票即可', '從格拉本大街拍攝教堂正面最壯觀', '06:00 - 22:00 (週日禮拜時間不同)', 'Stephansplatz 3, 1010 Wien', '地鐵U1/U3線 Stephansplatz 站'),

('prague-castle', '布拉格城堡 (Prague Castle)', '布拉格', 'czech', '🏰', '全球最大的古城堡建築群，面積近7萬平方米。自9世紀起就是捷克國王的居所，現今仍是總統府所在地。', '["聖維特大教堂 - 哥德式建築傑作，彩繪玻璃是慕夏作品", "舊皇宮 - 弗拉迪斯拉夫廳的拱頂令人驚嘆", "黃金巷 - 彩色小屋，卡夫卡曾居住於此", "城堡衛兵交接 - 每日中午12點"]', '早上8點前入場，避開人潮', '至少4-5小時', 'Circuit B €16 (大教堂+舊皇宮+黃金巷)', '領隊已安排團體票', '從城堡廣場拍攝大教堂正面', '06:00 - 22:00 (景點09:00-17:00)', 'Hradčany, 119 08 Praha 1', '地鐵A線 Malostranská 站，再步行上坡'),

('charles-bridge', '查理大橋 (Charles Bridge)', '布拉格', 'czech', '🌉', '連接布拉格老城與小城的14世紀石橋，長516米，兩側有30座巴洛克聖徒雕像。是布拉格最浪漫的地標。', '["聖約翰雕像 - 摸底座會帶來好運", "橋頭塔樓 - 可登頂看日出", "街頭藝人 - 現場音樂與畫作", "30座雕像 - 每座都有故事"]', '清晨6-7點或晚上10點後，避開白天擁擠', '步行約20分鐘，含拍照停留1小時', '免費', '無需預約', '從小城區橋頭塔樓拍攝', '24小時開放', 'Karlův most, 110 00 Praha 1', '地鐵A線 Staroměstská 站'),

('old-town-square', '老城廣場 (Old Town Square)', '布拉格', 'czech', '⛲', '布拉格的心臟地帶，周圍環繞著哥德式、巴洛克式、羅馬式建築。天文鐘是必看亮點。', '["布拉格天文鐘 - 整點報時，十二使徒現身", "泰恩教堂 - 雙塔黑影是布拉格地標", "胡斯紀念碑 - 紀念宗教改革先驅", "聖尼古拉教堂 - 巴洛克華麗內飾"]', '整點前5分鐘到天文鐘前卡位', '1-2小時', '廣場免費，教堂登塔約 €10', '無需預約', '泰恩教堂與胡斯紀念碑是經典構圖', '24小時開放', 'Staroměstské náměstí, 110 00 Praha 1', '地鐵A線 Staroměstská 站'),

('hallstatt', '哈修塔特湖區 (Hallstatt)', '哈修塔特', 'austria', '🏔️', '世界文化遺產，被譽為「世界最美小鎮」。依山傍水，傳統木屋與教堂倒映在湖面上，如詩如畫。', '["明信片角度 - 經典拍照點", "鹽礦 - 世界上最古老的鹽礦", "天空步道 - 懸空觀景台", "骨頭教堂 - 600顆彩繪頭骨"]', '早上9點前人少', '3-4小時', '小鎮免費，鹽礦 €34', '自由活動', '明信片角度（北邊路口）', '24小時', 'Hallstatt, Austria', '團體巴士直達'),

('konigssee', '國王湖 (Königssee)', '貝希特斯加登', 'germany', '🏔️', '德國最美的高山湖泊，被阿爾卑斯山環抱。湖水清澈見底，電動船遊覽是必體驗。', '["聖巴多羅買教堂 - 紅頂洋蔥教堂", "Obersee湖 - 更上游的秘境", "回音壁 - 船夫吹奏小號示範", "瓦茨曼山 - 德國第二高峰"]', '上午湖面平靜，倒影清晰', '船程+徒步約4-5小時', '來回船票 €22', '領隊已安排', '紅頂教堂與湖山倒影', '08:00-17:00（依季節調整）', 'Seestraße 3, 83471 Schönau am Königssee', '團體巴士直達');

-- ============================================
-- 6. 插入實用提醒項目
-- ============================================

-- 行李準備
INSERT INTO tip_items (category_id, subcategory, tip_text, display_order)
SELECT id, '登機行李', '證件、錢包、手機、充電線隨身攜帶', 1 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '登機行李', '長途飛行帶頸枕、眼罩、耳塞', 2 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '登機行李', '準備一套換洗衣物（以防托運行李延誤）', 3 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '登機行李', '保濕面膜、護唇膏（機艙很乾燥）', 4 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '登機行李', '暈車藥、腸胃藥', 5 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '衣物建議（4月天氣）', '4月氣溫約 8-18°C，早晚溫差大', 6 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '衣物建議（4月天氣）', '採用「洋蔥式穿法」，多層次搭配', 7 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '衣物建議（4月天氣）', '帶一件防風防水外套', 8 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '歐洲轉接頭', '奧地利、德國：Type C/F（兩圓孔）', 9 FROM tip_categories WHERE category_key = 'luggage'
UNION ALL
SELECT id, '歐洲轉接頭', '捷克、匈牙利、斯洛伐克：Type C/E（兩圓孔）', 10 FROM tip_categories WHERE category_key = 'luggage';

-- ============================================
-- 7. 插入行前清單項目 (部分示例)
-- ============================================
INSERT INTO checklist_items (category_id, item_text, important, display_order)
SELECT id, '護照（效期6個月以上）', true, 1 FROM checklist_categories WHERE category_key = 'documents'
UNION ALL
SELECT id, '護照影本（2份，分開存放）', true, 2 FROM checklist_categories WHERE category_key = 'documents'
UNION ALL
SELECT id, '身分證（備用）', false, 3 FROM checklist_categories WHERE category_key = 'documents'
UNION ALL
SELECT id, '機票電子檔（截圖備份）', true, 4 FROM checklist_categories WHERE category_key = 'documents'
UNION ALL
SELECT id, '旅遊保險單（列印或電子檔）', true, 5 FROM checklist_categories WHERE category_key = 'documents'
UNION ALL
SELECT id, '萬用轉接頭（歐規Type C/F）', true, 1 FROM checklist_categories WHERE category_key = 'electronics'
UNION ALL
SELECT id, '延長線（多孔）', true, 2 FROM checklist_categories WHERE category_key = 'electronics'
UNION ALL
SELECT id, '行動電源（20000mAh以下）', true, 3 FROM checklist_categories WHERE category_key = 'electronics'
UNION ALL
SELECT id, '歐洲網卡/eSIM', true, 4 FROM checklist_categories WHERE category_key = 'electronics'
UNION ALL
SELECT id, '感冒藥（日夜用）', true, 1 FROM checklist_categories WHERE category_key = 'health'
UNION ALL
SELECT id, '腸胃藥（止瀉、消化不良）', true, 2 FROM checklist_categories WHERE category_key = 'health'
UNION ALL
SELECT id, '暈車藥', true, 3 FROM checklist_categories WHERE category_key = 'health'
UNION ALL
SELECT id, '歐元現金 €300-500（小額面鈔）', true, 1 FROM checklist_categories WHERE category_key = 'money'
UNION ALL
SELECT id, '信用卡（Visa/Mastercard）', true, 2 FROM checklist_categories WHERE category_key = 'money'
UNION ALL
SELECT id, '牙刷、牙膏（歐洲飯店通常沒有）', true, 1 FROM checklist_categories WHERE category_key = 'toiletries'
UNION ALL
SELECT id, '防曬乳 SPF50+', true, 2 FROM checklist_categories WHERE category_key = 'toiletries';

-- ============================================
-- 完成！
-- ============================================
SELECT 'Migration completed successfully!' AS status;
