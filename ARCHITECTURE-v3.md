# Europe Travel Guide Platform - 產品級架構設計
## 第四階段：商業化 AI 隨身導遊平台 (v3.0 Product Architecture)

---

## A. 產品定位升級

### 產品名稱
**「TravelMind AI | 隨行智遊」**

### 產品定位
**Mobile First / PWA / AI-Powered Travel Guide Platform**

從「個人歐洲旅遊網站」升級為「可商業化的 AI 隨身導遊平台」，具備以下核心價值：

| 價值維度 | 定位說明 |
|:---|:---|
| **個人隨身導遊** | 24/7 AI 導遊陪伴，根據時間/位置/狀態主動提供建議 |
| **智慧問答與導覽** | 多模態 AI 互動（文字、語音、地圖標記）|
| **自動行程生成** | 基於使用者偏好與約束條件，自動規劃最適行程 |
| **多語言導覽** | 支援 zh-TW/en/ja，AI 內容自動翻譯與在地化 |
| **雲端同步** | 跨裝置資料同步，支援離線與線上無縫切換 |
| **可擴充內容平台** | CMS 驅動的景點內容，可快速擴展新城市 |

### 目標用戶
1. **自助旅行者** - 需要隨身導遊但不想跟團
2. **深度體驗者** - 追求秘境、攝影點、當地玩法
3. **多語言旅客** - 需要母語導覽內容
4. **行程規劃者** - 需要自動生成與動態調整行程

### 產品願景
> 讓每個人都能擁有一位 24 小時隨身的私人 AI 導遊

---

## B. 整體系統架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (UI)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Home   │  │  Today   │  │   Map    │  │Settings  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Attraction│  │   Chat   │  │Planner   │  │Profile   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  Components: Card, Timeline, MapView, ChatBubble, VoicePlayer   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APP LOGIC LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Router     │  │  State Mgmt  │  │   Cache      │          │
│  │  (navigate)  │  │  (AppState)  │  │  (LRU + TTL) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Modules: UserPrefs, OfflineDetector, SyncManager               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI ORCHESTRATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AI Router   │  │  Prompt Eng  │  │  Context     │          │
│  │  (task→model)│  │  (templates) │  │  Assembler   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Guide AI    │  │  Planner AI  │  │  Chat AI     │          │
│  │  (rule+LLM)  │  │  (LLM only)  │  │  (LLM only)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Content AI   │  │  Fallback    │                            │
│  │  (LLM+temp)  │  │  (rule-based)│                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OFFLINE / DATA LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              IndexedDB (travelDB)                         │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │attractions│ │itinerary│ │favorites│ │reminders│ │userState│ │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                       │  │
│  │  │ offlineTiles │ │i18n_cache│ │ai_response_cache│         │  │
│  │  └────────┘ └────────┘ └────────┘                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Service Worker│  │LocalStorage  │  │ File System  │          │
│  │  (caching)   │  │  (prefs)     │  │  (images)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLOUD SYNC LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Supabase Platform                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │  Auth    │  │ Database │  │ Storage  │  │ Edge Fn  │    │  │
│  │  │(anon/user)│ │(RLS+sync)│  │(images)  │  │(AI proxy)│    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  │  ┌──────────┐ ┌──────────┐                              │  │
│  │  │ Realtime │  │  Cron    │                              │  │
│  │  │ (sync)   │  │ (jobs)   │                              │  │
│  │  └──────────┘ └──────────┘                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  External APIs: OpenAI / Gemini / Claude (via Edge Function)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTENT LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Attraction  │  │   Itinerary  │  │    CMS       │          │
│  │   Content    │  │  Templates   │  │   Admin      │          │
│  │  (JSON+AI)   │  │  (pre-built) │  │  (web admin) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Content Types: Guide, Secret, Light, Voice, Multi-lang         │
└─────────────────────────────────────────────────────────────────┘
```

### 層級責任說明

| 層級 | 責任 | 關鍵模組 |
|:---|:---|:---|
| **Presentation** | UI 渲染、互動、動畫 | Pages, Components, Theme |
| **App Logic** | 路由、狀態、快取策略 | Router, State, Cache |
| **AI Orchestration** | AI 任務路由、Prompt 管理、上下文組裝 | AI Router, Prompt Engine |
| **Offline/Data** | 離線資料、本地快取、檔案儲存 | IndexedDB, Service Worker |
| **Cloud Sync** | 雲端同步、身份驗證、AI API 代理 | Supabase, Edge Functions |
| **Content** | 內容管理、模板、多語系 | CMS, Content Schema |

---

## C. LLM 接入策略

### 架構原則
**前端不直接呼叫 LLM API，所有 AI 請求透過 Supabase Edge Function 代理**

```
Frontend App → Supabase Edge Function → LLM Provider
                    ↓
              (Rate Limit + Cache + Cost Control)
```

### 3 類 AI 任務對應模型

| 任務類型 | 模型選擇 | 原因 |
|:---|:---|:---|
| **Guide AI** | GPT-4o-mini / Gemini Flash | 快速、便宜、足夠應對導覽 |
| **Planner AI** | GPT-4o / Claude 3.5 Sonnet | 需要複雜規劃與邏輯推理 |
| **Chat AI** | GPT-4o / Gemini Pro | 需要高品質對話體驗 |
| **Content AI** | GPT-4o / Claude 3 Opus | 需要創意與文筆品質 |

### Prompt 結構設計

```typescript
interface PromptTemplate {
  system: string;           // 角色定義 + 輸出格式
  context: {
    user: UserProfile;      // 使用者偏好
    location: Location;     // GPS + 城市
    time: TimeContext;      // 當地時間 + 時段
    weather: Weather;       // 天氣資料
    itinerary: Itinerary;   // 當日行程
    history: Message[];     // 對話歷史 (chat only)
  };
  userMessage: string;      // 使用者輸入
  outputSchema: JSONSchema; // 強制輸出格式
}
```

### Context 組裝策略

```javascript
// Context 優先級與截斷策略
const CONTEXT_PRIORITY = [
  'user.location',      // 必須 - 影響導覽內容
  'user.profile',       // 必須 - 影響語氣與建議
  'current.activity',   // 高優先 - 現在該做什麼
  'next.activity',      // 高優先 - 下一步
  'nearby.attractions', // 中優先 - 附近景點
  'today.itinerary',    // 中優先 - 今日行程
  'trip.history',       // 低優先 - 已完成
  'chat.history'        // 可截斷 - 只保留最後 5 輪
];

// Token 控制
const TOKEN_LIMITS = {
  guide: { max: 2000, reserve: 500 },    // 留 500 for response
  planner: { max: 4000, reserve: 2000 },
  chat: { max: 8000, reserve: 1000 },
  content: { max: 4000, reserve: 2000 }
};
```

### 離線降級策略

```javascript
class AIOrchestrator {
  async getSuggestion(task, context) {
    // 1. 檢查網路狀態
    if (!navigator.onLine) {
      return this.fallbackToRuleEngine(task, context);
    }
    
    // 2. 嘗試 LLM
    try {
      const cached = await this.getCachedResponse(task, context);
      if (cached && !this.isStale(cached)) {
        return cached;
      }
      
      const response = await this.callEdgeFunction(task, context);
      await this.cacheResponse(task, context, response);
      return response;
      
    } catch (error) {
      // 3. LLM 失敗，降級到規則引擎
      console.warn('LLM failed, falling back to rule engine:', error);
      return this.fallbackToRuleEngine(task, context);
    }
  }
  
  fallbackToRuleEngine(task, context) {
    // 使用原有的 AIGuide 規則引擎
    return AIGuide.generateSuggestion(context);
  }
}
```

---

## D. AI 任務分層

### 1. Guide AI Module

**用途：**
- 景點導覽（根據位置推送）
- 現在該做什麼（時間 + 行程）
- 注意事項（天氣、時間、體力）
- 秘密客玩法（攝影點、秘境、當地人建議）

**Prompt Template：**
```
System: 你是一位{personality}風格的專業導遊，正在帶領旅客遊覽{city}。
輸出格式必須是 JSON：{action, next, warning, alternative, contactTaiwan}

Context:
- 使用者偏好：{user.profile}
- 當前位置：{location.name} (距離 {location.nextAttraction} 還有 {distance})
- 當地時間：{localTime} ({timeSegment})
- 天氣：{weather.condition}, {weather.temperature}°C
- 當前活動：{currentActivity?.title || '無'}
- 下一個活動：{nextActivity.title} at {nextActivity.time}
- 今日進度：{progress.percent}%
- 附近景點：{nearby.slice(0,3).map(a => a.name)}

User Input: {userQuestion || '請給我現在的建議'}
```

**輸出 Schema：**
```json
{
  "action": "string",        // 現在建議做什麼
  "next": "string",          // 下一步行動
  "warning": "string|null",  // 注意事項（可選）
  "alternative": "string",   // 備案方案
  "contactTaiwan": "string", // 是否適合聯繫台北
  "confidence": "number"     // 0-1 信心分數
}
```

### 2. Planner AI Module

**用途：**
- 自動行程生成
- 動態重排行程
- 依時間/GPS/體力調整

**Prompt Template：**
```
System: 你是一位專業行程規劃師，擅長根據旅客偏好設計最適行程。
輸出必須是有效的 JSON Array，每個元素代表一天。

Input Parameters:
{
  "destination": "布達佩斯, 維也納, 布拉格",
  "days": 10,
  "dates": { "start": "2026-04-01", "end": "2026-04-10" },
  "interests": ["history", "architecture", "photography"],
  "energy": "normal",  // relaxed, normal, high
  "budget": "medium",  // low, medium, high
  "pace": "moderate",  // slow, moderate, fast
  "companions": ["elderly"], // elderly, kids, none
  "preferences": {
    "avoidCrowds": true,
    "preferLocal": true,
    "photoPriority": true
  }
}

Output Schema:
{
  "day": number,
  "date": "YYYY-MM-DD",
  "theme": "string",           // 每日主題
  "city": "string",
  "activities": [
    {
      "time": "HH:MM",
      "title": "string",
      "type": "attraction|food|transport|rest",
      "duration": "string",    // e.g., "2 hours"
      "location": { "name": "string", "lat": number, "lng": number },
      "notes": "string",
      "alternatives": ["string"] // 雨天/疲勞時的替代方案
    }
  ],
  "transport": "string",       // 當日移動方式
  "warnings": ["string"],      // 當日特別注意事項
  "tips": "string"             // 當日小秘訣
}
```

### 3. Chat AI Module

**用途：**
- 使用者自由提問
- 問答互動
- 即時旅遊建議

**設計特點：**
```javascript
const ChatAI = {
  // 對話歷史管理（只保留最後 10 輪）
  history: [],
  
  // 上下文感知
  async chat(userMessage) {
    const context = await this.gatherContext();
    
    const prompt = {
      system: `你是旅客的隨身導遊助手，正在{city}陪伴旅客。
               回答要簡潔實用，避免長篇大論。
               如果問題與當前位置/行程無關，友善地引導回旅遊主題。`,
      context: {
        currentLocation: context.location,
        todayItinerary: context.itinerary,
        recentHistory: this.history.slice(-5)
      },
      userMessage
    };
    
    const response = await this.callLLM(prompt);
    this.history.push({ role: 'user', content: userMessage });
    this.history.push({ role: 'assistant', content: response });
    
    // 截斷歷史
    if (this.history.length > 20) {
      this.history = this.history.slice(-10);
    }
    
    return response;
  }
};
```

### 4. Content AI Module

**用途：**
- 生成景點文案（4種版本）
- 生成短文/長文/語音稿
- 多語系改寫

**4 種內容版本：**

```typescript
interface AttractionContent {
  attractionId: string;
  language: 'zh-TW' | 'en' | 'ja';
  versions: {
    guide: ContentVersion;      // 導遊版：專業詳盡
    secret: ContentVersion;     // 秘密客版：隱藏玩法
    light: ContentVersion;      // 輕鬆版：短而快
    voice: ContentVersion;      // 語音版：適合 TTS
  };
  generatedAt: string;
  aiModel: string;
}

interface ContentVersion {
  hook: string;              // 一句話亮點
  story: string;             // 背後故事
  highlights: string[];      // 必看重點
  experience: string;        // 最值得體驗
  warnings: string[];        // 注意事項
  photos: string[];          // 拍照建議
  duration: string;          // 建議停留
  wordCount: number;         // 字數統計
  estimatedSpeechTime: number; // 預估語音時長（秒）
}
```

**Prompt 設計（以「導遊版」為例）：**
```
System: 你是一位資深導遊，請為「{attraction.name}」撰寫專業導覽內容。
風格：專業、有深度、引發興趣
字數：500-800 字

請包含以下欄位，輸出為 JSON：
{
  "hook": "一句話亮點（吸引注意）",
  "story": "背後故事（歷史/文化背景）",
  "highlights": ["必看重點1", "必看重點2", "必看重點3"],
  "experience": "最值得體驗（獨特體驗建議）",
  "warnings": ["注意事項1", "注意事項2"],
  "photos": ["拍照建議1", "拍照建議2", "拍照建議3"],
  "duration": "建議停留時間（含原因）"
}

景點資訊：
- 名稱：{attraction.name}
- 城市：{attraction.city}
- 類型：{attraction.type}
- 歷史：{attraction.history}
- 特色：{attraction.features}
```

---

## E. 多語系架構 (i18n)

### 架構分層

```
i18n/
├── static/                    # UI 靜態文字
│   ├── zh-TW.json            # 繁體中文
│   ├── en.json               # 英文
│   └── ja.json               # 日文
├── content/                   # 動態內容（景點、行程）
│   ├── attractions/
│   │   ├── zh-TW/
│   │   ├── en/
│   │   └── ja/
│   └── itineraries/
│       ├── zh-TW/
│       ├── en/
│       └── ja/
└── prompts/                   # AI Prompt 模板
    ├── guide-zh-TW.txt
    ├── guide-en.txt
    └── guide-ja.txt
```

### 靜態文案結構

```json
{
  "app": {
    "name": "TravelMind AI",
    "tagline": "你的隨身 AI 導遊"
  },
  "nav": {
    "home": "首頁",
    "today": "今日",
    "map": "地圖",
    "favorites": "收藏",
    "settings": "設定",
    "chat": "AI 對話",
    "planner": "行程規劃"
  },
  "ai": {
    "guideTitle": "AI 導遊建議",
    "now": "現在建議",
    "next": "下一步",
    "warning": "注意事項",
    "alternative": "替代方案",
    "contactStatus": "聯繫狀態"
  },
  "time": {
    "localTime": "當地時間",
    "taipeiTime": "台北時間",
    "available": "可聯繫公司",
    "unavailable": "台北休息中"
  },
  "settings": {
    "language": "語言",
    "personality": "導遊風格",
    "energy": "體力偏好",
    "notifications": "通知設定"
  }
}
```

### 動態內容結構

```typescript
// 景點內容多語系結構
interface LocalizedAttraction {
  id: string;
  baseData: {
    // 語言無關的資料
    lat: number;
    lng: number;
    photos: string[];
    openingHours: { [key: string]: string };
    ticketPrice: { [key: string]: string };
  };
  content: {
    'zh-TW': AttractionContent;
    'en': AttractionContent;
    'ja': AttractionContent;
  };
}
```

### 語言切換策略

```javascript
class I18nManager {
  currentLang = 'zh-TW';
  fallbackLang = 'en';
  
  // 靜態文字
  t(key) {
    return this.translations[this.currentLang]?.[key] 
        || this.translations[this.fallbackLang]?.[key]
        || key;
  }
  
  // 動態內容
  async getAttractionContent(attractionId) {
    // 1. 優先從本地 IndexedDB 讀取
    const cached = await travelDB.getAttractionContent(attractionId, this.currentLang);
    if (cached) return cached;
    
    // 2. 嘗試從 Supabase 讀取
    if (navigator.onLine) {
      const remote = await supabaseClient
        .from('attraction_content')
        .select('*')
        .eq('attraction_id', attractionId)
        .eq('language', this.currentLang)
        .single();
      
      if (remote.data) {
        await travelDB.saveAttractionContent(remote.data);
        return remote.data;
      }
    }
    
    // 3. 降級到預設語言
    if (this.currentLang !== this.fallbackLang) {
      return this.getAttractionContentWithLang(attractionId, this.fallbackLang);
    }
    
    // 4. 最終降級到基礎資料
    return this.getBaseAttractionData(attractionId);
  }
  
  // AI 語言設定
  getAILanguage() {
    const langMap = {
      'zh-TW': '繁體中文',
      'en': 'English',
      'ja': '日本語'
    };
    return langMap[this.currentLang];
  }
}
```

### 語音導覽語言切換

```javascript
class VoiceManager {
  speak(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voiceMap = {
      'zh-TW': 'zh-TW',
      'en': 'en-US',
      'ja': 'ja-JP'
    };
    
    utterance.lang = voiceMap[lang] || 'en-US';
    utterance.rate = 0.9; // 稍慢，方便理解
    
    speechSynthesis.speak(utterance);
  }
}
```

---

## F. 自動行程生成器設計

### 使用者輸入流程

```
Step 1: 目的地選擇
├─ 國家 / 城市（可多選）
└─ 或選擇「推薦路線」

Step 2: 基本資訊
├─ 出發日期
├─ 結束日期（自動計算天數）
└─ 或選擇天數

Step 3: 偏好設定
├─ 興趣（多選）：歷史 / 建築 / 拍照 / 美食 / 購物 / 自然
├─ 體力：輕鬆 / 正常 / 高
├─ 預算：低 / 中 / 高
└─ 節奏：慢 / 中 / 快

Step 4: 特殊需求
├─ 旅伴：帶長輩 / 帶小孩 / 情侶 / 獨旅
├─ 避開人潮
├─ 偏好當地體驗
└─ 拍照優先

Step 5: 生成與確認
├─ AI 生成中（顯示進度）
├─ 預覽行程大綱
└─ 確認或調整
```

### 輸入參數 Schema

```typescript
interface ItineraryRequest {
  destinations: {
    type: 'countries' | 'cities' | 'route';
    values: string[];           // ['hungary', 'austria', 'czech']
  };
  dates: {
    start: string;              // "2026-04-01"
    end: string;                // "2026-04-10"
  };
  preferences: {
    interests: Interest[];      // ['history', 'architecture', 'photography']
    energy: 'relaxed' | 'normal' | 'high';
    budget: 'low' | 'medium' | 'high';
    pace: 'slow' | 'moderate' | 'fast';
  };
  constraints: {
    companions: ('elderly' | 'kids' | 'couple' | 'solo')[];
    avoidCrowds: boolean;
    preferLocal: boolean;
    photoPriority: boolean;
    accessibility?: boolean;    // 無障礙需求
  };
}

type Interest = 
  | 'history' | 'architecture' | 'photography' 
  | 'food' | 'shopping' | 'nature' | 'art' | 'nightlife';
```

### 後端生成策略

```javascript
class ItineraryGenerator {
  async generate(request) {
    // 1. 驗證輸入
    this.validateRequest(request);
    
    // 2. 計算天數與城市分配
    const days = this.calculateDays(request.dates);
    const cityAllocation = this.allocateCities(
      request.destinations.values, 
      days
    );
    
    // 3. 取得景點資料庫
    const attractions = await this.getAttractionsByCities(
      request.destinations.values
    );
    
    // 4. 根據偏好過濾景點
    const filtered = this.filterByInterests(
      attractions, 
      request.preferences.interests
    );
    
    // 5. 計算景點間移動時間
    const distances = await this.calculateDistances(filtered);
    
    // 6. 呼叫 AI 優化行程
    const prompt = this.buildPlannerPrompt(request, {
      days,
      cityAllocation,
      attractions: filtered,
      distances
    });
    
    const aiResponse = await this.callPlannerAI(prompt);
    
    // 7. 後處理與驗證
    const itinerary = this.postProcess(aiResponse, request);
    
    // 8. 儲存到使用者帳號
    await this.saveItinerary(itinerary);
    
    return itinerary;
  }
  
  // 城市分配演算法
  allocateCities(cities, totalDays) {
    // 基本原則：
    // - 每個城市至少 2 天
    // - 首都有更多景點，可多分配
    // - 考慮移動時間（跨城市日算半日）
    
    const cityDays = {
      '布達佩斯': 2.5,
      '維也納': 2.5,
      '布拉格': 2.5,
      '薩爾斯堡': 1.5,
      '哈修塔特': 1
    };
    
    // 簡化實作：平均分配
    return cities.map(city => ({
      city,
      days: Math.floor(totalDays / cities.length)
    }));
  }
}
```

### 輸出資料結構

```typescript
interface GeneratedItinerary {
  id: string;
  userId: string;
  createdAt: string;
  status: 'draft' | 'confirmed' | 'active' | 'completed';
  
  overview: {
    title: string;
    description: string;
    totalDays: number;
    cities: string[];
    theme: string;
  };
  
  days: DayPlan[];
  
  logistics: {
    transportPasses: string[];
    recommendedApps: string[];
    emergencyContacts: Contact[];
  };
  
  alternatives: {
    rain: DayPlan[];        // 雨天替代方案
    tired: DayPlan[];       // 疲勞時輕鬆方案
    extended: DayPlan[];    // 有額外時間的擴展方案
  };
}

interface DayPlan {
  day: number;
  date: string;
  weekday: string;
  theme: string;            // e.g., "布達佩斯：多瑙河畔的雙城"
  city: string;
  
  schedule: TimeBlock[];
  
  meals: {
    breakfast?: RestaurantRecommendation;
    lunch?: RestaurantRecommendation;
    dinner?: RestaurantRecommendation;
  };
  
  transport: {
    mode: 'walk' | 'public' | 'taxi' | 'train';
    details: string;
    estimatedTime: string;
  };
  
  tips: string[];
  warnings: string[];
}

interface TimeBlock {
  startTime: string;        // "09:00"
  endTime: string;          // "11:00"
  type: 'attraction' | 'food' | 'transport' | 'rest' | 'free';
  title: string;
  location: Location;
  description: string;
  
  attraction?: {
    id: string;
    duration: string;
    bestTime: string;
    photoSpots: string[];
  };
  
  alternatives?: string[];  // 如果無法前往時的替代
}
```

### 使用者調整機制

```javascript
// 拖曳調整介面
class ItineraryEditor {
  // 1. 調整日順序
  moveDay(fromIndex, toIndex) {
    // 檢查城市邏輯是否合理
    // 檢查移動時間是否足夠
  }
  
  // 2. 調整活動時間
  adjustActivityTime(dayIndex, activityIndex, newStartTime) {
    // 自動調整後續活動時間
    // 檢查衝突
  }
  
  // 3. 刪除活動
  removeActivity(dayIndex, activityIndex) {
    // 自動填充空檔或建議替代活動
  }
  
  // 4. 新增活動
  addActivity(dayIndex, attractionId) {
    // 自動計算最佳插入時間
    // 更新移動路線
  }
  
  // 5. 請求 AI 重新優化
  async reoptimize(preserveManualChanges = true) {
    // 保留手動調整的部分
    // AI 優化其他部分
  }
}
```

---

## G. 內容生成引擎設計

### 4 種內容版本規範

| 版本 | 風格 | 字數 | 用途 | TTS 適配 |
|:---|:---|:---:|:---|:---:|
| **Guide** | 專業、有深度 | 500-800 | 認真聽講解的旅客 | ✅ |
| **Secret** | 神秘、隱藏 | 400-600 | 追求獨特體驗的旅客 | ✅ |
| **Light** | 輕鬆、簡短 | 200-300 | 快速瀏覽的旅客 | ✅ |
| **Voice** | 口語化、自然 | 300-500 | 專門為語音播報優化 | ✅ (最佳) |

### 固定欄位規範

```typescript
interface ContentVersion {
  meta: {
    version: 'guide' | 'secret' | 'light' | 'voice';
    language: 'zh-TW' | 'en' | 'ja';
    wordCount: number;
    estimatedSpeechTime: number; // 秒
    generatedBy: string;         // AI model name
    generatedAt: string;
  };
  
  content: {
    hook: string;                // 一句話亮點 (15-30字)
    story: string;               // 背後故事
    highlights: string[];        // 必看重點 (3-5 點)
    experience: string;          // 最值得體驗
    warnings: string[];          // 注意事項 (2-3 點)
    photos: string[];            // 拍照建議 (3 點)
    duration: string;            // 建議停留時間
    bestTime?: string;           // 最佳參觀時間
  };
}
```

### Prompt Template 設計

**Guide 版本：**
```
角色：資深專業導遊，知識淵博，善於將歷史文化轉化為生動故事
目標對象：對歷史文化有興趣的深度旅行者
風格：專業、有深度、引發思考，但不要太學術
字數：500-800 字

請為「{attraction.name}」撰寫導覽內容，輸出為 JSON：

{
  "hook": "一句話抓住注意（含亮點關鍵字）",
  "story": "背後故事（200-300字，含歷史背景、文化意義、有趣軼事）",
  "highlights": ["必看重點1（50字）", "必看重點2（50字）", "必看重點3（50字）"],
  "experience": "最值得體驗（獨特體驗建議，100字）",
  "warnings": ["注意事項1", "注意事項2"],
  "photos": ["拍照建議1（具體位置/角度）", "拍照建議2", "拍照建議3"],
  "duration": "建議停留時間（含原因，如：建議停留2小時，細細欣賞建築細節和拍照）"
}

景點資訊：
- 名稱：{attraction.name}
- 類型：{attraction.type}
- 建造年代：{attraction.builtYear}
- 風格：{attraction.style}
- 歷史：{attraction.history}
- 特色：{attraction.features}
```

**Voice 版本（差異）：**
```
角色：親切的隨身導遊，像是在你旁邊邊走邊說
風格：口語化、自然、有節奏感，適合語音聆聽
字數：300-500 字
特殊要求：
- 使用口語連接詞（「接下來」、「你看」、「別忘了」）
- 句子不要太長，方便呼吸
- 重要數字要明確說出
- 避免視覺描述（「如圖所示」）
```

### 緩存策略

```javascript
class ContentCache {
  // 快取金鑰
  getCacheKey(attractionId, version, language) {
    return `content:${attractionId}:${version}:${language}`;
  }
  
  // 儲存策略
  async cacheContent(content) {
    const key = this.getCacheKey(
      content.attractionId,
      content.meta.version,
      content.meta.language
    );
    
    await travelDB.put('contentCache', {
      key,
      data: content,
      createdAt: new Date().toISOString(),
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 天
    });
  }
  
  // 讀取策略
  async getContent(attractionId, version, language) {
    const key = this.getCacheKey(attractionId, version, language);
    const cached = await travelDB.get('contentCache', key);
    
    if (!cached) return null;
    
    // 檢查是否過期
    const age = Date.now() - new Date(cached.createdAt).getTime();
    if (age > cached.ttl) {
      await travelDB.delete('contentCache', key);
      return null;
    }
    
    return cached.data;
  }
  
  // 預載策略（離線前）
  async prefetchContent(attractionIds, versions, languages) {
    for (const id of attractionIds) {
      for (const version of versions) {
        for (const lang of languages) {
          const cached = await this.getContent(id, version, lang);
          if (!cached) {
            // 背景生成並快取
            this.generateAndCache(id, version, lang);
          }
        }
      }
    }
  }
}
```

### 多語言版本管理

```javascript
class MultiLanguageContent {
  // 生成流程
  async generateAllVersions(attractionId) {
    const languages = ['zh-TW', 'en', 'ja'];
    const versions = ['guide', 'secret', 'light', 'voice'];
    
    const results = {};
    
    for (const lang of languages) {
      results[lang] = {};
      
      // 先以 zh-TW 為主語言生成
      if (lang === 'zh-TW') {
        for (const version of versions) {
          results[lang][version] = await this.generateContent(
            attractionId, version, 'zh-TW'
          );
        }
      } else {
        // 其他語言：先翻譯 zh-TW 內容，再由 AI 潤飾
        for (const version of versions) {
          const sourceContent = results['zh-TW'][version];
          results[lang][version] = await this.translateAndPolish(
            sourceContent, lang
          );
        }
      }
    }
    
    return results;
  }
  
  // 翻譯 + 潤飾
  async translateAndPolish(sourceContent, targetLang) {
    const prompt = `
請將以下中文內容翻譯為${targetLang === 'en' ? '英文' : '日文'}，
並進行在地化潤飾，讓當地人讀起來自然順暢。

原文：
${JSON.stringify(sourceContent, null, 2)}

要求：
1. 保持原意和風格
2. 使用當地慣用語
3. 調整文化參考（如需要）
4. 輸出格式與原文相同
`;
    
    return await this.callContentAI(prompt);
  }
}
```

---

## H. Supabase 雲端同步升級方案

### 資料表設計

```sql
-- 使用者資料表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'zh-TW',
  guide_personality TEXT DEFAULT 'professional', -- professional, casual, secret
  energy_level TEXT DEFAULT 'normal', -- relaxed, normal, high
  walking_tolerance INTEGER DEFAULT 5, -- 1-10
  photo_priority BOOLEAN DEFAULT false,
  contact_company_enabled BOOLEAN DEFAULT true,
  notification_prefs JSONB DEFAULT '{}',
  voice_prefs JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 收藏清單
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  attraction_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, attraction_id)
);

-- 提醒記錄
CREATE TABLE user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- time, gps, arrival
  title TEXT NOT NULL,
  message TEXT,
  scheduled_at TIMESTAMP,
  triggered_at TIMESTAMP,
  dismissed BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 已完成景點
CREATE TABLE user_completed_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  attraction_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  rating INTEGER, -- 1-5
  notes TEXT,
  photos TEXT[],
  UNIQUE(user_id, attraction_id)
);

-- 行程草稿
CREATE TABLE user_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, confirmed, active, completed
  data JSONB NOT NULL, -- 完整的行程 JSON
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 語言設定
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  language TEXT DEFAULT 'zh-TW',
  guide_personality TEXT DEFAULT 'professional',
  theme TEXT DEFAULT 'light',
  offline_mode BOOLEAN DEFAULT false,
  auto_sync BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 內容快取元資料
CREATE TABLE content_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- attraction, itinerary
  content_id TEXT NOT NULL,
  language TEXT NOT NULL,
  version TEXT NOT NULL,
  hash TEXT NOT NULL, -- 內容雜湊，用於比較
  downloaded_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  UNIQUE(content_type, content_id, language, version)
);

-- Edge Function 呼叫記錄（用於成本追蹤）
CREATE TABLE ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  task_type TEXT NOT NULL, -- guide, planner, chat, content
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  cached BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS (Row Level Security) 設計

```sql
-- 使用者只能存取自己的資料
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_completed_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 統一政策範本
CREATE POLICY "Users can only access their own data" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON user_reminders
  FOR ALL USING (auth.uid() = user_id);

-- 匿名使用者政策（使用 fingerprint / device_id）
CREATE POLICY "Anonymous users can access by device_id" ON user_favorites
  FOR ALL USING (
    auth.uid() IS NULL AND 
    device_id = current_setting('request.headers')::json->>'x-device-id'
  );
```

### 匿名 vs 登入使用者策略

```javascript
class AuthManager {
  async init() {
    // 1. 檢查是否有匿名 ID（存在 localStorage）
    this.anonymousId = localStorage.getItem('anonymous_id') 
                     || this.generateAnonymousId();
    
    // 2. 嘗試恢復 Supabase session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      this.mode = 'authenticated';
      this.userId = session.user.id;
    } else {
      this.mode = 'anonymous';
      this.userId = this.anonymousId;
    }
  }
  
  // 匿名升級為正式帳號
  async upgradeToAuthenticated(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    // 遷移匿名資料
    await this.migrateAnonymousData(this.anonymousId, data.user.id);
    
    this.mode = 'authenticated';
    this.userId = data.user.id;
    
    return data.user;
  }
  
  // 資料遷移
  async migrateAnonymousData(anonymousId, userId) {
    const tables = ['favorites', 'reminders', 'completed_attractions', 'itineraries'];
    
    for (const table of tables) {
      await supabaseClient.rpc('migrate_anonymous_data', {
        from_id: anonymousId,
        to_id: userId,
        table_name: table
      });
    }
  }
}
```

### 本地與雲端同步機制

```javascript
class SyncManager {
  async sync() {
    // 1. 上傳本地變更
    const localChanges = await this.getLocalChanges();
    for (const change of localChanges) {
      await this.pushToCloud(change);
    }
    
    // 2. 下載雲端變更
    const lastSync = await travelDB.getUserState('lastSyncTime');
    const cloudChanges = await this.pullFromCloud(lastSync);
    
    for (const change of cloudChanges) {
      await this.applyToLocal(change);
    }
    
    // 3. 解決衝突
    const conflicts = await this.detectConflicts();
    for (const conflict of conflicts) {
      await this.resolveConflict(conflict);
    }
    
    // 4. 更新同步時間
    await travelDB.setUserState('lastSyncTime', new Date().toISOString());
  }
  
  // 衝突解決策略
  async resolveConflict(conflict) {
    // 策略：時間戳優先（較新的獲勝）
    const localTime = new Date(conflict.local.updated_at);
    const cloudTime = new Date(conflict.cloud.updated_at);
    
    if (localTime > cloudTime) {
      await this.pushToCloud(conflict.local);
    } else {
      await this.applyToLocal(conflict.cloud);
    }
  }
  
  // 離線後重新連線的完整同步
  async fullSyncAfterReconnect() {
    // 顯示同步中提示
    this.showSyncingIndicator();
    
    try {
      await this.sync();
      this.showSyncSuccess();
    } catch (error) {
      console.error('Sync failed:', error);
      this.showSyncError(error);
    }
  }
}
```

---

## I. 會員與個人化設計

### User Profile Schema

```typescript
interface UserProfile {
  // 基本資料
  id: string;
  displayName: string;
  avatarUrl?: string;
  
  // 語言設定
  preferredLanguage: 'zh-TW' | 'en' | 'ja';
  
  // 導遊人格
  guidePersonality: 'professional' | 'casual' | 'secret';
  // professional: 專業詳盡
  // casual: 輕鬆幽默
  // secret: 秘境探索者
  
  // 旅遊節奏偏好
  travelPace: 'slow' | 'moderate' | 'fast';
  
  // 體力設定
  energyLevel: 'relaxed' | 'normal' | 'high';
  walkingTolerance: number; // 1-10
  
  // 拍照偏好
  photoPriority: boolean;
  preferredPhotoTypes: ('landscape' | 'portrait' | 'architecture' | 'food')[];
  
  // 聯繫設定
  contactCompanyEnabled: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // 通知偏好
  notificationPrefs: {
    timeReminders: boolean;
    gpsReminders: boolean;
    weatherAlerts: boolean;
    dailySummary: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "08:00"
    };
  };
  
  // 語音偏好
  voicePrefs: {
    enabled: boolean;
    autoPlay: boolean;
    speed: number; // 0.8 - 1.2
    voice: string; // system voice ID
  };
  
  // 進階設定
  accessibilityMode: boolean; // 無障礙模式
  highContrastMode: boolean;
  fontSize: 'small' | 'normal' | 'large';
  
  createdAt: string;
  updatedAt: string;
}
```

### 設定頁結構

```
設定頁面
├── 個人資料
│   ├── 顯示名稱
│   ├── 頭像
│   └── 緊急聯繫人
│
├── 語言與地區
│   ├── 介面語言 [zh-TW / en / ja]
│   └── 內容語言偏好
│
├── AI 導遊設定
│   ├── 導遊風格 [專業/輕鬆/秘密客]
│   ├── 旅遊節奏 [慢/中/快]
│   ├── 體力等級 [輕鬆/正常/高]
│   └── 拍照優先 [開/關]
│
├── 通知設定
│   ├── 時間提醒 [開/關]
│   ├── 定位提醒 [開/關]
│   ├── 天氣提醒 [開/關]
│   ├── 每日摘要 [開/關]
│   └── 勿擾時段 [設定]
│
├── 語音設定
│   ├── 語音導覽 [開/關]
│   ├── 自動播放 [開/關]
│   ├── 語速 [慢/正常/快]
│   └── 語音選擇
│
├── 無障礙與顯示
│   ├── 無障礙模式 [開/關]
│   ├── 高對比 [開/關]
│   └── 字體大小 [小/中/大]
│
├── 資料與同步
│   ├── 立即同步
│   ├── 離線模式 [開/關]
│   ├── 清除快取
│   └── 匯出資料
│
└── 關於
    ├── 版本資訊
    ├── 隱私政策
    └── 使用條款
```

### 偏好影響 AI 輸出

```javascript
class PersonalizationEngine {
  // 根據使用者偏好調整 AI Prompt
  personalizePrompt(basePrompt, userProfile) {
    const modifiers = [];
    
    // 導遊風格
    switch (userProfile.guidePersonality) {
      case 'professional':
        modifiers.push('你是一位專業嚴謹的導遊，提供詳盡準確的資訊。');
        break;
      case 'casual':
        modifiers.push('你是一位輕鬆幽默的導遊，像朋友一樣聊天。');
        break;
      case 'secret':
        modifiers.push('你是一位秘境探索者，專長發現隱藏景點和當地人才知道的玩法。');
        break;
    }
    
    // 節奏調整
    switch (userProfile.travelPace) {
      case 'slow':
        modifiers.push('建議從容不迫的步調，留出充足時間享受每個景點。');
        break;
      case 'fast':
        modifiers.push('行程緊湊，專注必看重點，高效利用時間。');
        break;
    }
    
    // 體力考量
    if (userProfile.energyLevel === 'relaxed') {
      modifiers.push('考慮到使用者偏好輕鬆行程，避免過多步行，多建議休息點。');
    }
    
    // 拍照優先
    if (userProfile.photoPriority) {
      modifiers.push('使用者喜歡拍照，請多提供拍照建議和最佳拍攝點。');
    }
    
    return {
      ...basePrompt,
      system: `${basePrompt.system}\n\n${modifiers.join('\n')}`
    };
  }
  
  // 根據偏好過濾建議
  filterSuggestionsByPreference(suggestions, userProfile) {
    return suggestions.filter(suggestion => {
      // 體力過濾
      if (userProfile.energyLevel === 'relaxed' && suggestion.energyRequired === 'high') {
        return false;
      }
      
      // 拍照優先排序
      if (userProfile.photoPriority && suggestion.photoOpportunity) {
        suggestion.priorityBonus = 10;
      }
      
      return true;
    });
  }
}
```

---

## J. CMS / Admin 規劃

### 後台架構

```
/admin (獨立部署或內嵌)
├── Dashboard
│   ├── 內容統計
│   ├── 使用者統計
│   └── AI 使用量
│
├── 景點管理
│   ├── 景點列表
│   ├── 新增景點
│   ├── 編輯景點
│   └── 批次匯入
│
├── 內容生成
│   ├── AI 生成內容
│   ├── 審核內容
│   ├── 發佈內容
│   └── 多語言管理
│
├── 行程模板
│   ├── 經典路線
│   ├── 主題路線
│   └── 季節路線
│
├── 使用者管理
│   ├── 使用者列表
│   ├── 反饋查看
│   └── 問題回報
│
├── 系統設定
│   ├── AI 模型設定
│   ├── 提醒規則
│   ├── 導遊語氣模板
│   └── 快取管理
│
└── 財務（未來）
    ├── 使用量報表
    ├── 成本分析
    └── 訂閱管理
```

### 景點管理欄位

```typescript
interface AttractionCMS {
  // 基本資訊
  id: string;
  name: { [lang: string]: string };  // 多語言名稱
  slug: string;                       // URL 用
  
  // 分類
  type: 'landmark' | 'museum' | 'park' | 'temple' | 'viewpoint' | 'shopping' | 'food';
  category: string[];                 // 標籤
  
  // 位置
  location: {
    city: string;
    country: string;
    address: { [lang: string]: string };
    lat: number;
    lng: number;
  };
  
  // 媒體
  photos: {
    url: string;
    caption: { [lang: string]: string };
    isPrimary: boolean;
  }[];
  icon: string;                       // emoji
  
  // 營業資訊
  openingHours: {
    [day: string]: { open: string; close: string; note?: string };
  };
  ticketPrice: {
    [type: string]: { price: number; currency: string; note?: string };
  };
  
  // 原始資料（供 AI 生成用）
  rawData: {
    history: string;
    architecture: string;
    culturalSignificance: string;
    interestingFacts: string[];
    nearbyAttractions: string[];
  };
  
  // AI 生成內容（多語言 x 多版本）
  aiContent: {
    [lang: string]: {
      guide: ContentVersion;
      secret: ContentVersion;
      light: ContentVersion;
      voice: ContentVersion;
      generatedAt: string;
      approved: boolean;
      approvedBy?: string;
      approvedAt?: string;
    };
  };
  
  // 狀態
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: string;
  
  // 元資料
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 內容審核流程

```
[AI 生成] → [草稿] → [人工審核] → [發佈]
                ↓
            [退回修改]
```

```javascript
class ContentWorkflow {
  // 1. AI 生成
  async generateContent(attractionId) {
    const attraction = await this.getAttraction(attractionId);
    
    // 生成 4 種版本 x 3 種語言
    const content = await MultiLanguageContent.generateAllVersions(attractionId);
    
    // 儲存為草稿
    await this.saveAsDraft(attractionId, content);
    
    // 通知審核者
    await this.notifyReviewers(attractionId);
  }
  
  // 2. 人工審核
  async reviewContent(attractionId, lang, version, decision, feedback) {
    if (decision === 'approve') {
      await this.publishContent(attractionId, lang, version);
    } else {
      await this.requestRevision(attractionId, lang, version, feedback);
    }
  }
  
  // 3. 發佈
  async publishContent(attractionId, lang, version) {
    // 更新狀態
    await cmsClient
      .from('attractions')
      .update({
        [`ai_content.${lang}.${version}.approved`]: true,
        [`ai_content.${lang}.${version}.approvedAt`]: new Date().toISOString()
      })
      .eq('id', attractionId);
    
    // 推送到 CDN/快取
    await this.invalidateCache(attractionId);
  }
}
```

### 與前台同步方式

```javascript
class ContentSync {
  // CMS 發佈後自動同步到使用者裝置
  async onContentPublished(attractionId, lang, version) {
    // 1. 更新 Supabase
    await this.updateSupabase(attractionId, lang, version);
    
    // 2. 推播通知已下載該內容的使用者
    const users = await this.getUsersWithCachedContent(attractionId, lang, version);
    
    for (const user of users) {
      await pushNotification.send(user.id, {
        title: '內容更新',
        body: `${attractionId} 的 ${lang} ${version} 版本已更新`,
        data: { attractionId, lang, version }
      });
    }
    
    // 3. 標記快取為過期（下次使用時自動更新）
    await this.markCacheStale(attractionId, lang, version);
  }
}
```

---

## K. 商業化預留策略

### 免費版 vs 付費版

| 功能 | 免費版 | 進階版 (Premium) |
|:---|:---|:---|
| **基礎導覽** | ✅ 規則引擎導覽 | ✅ + LLM 增強導覽 |
| **AI 對話** | ✅ 每日 10 則 | ✅ 無限 |
| **行程生成** | ❌ | ✅ 無限次生成 |
| **語音導覽** | ✅ 基礎 TTS | ✅ 高品質語音 |
| **離線下載** | ✅ 1 個城市 | ✅ 無限城市 |
| **多語言** | ✅ 1 種語言 | ✅ 全語言 |
| **內容版本** | ✅ Light 版本 | ✅ 全部 4 版本 |
| **進階內容** | ❌ | ✅ 秘密客玩法 |
| **客製化導遊** | ❌ | ✅ 個人風格訓練 |
| **雲端同步** | ✅ 基礎同步 | ✅ 即時同步 |
| **優先支援** | ❌ | ✅ |

### 特定城市包（City Pass）

```javascript
const CityPasses = {
  'europe-classic': {
    name: '歐洲經典四城',
    cities: ['布達佩斯', '維也納', '布拉格', '薩爾斯堡'],
    price: 4.99,
    features: ['完整導覽', '離線下載', '秘密客玩法']
  },
  'europe-complete': {
    name: '歐洲完整十城',
    cities: ['all'],
    price: 9.99,
    features: ['全部城市', '全部功能', '未來更新']
  }
};
```

### 深度導覽包（Deep Dive）

- **攝影師路線**：最佳拍攝點、黃金時段、構圖建議
- **歷史深度**：建築背景、歷史事件、文化脈絡
- **美食探索**：當地餐廳、街頭小吃、市場導覽
- **秘境探險**：遊客不知的景點、當地人才知道的玩法

### 架構權限層預留

```typescript
interface SubscriptionTier {
  id: 'free' | 'premium' | 'city-pass' | 'deep-dive';
  
  // 功能開關
  features: {
    llmGuide: boolean;
    unlimitedChat: boolean;
    itineraryGenerator: boolean;
    hqVoice: boolean;
    offlineCities: number | 'unlimited';
    languages: number | 'unlimited';
    contentVersions: ('light' | 'guide' | 'secret' | 'voice')[];
    customPersonality: boolean;
    realtimeSync: boolean;
  };
  
  // 使用量限制
  limits: {
    aiRequestsPerDay: number;
    contentGenerationsPerMonth: number;
    maxOfflineCities: number;
  };
}

// 檢查權限
class FeatureGate {
  canUseFeature(userId, feature) {
    const tier = await this.getUserTier(userId);
    return tier.features[feature] === true;
  }
  
  async enforceLimit(userId, resource, amount = 1) {
    const usage = await this.getUsage(userId, resource);
    const limit = await this.getLimit(userId, resource);
    
    if (usage + amount > limit) {
      throw new LimitExceededError('請升級以繼續使用');
    }
    
    await this.incrementUsage(userId, resource, amount);
  }
}
```

---

## L. 模組拆分與責任邊界

### 建議模組結構

```
js/modules/
├── core/                      # 核心基礎設施
│   ├── db.js                 # IndexedDB 操作
│   ├── event-bus.js          # 事件匯流排
│   └── logger.js             # 日誌系統
│
├── platform/                  # 平台整合
│   ├── offline.js            # PWA + Service Worker
│   ├── sync.js               # 雲端同步
│   └── auth.js               # 身份驗證
│
├── location/                  # 位置服務
│   ├── gps.js                # GPS 定位
│   ├── map.js                # 地圖顯示
│   └── geofence.js           # 地理圍欄提醒
│
├── ai/                        # AI 相關
│   ├── ai-router.js          # AI 任務路由
│   ├── ai-guide.js           # 導遊 AI (rule + LLM)
│   ├── ai-chat.js            # 對話 AI
│   ├── ai-planner.js         # 行程規劃 AI
│   └── ai-content.js         # 內容生成 AI
│
├── content/                   # 內容管理
│   ├── content-loader.js     # 內容載入與快取
│   ├── content-generator.js  # AI 內容生成
│   └── content-versions.js   # 多版本內容管理
│
├── user/                      # 使用者相關
│   ├── profile.js            # 使用者資料
│   ├── preferences.js        # 偏好設定
│   └── progress.js           # 行程進度追蹤
│
├── i18n/                      # 國際化
│   ├── i18n-core.js          # 核心 i18n
│   ├── i18n-content.js       # 內容多語言
│   └── i18n-voice.js         # 語音多語言
│
├── ui/                        # UI 輔助
│   ├── notifications.js      # 通知管理 (原 reminder.js)
│   ├── voice.js              # 語音播報
│   └── theme.js              # 主題管理
│
└── utils/                     # 工具
    ├── time.js               # 時間處理
    ├── distance.js           # 距離計算
    └── validators.js         # 資料驗證
```

### 責任邊界說明

| 模組 | 責任 | 不負責 |
|:---|:---|:---|
| **ai-router.js** | 決定任務由 rule/LLM 處理、管理 token 預算、快取 AI 回應 | 不直接呼叫 LLM API |
| **ai-guide.js** | 組裝導遊 context、呼叫 router、格式化輸出 | 不管理對話歷史 |
| **ai-chat.js** | 管理對話歷史、組裝 chat context、流式輸出 | 不處理導遊建議 |
| **ai-planner.js** | 行程生成 prompt、輸出驗證、儲存結果 | 不管理使用者偏好 |
| **ai-content.js** | 內容版本生成、多語言翻譯、品質檢查 | 不直接發佈內容 |
| **sync.js** | 檢測變更、解決衝突、排程同步 | 不操作 IndexedDB |
| **content-loader.js** | 決定從 cache/remote 載入、管理 content TTL | 不生成內容 |
| **gps.js** | 取得位置、計算距離、觸發地理事件 | 不顯示地圖 |
| **map.js** | 渲染地圖、標記、處理地圖互動 | 不管理 GPS 邏輯 |

---

## M. API / 安全 / 成本控制

### API Gateway 設計

```javascript
// Supabase Edge Function: /functions/ai-proxy/index.ts
import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  // 1. 驗證身份
  const authHeader = req.headers.get('Authorization');
  const user = await verifyAuth(authHeader);
  
  // 2. 解析請求
  const { task, messages, context } = await req.json();
  
  // 3. 速率限制檢查
  const rateLimit = await checkRateLimit(user.id, task);
  if (!rateLimit.allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // 4. 檢查快取
  const cacheKey = generateCacheKey(task, messages, context);
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return Response.json({ cached: true, ...cached });
  }
  
  // 5. 選擇模型
  const model = selectModel(task);
  
  // 6. 呼叫 LLM
  const response = await callLLM(model, messages, {
    temperature: getTemperature(task),
    max_tokens: getMaxTokens(task)
  });
  
  // 7. 記錄使用量
  await logUsage(user.id, task, model, response.usage);
  
  // 8. 快取回應
  await cacheResponse(cacheKey, response, getCacheTTL(task));
  
  // 9. 回傳
  return Response.json(response);
};

// 模型選擇邏輯
function selectModel(task) {
  const modelMap = {
    'guide': 'gpt-4o-mini',      // 便宜、快速
    'planner': 'gpt-4o',         // 需要推理能力
    'chat': 'gpt-4o',            // 對話品質
    'content': 'gpt-4o'          // 創作品質
  };
  return modelMap[task] || 'gpt-4o-mini';
}

// 速率限制
async function checkRateLimit(userId, task) {
  const limits = {
    'free': { 'guide': 50, 'chat': 10, 'planner': 0 },
    'premium': { 'guide': 500, 'chat': 9999, 'planner': 50 }
  };
  
  const tier = await getUserTier(userId);
  const limit = limits[tier][task] || 0;
  
  const usage = await getTodayUsage(userId, task);
  
  return {
    allowed: usage < limit,
    remaining: limit - usage
  };
}
```

### 金鑰管理

```
環境變數（Supabase Vault / Edge Function Secrets）:
├── OPENAI_API_KEY           # OpenAI
├── GEMINI_API_KEY           # Google Gemini
├── ANTHROPIC_API_KEY        # Claude
└── FALLBACK_API_KEY         # 備援

前端:
└── 無 API keys，所有請求透過 Edge Function
```

### 成本控制策略

| 策略 | 實作方式 |
|:---|:---|
| **快取優先** | 相同 context 的快取 24 小時 |
| **模型分級** | 簡單任務用 mini，複雜任務用 4o |
| **Token 控制** | 限制輸入/輸出長度，超長自動截斷 |
| **請求合併** | 批次處理多個小請求 |
| **離線降級** | 無網路時用 rule engine |
| **使用限制** | 免費版每日限制，避免濫用 |

```javascript
// Token 預算控制
class TokenBudget {
  constructor(task) {
    this.budgets = {
      'guide': { input: 1500, output: 500 },
      'planner': { input: 3000, output: 2000 },
      'chat': { input: 4000, output: 1000 },
      'content': { input: 2000, output: 1500 }
    };
    this.current = this.budgets[task];
  }
  
  truncateContext(context) {
    // 依優先級截斷 context
    const priority = ['location', 'time', 'currentActivity', 'nearby', 'history'];
    
    let estimatedTokens = this.estimateTokens(context);
    
    for (const key of priority.reverse()) {
      if (estimatedTokens <= this.current.input) break;
      
      if (key === 'history') {
        // 截斷歷史對話
        context.history = context.history.slice(-3);
      } else {
        delete context[key];
      }
      
      estimatedTokens = this.estimateTokens(context);
    }
    
    return context;
  }
  
  estimateTokens(text) {
    // 粗略估計：英文 1 token ≈ 4 chars，中文 1 token ≈ 1.5 chars
    return Math.ceil(text.length / 3);
  }
}
```

### Prompt Injection 防護

```javascript
class PromptSecurity {
  // 輸入驗證
  sanitizeInput(input) {
    // 移除或跳脫特殊字元
    const dangerous = [
      /system:/gi,
      /assistant:/gi,
      /ignore previous/gi,
      /disregard/gi
    ];
    
    let sanitized = input;
    for (const pattern of dangerous) {
      sanitized = sanitized.replace(pattern, '[filtered]');
    }
    
    // 長度限制
    if (sanitized.length > 500) {
      sanitized = sanitized.slice(0, 500) + '...';
    }
    
    return sanitized;
  }
  
  // 輸出驗證
  validateOutput(output, schema) {
    try {
      const parsed = JSON.parse(output);
      return this.validateSchema(parsed, schema);
    } catch {
      // 如果不是 JSON，檢查是否包含敏感資訊
      return !this.containsSensitiveData(output);
    }
  }
  
  // 速率限制異常行為
  async detectAbuse(userId, request) {
    const recentRequests = await getRecentRequests(userId, '1 hour');
    
    // 檢測異常模式
    if (recentRequests.length > 100) {
      await flagUser(userId, 'suspicious_activity');
    }
    
    // 檢測重複相同請求
    const duplicates = recentRequests.filter(r => 
      r.content === request.content
    );
    if (duplicates.length > 10) {
      await flagUser(userId, 'spam_detected');
    }
  }
}
```

---

## N. 分階段實作順序

### 第一批：核心產品能力（MVP+）

| 優先序 | 能力 | 原因 |
|:---:|:---|:---|
| **1** | **LLM 接入架構** | 這是 AI 產品的基礎，沒有這個後續無法進行。建立 Edge Function + Router 架構，讓前端可以無縫切換 rule/LLM。 |
| **2** | **多語系架構** | 產品要面向國際市場必須先建立 i18n 基礎。先實作靜態 UI 多語言，內容多語言可逐步擴充。 |
| **3** | **會員與個人化** | 這是差異化關鍵。讓 AI 根據使用者偏好輸出不同風格，大幅提升體驗。同時建立 user profile 為後續商業化做準備。 |

**第一批完成後產品狀態：**
- ✅ 可切換語言的 AI 導遊
- ✅ 根據個人偏好客製化建議
- ✅ 安全的 LLM 接入
- ✅ 離線/線上無縫切換

---

### 第二批：內容與生成能力

| 優先序 | 能力 | 原因 |
|:---:|:---|:---|
| **1** | **自動行程生成器** | 這是殺手級功能，可以大幅提升使用者價值。先實作基礎版本（固定模板 + AI 填充），再逐步優化。 |
| **2** | **內容生成引擎** | 建立 4 種內容版本的基礎架構，先用 AI 生成草稿，人工審核後發佈。這是內容平台的基礎。 |
| **3** | **CMS 後台（基礎）** | 有了內容生成後，需要 CMS 來管理內容生命週期。先做基礎欄位管理，審核流程可簡化。 |

**第二批完成後產品狀態：**
- ✅ 輸入條件自動生成行程
- ✅ 每個景點有 4 種內容版本
- ✅ 後台可管理內容
- ✅ 可快速擴展新城市

---

### 第三批：商業化與進階功能

| 優先序 | 能力 | 原因 |
|:---:|:---|:---|
| **1** | **Supabase 雲端同步升級** | 在前面功能穩定後，建立完整的同步機制。包含衝突解決、匿名升級、使用量追蹤。這是商業化的基礎設施。 |
| **2** | **商業化預留實作** | 實作 Feature Gate 和 Usage Limit，建立免費/付費的切換邏輯。可先用「即將推出」占位，但架構要先建立。 |
| **3** | **進階 AI 能力** | 在核心穩定後，加入更進階的 AI 功能：行程重排、AI 對話無限次、高品質語音。這些是付費轉換的關鍵。 |

**第三批完成後產品狀態：**
- ✅ 完整的雲端同步
- ✅ 可商業化的權限架構
- ✅ 進階 AI 功能
- ✅ 準備好對外發佈

---

### 時間預估

| 批次 | 預估工時 | 說明 |
|:---|:---:|:---|
| 第一批 | 40-50 小時 | 架構工作較重，但基礎打好後續輕鬆 |
| 第二批 | 60-80 小時 | 內容生成和 CMS 較複雜 |
| 第三批 | 40-50 小時 | 商業化邏輯需要細緻處理 |
| **總計** | **140-180 小時** | 約 4-6 週全職開發 |

---

## 總結

本產品架構設計遵循以下原則：

1. **離線優先** - 所有功能都要能在離線狀態下降級運作
2. **分層架構** - 清晰的層級責任，便於維護和擴展
3. **成本意識** - Token 控制、快取策略、模型分級
4. **商業預留** - 從第一天就考慮商業化，但不是過度設計
5. **漸進交付** - 分三批實作，每批都有可驗證的產品價值
