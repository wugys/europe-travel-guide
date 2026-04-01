// Supabase Edge Function: AI Proxy
// 所有 AI 請求都透過這裡，統一管理金鑰、速率限制、快取

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 模型選擇映射
const MODEL_MAP = {
  'guide': { model: 'gpt-4o-mini', temp: 0.7, maxTokens: 800 },
  'planner': { model: 'gpt-4o', temp: 0.8, maxTokens: 2000 },
  'chat': { model: 'gpt-4o', temp: 0.9, maxTokens: 1000 },
  'content': { model: 'gpt-4o', temp: 0.8, maxTokens: 1500 }
};

// 速率限制設定 (每日)
const RATE_LIMITS = {
  'free': { 'guide': 50, 'chat': 10, 'planner': 0, 'content': 0 },
  'premium': { 'guide': 500, 'chat': 9999, 'planner': 50, 'content': 100 }
};

Deno.serve(async (req) => {
  // CORS 預檢
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 驗證使用者
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { task, messages, context, stream = false } = body;

    // 驗證輸入
    if (!task || !MODEL_MAP[task]) {
      return new Response(JSON.stringify({ error: 'Invalid task type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 取得使用者資訊和訂閱等級
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';

    // 速率限制檢查
    const limit = RATE_LIMITS[tier][task];
    if (limit !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `rate_limit:${user.id}:${task}:${today}`;
      
      // 從資料庫檢查使用量
      const { data: usage } = await supabaseClient
        .from('ai_request_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_type', task)
        .gte('created_at', today)
        .lt('created_at', today + 'T23:59:59');

      const currentUsage = usage?.length || 0;
      
      if (currentUsage >= limit) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          limit,
          used: currentUsage,
          upgrade: tier === 'free'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 檢查快取
    const cacheKey = generateCacheKey(task, messages, context);
    const { data: cached } = await supabaseClient
      .from('ai_response_cache')
      .select('response, created_at')
      .eq('cache_key', cacheKey)
      .single();

    if (cached && !isStale(cached.created_at, task)) {
      return new Response(JSON.stringify({ 
        cached: true, 
        response: cached.response 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 選擇模型設定
    const modelConfig = MODEL_MAP[task];

    // 組裝完整 prompt
    const fullMessages = buildMessages(task, messages, context);

    // 呼叫 OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: fullMessages,
        temperature: modelConfig.temp,
        max_tokens: modelConfig.maxTokens,
        stream
      })
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;
    const usage = aiData.usage;

    // 計算成本 (粗略估算)
    const cost = calculateCost(modelConfig.model, usage);

    // 記錄使用量
    await supabaseClient.from('ai_request_logs').insert({
      user_id: user.id,
      task_type: task,
      model: modelConfig.model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      cost_usd: cost,
      cached: false
    });

    // 快取回應
    await supabaseClient.from('ai_response_cache').upsert({
      cache_key: cacheKey,
      task_type: task,
      response: aiResponse,
      expires_at: getExpiryDate(task)
    });

    return new Response(JSON.stringify({
      response: aiResponse,
      model: modelConfig.model,
      usage,
      cost
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// 生成快取金鑰
function generateCacheKey(task, messages, context) {
  const data = JSON.stringify({ task, messages, context });
  // 簡單雜湊
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `cache:${task}:${Math.abs(hash).toString(36)}`;
}

// 檢查快取是否過期
function isStale(createdAt, task) {
  const ttl = {
    'guide': 24 * 60 * 60 * 1000,      // 1 天
    'planner': 60 * 60 * 1000,          // 1 小時
    'chat': 5 * 60 * 1000,              // 5 分鐘
    'content': 7 * 24 * 60 * 60 * 1000  // 7 天
  };
  const age = Date.now() - new Date(createdAt).getTime();
  return age > (ttl[task] || 60 * 60 * 1000);
}

// 組裝完整 messages
function buildMessages(task, messages, context) {
  const systemPrompts = {
    'guide': `你是一位專業的旅遊導遊，正在陪伴旅客進行歐洲之旅。
請根據提供的時間、位置、行程等資訊，給出實用的建議。
輸出必須是有效的 JSON 格式，包含以下欄位：
{
  "action": "現在建議做什麼",
  "next": "下一步行動",
  "warning": "注意事項（可選）",
  "alternative": "備案方案",
  "contactTaiwan": "是否適合聯繫台北"
}`,
    'planner': `你是一位專業的行程規劃師，擅長設計歐洲旅遊行程。
請根據使用者的偏好和條件，生成詳細的行程規劃。
輸出必須是有效的 JSON 格式。`,
    'chat': `你是一位友善的旅遊助手，正在陪伴旅客遊覽歐洲。
回答要簡潔實用，避免長篇大論。如果問題與旅遊無關，友善地引導回主題。`,
    'content': `你是一位專業的旅遊內容創作者，請為景點撰寫吸引人的導覽內容。
輸出必須是有效的 JSON 格式，包含指定的欄位。`
  };

  const fullMessages = [
    { role: 'system', content: systemPrompts[task] },
    ...messages
  ];

  // 如果有 context，加入到 system message
  if (context) {
    fullMessages[0].content += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  }

  return fullMessages;
}

// 計算成本
function calculateCost(model, usage) {
  const rates = {
    'gpt-4o': { prompt: 0.0025, completion: 0.01 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 }
  };
  const rate = rates[model] || rates['gpt-4o-mini'];
  return (usage.prompt_tokens * rate.prompt + usage.completion_tokens * rate.completion) / 1000;
}

// 取得過期日期
function getExpiryDate(task) {
  const days = {
    'guide': 1,
    'planner': 0.04,  // 1 小時
    'chat': 0.003,    // 5 分鐘
    'content': 7
  };
  const date = new Date();
  date.setDate(date.getDate() + (days[task] || 1));
  return date.toISOString();
}