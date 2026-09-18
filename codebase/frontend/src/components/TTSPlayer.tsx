'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TTSPlayerProps {
  originalText: string;
  suggestedText?: string;
  onToast?: (msg: string) => void;
}

export default function TTSPlayer({ originalText, suggestedText, onToast }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'none' | 'compare' | 'original' | 'suggested'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any playing audio when switching sentence
  useEffect(() => {
    stopAudio();
  }, [originalText, suggestedText]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveSegment('none');
  };

  const playViaWebSpeech = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onToast) onToast('Trình duyệt không hỗ trợ Web Speech API.');
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    // Search for Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VIE') || v.name.includes('Vietnamese'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
      else {
        setIsPlaying(false);
        setActiveSegment('none');
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveSegment('none');
    };

    window.speechSynthesis.speak(utterance);
  };

  const playAudio = async (mode: 'compare' | 'original' | 'suggested') => {
    stopAudio();
    setIsPlaying(true);
    setActiveSegment(mode);

    const suggest = suggestedText || originalText;
    const bodyPayload = {
      mode: mode === 'compare' ? 'compare' : 'single',
      original: originalText,
      suggested: suggest,
      text: mode === 'suggested' ? suggest : originalText,
    };

    try {
      // 1. First priority: Use backend Vietnamese gTTS for crystal-clear natural Vietnamese
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) throw new Error('Backend TTS error');

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setActiveSegment('none');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        // Fallback to Web Speech API if audio playback fails
        fallbackWebSpeech(mode);
      };

      await audio.play();
      if (onToast) onToast('🔊 Đang phát giọng đọc tiếng Việt chuẩn (AI TTS)...');
    } catch {
      // 2. Offline Fallback: Use Web Speech API with Vietnamese voice
      fallbackWebSpeech(mode);
    }
  };

  const fallbackWebSpeech = (mode: 'compare' | 'original' | 'suggested') => {
    const suggest = suggestedText || originalText;
    if (mode === 'compare') {
      playViaWebSpeech(`Trước khi sửa: ${originalText}`, () => {
        setTimeout(() => {
          playViaWebSpeech(`Sau khi sửa: ${suggest}`, () => {
            setIsPlaying(false);
            setActiveSegment('none');
          });
        }, 600);
      });
    } else if (mode === 'original') {
      playViaWebSpeech(originalText);
    } else {
      playViaWebSpeech(suggest);
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        className="btn"
        style={{
          background: isPlaying && activeSegment === 'compare' ? '#e0edff' : '#f4f8ff',
          borderColor: '#beddff',
          color: '#1258dc',
          width: '100%',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '11px',
        }}
        onClick={() => {
          if (isPlaying && activeSegment === 'compare') {
            stopAudio();
          } else {
            playAudio('compare');
          }
        }}
        title="Nghe thử giọng đọc tiếng Việt câu gốc đối chiếu câu sửa"
      >
        <span>{isPlaying && activeSegment === 'compare' ? '⏹ Dừng đọc' : '🔊 Nghe thử (TTS): Câu gốc vs Gợi ý sửa'}</span>
      </button>

      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        <button
          className="btn"
          style={{
            flex: 1,
            fontSize: '12px',
            padding: '6px 8px',
            background: isPlaying && activeSegment === 'original' ? '#fff0f1' : '#fff',
            borderColor: '#e4eaf4',
          }}
          onClick={() => {
            if (isPlaying && activeSegment === 'original') stopAudio();
            else playAudio('original');
          }}
          title="Nghe riêng câu gốc bằng giọng tiếng Việt"
        >
          {isPlaying && activeSegment === 'original' ? '⏹ Dừng' : '🔊 Câu gốc'}
        </button>

        <button
          className="btn"
          style={{
            flex: 1,
            fontSize: '12px',
            padding: '6px 8px',
            background: isPlaying && activeSegment === 'suggested' ? '#f0fff7' : '#fff',
            borderColor: '#e4eaf4',
          }}
          onClick={() => {
            if (isPlaying && activeSegment === 'suggested') stopAudio();
            else playAudio('suggested');
          }}
          title="Nghe riêng câu gợi ý sửa bằng giọng tiếng Việt"
        >
          {isPlaying && activeSegment === 'suggested' ? '⏹ Dừng' : '🔊 Gợi ý sửa'}
        </button>
      </div>
    </div>
  );
}
