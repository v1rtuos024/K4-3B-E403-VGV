'use client';

import React from 'react';

export interface ProviderOption {
  id: string;
  name: string;
  models: { id: string; name: string }[];
}

export const PROVIDERS_CONFIG: ProviderOption[] = [
  {
    id: 'gemini',
    name: '🌟 Gemini AI',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
    ],
  },
  {
    id: 'groq',
    name: '⚡ Groq (LPU Siêu Tốc)',
    models: [
      { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B' },
      { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
    ],
  },
  {
    id: 'openrouter',
    name: '🌐 OpenRouter (Free)',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
    ],
  },
];

interface AIProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string, model: string) => void;
  onModelChange: (model: string) => void;
  onOpenSettings: () => void;
}

export default function AIProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  onOpenSettings,
}: AIProviderSelectorProps) {
  const currentProviderConfig = PROVIDERS_CONFIG.find((p) => p.id === selectedProvider) || PROVIDERS_CONFIG[0];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Provider Selector */}
      <select
        style={{
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid #d6dfef',
          background: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          color: '#10265f',
          cursor: 'pointer',
          outline: 'none',
        }}
        value={selectedProvider}
        onChange={(e) => {
          const newProv = e.target.value;
          const conf = PROVIDERS_CONFIG.find((p) => p.id === newProv) || PROVIDERS_CONFIG[0];
          onProviderChange(newProv, conf.models[0].id);
        }}
        title="Chọn nhà cung cấp AI: Gemini, Groq, hoặc OpenRouter Free"
      >
        {PROVIDERS_CONFIG.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Model Selector */}
      <select
        style={{
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid #d6dfef',
          background: '#fff',
          fontSize: '13px',
          color: '#345fe8',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          maxWidth: '160px',
        }}
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        title="Chọn mô hình AI"
      >
        {currentProviderConfig.models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* Settings Button */}
      <button
        type="button"
        className="btn"
        style={{ padding: '8px 10px', fontSize: '13px' }}
        onClick={onOpenSettings}
        title="Cấu hình API Key (Groq, OpenRouter, Gemini)"
      >
        ⚙️
      </button>
    </div>
  );
}
