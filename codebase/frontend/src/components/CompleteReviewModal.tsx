'use client';

import React from 'react';
import { Sentence, AuditItem } from '../types';

interface CompleteReviewModalProps {
  isOpen: boolean;
  scriptTitle: string;
  sentences: Sentence[];
  decisions: Record<number, 'accepted' | 'kept' | 'edited'>;
  auditTrail: AuditItem[];
  onClose: () => void;
  onExport: () => void;
}

export default function CompleteReviewModal({
  isOpen,
  scriptTitle,
  sentences,
  decisions,
  auditTrail,
  onClose,
  onExport,
}: CompleteReviewModalProps) {
  if (!isOpen) return null;

  const total = sentences.length;
  const issues = sentences.filter((s) => s.type);
  const totalIssues = issues.length;
  const reviewedCount = Object.keys(decisions).length;
  const acceptedCount = Object.values(decisions).filter((d) => d === 'accepted' || d === 'edited').length;
  const keptCount = Object.values(decisions).filter((d) => d === 'kept').length;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>🎓 Nghiệm Thu Hoàn Tất Kịch Bản</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ background: '#f0fff7', border: '1px solid #bdf2d5', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ color: '#078553', margin: '0 0 6px', fontSize: '16px' }}>
            ✓ Kịch bản đã sẵn sàng cho thu âm video bài giảng!
          </h4>
          <span style={{ fontSize: '13px', color: '#166534' }}>
            {scriptTitle}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '16px 0', textAlign: 'center' }}>
          <div style={{ background: '#f8fbff', border: '1px solid #dfe7f4', borderRadius: '8px', padding: '12px 6px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10265f' }}>{total}</div>
            <div style={{ fontSize: '11px', color: '#64769b', marginTop: '4px' }}>Tổng số câu</div>
          </div>

          <div style={{ background: '#fff3f4', border: '1px solid #fed2d5', borderRadius: '8px', padding: '12px 6px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>{totalIssues}</div>
            <div style={{ fontSize: '11px', color: '#64769b', marginTop: '4px' }}>Lỗi phát hiện</div>
          </div>

          <div style={{ background: '#f0fff7', border: '1px solid #bdf2d5', borderRadius: '8px', padding: '12px 6px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#08a66c' }}>{acceptedCount}</div>
            <div style={{ fontSize: '11px', color: '#64769b', marginTop: '4px' }}>Đã sửa/chấp nhận</div>
          </div>

          <div style={{ background: '#f4f8ff', border: '1px solid #beddff', borderRadius: '8px', padding: '12px 6px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#3182ef' }}>{keptCount}</div>
            <div style={{ fontSize: '11px', color: '#64769b', marginTop: '4px' }}>Giữ nguyên</div>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '16px 0' }}>
          <b>Nhật ký kiểm tra (Audit Trail):</b> Đã ghi nhận {auditTrail.length} bản ghi thao tác biên tập viên theo chuẩn HAX & PAIR.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn" onClick={onClose}>
            Đóng
          </button>
          <button
            className="btn primary"
            onClick={() => {
              onClose();
              onExport();
            }}
          >
            ⇧ Tải báo cáo nghiệm thu (.md)
          </button>
        </div>
      </div>
    </div>
  );
}
