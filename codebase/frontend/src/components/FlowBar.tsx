'use client';

import React from 'react';

interface FlowBarProps {
  currentFlow: number;
  onSwitchFlow: (flowId: number) => void;
  goldenSetFilter: string;
  onFilterGoldenSet: (filterType: string) => void;
  passCount: number;
  totalGoldenCases: number;
  passRate: number;
  hasEvaluated: boolean;
  isEvaluating: boolean;
  onRunEvaluation: () => void;
}

export default function FlowBar({
  currentFlow,
  onSwitchFlow,
  goldenSetFilter,
  onFilterGoldenSet,
  passCount,
  totalGoldenCases,
  passRate,
  hasEvaluated,
  isEvaluating,
  onRunEvaluation,
}: FlowBarProps) {
  const flows = [
    { id: 1, label: '1. Happy Path' },
    { id: 2, label: '2. Low-confidence (Mơ hồ)' },
    { id: 3, label: '3. Failure & Safety' },
    { id: 4, label: '4. Correction (Sửa tay)' },
    { id: 5, label: '5. Kịch bản sạch (False Positive)' },
    { id: 6, label: '🎯 6. Golden Set Eval (21 Cases)', isSpecial: true },
  ];

  return (
    <div>
      <div className="flowBar">
        <span className="flowTitle">Demo 4 Đường Trải Nghiệm:</span>
        {flows.map((f) => {
          const isActive = currentFlow === f.id;
          let extraStyle: React.CSSProperties = {};
          if (f.isSpecial) {
            extraStyle = {
              background: isActive ? '#5b21b6' : '#7544ed',
              color: '#fff',
              fontWeight: 700,
              borderColor: '#7544ed',
            };
          }
          return (
            <button
              key={f.id}
              className={`flowBtn ${isActive ? 'active' : ''}`}
              style={extraStyle}
              onClick={() => onSwitchFlow(f.id)}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {currentFlow === 6 && (
        <div style={{ marginTop: '12px' }}>
          {!hasEvaluated && !isEvaluating ? (
            <div
              style={{
                background: '#f5f0ff',
                border: '1px solid #d4c5f9',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontWeight: 800, color: '#6028d9', fontSize: '15px' }}>
                  🎯 Bộ Kiểm Thử Golden Set (21 Cases):
                </span>
                <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '8px' }}>
                  Chưa chạy đánh giá. Dữ liệu đối chiếu Ground Truth đã sẵn sàng.
                </span>
              </div>
              <button
                className="btn"
                style={{
                  background: '#7544ed',
                  color: '#fff',
                  fontWeight: 700,
                  borderColor: '#7544ed',
                  padding: '9px 18px',
                  boxShadow: '0 2px 8px rgba(117, 68, 237, 0.3)',
                }}
                onClick={onRunEvaluation}
              >
                ▶ Bắt đầu chạy đánh giá (21 Cases)
              </button>
            </div>
          ) : isEvaluating ? (
            <div
              style={{
                background: '#f5f0ff',
                border: '1px solid #d4c5f9',
                borderRadius: '10px',
                padding: '14px 18px',
                textAlign: 'center',
                color: '#6028d9',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              ⏳ Đang gửi 21 ca kiểm thử tới AI để đo lường chất lượng theo 5 tiêu chí (vui lòng chờ trong giây lát)...
            </div>
          ) : (
            <div
              style={{
                background: '#f5f0ff',
                border: '1px solid #d4c5f9',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: '#6028d9', fontSize: '15px' }}>
                    📊 Kết quả đo lường:
                  </span>
                  <span
                    style={{
                      background: passRate >= 70 ? '#08a66c' : '#ef4444',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                      marginLeft: '8px',
                    }}
                  >
                    {passCount} / {totalGoldenCases} PASS ({passRate}%)
                  </span>
                  <span
                    style={{
                      background: passRate >= 70 ? '#e0f2fe' : '#fee2e2',
                      color: passRate >= 70 ? '#0369a1' : '#b91c1c',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12px',
                      marginLeft: '6px',
                    }}
                  >
                    {passRate >= 70 ? 'Quality Bar: ≥70% (ĐẠT)' : 'Quality Bar: ≥70% (CHƯA ĐẠT)'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', fontSize: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className={`flowBtn ${goldenSetFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => onFilterGoldenSet('ALL')}
                  >
                    Tất cả ({totalGoldenCases})
                  </button>
                  <button
                    className={`flowBtn ${goldenSetFilter === 'PASS' ? 'active' : ''}`}
                    style={{ color: '#08a66c' }}
                    onClick={() => onFilterGoldenSet('PASS')}
                  >
                    ✓ Đạt ({passCount})
                  </button>
                  <button
                    className={`flowBtn ${goldenSetFilter === 'FAIL' ? 'active' : ''}`}
                    style={{ color: '#ef4444' }}
                    onClick={() => onFilterGoldenSet('FAIL')}
                  >
                    ✗ Chưa đạt ({totalGoldenCases - passCount})
                  </button>
                  <button
                    className={`flowBtn ${goldenSetFilter === 'CLEAN' ? 'active' : ''}`}
                    onClick={() => onFilterGoldenSet('CLEAN')}
                  >
                    Sạch C0
                  </button>
                  <button
                    className={`flowBtn ${goldenSetFilter === 'ERROR' ? 'active' : ''}`}
                    onClick={() => onFilterGoldenSet('ERROR')}
                  >
                    Lỗi C1-C5
                  </button>
                  <button
                    className="flowBtn"
                    style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#c4b5fd' }}
                    onClick={onRunEvaluation}
                    title="Chạy lại đo lường"
                  >
                    🔄 Chạy lại
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
