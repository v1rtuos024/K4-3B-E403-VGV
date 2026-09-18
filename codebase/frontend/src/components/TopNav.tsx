'use client';

import React from 'react';

interface TopNavProps {
  onExport: () => void;
  onComplete: () => void;
  onShowUserInfo: () => void;
}

export default function TopNav({ onExport, onComplete, onShowUserInfo }: TopNavProps) {
  return (
    <header className="top">
      <div className="brand" onClick={onShowUserInfo} title="Xem thông tin hệ thống">
        🎓 VLearn
        <small>Lesson Studio</small>
      </div>

      <span className="badge" title="Track C - Đề 2: Vietnamese Spoken-Script QA">
        C2
      </span>

      <div className="title">
        <b>Vietnamese Spoken-Script QA</b>
        <div>AI hỗ trợ rà soát kịch bản video bài giảng tiếng Việt (FastAPI + Next.js)</div>
      </div>

      <button className="btn" onClick={onExport} title="Xuất báo cáo nghiệm thu Markdown">
        ⇧ Export
      </button>

      <button className="btn primary" onClick={onComplete} title="Hoàn tất và tổng kết nghiệm thu">
        ✓ Hoàn tất duyệt
      </button>

      <div
        style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', background: '#edf2fa' }}
        onClick={onShowUserInfo}
        title="Biên tập viên Studio"
      >
        DV &nbsp; <b>Đặng Vinh</b>
      </div>
    </header>
  );
}
