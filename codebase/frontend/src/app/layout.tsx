import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'VLearn Spoken-Script QA Studio',
  description: 'AI hỗ trợ rà soát kịch bản video bài giảng tiếng Việt (Track C Đề 2)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
