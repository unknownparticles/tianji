import { useState, useEffect } from 'react';

export interface ApiConfig {
  provider: 'gemini' | 'glm' | 'deepseek';
  apiKey: string;
}

const STORAGE_KEY = 'tianji_api_config';

export function useApiKeys() {
  const [config, setConfig] = useState<ApiConfig>({
    provider: 'gemini',
    apiKey: ''
  });

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load API config:', e);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return { config, setConfig, saveConfig };
}
