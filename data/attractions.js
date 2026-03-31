/**
 * 奧捷斯匈景點詳細介紹
 */

const ATTRACTIONS_DATA = [
    // ===== 匈牙利 - 布達佩斯 =====
    {
        id: "budapest-parliament",
        name: "匈牙利國會大廈 (Hungarian Parliament)",
        city: "布達佩斯",
        country: "hungary",
        icon: "🏛️",
        description: "布達佩斯最具代表性的建築，歐洲最大的國會建築之一。新哥德式與新文藝復興風格的完美融合，坐落於多瑙河畔，與漁人堡遙遙相望。",
        highlights: [
            "黃金圓頂 - 重達4公斤的皇冠",
            "圓頂大廳 - 96公尺高，象徵896年建國",
            "階梯大廳 - 紅毯與大理石柱",
            "多瑙河畔夜景 - 晚上燈光璀璨"
        ],
        tips: {
            bestTime: "早上9點開門即入場，或傍晚拍夜景",
            duration: "導覽約45分鐘",
            tickets: "導覽團約 €15-20，需提前預約",
            booking: "領隊已安排團體導覽",
            photo: "對岸漁人堡是最佳拍攝點"
        },
        openingHours: "08:00-18:00（夏季延長）",
        location: "Kossuth Lajos tér 1-3, Budapest",
        howToGet: "地鐵M2線 Kossuth Lajos tér 站"
    },
    {
        id: "fishermans-bastion",
        name: "漁人堡 (Fisherman's Bastion)",
        city: "布達佩斯",
        country: "hungary",
        icon: "🏰",
        description: "位於布達城堡山，新羅馬式風格的觀景台。七座尖塔象徵七個馬札爾部落，是欣賞多瑙河與國會大廈的最佳地點。",
        highlights: [
            "觀景台 - 270度俯瞰布達佩斯",
            "馬提亞教堂 - 彩色馬賽克屋頂",
            "拱廊與尖塔 - 童話般的建築",
            "日出日落 - 金色時刻最美"
        ],
        tips: {
            bestTime: "日出或日落時分",
            duration: "1-2小時",
            tickets: "下層免費，上層觀景台 €3",
            booking: "現場購票",
            photo: "從上層觀景台拍國會大廈"
        },
        openingHours: "24小時（觀景台09:00-21:00）",
        location: "Szentháromság tér, Budapest",
        howToGet: "布達城堡山纜車或步行"
    },
    {
        id: "szechenyi-bath",
        name: "塞切尼溫泉 (Széchenyi Thermal Bath)",
        city: "布達佩斯",
        country: "hungary",
        icon: "♨️",
        description: "歐洲最大的溫泉浴場，新巴洛克風格建築。布達佩斯被稱為「溫泉之都」，這裡有15個室內池和3個室外池。",
        highlights: [
            "黃色宮殿建築 - 絕美拍照背景",
            "室外溫泉池 - 冬天泡溫泉最舒服",
            "溫泉水療 - 富含礦物質",
            "棋盤遊戲 - 當地人在水中下棋"
        ],
        tips: {
            bestTime: "早上較少人，下午最熱鬧",
            duration: "2-3小時",
            tickets: "日票約 €20",
            booking: "現場購票",
            photo: "黃色建築前或室內泳池"
        },
        openingHours: "07:00-20:00",
        location: "Állatkerti krt. 9-11, Budapest",
        howToGet: "地鐵M1線 Széchenyi fürdő 站"
    },
    
    // ===== 斯洛伐克 - 布拉提斯拉瓦 =====
    {
        id: "bratislava-castle",
        name: "布拉提斯拉瓦城堡 (Bratislava Castle)",
        city: "布拉提斯拉瓦",
        country: "slovakia",
        icon: "🏰",
        description: "坐落於多瑙河畔的小山上，城堡四角各有一座塔樓，外觀像倒置的桌子。可俯瞰多瑙河與奧地利邊境。",
        highlights: [
            "城堡博物館 - 斯洛伐克歷史文物",
            "頂樓觀景台 - 360度全景",
            "皇冠廳 - 復刻匈牙利國王加冕場景",
            "四大塔樓 - 獨特建築外觀"
        ],
        tips: {
            bestTime: "傍晚時分看夕陽",
            duration: "2小時",
            tickets: "城堡免費，博物館 €10",
            booking: "現場購票",
            photo: "從多瑙河對岸拍攝城堡倒影"
        },
        openingHours: "09:00-17:00",
        location: "Hrad, 811 06 Bratislava",
        howToGet: "從老城步行15分鐘上坡"
    },
    
    // ===== 奧地利 - 維也納 =====
    {
        id: "schoenbrunn",
        name: "美泉宮 (Schönbrunn Palace)",
        city: "維也納",
        country: "austria",
        icon: "🏛️",
        description: "美泉宮是哈布斯堡王朝的夏宮，建於18世紀，擁有1441間房間。宮殿結合了巴洛克藝術與皇家氣派，是奧地利最重要的文化遺產之一。",
        highlights: [
            "鏡廳 (Hall of Mirrors) - 莫扎特6歲時在此演奏",
            "皇家花園 - 法式庭園設計，有海王星噴泉",
            "凱旋門觀景台 - 可俯瞰宮殿與維也納市景",
            "動物園 - 世界最古老的動物園之一"
        ],
        tips: {
            bestTime: "早上9點開門即入場，避開人潮",
            duration: "建議停留3-4小時",
            tickets: "Imperial Tour €22 (22間房) 或 Grand Tour €29 (40間房)",
            booking: "領隊已安排團體導覽",
            photo: "花園內的凱旋門是最佳拍照點"
        },
        openingHours: "08:30 - 17:00 (夏季延長至18:00)",
        location: "Schönbrunner Schloßstraße 47, 1130 Wien",
        howToGet: "地鐵U4線 Schönbrunn 站"
    },
    {
        id: "st-stephen",
        name: "聖史蒂芬大教堂 (St. Stephen's Cathedral)",
        city: "維也納",
        country: "austria",
        icon: "⛪",
        description: "維也納的地標與精神象徵，建於12世紀，混合了羅馬式與哥德式建築風格。彩色瓦片屋頂是維也納天際線的標誌。",
        highlights: [
            "南塔 (South Tower) - 登塔俯瞰維也納",
            "北塔觀景台 - 電梯直達，適合不想爬樓梯的人",
            "地下墓穴 - 哈布斯堡家族成員長眠之地",
            "彩色屋頂 - 雙頭鷹圖案，象徵哈布斯堡王朝"
        ],
        tips: {
            bestTime: "傍晚時分光線最美",
            duration: "教堂參觀1小時，登塔額外1小時",
            tickets: "教堂免費，北塔電梯 €6，南塔爬樓梯 €5",
            booking: "現場購票即可",
            photo: "從格拉本大街拍攝教堂正面最壯觀"
        },
        openingHours: "06:00 - 22:00 (週日禮拜時間不同)",
        location: "Stephansplatz 3, 1010 Wien",
        howToGet: "地鐵U1/U3線 Stephansplatz 站"
    },
    {
        id: "hofburg",
        name: "霍夫堡宮 (Hofburg Palace)",
        city: "維也納",
        country: "austria",
        icon: "👑",
        description: "哈布斯堡王朝的冬宮，現在是奧地利總統官邸。茜茜公主博物館展示了這位傳奇皇后的生活。",
        highlights: [
            "茜茜公主博物館 - 了解伊莉莎白皇后的一生",
            "皇家銀器館 - 超過7,000件皇家餐具",
            "西班牙騎術學校 - 利比扎馬表演",
            "英雄廣場 - 兩位歐根親王雕像"
        ],
        tips: {
            bestTime: "上午參觀",
            duration: "2-3小時",
            tickets: "茜茜博物館 €16，組合票 €30",
            booking: "領隊已安排",
            photo: "英雄廣場與宮殿外觀"
        },
        openingHours: "09:00-17:00",
        location: "Michaelerkuppel, 1010 Wien",
        howToGet: "地鐵U3線 Herrengasse 站"
    },
    {
        id: "belvedere",
        name: "熊布朗宮/美景宮 (Belvedere)",
        city: "維也納",
        country: "austria",
        icon: "🎨",
        description: "巴洛克風格的宮殿，分為上美景宮和下美景宮。上美景宮收藏了大量19世紀奧地利藝術品，包括克林姆的《吻》。",
        highlights: [
            "克林姆《吻》 - 分離派代表作",
            "花園噴泉 - 巴洛克對稱美學",
            "宮殿倒影池 - 絕美拍照點",
            "埃貢·席勒作品 - 表現主義大師"
        ],
        tips: {
            bestTime: "上午人少",
            duration: "2-3小時",
            tickets: "上美景宮 €16",
            booking: "現場購票",
            photo: "花園水池倒映宮殿"
        },
        openingHours: "09:00-18:00",
        location: "Prinz Eugen-Straße 27, 1030 Wien",
        howToGet: "電車D線 Schloss Belvedere 站"
    },
    {
        id: "hundertwasser",
        name: "百水公寓 (Hundertwasserhaus)",
        city: "維也納",
        country: "austria",
        icon: "🎨",
        description: "奧地利藝術家百水先生設計的公寓，色彩繽紛、線條不規則，挑戰傳統建築美學。屋頂種滿了樹木，被稱為「垂直森林」。",
        highlights: [
            "彩色外牆 - 沒有直線的建築",
            "屋頂花園 - 與自然共生",
            "百水藝術村 - 對面可參觀",
            "紀念品店 - 百水風格商品"
        ],
        tips: {
            bestTime: "白天光線好",
            duration: "30分鐘外觀拍照",
            tickets: "外觀免費",
            booking: "無需預約",
            photo: "街對面可拍到全景"
        },
        openingHours: "外觀24小時",
        location: "Kegelgasse 36-38, 1030 Wien",
        howToGet: "地鐵U3/U4線 Landstraße 站"
    },
    
    // ===== 捷克 - 布爾諾 =====
    {
        id: "spilberk",
        name: "史畢利伯城堡 (Špilberk Castle)",
        city: "布爾諾",
        country: "czech",
        icon: "🏰",
        description: "布爾諾的地標，原為中世紀城堡，後改為監獄。現在是博物館，可俯瞰整個城市。",
        highlights: [
            "城堡塔樓 - 360度俯瞰布爾諾",
            "監獄博物館 - 了解歷史",
            "城堡花園 - 散步休憩",
            "夜景 - 城市燈火"
        ],
        tips: {
            bestTime: "下午或傍晚",
            duration: "1.5-2小時",
            tickets: "約 €6",
            booking: "現場購票",
            photo: "塔樓俯瞰城市"
        },
        openingHours: "09:00-17:00",
        location: "Špilberk 210/1, Brno",
        howToGet: "步行上坡約15分鐘"
    },
    
    // ===== 捷克 - 布拉格 =====
    {
        id: "prague-castle",
        name: "布拉格城堡 (Prague Castle)",
        city: "布拉格",
        country: "czech",
        icon: "🏰",
        description: "全球最大的古城堡建築群，面積近7萬平方米。自9世紀起就是捷克國王的居所，現今仍是總統府所在地。",
        highlights: [
            "聖維特大教堂 - 哥德式建築傑作，彩繪玻璃是慕夏作品",
            "舊皇宮 - 弗拉迪斯拉夫廳的拱頂令人驚嘆",
            "黃金巷 - 彩色小屋，卡夫卡曾居住於此",
            "城堡衛兵交接 - 每日中午12點"
        ],
        tips: {
            bestTime: "早上8點前入場，避開人潮",
            duration: "至少4-5小時",
            tickets: "Circuit B €16 (大教堂+舊皇宮+黃金巷)",
            booking: "領隊已安排團體票",
            photo: "從城堡廣場拍攝大教堂正面"
        },
        openingHours: "06:00 - 22:00 (景點09:00-17:00)",
        location: "Hradčany, 119 08 Praha 1",
        howToGet: "地鐵A線 Malostranská 站，再步行上坡"
    },
    {
        id: "charles-bridge",
        name: "查理大橋 (Charles Bridge)",
        city: "布拉格",
        country: "czech",
        icon: "🌉",
        description: "連接布拉格老城與小城的14世紀石橋，長516米，兩側有30座巴洛克聖徒雕像。是布拉格最浪漫的地標。",
        highlights: [
            "聖約翰雕像 - 摸底座會帶來好運",
            "橋頭塔樓 - 可登頂看日出",
            "街頭藝人 - 現場音樂與畫作",
            "30座雕像 - 每座都有故事"
        ],
        tips: {
            bestTime: "清晨6-7點或晚上10點後，避開白天擁擠",
            duration: "步行約20分鐘，含拍照停留1小時",
            tickets: "免費",
            booking: "無需預約",
            photo: "從小城區橋頭塔樓拍攝"
        },
        openingHours: "24小時開放",
        location: "Karlův most, 110 00 Praha 1",
        howToGet: "地鐵A線 Staroměstská 站"
    },
    {
        id: "old-town-square",
        name: "老城廣場 (Old Town Square)",
        city: "布拉格",
        country: "czech",
        icon: "⛲",
        description: "布拉格的心臟地帶，周圍環繞著哥德式、巴洛克式、羅馬式建築。天文鐘是必看亮點。",
        highlights: [
            "布拉格天文鐘 - 整點報時，十二使徒現身",
            "泰恩教堂 - 雙塔黑影是布拉格地標",
            "胡斯紀念碑 - 紀念宗教改革先驅",
            "聖尼古拉教堂 - 巴洛克華麗內飾"
        ],
        tips: {
            bestTime: "整點前5分鐘到天文鐘前卡位",
            duration: "1-2小時",
            tickets: "廣場免費，教堂登塔約 €10",
            booking: "無需預約",
            photo: "泰恩教堂與胡斯紀念碑是經典構圖"
        },
        openingHours: "24小時開放",
        location: "Staroměstské náměstí, 110 00 Praha 1",
        howToGet: "地鐵A線 Staroměstská 站"
    },
    
    // ===== 捷克 - 庫倫洛夫 =====
    {
        id: "cesky-krumlov-castle",
        name: "庫倫洛夫城堡 (Český Krumlov Castle)",
        city: "庫倫洛夫",
        country: "czech",
        icon: "🏰",
        description: "捷克第二大城堡群， UNESCO世界文化遺產。彩繪塔是庫倫洛夫的標誌，俯瞰紅屋頂小鎮與伏爾塔瓦河彎。",
        highlights: [
            "彩繪塔 - 粉紅與綠色的文藝復興塔樓",
            "城堡劇場 - 保存完整的巴洛克劇場",
            "城堡花園 - 法式庭園與噴泉",
            "觀景台 - 絕美小鎮全景"
        ],
        tips: {
            bestTime: "下午光線柔和",
            duration: "2-3小時",
            tickets: "城堡區免費，導覽約 €10",
            booking: "領隊安排",
            photo: "彩繪塔與小鎮全景"
        },
        openingHours: "09:00-17:00",
        location: "Zámek 59, 381 01 Český Krumlov",
        howToGet: "步行上山"
    },
    
    // ===== 德國 - 國王湖 =====
    {
        id: "konigssee",
        name: "國王湖 (Königssee)",
        city: "貝希特斯加登",
        country: "germany",
        icon: "🏔️",
        description: "德國最美的高山湖泊，被阿爾卑斯山環抱。湖水清澈見底，電動船遊覽是必體驗。",
        highlights: [
            "聖巴多羅買教堂 - 紅頂洋蔥教堂",
            "Obersee湖 - 更上游的秘境",
            "回音壁 - 船夫吹奏小號示範",
            "瓦茨曼山 - 德國第二高峰"
        ],
        tips: {
            bestTime: "上午湖面平靜，倒影清晰",
            duration: "船程+徒步約4-5小時",
            tickets: "來回船票 €22",
            booking: "領隊已安排",
            photo: "紅頂教堂與湖山倒影"
        },
        openingHours: "08:00-17:00（依季節調整）",
        location: "Seestraße 3, 83471 Schönau am Königssee",
        howToGet: "團體巴士直達"
    },
    
    // ===== 奧地利 - 薩爾斯堡 =====
    {
        id: "salzburg-fortress",
        name: "薩爾斯堡要塞 (Hohensalzburg Fortress)",
        city: "薩爾斯堡",
        country: "austria",
        icon: "🏰",
        description: "歐洲保存最完整的中世紀要塞，建於11世紀。搭乘纜車上山，可俯瞰整個薩爾斯堡與阿爾卑斯山。",
        highlights: [
            "黃金大廳 - 金色裝飾的宴會廳",
            "要塞博物館 - 中世紀武器與生活",
            "觀景台 - 360度山景",
            "纜車 - 最陡的纜車之一"
        ],
        tips: {
            bestTime: "下午或傍晚",
            duration: "2-3小時",
            tickets: "含纜車約 €15",
            booking: "領隊安排",
            photo: "俯瞰薩爾斯堡市區"
        },
        openingHours: "09:00-19:00",
        location: "Mönchsberg 34, 5020 Salzburg",
        howToGet: "要塞纜車 Festungsgasse"
    },
    {
        id: "mozart-house",
        name: "莫札特故居 (Mozart's Birthplace)",
        city: "薩爾斯堡",
        country: "austria",
        icon: "🎵",
        description: "1756年莫札特出生的房子，現在是博物館。展示莫札特用過的樂器、手稿與個人物品。",
        highlights: [
            "童年小提琴 - 莫札特用過的樂器",
            "手稿 - 珍貴的作曲草稿",
            "家庭房間 - 18世紀的居家生活",
            "黃色外牆 - 糧食胡同9號"
        ],
        tips: {
            bestTime: "上午",
            duration: "1小時",
            tickets: "約 €12",
            booking: "領隊安排",
            photo: "糧食胡同外觀"
        },
        openingHours: "09:00-17:30",
        location: "Getreidegasse 9, 5020 Salzburg",
        howToGet: "步行前往糧食胡同"
    },
    
    // ===== 奧地利 - 哈修塔特 =====
    {
        id: "hallstatt",
        name: "哈修塔特湖區 (Hallstatt)",
        city: "哈修塔特",
        country: "austria",
        icon: "🏔️",
        description: "世界文化遺產，被譽為「世界最美小鎮」。依山傍水，傳統木屋與教堂倒映在湖面上，如詩如畫。",
        highlights: [
            "明信片角度 - 經典拍照點",
            "鹽礦 - 世界上最古老的鹽礦",
            "天空步道 - 懸空觀景台",
            "骨頭教堂 - 600顆彩繪頭骨"
        ],
        tips: {
            bestTime: "早上9點前人少",
            duration: "3-4小時",
            tickets: "小鎮免費，鹽礦 €34",
            booking: "自由活動",
            photo: "明信片角度（北邊路口）"
        },
        openingHours: "24小時",
        location: "Hallstatt, Austria",
        howToGet: "團體巴士直達"
    }
];

// 景點搜尋功能
function searchAttractions(keyword) {
    return ATTRACTIONS_DATA.filter(attraction => 
        attraction.name.toLowerCase().includes(keyword.toLowerCase()) ||
        attraction.city.toLowerCase().includes(keyword.toLowerCase()) ||
        attraction.description.toLowerCase().includes(keyword.toLowerCase())
    );
}

// 依國家篩選
function getAttractionsByCountry(country) {
    return ATTRACTIONS_DATA.filter(attraction => attraction.country === country);
}
