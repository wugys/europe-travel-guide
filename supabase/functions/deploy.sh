#!/bin/bash
# ============================================
# Deploy Edge Function: ai-proxy
# TravelMind AI v3.0
# ============================================

set -e

echo "🚀 Deploying ai-proxy Edge Function..."

# 檢查 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# 檢查是否登入
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in. Please run:"
    echo "   supabase login"
    exit 1
fi

# 連結專案
echo "🔗 Linking to project..."
supabase link --project-ref xbwibudbaqhxbuyjhouc

# 部署函數
echo "📤 Deploying function..."
supabase functions deploy ai-proxy

# 設定環境變數
echo "🔧 Setting environment variables..."
echo "   Note: OPENAI_API_KEY must be set manually in Supabase Dashboard"
echo "   Dashboard URL: https://supabase.com/dashboard/project/xbwibudbaqhxbuyjhouc/settings/functions"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Go to Supabase Dashboard"
echo "   2. Navigate to Project Settings > Functions"
echo "   3. Add environment variable: OPENAI_API_KEY=your_key_here"
echo "   4. Test the function with:"
echo ""
echo "   curl -X POST https://xbwibudbaqhxbuyjhouc.supabase.co/functions/v1/ai-proxy \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"task\": \"guide\", \"context\": {}}'"
echo ""

# 顯示函數 URL
FUNCTION_URL="https://xbwibudbaqhxbuyjhouc.supabase.co/functions/v1/ai-proxy"
echo "🔗 Function URL: $FUNCTION_URL"