'use client';

import React from 'react';

interface ScriptToolbarProps {
  currentView: 'script' | 'video';
  onChangeView: (view: 'script' | 'video') => void;
  onlyIssues: boolean;
  onToggleOnlyIssues: (checked: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddSentence: () => void;
}

export default function ScriptToolbar({
  currentView,
  onChangeView,
  onlyIssues,
  onToggleOnlyIssues,
  searchQuery,
  onSearchChange,
  onAddSentence,
}: ScriptToolbarProps) {
  return (
    <div className="toolbar">
      <span
        className={currentView === 'script' ? 'tab' : 'tabInactive'}
        onClick={() => onChangeView('script')}
      >
        ☷ Kịch bản
      </span>

      <span
        className={currentView === 'video' ? 'tab' : 'tabInactive'}
        onClick={() => onChangeView('video')}
        title="Mở trình đọc Teleprompter & Video Preview"
      >
        ▻ Chế độ xem video (preview)
      </span>

      <button
        className="btn"
        style={{ padding: '6px 12px', fontSize: '12px' }}
        onClick={onAddSentence}
        title="Thêm câu mới vào kịch bản"
      >
        ＋ Thêm câu
      </button>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={onlyIssues}
          onChange={(e) => onToggleOnlyIssues(e.target.checked)}
        />
        Chỉ hiển thị câu có lỗi
      </label>

      <input
        className="search"
        placeholder="⌕ Tìm trong kịch bản..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
