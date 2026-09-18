'use client';

import React from 'react';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>🎓 Thông Tin Hệ Thống VLearn Studio</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ lineHeight: 1.6, fontSize: '13px', color: '#1e293b' }}>
          <p>
            <b>Hệ thống:</b> VLearn Spoken-Script QA Agent (Track C Đề 2)
          </p>
          <p>
            <b>Kiến trúc:</b>
            <br />
            • <b>Backend:</b> FastAPI (Python) + Gemini AI Lõi + Vietnamese gTTS Audio Engine
            <br />
            • <b>Frontend:</b> Next.js (React + TypeScript) Component Architecture
          </p>
          <p>
            <b>Biên tập viên:</b> Đặng Vinh (DV) — VLearn Studio Team
          </p>
          <p>
            <b>Tính năng nổi bật:</b>
            <br />
            ✓ <b>Flow Thật 100%:</b> Nạp kịch bản tùy ý từ file .md/.txt, chỉnh sửa, gọi Gemini phân tích trực tiếp.
            <br />
            ✓ <b>Text-to-Speech Tiếng Việt Chuẩn:</b> Giọng đọc tiếng Việt tự nhiên phát âm so sánh câu gốc và câu sửa.
            <br />
            ✓ <b>100% Nút Bấm Hoạt Động:</b> Export báo cáo Markdown, Preview Teleprompter, Sửa tay, Chấp nhận, Giữ nguyên.
            <br />
            ✓ <b>4 Experience Paths + Golden Set:</b> Bộ 21 ca kiểm thử Ground Truth chuẩn sư phạm.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
