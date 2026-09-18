'use client';

import React from 'react';
import { Sentence } from '../types';

interface ScriptListProps {
  sentences: Sentence[];
  selectedId: number;
  onSelectSentence: (id: number) => void;
  decisions: Record<number, 'accepted' | 'kept' | 'edited'>;
}

export default function ScriptList({
  sentences,
  selectedId,
  onSelectSentence,
  decisions,
}: ScriptListProps) {
  if (sentences.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64769b' }}>
        Không tìm thấy câu nào phù hợp với bộ lọc tìm kiếm.
      </div>
    );
  }

  return (
    <div className="rows">
      {sentences.map((item) => {
        const isSelected = item.id === selectedId;
        const decision = decisions[item.id];

        let badgeTag: React.ReactNode = null;
        if (decision === 'accepted' || decision === 'edited') {
          badgeTag = <span className="tag greenTag">✓ Đã duyệt</span>;
        } else if (decision === 'kept') {
          badgeTag = <span className="tag grayTag">Giữ nguyên</span>;
        } else if (item.isGoldenSet) {
          if (!item.eval_status) {
            badgeTag = (
              <div>
                <span className="tag grayTag">Chờ test</span>
                <span style={{ fontSize: '10px', color: '#555', display: 'block', marginTop: '2px', textAlign: 'center' }}>
                  {item.category}
                </span>
              </div>
            );
          } else {
            const isPass = item.eval_status === 'PASS';
            badgeTag = (
              <div>
                <span className={`tag ${isPass ? 'greenTag' : 'red'}`}>
                  {isPass ? 'PASS' : 'FAIL'}
                </span>
                <span style={{ fontSize: '10px', color: '#555', display: 'block', marginTop: '2px', textAlign: 'center' }}>
                  {item.category}
                </span>
              </div>
            );
          }
        } else if (item.type) {
          const tagColorClass = item.tag
            ? 'yellow'
            : item.color === 'purple'
            ? 'purpleTag'
            : item.color || 'blue';
          badgeTag = (
            <span className={`tag ${tagColorClass}`}>
              {item.tag || item.type}
            </span>
          );
        }

        let hlClass = '';
        if (decision === 'accepted' || decision === 'edited') {
          hlClass = 'hl-green';
        } else if (item.type && item.color) {
          hlClass = `hl-${item.color}`;
        }

        let rowIssueClass = '';
        if (item.type && item.color) {
          rowIssueClass = `issue-${item.color}`;
        }

        return (
          <div
            key={item.id}
            className={`row ${rowIssueClass} ${isSelected ? 'activeRow' : ''}`}
            onClick={() => onSelectSentence(item.id)}
          >
            <div
              className="num"
              style={item.case_id ? { fontSize: '11px', fontWeight: 700 } : undefined}
            >
              {item.case_id || item.id}
            </div>

            <div>
              {hlClass ? <span className={hlClass}>{item.text}</span> : <span>{item.text}</span>}
            </div>

            <div>{badgeTag}</div>
          </div>
        );
      })}
    </div>
  );
}
