'use client';

import React, { useState, useEffect } from 'react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { groqKey: string; openrouterKey: string; geminiKey: string }) => void;
  initialKeys: { groqKey: string; openrouterKey: string; geminiKey: string };
}

export default function AISettingsModal({
  isOpen,
  onClose,
  onSave,
  initialKeys,
}: AISettingsModalProps) {
  const [groqKey, setGroqKey] = useState(initialKeys.groqKey);
  const [openrouterKey, setOpenrouterKey] = useState(initialKeys.openrouterKey);
  const [geminiKey, setGeminiKey] = useState(initialKeys.geminiKey);

  useEffect(() => {
    setGroqKey(initialKeys.groqKey);
    setOpenrouterKey(initialKeys.openrouterKey);
    setGeminiKey(initialKeys.geminiKey);
  }, [initialKeys]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ groqKey, openrouterKey, geminiKey });
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>⚙️ Cấu Hình API Key (AI Multi-Provider)</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#53658e', marginTop: 0 }}>
          Hệ thống đã hỗ trợ sẵn file <code>.env</code> ở backend. Nếu muốn ghi đè hoặc nhập nhanh key trực tiếp từ trình duyệt, bạn có thể dán vào đây:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
          {/* Groq Cloud */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                ⚡ Groq API Key (LPU Siêu Tốc)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
              >
                Lấy key miễn phí ↗
              </a>
            </div>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Mô hình: Llama 3.3 70B Versatile, Llama 3.1 8B Instant (tốc độ ~500 tokens/s).
            </span>
          </div>

          {/* OpenRouter */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                🌐 OpenRouter API Key (Free Models)
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
              >
                Lấy key OpenRouter ↗
              </a>
            </div>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
              placeholder="sk-or-v1-..."
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Mô hình miễn phí: <code>llama-3.3-70b-instruct:free</code>, <code>deepseek-r1:free</code>, <code>gemini-2.0-flash-exp:free</code>.
            </span>
          </div>

          {/* Google Gemini */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                🌟 Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
              >
                Lấy key Gemini ↗
              </a>
            </div>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Mô hình: Gemini 2.5 Flash, Gemini 1.5 Flash.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn" onClick={onClose}>
            Đóng
          </button>
          <button className="btn primary" onClick={handleSave}>
            ✓ Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
