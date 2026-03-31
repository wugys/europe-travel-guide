/**
 * 行前準備清單
 */

const CHECKLIST_DATA = {
    // 1. 證件與文件
    documents: {
        title: "📄 證件與文件",
        items: [
            { text: "護照（效期6個月以上）", important: true },
            { text: "護照影本（2份，分開存放）", important: true },
            { text: "身分證（備用）", important: false },
            { text: "申根簽證（如需要）", important: true },
            { text: "機票電子檔（截圖備份）", important: true },
            { text: "飯店預訂確認單", important: true },
            { text: "火車票/交通票券列印", important: false },
            { text: "旅遊保險單（列印或電子檔）", important: true },
            { text: "緊急聯絡人資訊卡", important: true },
            { text: "駕照（國際駕照，如自駕）", important: false },
            { text: "學生證（購票優惠用）", important: false },
            { text: "疫苗接種證明（如需要）", important: false }
        ]
    },

    // 2. 行李物品
    luggage: {
        title: "🎒 行李物品",
        items: [
            { text: "26-28吋行李箱", important: true },
            { text: "隨身登機箱/背包", important: true },
            { text: "頸枕（長途飛行必備）", important: true },
            { text: "眼罩、耳塞", important: true },
            { text: "輕便雨衣或折傘", important: true },
            { text: "保溫瓶（可裝熱水）", important: false },
            { text: "摺疊購物袋", important: false },
            { text: "行李鎖（TSA海關鎖）", important: true },
            { text: "行李吊牌（寫聯絡資訊）", important: true },
            { text: "行李束帶", important: false },
            { text: "真空壓縮袋", important: false },
            { text: "分裝袋/收納袋", important: false }
        ]
    },

    // 3. 電子用品
    electronics: {
        title: "🔌 電子用品",
        items: [
            { text: "萬用轉接頭（歐規Type C/F）", important: true },
            { text: "延長線（多孔）", important: true },
            { text: "手機充電線（2條）", important: true },
            { text: "行動電源（20000mAh以下）", important: true },
            { text: "相機+充電器", important: false },
            { text: "記憶卡（備用）", important: false },
            { text: "耳機/藍牙耳機", important: false },
            { text: "歐洲網卡/eSIM", important: true },
            { text: "手機防水袋", important: false },
            { text: "自拍棒", important: false },
            { text: "手錶（看時間方便）", important: false }
        ]
    },

    // 4. 健康藥品
    health: {
        title: "💊 健康藥品",
        items: [
            { text: "感冒藥（日夜用）", important: true },
            { text: "退燒止痛藥（普拿疼）", important: true },
            { text: "腸胃藥（止瀉、消化不良）", important: true },
            { text: "暈車藥", important: true },
            { text: "過敏藥（抗組織胺）", important: true },
            { text: "個人慢性病藥物（+處方箋英文版）", important: true },
            { text: "OK繃、防水貼布", important: true },
            { text: "消炎藥膏", important: false },
            { text: "防蚊液", important: false },
            { text: "眼藥水", important: false },
            { text: "維他命C", important: false },
            { text: "口罩（備用）", important: false }
        ]
    },

    // 5. 財務準備
    money: {
        title: "💳 財務準備",
        items: [
            { text: "歐元現金 €300-500（小額面鈔）", important: true },
            { text: "信用卡（Visa/Mastercard）", important: true },
            { text: "備用信用卡（不同銀行）", important: true },
            { text: "金融卡（提領備用）", important: false },
            { text: "零錢包（裝硬幣）", important: true },
            { text: "防盜腰包/隱藏式錢包", important: true },
            { text: "通知銀行開通海外刷卡", important: true },
            { text: "記下卡片客服電話", important: true }
        ]
    },

    // 6. 盥洗用品
    toiletries: {
        title: "🧴 盥洗用品",
        items: [
            { text: "牙刷、牙膏（歐洲飯店通常沒有）", important: true },
            { text: "洗髮精、沐浴乳（小瓶或當地買）", important: true },
            { text: "洗面乳", important: true },
            { text: "保養品（化妝水、乳液）", important: true },
            { text: "防曬乳 SPF50+", important: true },
            { text: "防曬護唇膏", important: true },
            { text: "隱形眼鏡+藥水", important: false },
            { text: "眼鏡（備用一副）", important: true },
            { text: "衛生紙/面紙", important: false },
            { text: "濕紙巾", important: false },
            { text: "棉花棒", important: false },
            { text: "梳子", important: false }
        ]
    },

    // 7. 衣物配件
    clothing: {
        title: "👕 衣物配件",
        items: [
            { text: "內衣褲（每天1套+2套備用）", important: true },
            { text: "襪子（每天1雙+2雙備用）", important: true },
            { text: "長袖T恤/薄毛衣", important: true },
            { text: "長褲/牛仔褲", important: true },
            { text: "防風防水外套", important: true },
            { text: "圍巾/披肩（進教堂用）", important: true },
            { text: "舒適步行鞋（已穿過的）", important: true },
            { text: "拖鞋（飯店用）", important: true },
            { text: "睡衣", important: false },
            { text: "帽子/鴨舌帽", important: false },
            { text: "手套（禦寒用）", important: false },
            { text: "太陽眼鏡", important: true }
        ]
    },

    // 8. APP與工具
    apps: {
        title: "📱 APP與工具",
        items: [
            { text: "Google Maps（下載離線地圖）", important: true },
            { text: "Google 翻譯（下載離線包）", important: true },
            { text: "Omio（歐洲交通訂票）", important: true },
            { text: "Uber / Bolt（叫車）", important: true },
            { text: "TripAdvisor（餐廳推薦）", important: false },
            { text: "XE Currency（匯率換算）", important: true },
            { text: "天氣App", important: true },
            { text: "雲端備份（Google相簿/iCloud）", important: true }
        ]
    }
};
