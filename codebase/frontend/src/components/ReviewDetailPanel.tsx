'use client';

import React from 'react';
import { Sentence } from '../types';
import TTSPlayer from './TTSPlayer';

interface ReviewDetailPanelProps {
  sentence: Sentence | null;
  currentIndex: number;
  totalCount: number;
  decision?: 'accepted' | 'kept' | 'edited';
  onDecide: (decision: 'accepted' | 'kept') => void;
  onManualEdit: () => void;
  onUndoDecision: () => void;
  onToast: (msg: string) => void;
  onDeleteSentence?: (id: number) => void;
}

export default function ReviewDetailPanel({
  sentence,
  currentIndex,
  totalCount,
  decision,
  onDecide,
  onManualEdit,
  onUndoDecision,
  onToast,
  onDeleteSentence,
}: ReviewDetailPanelProps) {
  if (!sentence) {
    return (
      <section className="right">
        <h3>Chi tiết góp ý của AI</h3>
        <div className="panel" style={{ color: '#64769b', textAlign: 'center', padding: '30px 10px' }}>
          Chọn một câu trong kịch bản để xem phân tích chi tiết của AI.
        </div>
      </section>
    );
  }

  const renderContent = () => {
    // 1. If user has accepted/edited this sentence
    if (decision === 'accepted' || decision === 'edited') {
      return (
        <div>
          <div className="panel green">
            <h4>✓ Đã chấp nhận gợi ý sửa</h4>
            Câu này đã được biên tập theo phong cách văn nói tối giản cho video bài giảng.
          </div>
          <b>Câu sau khi sửa:</b>
          <div className="panel" style={{ background: '#f8fcff' }}>
            {sentence.text}
          </div>

          <TTSPlayer
            originalText={sentence.text}
            suggestedText={sentence.suggest || sentence.text}
            onToast={onToast}
          />

          <div className="decision">
            <button className="keep" onClick={onUndoDecision}>
              ↩ Khôi phục câu gốc
            </button>
            <button className="editBtn" onClick={onManualEdit}>
              ✎ Sửa tiếp
            </button>
          </div>
        </div>
      );
    }

    // 2. If Golden Set test case
    if (sentence.isGoldenSet) {
      if (!sentence.eval_status) {
        return (
          <div>
            <div className="panel" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
              <h4 style={{ margin: '0 0 6px', color: '#475569' }}>⏳ Trạng thái: Chưa kiểm thử ca này</h4>
              Bấm nút <b>&ldquo;▶ Bắt đầu chạy đánh giá&rdquo;</b> ở thanh kịch bản phía trên để AI phân tích và đối chiếu với Ground Truth.
            </div>

            <b>[{sentence.case_id}] Câu kịch bản test:</b>
            <div className="panel">{sentence.text}</div>

            <div className="panel" style={{ background: '#fffcf0', borderColor: '#fedf89' }}>
              <b>🏷️ Ground Truth (Chuẩn con người):</b>
              <br />
              • Nhãn: <b>{sentence.gold_label}</b> ({sentence.category})
              <br />
              {sentence.gold_span && (
                <>
                  • Span lỗi: <i>&ldquo;{sentence.gold_span}&rdquo;</i>
                  <br />
                </>
              )}
              {sentence.gold_reason && (
                <>
                  • Lý do: {sentence.gold_reason}
                  <br />
                </>
              )}
              {sentence.gold_suggest && (
                <>
                  • Gợi ý chuẩn:{' '}
                  <span className="suggest" style={{ marginTop: '4px' }}>
                    {sentence.gold_suggest}
                  </span>
                </>
              )}
            </div>

            <TTSPlayer originalText={sentence.text} suggestedText={sentence.gold_suggest || sentence.text} onToast={onToast} />
          </div>
        );
      }

      const isPass = sentence.eval_status === 'PASS';
      const crit = sentence.criteria || {
        detection: false,
        span: false,
        category: false,
        explanation: false,
        suggestion: false,
      };

      return (
        <div>
          <div className={`panel ${isPass ? 'green' : 'danger'}`}>
            <h4>{isPass ? '✓ KẾT QUẢ TEST: PASS' : '✗ KẾT QUẢ TEST: FAIL'}</h4>
            {isPass ? 'Đáp ứng tiêu chuẩn đánh giá Golden Set.' : sentence.notes || 'Không khớp Ground Truth.'}
          </div>

          <b>[{sentence.case_id}] Câu kịch bản test:</b>
          <div className="panel">{sentence.text}</div>

          <div className="panel" style={{ fontSize: '12px', background: '#fcfaff' }}>
            <b>📋 Đánh giá 5 chiều chất lượng:</b>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <span>• Nhận diện: <b>{crit.detection ? '✓ ĐÚNG' : '✗ SAI'}</b></span>
              <span>• Khoanh vùng: <b>{crit.span ? '✓ ĐÚNG' : '✗ SAI'}</b></span>
              <span>• Phân loại: <b>{crit.category ? '✓ ĐÚNG' : '✗ SAI'}</b></span>
              <span>• Giải thích: <b>{crit.explanation ? '✓ ĐÚNG' : '✗ SAI'}</b></span>
              <span>• Gợi ý tối thiểu: <b>{crit.suggestion ? '✓ ĐÚNG' : '✗ SAI'}</b></span>
            </div>
          </div>

          <div className="panel" style={{ background: '#fffcf0', borderColor: '#fedf89' }}>
            <b>🏷️ Ground Truth (Chuẩn con người):</b>
            <br />
            • Nhãn: <b>{sentence.gold_label}</b> ({sentence.category})
            <br />
            {sentence.gold_span && (
              <>
                • Span lỗi: <i>&ldquo;{sentence.gold_span}&rdquo;</i>
                <br />
              </>
            )}
            {sentence.gold_reason && (
              <>
                • Lý do: {sentence.gold_reason}
                <br />
              </>
            )}
            {sentence.gold_suggest && (
              <>
                • Gợi ý chuẩn:{' '}
                <span className="suggest" style={{ marginTop: '4px' }}>
                  {sentence.gold_suggest}
                </span>
              </>
            )}
          </div>

          {sentence.ai_issue ? (
            <div className="panel" style={{ background: '#eef6ff', borderColor: '#b9d9fe' }}>
              <b>🤖 AI phát hiện ({sentence.ai_issue.type}):</b>
              <br />
              • Span: <i>&ldquo;{sentence.ai_issue.span}&rdquo;</i>
              <br />
              • Lý do: {sentence.ai_issue.reason}
              <br />
              • Gợi ý sửa:{' '}
              <span className="suggest" style={{ marginTop: '4px' }}>
                {sentence.ai_issue.suggestion}
              </span>
            </div>
          ) : (
            sentence.ai_label === 'CLEAN' && (
              <div className="panel" style={{ background: '#f0fff7' }}>
                <b>🤖 AI nhận diện:</b> Câu sạch (CLEAN)
              </div>
            )
          )}

          <TTSPlayer
            originalText={sentence.text}
            suggestedText={sentence.suggest || sentence.gold_suggest || sentence.text}
            onToast={onToast}
          />

          <div className="decision">
            <button className="accept" onClick={() => onDecide('accepted')}>
              ✓ Chấp nhận gợi ý
            </button>
            <button className="keep" onClick={() => onDecide('kept')}>
              Giữ nguyên
            </button>
          </div>
        </div>
      );
    }

    // 3. If sentence is clean (no issue)
    if (!sentence.type) {
      return (
        <div>
          <div className="panel green">
            <h4>✓ Không phát hiện vấn đề</h4>
            Câu này phù hợp với văn nói trong video bài giảng, không bị sượng hay đứt hơi.
          </div>
          <b>Đoạn văn bản câu:</b>
          <div className="panel">{sentence.text}</div>

          <TTSPlayer originalText={sentence.text} onToast={onToast} />

          <div className="decision">
            <button className="keep" onClick={() => onDecide('kept')}>
              ✓ Xác nhận câu chuẩn
            </button>
            <button className="editBtn" onClick={onManualEdit}>
              ✎ Sửa tay
            </button>
          </div>
        </div>
      );
    }

    // 4. If normal issue detected
    return (
      <div>
        <div className="panel danger">
          <b>❗ {sentence.type}</b>
          <br />
          {sentence.color === 'red'
            ? 'Nguy cơ hụt hơi hoặc khẳng định thiếu căn cứ'
            : 'AI phát hiện điểm cần biên tập văn nói'}
        </div>

        {sentence.safetyAlert && <div className="alertBox">{sentence.safetyAlert}</div>}

        <b>Đoạn văn bản gốc</b>
        <div className="panel">{sentence.text}</div>

        <div className="panel">
          <b>💡 Lý do</b>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
            {sentence.reason && sentence.reason.length > 0 ? (
              sentence.reason.map((r, i) => <li key={i}>{r}</li>)
            ) : (
              <li>Cần biên tập lại cho tự nhiên khi đọc thành lời.</li>
            )}
          </ul>
        </div>

        {sentence.suggest && (
          <div className="panel green">
            <h4>✦ Gợi ý sửa tối thiểu (minimal diff)</h4>
            <span className="suggest">{sentence.suggest}</span>
          </div>
        )}

        <TTSPlayer
          originalText={sentence.text}
          suggestedText={sentence.suggest || sentence.text}
          onToast={onToast}
        />

        <div className="decision">
          <button className="accept" onClick={() => onDecide('accepted')}>
            ✓ Chấp nhận gợi ý
          </button>
          <button className="keep" onClick={() => onDecide('kept')}>
            Giữ nguyên
          </button>
          <button className="editBtn" onClick={onManualEdit}>
            ✎ Sửa tay
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="right">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0 }}>Chi tiết góp ý của AI</h3>
        <span className="muted" style={{ fontSize: '13px' }}>
          Câu {currentIndex} / {totalCount}
        </span>
      </div>

      {renderContent()}

      {onDeleteSentence && (
        <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #eef2f7', textAlign: 'right' }}>
          <button
            className="btn"
            style={{ fontSize: '11px', color: '#a91d29', borderColor: '#ffd2d5', padding: '4px 8px' }}
            onClick={() => onDeleteSentence(sentence.id)}
            title="Xóa câu này khỏi kịch bản"
          >
            🗑 Xóa câu
          </button>
        </div>
      )}
    </section>
  );
}
