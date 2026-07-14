import React from 'react';
import { Database, Sparkles, X } from 'lucide-react';
import { providerRequiresApiKey, type InterpretationProvider } from '../hooks/useApiKeys';

interface InterpretationSettingsModalProps {
  provider: InterpretationProvider;
  apiKey: string;
  onProviderChange: (provider: InterpretationProvider) => void;
  onApiKeyChange: (apiKey: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const PROVIDER_OPTIONS: readonly {
  value: InterpretationProvider;
  label: string;
  description: string;
}[] = [
  { value: 'local', label: '本地知识库', description: '无需 API Key' },
  { value: 'gemini', label: 'Gemini', description: 'Google AI' },
  { value: 'glm', label: 'GLM', description: '智谱 AI' },
  { value: 'deepseek', label: 'DeepSeek', description: 'DeepSeek AI' }
];

/** 选择本地或 AI 解卦方式，并仅在远程模式下收集 API Key。 */
const InterpretationSettingsModal: React.FC<InterpretationSettingsModalProps> = ({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
  onSave,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="interpretation-settings-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="interpretation-settings-title" className="text-2xl font-bold text-red-900">解卦设置</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭解卦设置"
            title="关闭"
            className="p-1 text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-stone-700">解卦方式</legend>
          <div className="space-y-2">
            {PROVIDER_OPTIONS.map(option => {
              const isSelected = provider === option.value;
              const Icon = option.value === 'local' ? Database : Sparkles;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${isSelected ? 'border-red-800 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => onProviderChange(option.value)}
                    className="cursor-pointer accent-red-900"
                  />
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-red-900' : 'text-stone-400'}`} />
                  <span className="min-w-0">
                    <span className="block font-bold text-stone-800">{option.label}</span>
                    <span className="block text-xs text-stone-500">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {providerRequiresApiKey(provider) && (
          <div className="mt-5">
            <label htmlFor="interpretation-api-key" className="mb-2 block text-sm font-bold text-stone-700">API Key</label>
            <input
              id="interpretation-api-key"
              type="password"
              value={apiKey}
              onChange={event => onApiKeyChange(event.target.value)}
              placeholder="输入你的 API Key"
              autoComplete="off"
              className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onSave}
          className="mt-6 w-full rounded-lg bg-red-900 px-4 py-3 font-bold text-white transition-colors hover:bg-red-800"
        >
          保存设置
        </button>
      </div>
    </div>
  );
};

export default InterpretationSettingsModal;
