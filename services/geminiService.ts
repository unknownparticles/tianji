
import { GoogleGenAI } from "@google/genai";

// 内置的 API 端点
const API_URLS = {
  glm: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    deepseek: 'https://api.deepseek.com/chat/completions'
};

const readEnv = (key: string) => {
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  if (metaEnv && key in metaEnv) return metaEnv[key];
  if (typeof process !== "undefined" && process.env) return process.env[key];
  return undefined;
};

const GEMINI_API_KEY =
  readEnv("VITE_GEMINI_API_KEY") ||
  readEnv("VITE_API_KEY") ||
  readEnv("GEMINI_API_KEY") ||
  readEnv("API_KEY");

let geminiClient: GoogleGenAI | null = null;
const getGeminiClient = () => {
  if (!GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return geminiClient;
};

/**
 * Interpret hexagram using different AI providers.
 * provider: 'gemini' | 'glm' | 'deepseek' (defaults to 'gemini')
 * customPrompt: optional extra instructions from frontend
 * apiKey: API key for the selected provider (required)
 */
export async function interpretHexagram(
  mainHex: string,
  changingHex: string | null,
  lines: string[],
  provider: string = 'gemini',
  customPrompt?: string,
  apiKey?: string
) {
  const basePrompt = `
    你是一位精通《周易》的占卜大师。现在请为用户解读卦象。
    本卦：${mainHex}
    ${changingHex ? `变卦：${changingHex}` : '（无变卦）'}
    具体爻象（从初爻到六爻）：${lines.join(', ')}

    请按照以下结构进行详细解读，使用温润、古雅但易懂的语言：
    1. 卦象解析：本卦的整体寓意，天时地利人和。
    2. 变爻解读：针对具体的动爻（老阴/老阳）给出的特别提示。
    3. 运势指引：事业/财运，感情/人际，健康/安全
    4. 哲理建议：本卦蕴含的人生智慧和此时的最佳策略。

    输出要求：使用 Markdown 格式，语气专业且充满智慧。
  `;

  const finalPrompt = customPrompt ? `${basePrompt}\n附加说明：${customPrompt}` : basePrompt;

  try {
    if (provider === 'gemini') {
      const key = apiKey || GEMINI_API_KEY;
      if (!key) {
        return "未配置 Gemini API Key，请在设置中输入 API Key。";
      }
      const client = new GoogleGenAI({ apiKey: key });
      const model = "gemini-3-pro-preview";
      const response = await client.models.generateContent({
        model: model,
        contents: finalPrompt,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      return response.text;
    }

    // GLM provider - URL built-in
    if (provider === 'glm') {
      if (!apiKey) {
        return "未配置 GLM API Key，请在设置中输入 API Key。";
      }

      const resp = await fetch(API_URLS.glm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
          body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [{ role: 'user', content: finalPrompt }],
            stream: false
          })
      });
      if (!resp.ok) throw new Error(`GLM request failed: ${resp.status}`);
      const data = await resp.json();
        return data.choices?.[0]?.message?.content || data.text || data.output || data.result || JSON.stringify(data);
    }

    // Deepseek provider - URL built-in
    if (provider === 'deepseek') {
      if (!apiKey) {
        return "未配置 Deepseek API Key，请在设置中输入 API Key。";
      }

      const resp = await fetch(API_URLS.deepseek, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: finalPrompt }],
            stream: false
          })
      });
      if (!resp.ok) throw new Error(`Deepseek request failed: ${resp.status}`);
      const data = await resp.json();
        return data.choices?.[0]?.message?.content || data.text || data.output || data.result || JSON.stringify(data);
    }

    throw new Error(`Unknown provider: ${provider}`);
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return "天机暂时不可泄露（解析出错），请静心稍后再试。";
  }
}
