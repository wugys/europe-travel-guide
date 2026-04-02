# TravelMind AI v3.0 - 第二批設定指南

## 概述
第二批實作包含：**行程生成器**、**內容引擎**、**CMS 內容管理系統**

---

## ✅ 已實作項目

### 1. Trip Planner (行程生成器)
**檔案**: `js/modules/planner.js` (13KB)

**功能**:
- 步驟式行程規劃 (5步完成)
- AI + 模板雙軌生成
- 個人化偏好設定
- 行程儲存與同步

**規劃步驟**:
1. 選擇目的地 (布達佩斯、維也納、布拉格等6個城市)
2. 設定天數與日期
3. 選擇興趣標籤 (文化、美食、自然、購物、在地體驗)
4. 設定預算與節奏
5. AI/模板生成行程

**使用方式**:
```javascript
// 初始化
tripPlanner.init();

// 設定偏好
tripPlanner.setPreference('destination', 'budapest');
tripPlanner.setPreference('days', 3);
tripPlanner.setPreference('interests', ['culture', 'food']);

// 生成行程
const itinerary = await tripPlanner.generateItinerary();
```

### 2. Content Engine (內容引擎)
**檔案**: `js/modules/content-engine.js` (12KB)

**功能**:
- 四種內容版本生成
- AI + 模板雙軌
- 多層快取策略
- 多語言支援

**內容版本**:
| 版本 | 特點 | 用途 |
|:---|:---|:---|
| guide | 專業詳盡 | 深度導覽 |
| secret | 在地視角 | 秘境探索 |
| light | 簡潔快速 | 快速瀏覽 |
| voice | 口語化 | 語音導覽 |

**使用方式**:
```javascript
// 取得內容 (自動快取)
const content = await contentEngine.getContent('attraction-id', 'guide');

// 強制重新生成
const fresh = await contentEngine.getContent('attraction-id', 'secret', true);

// 預載多個景點
await contentEngine.preloadContents(['id1', 'id2'], ['light', 'guide']);
```

### 3. CMS Admin (內容管理系統)
**檔案**: `js/modules/cms-admin.js` (11KB)

**功能**:
- 景點資料管理
- 內容版本控制
- 審核流程 (draft → pending_review → published)
- 批次操作
- 變更記錄

**權限角色**:
| 角色 | 權限 |
|:---|:---|
| user | 只能檢視已發布內容 |
| editor | 編輯內容、審核 |
| admin | 完整權限 |

---

## 🗄️ 資料表結構

**檔案**: `supabase/migrations/002_cms_schema.sql`

### 新增表格

| 表格 | 用途 | 記錄數預估 |
|:---|:---|:---:|
| `attractions_admin` | 景點管理 | ~100 |
| `content_versions` | 內容版本 | ~400 |
| `review_tasks` | 審核任務 | ~50 |
| `change_logs` | 變更記錄 | ~1000 |
| `saved_itineraries` | 使用者行程 | 每用戶 N 筆 |
| `attraction_content` | 前台內容快取 | ~400 |

### 更新表格
- `user_profiles` 新增 `role` 欄位 (user/editor/admin)

---

## 📋 部署步驟

### 1. 部署資料表
```bash
# 在 Supabase SQL Editor 執行
supabase/migrations/002_cms_schema.sql
```

### 2. 部署前端程式
```bash
git add -A
git commit -m "v3.0-batch2: Add Trip Planner, Content Engine, CMS"
git push origin main
```

### 3. 初始化 CMS 資料
```sql
-- 插入範例景點資料
INSERT INTO attractions_admin (id, name, city, country, type, status) VALUES
('budapest-parliament', '國會大廈', '布達佩斯', '匈牙利', 'landmark', 'active'),
('vienna-schonbrunn', '熊布朗宮', '維也納', '奧地利', 'museum', 'active'),
('prague-castle', '布拉格城堡', '布拉格', '捷克', 'landmark', 'active');
```

---

## 🧪 測試驗證

### 測試行程生成器
```javascript
// 開啟瀏覽器 Console
tripPlanner.setPreference('destination', 'budapest');
tripPlanner.setPreference('days', 2);
tripPlanner.setPreference('interests', ['culture', 'food']);
tripPlanner.generateItinerary().then(console.log);
```

### 測試內容引擎
```javascript
contentEngine.getContent('budapest-parliament', 'guide')
  .then(console.log);
```

### 測試 CMS
```javascript
// 檢查是否為管理員
cmsAdmin.checkAuth().then(console.log);

// 取得統計
cmsAdmin.getStats().then(console.log);
```

---

## 📊 預估使用量

### OpenAI API (Content Engine)
| 內容類型 | 每個景點 | 50個景點總計 |
|:---|:---:|:---:|
| Guide | ~500 tokens | 25K tokens |
| Secret | ~400 tokens | 20K tokens |
| Light | ~200 tokens | 10K tokens |
| Voice | ~300 tokens | 15K tokens |

**總計**: ~70K tokens = ~$0.50 USD (使用 gpt-4o-mini)

### 資料庫儲存
- 純文字內容: ~10MB
- 含圖片連結: ~50MB

---

## 🔮 未來擴充

### 第三批規劃
| 功能 | 說明 | 預估工時 |
|:---|:---|:---:|
| 雲端同步 | 多裝置資料同步 | 20h |
| 商業化 | 訂閱付款整合 | 15h |
| 進階 AI | 即時對話、圖片辨識 | 25h |

---

## 📁 檔案清單

### 新增檔案
```
js/modules/planner.js          # 行程生成器
js/modules/content-engine.js   # 內容引擎
js/modules/cms-admin.js        # CMS 管理

supabase/migrations/002_cms_schema.sql  # 資料表
```

### 修改檔案
```
js/app.js      # 新增模組初始化
index.html     # 載入新模組、v33
```

---

## 🐛 常見問題

### Q: 行程生成器顯示「無法使用 AI」
A: 檢查：
1. 是否為 Premium 會員
2. 網路連線是否正常
3. OPENAI_API_KEY 是否設定

### Q: 內容引擎回傳模板而非 AI 內容
A: 這是正常行為：
- Free 用戶使用模板
- Premium 用戶使用 AI
- 離線時自動降級為模板

### Q: CMS 顯示「無權限」
A: 需要：
1. 登入帳號
2. 在 user_profiles 設定 role = 'editor' 或 'admin'

---

**文件版本**: v3.0 Batch 2  
**更新日期**: 2026-04-02  
**總檔案大小**: ~37KB (3個 JS 模組) + 11KB (SQL)