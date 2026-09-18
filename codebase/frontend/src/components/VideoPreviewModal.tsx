'use client';

import React, { useState, useEffect } from 'react';
import { Sentence } from '../types';

interface VideoPreviewModalProps {
  isOpen: boolean;
  scriptTitle: string;
  sentences: Sentence[];
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function VideoPreviewModal({
  isOpen,
  scriptTitle,
  sentences,
  onClose,
  onToast,
}: VideoPreviewModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentIdx(0);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // Teleprompter step forward when playing
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentIdx < sentences.length) {
      const currentSentence = sentences[currentIdx];
      const wordCount = currentSentence ? currentSentence.text.split(' ').length : 10;
      // Calculate reading duration roughly ~200ms per word
      const duration = Math.max(2500, wordCount * 280);

      // Speak using Web Speech API vi-VN if available
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(currentSentence.text);
        u.lang = 'vi-VN';
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find((v) => v.lang.startsWith('vi'));
        if (viVoice) u.voice = viVoice;
        window.speechSynthesis.speak(u);
      }

      timer = setTimeout(() => {
        if (currentIdx + 1 < sentences.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          onToast('✓ Đã phát hết video preview bài giảng!');
        }
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIdx, sentences, onToast]);

  if (!isOpen) return null;

  const currentSentence: Sentence = sentences[currentIdx] || { id: 0, text: '' };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalBox"
        style={{ maxWidth: '750px', background: '#0b132b', color: '#fff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#e0e7ff', fontSize: '18px' }}>
              🎥 Chế độ Teleprompter & Video Preview
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {scriptTitle} · Câu {currentIdx + 1} / {sentences.length}
            </span>
          </div>
          <button className="closeBtn" style={{ color: '#fff' }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Video Canvas Simulation */}
        <div
          style={{
            background: '#1c2541',
            borderRadius: '10px',
            padding: '30px 24px',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
            border: '1px solid #3a506b',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {isPlaying ? '● LIVE PREVIEW' : 'PAUSED'}
          </span>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              lineHeight: 1.6,
              color: '#f8fafc',
              maxWidth: '620px',
              transition: 'all 0.2s',
            }}
          >
            &ldquo;{currentSentence.text}&rdquo;
          </div>

          <div style={{ marginTop: '16px', fontSize: '13px', color: '#6ee7b7' }}>
            {currentSentence.type ? `⚠️ Ghi chú spoken: ${currentSentence.type}` : '✓ Câu đọc chuẩn nhịp'}
          </div>
        </div>

        {/* Teleprompter Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '12px',
            borderTop: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn"
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '9px 18px' }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸ Tạm dừng' : '▶ Bắt đầu chạy chữ & giọng đọc'}
            </button>
            <button
              className="btn"
              style={{ background: '#334155', color: '#fff', border: 'none' }}
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            >
              ⏮ Câu trước
            </button>
            <button
              className="btn"
              style={{ background: '#334155', color: '#fff', border: 'none' }}
              disabled={currentIdx >= sentences.length - 1}
              onClick={() => setCurrentIdx((p) => Math.min(sentences.length - 1, p + 1))}
            >
              Câu sau ⏭
            </button>
          </div>

          <button
            className="btn"
            style={{ background: 'transparent', color: '#94a3b8', borderColor: '#475569' }}
            onClick={onClose}
          >
            Đóng preview
          </button>
        </div>
      </div>
    </div>
  );
}
