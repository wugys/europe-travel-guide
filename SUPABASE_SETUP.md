# Europe Travel Guide - Supabase 設定指南

## 快速開始

### 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 註冊帳號
2. 建立新專案，名稱可設為 `europe-travel-guide`
3. 記下以下資訊：
   - **Project URL**: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **anon key**: (在 Project Settings > API 中取得)

### 2. 執行資料庫遷移

在 Supabase Dashboard 中：

1. 進入 **SQL Editor**
2. 開啟 `supabase/schema.sql` 檔案內容
3. 複製貼上到 SQL Editor 並執行
4. 開啟 `supabase/seed.sql` 檔案內容
5. 複製貼上到 SQL Editor 並執行

這會建立所有需要的表格並匯入行程資料。

### 3. 設定前端連線

編輯 `js/db.js` 檔案，找到以下行：

```javascript
// Supabase 設定
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

替換為你的實際資訊：

```javascript
// Supabase 設定
const SUPABASE_URL = 'https://abc123def456ghi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

### 4. 部屬上線

完成設定後，推送到 GitHub Pages：

```bash
cd europe-travel-guide
git add .
git commit -m "Add Supabase integration"
git push origin main
```

---

## 功能說明

### 雙模式運作

系統會自動偵測 Supabase 連線狀態：

| 模式 | 說明 |
|:---|:---|
| **Supabase 模式** | 連線成功時，從雲端資料庫載入資料 |
| **離線模式** | 連線失敗時，自動使用本地 JavaScript 資料 |

### 資料表結構

```
trip_info          - 行程基本資訊
flights            - 航班資訊
itinerary_days     - 每日行程
activities         - 每日活動
attractions        - 景點詳情
tip_categories     - 提醒分類
tip_items          - 提醒項目
checklist_categories - 清單分類
checklist_items    - 清單項目
user_checklist_status - 使用者勾選狀態
```

### 客製化行程

如需修改行程內容，有兩種方式：

**方式一：修改資料庫（推薦）**

在 Supabase Dashboard 中直接編輯表格資料。

**方式二：修改本地檔案**

編輯以下檔案：
- `data/itinerary.js` - 行程資料
- `data/attractions.js` - 景點資料
- `data/tips.js` - 旅遊提醒
- `data/checklist.js` - 行前清單

---

## 安全性注意事項

⚠️ **重要**: 

1. **anon key** 是公開的（用於前端），請勿使用 service_role key
2. 資料庫已設定 Row Level Security (RLS)，公開資料可讀取
3. 使用者勾選狀態僅儲存在該使用者裝置上

---

## 常見問題

**Q: 可以不接 Supabase 只用本地資料嗎？**  
A: 可以！系統會自動偵測，如果 Supabase 連線失敗會自動使用本地資料。

**Q: 如何備份資料？**  
A: 在 Supabase Dashboard 可使用 "Database Backups" 功能。

**Q: 可以多人共用嗎？**  
A: 可以，所有人連線到同一個 Supabase 專案即可看到相同行程。但各自的勾選清單是獨立的。

**Q: 流量限制？**  
A: Supabase 免費版每月 500MB 流量，一般旅遊導遊使用綽綽有餘。
