
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Interpret hexagram using different AI providers.
 * provider: 'gemini' | 'glm' | 'deepseek' (defaults to 'gemini')
 * customPrompt: optional extra instructions from frontend
 */
export async function interpretHexagram(
  mainHex: string,
  changingHex: string | null,
  lines: string[],
  provider: string = 'gemini',
  customPrompt?: string
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
      const model = "gemini-3-pro-preview";
      const response = await ai.models.generateContent({
        model: model,
        contents: finalPrompt,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      return response.text;
    }

    // Generic HTTP-based provider support (GLM, Deepseek). Requires env vars for endpoints and keys.
    if (provider === 'glm') {
      const url = process.env.GLM_API_URL;
      const key = process.env.GLM_API_KEY;
      if (!url) throw new Error('GLM API URL not configured (GLM_API_URL)');

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'Authorization': `Bearer ${key}` } : {})
        },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      if (!resp.ok) throw new Error(`GLM request failed: ${resp.status}`);
      const data = await resp.json();
      // Attempt to extract text from common response shapes
      return (data.text || data.output || data.result || JSON.stringify(data));
    }

    if (provider === 'deepseek') {
      const url = process.env.DEEPSEEK_API_URL;
      const key = process.env.DEEPSEEK_API_KEY;
      if (!url) throw new Error('Deepseek API URL not configured (DEEPSEEK_API_URL)');

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'Authorization': `Bearer ${key}` } : {})
        },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      if (!resp.ok) throw new Error(`Deepseek request failed: ${resp.status}`);
      const data = await resp.json();
      return (data.text || data.output || data.result || JSON.stringify(data));
    }

    throw new Error(`Unknown provider: ${provider}`);
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return "天机暂时不可泄露（解析出错），请静心稍后再试。";
  }
}
