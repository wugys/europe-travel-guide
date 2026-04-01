# TravelMind AI v3.0 - 第一批實作設定指南

## 概述
本文件說明如何完成第一批核心能力的部署。

---

## ✅ 已完成項目

### 前端模組
- [x] i18n 多語系模組 (`js/modules/i18n.js`)
- [x] User Profile 會員個人化模組 (`js/modules/profile.js`)
- [x] AI Router 模組 (`js/modules/ai-router.js`)
- [x] app.js 整合 AI Router 事件監聽

### 資料表結構
- [x] `user_profiles` - 會員資料與設定
- [x] `ai_request_logs` - AI 請求記錄
- [x] `ai_response_cache` - AI 回應快取
- [x] `rate_limit_tracking` - 速率限制追蹤
- [x] `daily_usage_stats` - 每日使用統計

---

## ⏳ 待手動設定項目

### 1. 設定 OPENAI_API_KEY

**步驟**:
1. 前往 [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. 建立新的 API Key
3. 前往 [Supabase Dashboard](https://supabase.com/dashboard/project/xbwibudbaqhxbuyjhouc/settings/functions)
4. 點擊 "Environment Variables"
5. 新增變數:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-你的金鑰`

### 2. 部署資料表

**選項 A：使用 Supabase Dashboard SQL Editor**
1. 前往 SQL Editor
2. 開啟檔案 `supabase/migrations/001_initial_schema.sql`
3. 複製全部內容並貼上
4. 點擊 "Run"

**選項 B：使用 Supabase CLI**
```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref xbwibudbaqhxbuyjhouc

# 執行遷移
supabase db push
```

### 3. 部署 Edge Function

```bash
# 確保已安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 執行部署腳本
cd europe-travel-guide
./supabase/functions/deploy.sh
```

或者手動部署:
```bash
supabase functions deploy ai-proxy
```

### 4. 設定 CORS (若需要)

在 `supabase/functions/ai-proxy/index.ts` 中，確認 CORS 標頭已正確設定:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

---

## 🧪 測試步驟

### 測試資料表
```sql
-- 測試 user_profiles
SELECT * FROM user_profiles LIMIT 1;

-- 測試 RLS (應該只能看到自己的資料)
SELECT * FROM user_profiles WHERE user_id = auth.uid();
```

### 測試 Edge Function
```bash
# 測試健康檢查
curl https://xbwibudbaqhxbuyjhouc.supabase.co/functions/v1/ai-proxy \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -X POST \
  -d '{"task":"guide","context":{"test":true}}'
```

### 測試前端整合
1. 開啟瀏覽器開發者工具
2. 查看 Console 輸出:
   - `✅ i18n initialized`
   - `✅ UserProfile initialized`
   - `✅ AIRouter initialized`
   - `✅ Europe Travel Guide v3.0 ready`

---

## 📊 成本預估

### OpenAI API 成本 (每月)
| 使用量 | 預估成本 |
|-------|---------|
| 1,000 guide 請求 | ~$0.50 USD |
| 100 planner 請求 | ~$2.00 USD |
| 10,000 chat 訊息 | ~$5.00 USD |

### Supabase 成本
- 免費層: 500MB 資料庫, 2GB 儲存, 無限 Edge Function 呼叫
- Pro: $25/月

---

## 🔒 安全檢查清單

- [ ] OPENAI_API_KEY 只在 Supabase Dashboard 設定，未提交到 Git
- [ ] RLS 政策已正確設定
- [ ] Edge Function 有適當的錯誤處理
- [ ] 速率限制已啟用
- [ ] 敏感資料未記錄在日誌中

---

## 🐛 常見問題

### Q: Edge Function 部署失敗
A: 確認 Supabase CLI 已登入且專案已正確連結

### Q: AI 請求返回 401
A: 確認 OPENAI_API_KEY 已正確設定

### Q: 資料表查詢返回空結果
A: 確認 RLS 政策允許該操作

### Q: 前端顯示 "AI 服務暫時無法使用"
A: 檢查瀏覽器 Console 和 Network 標籤，確認 Edge Function 回應

---

## 📞 支援

有問題請參考:
- [Supabase 文件](https://supabase.com/docs)
- [OpenAI API 文件](https://platform.openai.com/docs)
- [Edge Functions 文件](https://supabase.com/docs/guides/functions)