import { useState, useEffect } from 'react';

export interface ApiKeys {
  gemini: string;
  glm: string;
  glmUrl: string;
  deepseek: string;
  deepseekUrl: string;
}

const STORAGE_KEY = 'tianji_api_keys';

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({
    gemini: '',
    glm: '',
    glmUrl: '',
    deepseek: '',
    deepseekUrl: ''
  });

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setKeys(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load API keys:', e);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveKeys = (newKeys: ApiKeys) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  return { keys, saveKeys };
}
