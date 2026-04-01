/**
 * 住宿資訊 - 含經緯度座標
 */

const HOTELS_DATA = [
    // ===== Day 1-2: 布達佩斯 =====
    {
        id: "budapest-hotel",
        name: "布達佩斯住宿",
        city: "布達佩斯",
        country: "hungary",
        nights: 2,
        lat: 47.4979,
        lng: 19.0402,
        icon: "🏨",
        description: "布達佩斯市中心酒店，靠近多瑙河畔"
    },
    
    // ===== Day 2: 布拉提斯拉瓦（日遊，住宿布達佩斯） =====
    
    // ===== Day 3-5: 維也納 =====
    {
        id: "vienna-hotel",
        name: "維也納住宿",
        city: "維也納",
        country: "austria",
        nights: 3,
        lat: 48.2082,
        lng: 16.3738,
        icon: "🏨",
        description: "維也納市中心酒店，靠近聖史蒂芬大教堂"
    },
    
    // ===== Day 6: 梅爾克（日遊，住宿維也納） =====
    
    // ===== Day 7-9: 布拉格 =====
    {
        id: "prague-hotel",
        name: "布拉格住宿",
        city: "布拉格",
        country: "czech",
        nights: 3,
        lat: 50.0755,
        lng: 14.4378,
        icon: "🏨",
        description: "布拉格老城區酒店，靠近老城廣場"
    },
    
    // ===== Day 10: 離開 =====
];

/**
 * 行程路線 - 按天排序
 */
const ROUTE_DATA = [
    { day: 1, city: "布達佩斯", lat: 47.4979, lng: 19.0402, country: "hungary" },
    { day: 2, city: "布拉提斯拉瓦", lat: 48.1435, lng: 17.1090, country: "slovakia" },
    { day: 2, city: "布達佩斯", lat: 47.4979, lng: 19.0402, country: "hungary" },
    { day: 3, city: "維也納", lat: 48.2082, lng: 16.3738, country: "austria" },
    { day: 4, city: "維也納", lat: 48.2082, lng: 16.3738, country: "austria" },
    { day: 5, city: "維也納", lat: 48.2082, lng: 16.3738, country: "austria" },
    { day: 6, city: "梅爾克", lat: 48.2282, lng: 15.3305, country: "austria" },
    { day: 6, city: "維也納", lat: 48.2082, lng: 16.3738, country: "austria" },
    { day: 7, city: "布拉格", lat: 50.0755, lng: 14.4378, country: "czech" },
    { day: 8, city: "布拉格", lat: 50.0755, lng: 14.4378, country: "czech" },
    { day: 9, city: "布拉格", lat: 50.0755, lng: 14.4378, country: "czech" },
    { day: 10, city: "布拉格", lat: 50.0755, lng: 14.4378, country: "czech" }
];
