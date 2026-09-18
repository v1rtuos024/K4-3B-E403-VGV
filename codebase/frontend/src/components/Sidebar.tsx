'use client';

import React from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabKey: string) => void;
}

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const navItems = [
    { key: 'home', icon: '⌂', label: 'Trang chủ' },
    { key: 'studio', icon: '▣', label: 'Lesson Studio' },
    { key: 'qa', icon: '▧', label: 'Rà soát kịch bản' },
    { key: 'library', icon: '▣', label: 'Thư viện kịch bản' },
    { key: 'divider', isDivider: true },
    { key: 'projects', icon: '▱', label: 'Dự án của tôi' },
    { key: 'reports', icon: '▥', label: 'Báo cáo' },
  ];

  return (
    <aside>
      {navItems.map((item, idx) => {
        if (item.isDivider) {
          return <br key={`div-${idx}`} />;
        }
        const isActive = currentTab === item.key;
        return (
          <div
            key={item.key}
            className={`nav ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.key!)}
            title={`Đi tới ${item.label}`}
          >
            <span>{item.icon}</span> &nbsp; {item.label}
          </div>
        );
      })}

      <div className="tip">
        💡 <b>Mẹo sử dụng</b>
        <br />
        <span className="muted">
          AI chỉ ra đoạn văn nói dễ gây vấp, đứt hơi kèm lý do và gợi ý sửa tối thiểu. Bạn duyệt từng câu hoặc bấm &ldquo;Phân tích với AI&rdquo; nhé!
        </span>
      </div>
    </aside>
  );
}
