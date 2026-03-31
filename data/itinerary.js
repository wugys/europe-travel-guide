/**
 * 奧捷斯匈四國行程數據
 * 旅行日期：2026/04/01 - 2026/04/10 (10天)
 */

// 行程基本資訊
const TRIP_INFO = {
    name: "🏰 奧捷斯匈四國之旅",
    subtitle: "國王湖遊船．四國首都．維也納．布拉格．布達佩斯．庫倫洛夫．哈修塔特湖區",
    startDate: "2026-04-01",
    endDate: "2026-04-10",
    duration: "10天",
    leader: {
        name: "林孜璟",
        phone: "+886 0913573121"
    },
    travelers: [],
    countries: ["🇭🇺 匈牙利", "🇸🇰 斯洛伐克", "🇦🇹 奧地利", "🇨🇿 捷克", "🇩🇪 德國"],
    cities: ["布達佩斯", "布拉提斯拉瓦", "維也納", "布爾諾", "布拉格", "庫倫洛夫", "薩爾斯堡", "哈修塔特"]
};

// 航班資訊
const FLIGHT_INFO = {
    outbound: [
        {
            flight: "MU5006",
            date: "2026/04/01(三)",
            depTime: "18:40",
            depAirport: "桃園機場",
            arrTime: "20:40",
            arrAirport: "上海浦東機場",
            duration: "02:00"
        },
        {
            flight: "FM869",
            date: "2026/04/02(四)",
            depTime: "01:50",
            depAirport: "上海浦東機場",
            arrTime: "08:05",
            arrAirport: "布達佩斯機場",
            duration: "12:15"
        }
    ],
    return: [
        {
            flight: "FM870",
            date: "2026/04/09(四)",
            depTime: "12:30",
            depAirport: "布達佩斯機場",
            arrTime: "05:35(+1)",
            arrAirport: "上海浦東機場",
            duration: "11:05"
        },
        {
            flight: "MU5007",
            date: "2026/04/10(五)",
            depTime: "12:20",
            depAirport: "上海浦東機場",
            arrTime: "14:25",
            arrAirport: "桃園機場",
            duration: "02:05"
        }
    ]
};

// 每日行程
const ITINERARY_DATA = [
    {
        day: 1,
        date: "2026-04-01",
        title: "台北 → 上海",
        route: ["台北", "上海"],
        country: "taiwan",
        highlight: "出發日",
        activities: [
            {
                time: "15:30",
                title: "桃園機場集合",
                desc: "第二航廈 東方航空(中華航空代理)櫃台",
                type: "transport"
            },
            {
                time: "18:40",
                title: "航班起飛 MU5006",
                desc: "台北 → 上海浦東",
                type: "transport"
            },
            {
                time: "20:40",
                title: "抵達上海浦東",
                desc: "轉機等待",
                type: "transport"
            }
        ],
        meals: { breakfast: false, lunch: false, dinner: "機上簡餐" },
        accommodation: "機上过夜",
        notes: "請務必準時集合，攜帶護照及電子機票"
    },
    {
        day: 2,
        date: "2026-04-02",
        title: "上海 → 布達佩斯 → 布拉提斯拉瓦 → 維也納",
        route: ["上海", "布達佩斯", "布拉提斯拉瓦", "維也納"],
        country: "hungary",
        highlight: "抵達歐洲，四國首都巡禮開始",
        activities: [
            {
                time: "01:50",
                title: "航班起飛 FM869",
                desc: "上海浦東 → 布達佩斯",
                type: "transport"
            },
            {
                time: "08:05",
                title: "抵達布達佩斯",
                desc: "入境、領取行李",
                type: "transport"
            },
            {
                time: "10:00",
                title: "布達佩斯市區觀光",
                desc: "國會大廈、漁人堡、馬提亞教堂",
                type: "attraction"
            },
            {
                time: "14:00",
                title: "前往布拉提斯拉瓦",
                desc: "車程約233km",
                type: "transport"
            },
            {
                time: "16:30",
                title: "布拉提斯拉瓦市區",
                desc: "布拉提斯拉瓦城堡、舊城區",
                type: "attraction"
            },
            {
                time: "18:00",
                title: "前往維也納",
                desc: "車程約80km",
                type: "transport"
            },
            {
                time: "19:30",
                title: "晚餐",
                desc: "維也納特選炸豬排",
                type: "food"
            }
        ],
        meals: { breakfast: "機上餐食", lunch: "中式六菜一湯", dinner: "維也納特選炸豬排" },
        accommodation: "VOCO VIENNA PRATER 或 AUSTRIA TREND HOTEL LASSALLE",
        hotelInfo: {
            name: "VOCO VIENNA PRATER",
            address: "ENGERTHSTRASSE 173-175, VIENNA 1020",
            phone: "43-1-2144000"
        },
        notes: "長途飛行後第一天，注意休息"
    },
    {
        day: 3,
        date: "2026-04-03",
        title: "維也納 → 布爾諾",
        route: ["維也納", "布爾諾"],
        country: "austria",
        highlight: "維也納藝術巡禮",
        activities: [
            {
                time: "08:00",
                title: "美泉宮",
                desc: "參觀哈布斯堡王朝夏宮，世界文化遺產",
                type: "attraction"
            },
            {
                time: "11:00",
                title: "聖史蒂芬大教堂",
                desc: "維也納地標，哥德式建築傑作",
                type: "attraction"
            },
            {
                time: "12:30",
                title: "午餐",
                desc: "中式六菜一湯",
                type: "food"
            },
            {
                time: "14:00",
                title: "霍夫堡宮",
                desc: "茜茜公主博物館、皇家銀器館",
                type: "attraction"
            },
            {
                time: "16:00",
                title: "前往布爾諾",
                desc: "車程約138km",
                type: "transport"
            },
            {
                time: "19:00",
                title: "晚餐",
                desc: "當地特色西式(豬)料理",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "中式六菜一湯", dinner: "當地特色西式料理" },
        accommodation: "OREA CONGRESS HOTEL BRNO",
        hotelInfo: {
            name: "OREA CONGRESS HOTEL BRNO",
            address: "KŘIŽKOVSKÉHO 458/47, 603 73 BRNO",
            phone: "420-530510121"
        },
        notes: "美泉宮門票已含，請跟隨領隊"
    },
    {
        day: 4,
        date: "2026-04-04",
        title: "布爾諾 → 布拉格",
        route: ["布爾諾", "布拉格"],
        country: "czech",
        highlight: "金色布拉格",
        activities: [
            {
                time: "08:00",
                title: "布爾諾市區觀光",
                desc: "史畢利伯城堡、彼得羅夫大教堂",
                type: "attraction"
            },
            {
                time: "11:00",
                title: "前往布拉格",
                desc: "車程約206km",
                type: "transport"
            },
            {
                time: "13:00",
                title: "午餐",
                desc: "捷克烤鴨特選料理",
                type: "food"
            },
            {
                time: "15:00",
                title: "布拉格城堡",
                desc: "聖維特大教堂、舊皇宮、黃金巷",
                type: "attraction"
            },
            {
                time: "18:00",
                title: "查理大橋",
                desc: "日落時分漫步查理大橋",
                type: "attraction"
            },
            {
                time: "19:30",
                title: "晚餐",
                desc: "中式六菜一湯",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "捷克烤鴨特選料理", dinner: "中式六菜一湯" },
        accommodation: "OCCIDENTAL PRAHA",
        hotelInfo: {
            name: "OCCIDENTAL PRAHA",
            address: "Na Strzi 32 Prague 140 00",
            phone: "420-2-96772111"
        },
        notes: "布拉格城堡門票已含，黃金巷卡夫卡故居"
    },
    {
        day: 5,
        date: "2026-04-05",
        title: "布拉格 → 庫倫洛夫",
        route: ["布拉格", "庫倫洛夫"],
        country: "czech",
        highlight: "中世紀童話小鎮",
        activities: [
            {
                time: "08:00",
                title: "舊城廣場",
                desc: "天文鐘、泰恩教堂、火藥塔",
                type: "attraction"
            },
            {
                time: "10:00",
                title: "自由活動",
                desc: "老城區購物、品嚐煙囪捲",
                type: "shopping"
            },
            {
                time: "12:00",
                title: "前往庫倫洛夫",
                desc: "車程約172km",
                type: "transport"
            },
            {
                time: "14:00",
                title: "午餐",
                desc: "捷克西式料理",
                type: "food"
            },
            {
                time: "15:30",
                title: "庫倫洛夫城堡",
                desc: "彩繪塔、城堡花園、巴洛克劇場",
                type: "attraction"
            },
            {
                time: "18:00",
                title: "伏爾塔瓦河遊船",
                desc: "欣賞小鎮全景",
                type: "attraction"
            },
            {
                time: "19:30",
                title: "晚餐",
                desc: "特選地窖豬肋排料理",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "捷克西式料理", dinner: "特選地窖豬肋排料理" },
        accommodation: "HOTEL GRAND",
        hotelInfo: {
            name: "HOTEL GRAND",
            address: "Namesti Svornosti 3 Cesky Krumlov 381 01",
            phone: "420-38-0711671"
        },
        notes: "庫倫洛夫世界文化遺產，保持中世紀風貌"
    },
    {
        day: 6,
        date: "2026-04-06",
        title: "庫倫洛夫 → 國王湖 → 薩爾斯堡",
        route: ["庫倫洛夫", "國王湖", "薩爾斯堡"],
        country: "germany",
        highlight: "德國最美湖泊",
        activities: [
            {
                time: "07:30",
                title: "前往國王湖",
                desc: "車程約250km，穿越德國邊境",
                type: "transport"
            },
            {
                time: "12:00",
                title: "午餐",
                desc: "當地西式料理",
                type: "food"
            },
            {
                time: "13:30",
                title: "國王湖遊船",
                desc: "德國最美湖泊，電動船遊覽",
                type: "attraction"
            },
            {
                time: "15:00",
                title: "紅頂教堂",
                desc: "聖巴多羅買教堂，經典拍照點",
                type: "attraction"
            },
            {
                time: "16:30",
                title: "前往薩爾斯堡",
                desc: "車程約40km",
                type: "transport"
            },
            {
                time: "18:00",
                title: "晚餐",
                desc: "中式六菜一湯",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "當地西式料理", dinner: "中式六菜一湯" },
        accommodation: "FOURSIDE HOTEL SALZBURG",
        hotelInfo: {
            name: "FOURSIDE HOTEL SALZBURG",
            address: "Am Messezentrum 2 Salzburg Salzburg 5020",
            phone: "43-662-4355460"
        },
        notes: "國王湖遊船約2小時，準備防風外套"
    },
    {
        day: 7,
        date: "2026-04-07",
        title: "薩爾斯堡 → 哈修塔特 → 維也納",
        route: ["薩爾斯堡", "哈修塔特", "維也納"],
        country: "austria",
        highlight: "莫札特故鄉與世界最美小鎮",
        activities: [
            {
                time: "08:00",
                title: "薩爾斯堡市區",
                desc: "莫札特故居、薩爾斯堡要塞",
                type: "attraction"
            },
            {
                time: "10:00",
                title: "前往哈修塔特",
                desc: "車程約77km",
                type: "transport"
            },
            {
                time: "11:30",
                title: "哈修塔特湖區",
                desc: "世界文化遺產，絕美湖邊小鎮",
                type: "attraction"
            },
            {
                time: "13:00",
                title: "午餐",
                desc: "特選湖區鱒魚料理",
                type: "food"
            },
            {
                time: "15:00",
                title: "前往維也納",
                desc: "車程約300km",
                type: "transport"
            },
            {
                time: "19:00",
                title: "晚餐",
                desc: "中式六菜一湯",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "特選湖區鱒魚料理", dinner: "中式六菜一湯" },
        accommodation: "AUSTRIA TREND EVENTHOTEL PYRAMIDE",
        hotelInfo: {
            name: "AUSTRIA TREND EVENTHOTEL PYRAMIDE",
            address: "PARKALLEE 2, VÖSENDORF, 2334",
            phone: "43-1-69-900"
        },
        notes: "哈修塔特是絕美拍照點，請準備相機"
    },
    {
        day: 8,
        date: "2026-04-08",
        title: "維也納 → 布達佩斯",
        route: ["維也納", "布達佩斯"],
        country: "hungary",
        highlight: "多瑙河雙子城",
        activities: [
            {
                time: "08:00",
                title: "熊布朗宮",
                desc: "維也納另一宮殿，皇家花園",
                type: "attraction"
            },
            {
                time: "10:00",
                title: "百水公寓",
                desc: "維也納藝術建築",
                type: "attraction"
            },
            {
                time: "11:00",
                title: "格拉本大街購物",
                desc: "黑死病紀念柱、精品街",
                type: "shopping"
            },
            {
                time: "12:30",
                title: "午餐",
                desc: "中式六菜一湯",
                type: "food"
            },
            {
                time: "14:00",
                title: "前往布達佩斯",
                desc: "車程約245km",
                type: "transport"
            },
            {
                time: "18:00",
                title: "布達佩斯夜景",
                desc: "多瑙河遊船夜景",
                type: "attraction"
            },
            {
                time: "19:30",
                title: "晚餐",
                desc: "匈牙利當地特色(牛)料理",
                type: "food"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "中式六菜一湯", dinner: "匈牙利當地特色料理" },
        accommodation: "TRIBE BUDAPEST STADIUM",
        hotelInfo: {
            name: "TRIBE BUDAPEST STADIUM",
            address: "KÖNYVES KÁLMÁN KRT. 34, BUDAPEST, 1097",
            phone: "36-1-2389360"
        },
        notes: "最後一晚在布達佩斯，可享受溫泉"
    },
    {
        day: 9,
        date: "2026-04-09",
        title: "布達佩斯 → 上海",
        route: ["布達佩斯", "上海"],
        country: "hungary",
        highlight: "回程日",
        activities: [
            {
                time: "08:00",
                title: "塞切尼溫泉",
                desc: "匈牙利溫泉體驗（自費選項）",
                type: "attraction"
            },
            {
                time: "10:00",
                title: "中央市場",
                desc: "購買伴手禮、鵝肝醬",
                type: "shopping"
            },
            {
                time: "12:00",
                title: "前往機場",
                desc: "集合前往布達佩斯機場",
                type: "transport"
            },
            {
                time: "12:30",
                title: "航班起飛 FM870",
                desc: "布達佩斯 → 上海",
                type: "transport"
            }
        ],
        meals: { breakfast: "飯店西式早餐", lunch: "機上餐食", dinner: "機上餐食" },
        accommodation: "機上过夜",
        notes: "請提前打包行李，確認護照及登機證"
    },
    {
        day: 10,
        date: "2026-04-10",
        title: "上海 → 台北",
        route: ["上海", "台北"],
        country: "taiwan",
        highlight: "回到溫暖的家",
        activities: [
            {
                time: "05:35",
                title: "抵達上海浦東",
                desc: "轉機等待",
                type: "transport"
            },
            {
                time: "12:20",
                title: "航班起飛 MU5007",
                desc: "上海 → 台北",
                type: "transport"
            },
            {
                time: "14:25",
                title: "抵達桃園機場",
                desc: "結束美好旅程",
                type: "transport"
            }
        ],
        meals: { breakfast: "機上餐食", lunch: false, dinner: false },
        accommodation: "溫暖的家",
        notes: "歡迎回家！記得分享照片"
    }
];

// 若今日沒有行程，顯示的預設訊息
const NO_TODAY_TRIP_MESSAGE = {
    before: "🎒 旅行尚未開始！還有 {days} 天就要出發了，準備好了嗎？",
    after: "🏠 旅行已經結束了！希望這趟旅程留下了美好的回憶。",
    gap: "📅 今天是休息日，沒有安排行程。可以自由探索或休息！"
};
