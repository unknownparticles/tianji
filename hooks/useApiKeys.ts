import { useState, useEffect } from 'react';

export type InterpretationProvider = 'local' | 'gemini' | 'glm' | 'deepseek';

export interface ApiConfig {
  provider: InterpretationProvider;
  apiKey: string;
}

const STORAGE_KEY = 'tianji_api_config';
const PROVIDERS: readonly InterpretationProvider[] = ['local', 'gemini', 'glm', 'deepseek'];
const DEFAULT_CONFIG: ApiConfig = { provider: 'local', apiKey: '' };

/** 本地知识库不需要密钥，其余 Provider 均通过远程 API 解析。 */
export function providerRequiresApiKey(provider: InterpretationProvider): boolean {
  return provider !== 'local';
}

/** 将本地存储内容转换为有效配置，损坏或未知配置回退到纯本地模式。 */
export function parseStoredConfig(saved: string | null): ApiConfig {
  if (!saved) return { ...DEFAULT_CONFIG };

  try {
    const parsed = JSON.parse(saved) as Partial<ApiConfig>;
    if (!PROVIDERS.includes(parsed.provider as InterpretationProvider) || typeof parsed.apiKey !== 'string') {
      return { ...DEFAULT_CONFIG };
    }
    return { provider: parsed.provider as InterpretationProvider, apiKey: parsed.apiKey };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function useApiKeys() {
  const [config, setConfig] = useState<ApiConfig>({ ...DEFAULT_CONFIG });

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setConfig(parseStoredConfig(saved));
  }, []);

  // 保存到 localStorage
  const saveConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return { config, setConfig, saveConfig };
}
