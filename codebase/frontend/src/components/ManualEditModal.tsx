'use client';

import React, { useState, useEffect } from 'react';

interface ManualEditModalProps {
  isOpen: boolean;
  sentenceId: number;
  initialText: string;
  onSave: (newText: string) => void;
  onClose: () => void;
}

export default function ManualEditModal({
  isOpen,
  sentenceId,
  initialText,
  onSave,
  onClose,
}: ManualEditModalProps) {
  const [editText, setEditText] = useState(initialText);

  useEffect(() => {
    setEditText(initialText);
  }, [initialText]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (editText.trim()) {
      onSave(editText.trim());
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>✎ Chỉnh sửa thủ công (Câu {sentenceId})</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#53658e', marginTop: 0 }}>
          Biên tập viên có thể tự gõ nội dung câu nói cho phù hợp với phong cách cá nhân của giảng viên:
        </p>

        <textarea
          style={{
            width: '100%',
            height: '120px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #c9d6eb',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'vertical',
            outline: 'none',
          }}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Nhập nội dung chỉnh sửa..."
          autoFocus
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <button className="btn" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="btn primary" onClick={handleSave}>
            ✓ Lưu chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
