'use client';

import React, { useState } from 'react';

interface AddSentenceModalProps {
  isOpen: boolean;
  onAdd: (text: string) => void;
  onClose: () => void;
}

export default function AddSentenceModal({ isOpen, onAdd, onClose }: AddSentenceModalProps) {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
      onClose();
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>＋ Thêm câu mới vào kịch bản</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '13px', color: '#53658e', marginTop: 0 }}>
            Nhập câu thoại bài giảng bạn muốn thêm vào kịch bản. Sau đó bạn có thể bấm &ldquo;✦ Phân tích với AI&rdquo; để kiểm tra văn nói:
          </p>

          <textarea
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #c9d6eb',
              fontSize: '14px',
              lineHeight: '1.5',
              outline: 'none',
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ví dụ: Bây giờ, chúng ta sẽ bắt đầu thực hành viết mã..."
            autoFocus
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={!text.trim()}>
              Thêm vào kịch bản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
