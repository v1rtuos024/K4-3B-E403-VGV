'use client';

import React, { useState, useEffect, useRef } from 'react';
import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import FlowBar from '../components/FlowBar';
import ScriptToolbar from '../components/ScriptToolbar';
import ScriptList from '../components/ScriptList';
import ReviewDetailPanel from '../components/ReviewDetailPanel';
import ManualEditModal from '../components/ManualEditModal';
import VideoPreviewModal from '../components/VideoPreviewModal';
import CompleteReviewModal from '../components/CompleteReviewModal';
import AddSentenceModal from '../components/AddSentenceModal';
import UserInfoModal from '../components/UserInfoModal';
import AIProviderSelector from '../components/AIProviderSelector';
import AISettingsModal from '../components/AISettingsModal';
import Toast from '../components/Toast';
import { Sentence, AuditItem } from '../types';

// Default initial preset 1 (Happy Path)
const DEFAULT_PRESET_1: Sentence[] = [
  { id: 1, text: 'Xin chào các bạn, hôm nay chúng ta sẽ tìm hiểu về trí tuệ nhân tạo và cách nó có thể hỗ trợ việc học tập của chúng ta một cách hiệu quả hơn.' },
  {
    id: 2,
    type: 'Câu quá dài',
    color: 'red',
    text: 'Trí tuệ nhân tạo, hay còn gọi là AI, là một lĩnh vực của khoa học máy tính chuyên nghiên cứu và phát triển các hệ thống có khả năng mô phỏng trí thông minh của con người như học tập, suy luận, nhận thức, và đưa ra quyết định.',
    reason: [
      'Quá dài (35 từ), dễ đứt hơi khi đọc thành tiếng.',
      'Chứa nhiều mệnh đề phụ lồng nhau, khó ngắt nghỉ tự nhiên.',
      'Nguy cơ TTS/MC đọc vấp.',
    ],
    suggest: 'Trí tuệ nhân tạo (AI) là lĩnh vực của khoa học máy tính, chuyên phát triển các hệ thống mô phỏng trí thông minh con người như học tập, suy luận và ra quyết định.',
    span: 'Trí tuệ nhân tạo, hay còn gọi là AI, là một lĩnh vực của khoa học máy tính chuyên nghiên cứu và phát triển các hệ thống có khả năng mô phỏng trí thông minh của con người như học tập, suy luận, nhận thức, và đưa ra quyết định.',
  },
  { id: 3, text: 'Ở bài học này, chúng ta sẽ khám phá những ứng dụng phổ biến của AI trong giáo dục.' },
  {
    id: 4,
    type: 'Thuật ngữ',
    color: 'yellow',
    text: 'Ví dụ như việc sử dụng prompt để tương tác với các mô hình ngôn ngữ lớn như LLM, hay tích hợp API của các công cụ AI vào trong quá trình học tập.',
    reason: [
      'Có acronym/code-switch tiếng Anh (prompt, LLM, API).',
      'Giọng đọc TTS dễ phát âm ngập ngừng nếu thiếu phiên âm.',
    ],
    suggest: 'Ví dụ, chúng ta có thể dùng câu lệnh (prompt) để tương tác với mô hình ngôn ngữ lớn (L-L-M), và tích hợp A-P-I vào quá trình học tập.',
    span: 'prompt để tương tác với các mô hình ngôn ngữ lớn như LLM, hay tích hợp API',
  },
  {
    id: 5,
    type: 'Câu sượng',
    color: 'blue',
    text: 'Không chỉ dừng lại ở lý thuyết, chúng ta sẽ cùng thực hành để trải nghiệm sức mạnh của AI.',
    reason: [
      'Cụm từ “sức mạnh của AI” hơi mang văn phong quảng cáo.',
      'Có thể nói tự nhiên và cụ thể hơn trong ngữ cảnh sư phạm.',
    ],
    suggest: 'Không chỉ học lý thuyết, chúng ta sẽ cùng thực hành để thấy AI có thể hỗ trợ việc học như thế nào.',
    span: 'trải nghiệm sức mạnh của AI',
  },
  { id: 6, text: 'Trước hết, chúng ta cần hiểu rõ AI không phải là công cụ thay thế con người, mà là trợ lý giúp chúng ta học tập tốt hơn.' },
  {
    id: 7,
    type: 'Nghe như viết',
    color: 'purple',
    text: 'Trong bối cảnh chuyển đổi số hiện nay, việc trang bị kỹ năng sử dụng AI là vô cùng quan trọng đối với mỗi học sinh, sinh viên, và cả những người đi làm trong tương lai.',
    reason: [
      'Mở đầu mang phong cách văn viết báo cáo.',
      'Nhiều danh từ trừu tượng, nặng nề khi đọc thành lời trong video ngắn.',
    ],
    suggest: 'AI đang xuất hiện ngày càng nhiều trong học tập và công việc. Vì vậy, biết cách sử dụng AI là một kỹ năng rất hữu ích.',
    span: 'Trong bối cảnh chuyển đổi số hiện nay, việc trang bị kỹ năng sử dụng AI là vô cùng quan trọng',
  },
  { id: 8, text: 'Hãy cùng bắt đầu nhé!' },
];

/**
 * Ensures suggestion is ALWAYS the complete rewritten sentence,
 * never just an isolated term or replacement fragment.
 */
function resolveFullSuggestion(text: string, span?: string, suggest?: string): string {
  if (!suggest) return text;
  if (!span || !text.includes(span) || span.trim() === text.trim()) {
    return suggest;
  }

  const spanIndex = text.indexOf(span);
  const prefix = text.slice(0, spanIndex).trim();
  const suffix = text.slice(spanIndex + span.length).trim();

  // Check if suggest already contains surrounding context
  const hasPrefix = Boolean(prefix && (prefix.length > 10 ? suggest.includes(prefix.slice(-10)) : suggest.includes(prefix)));
  const hasSuffix = Boolean(suffix && (suffix.length > 10 ? suggest.includes(suffix.slice(0, 10)) : suggest.includes(suffix)));

  // If there is surrounding context in text, but suggest doesn't contain either prefix or suffix,
  // then suggest is only an isolated span/term replacement. Stitch it back into the full sentence!
  if ((prefix.length > 0 || suffix.length > 0) && !hasPrefix && !hasSuffix) {
    return text.replace(span, suggest);
  }

  return suggest;
}

export default function HomePage() {
  const [currentSidebarTab, setCurrentSidebarTab] = useState('qa');
  const [currentFlow, setCurrentFlow] = useState(1);
  const [scriptTitle, setScriptTitle] = useState('Kịch bản: D1 – Giới thiệu về AI trong học tập (Happy Path)');
  const [scriptMeta, setScriptMeta] = useState('8 câu · ~2 phút · Happy Path');
  const [sentences, setSentences] = useState<Sentence[]>(DEFAULT_PRESET_1);
  const [originalSentenceTexts, setOriginalSentenceTexts] = useState<Record<number, string>>({});
  const [selectedId, setSelectedId] = useState<number>(2);
  const [decisions, setDecisions] = useState<Record<number, 'accepted' | 'kept' | 'edited'>>({});
  const [auditTrail, setAuditTrail] = useState<AuditItem[]>([]);

  // Multi-provider AI settings (Gemini, Groq, OpenRouter)
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [apiKeys, setApiKeys] = useState<{ groqKey: string; openrouterKey: string; geminiKey: string }>({
    groqKey: '',
    openrouterKey: '',
    geminiKey: '',
  });
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // Filtering & search
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [goldenSetFilter, setGoldenSetFilter] = useState('ALL');
  const [allGoldenSetData, setAllGoldenSetData] = useState<Sentence[]>([]);
  const [hasEvaluatedGoldenSet, setHasEvaluatedGoldenSet] = useState(false);
  const [isEvaluatingGoldenSet, setIsEvaluatingGoldenSet] = useState(false);
  const [goldenSetPassCount, setGoldenSetPassCount] = useState(0);
  const [goldenSetPassRate, setGoldenSetPassRate] = useState(0);

  // Modals & notifications
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isAddSentenceOpen, setIsAddSentenceOpen] = useState(false);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Load API keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vlearn_api_keys');
      if (stored) {
        setApiKeys(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSaveApiKeys = (keys: { groqKey: string; openrouterKey: string; geminiKey: string }) => {
    setApiKeys(keys);
    try {
      localStorage.setItem('vlearn_api_keys', JSON.stringify(keys));
      showToast('✓ Đã lưu cấu hình API Keys thành công!');
    } catch {}
  };

  // Save initial sentences original texts on mount or flow switch
  useEffect(() => {
    const origMap: Record<number, string> = {};
    sentences.forEach((s) => {
      origMap[s.id] = s.text;
    });
    setOriginalSentenceTexts(origMap);
  }, [currentFlow]);

  // Load preset from backend FastAPI
  const handleSwitchFlow = async (flowId: number) => {
    setCurrentFlow(flowId);
    setDecisions({});
    setGoldenSetFilter('ALL');

    try {
      const res = await fetch(`/api/presets/${flowId}`);
      if (res.ok) {
        const data = await res.json();
        setScriptTitle(data.title);
        setScriptMeta(data.meta);
        setSentences(data.sentences);
        if (flowId === 6) {
          setAllGoldenSetData(data.sentences);
        }
        const firstIssue = data.sentences.find((x: Sentence) => x.type);
        setSelectedId(firstIssue ? firstIssue.id : data.sentences[0]?.id || 1);
        showToast(`Đã nạp: ${data.title}`);
        return;
      }
    } catch {
      if (flowId === 1) {
        setScriptTitle('Kịch bản: D1 – Giới thiệu về AI trong học tập (Happy Path)');
        setScriptMeta('8 câu · ~2 phút · Happy Path');
        setSentences(DEFAULT_PRESET_1);
        setSelectedId(2);
      }
    }
  };

  // Live evaluation of Golden Set
  const handleRunGoldenSetEvaluation = async () => {
    setIsEvaluatingGoldenSet(true);
    const providerNameMap: Record<string, string> = {
      gemini: 'Google Gemini',
      groq: 'Groq Cloud (LPU)',
      openrouter: 'OpenRouter (Free)',
    };
    const provName = providerNameMap[selectedProvider] || selectedProvider;
    showToast(`⏳ Bắt đầu đo lường 21 ca kiểm thử với ${provName}...`);

    let customKey: string | undefined = undefined;
    if (selectedProvider === 'groq' && apiKeys.groqKey.trim()) customKey = apiKeys.groqKey.trim();
    else if (selectedProvider === 'openrouter' && apiKeys.openrouterKey.trim()) customKey = apiKeys.openrouterKey.trim();
    else if (selectedProvider === 'gemini' && apiKeys.geminiKey.trim()) customKey = apiKeys.geminiKey.trim();

    try {
      const payload = {
        provider: selectedProvider,
        model: selectedModel,
        custom_api_key: customKey,
      };

      const res = await fetch('/api/golden-set/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Lỗi khi đánh giá Golden Set');

      const data = await res.json();
      setSentences(data.cases);
      setAllGoldenSetData(data.cases);
      setGoldenSetPassCount(data.pass_count);
      setGoldenSetPassRate(data.pass_rate);
      setHasEvaluatedGoldenSet(true);
      setGoldenSetFilter('ALL');
      if (data.cases.length > 0) {
        setSelectedId(data.cases[0].id);
      }
      showToast(`✓ Đánh giá xong: ${data.pass_count}/${data.total_cases} PASS (${data.pass_rate}%)!`);
    } catch (e: any) {
      showToast(`⚠️ Không thể hoàn thành đo lường: ${e.message}`);
    } finally {
      setIsEvaluatingGoldenSet(false);
    }
  };

  // Filter golden set cases
  const handleFilterGoldenSet = (filterType: string) => {
    setGoldenSetFilter(filterType);
    let filtered = [...allGoldenSetData];
    if (filterType === 'PASS') filtered = allGoldenSetData.filter((x) => x.eval_status === 'PASS');
    else if (filterType === 'FAIL') filtered = allGoldenSetData.filter((x) => x.eval_status === 'FAIL');
    else if (filterType === 'CLEAN') filtered = allGoldenSetData.filter((x) => x.gold_label === 'CLEAN');
    else if (filterType === 'ERROR') filtered = allGoldenSetData.filter((x) => x.gold_label !== 'CLEAN');

    setSentences(filtered);
    if (filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  };

  // Real Multi-Provider AI Spoken-Script QA Analysis
  const handleAnalyzeWithAI = async () => {
    if (sentences.length === 0) {
      showToast('Kịch bản chưa có câu nào để phân tích.');
      return;
    }

    setIsAnalyzing(true);
    const providerNameMap: Record<string, string> = {
      gemini: 'Google Gemini',
      groq: 'Groq Cloud (LPU)',
      openrouter: 'OpenRouter (Free)',
    };
    const provName = providerNameMap[selectedProvider] || selectedProvider;
    showToast(`⏳ ${provName} đang phân tích kịch bản theo thời gian thực...`);

    // Determine custom key if provided in browser
    let customKey: string | undefined = undefined;
    if (selectedProvider === 'groq' && apiKeys.groqKey.trim()) customKey = apiKeys.groqKey.trim();
    else if (selectedProvider === 'openrouter' && apiKeys.openrouterKey.trim()) customKey = apiKeys.openrouterKey.trim();
    else if (selectedProvider === 'gemini' && apiKeys.geminiKey.trim()) customKey = apiKeys.geminiKey.trim();

    try {
      const payload = {
        sentences: sentences.map((s) => ({ id: s.id, text: s.text })),
        provider: selectedProvider,
        model: selectedModel,
        custom_api_key: customKey,
      };

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Lỗi phân tích từ backend');

      const issuesMap = new Map<number, any>();
      (data.issues || []).forEach((issue: any) => {
        issuesMap.set(issue.sentence_id, issue);
      });

      const labelType = (t: string) => {
        const map: Record<string, string> = {
          TOO_LONG: 'Câu quá dài',
          AWKWARD_SPOKEN: 'Câu sượng',
          TRANSLATIONESE: 'Câu dịch',
          TERM_PRONUNCIATION: 'Thuật ngữ',
          COMPLEX_SENTENCE: 'Câu phức tạp',
          AMBIGUOUS_PRONOUN: 'Đại từ mơ hồ',
          UNGROUNDED_CLAIM: 'Thiếu căn cứ',
          REPETITION: 'Lặp từ',
        };
        return map[t] || t;
      };

      const colorType = (t: string) => {
        const map: Record<string, string> = {
          TOO_LONG: 'red',
          TERM_PRONUNCIATION: 'yellow',
          AWKWARD_SPOKEN: 'blue',
          TRANSLATIONESE: 'purple',
          COMPLEX_SENTENCE: 'red',
          AMBIGUOUS_PRONOUN: 'yellow',
          UNGROUNDED_CLAIM: 'red',
          REPETITION: 'purple',
        };
        return map[t] || 'blue';
      };

      const updated = sentences.map((s) => {
        const issue = issuesMap.get(s.id);
        if (!issue) {
          return {
            ...s,
            type: undefined,
            color: undefined,
            reason: undefined,
            suggest: undefined,
            safetyAlert: undefined,
          };
        }
        const resolvedSuggest = issue.suggestion
          ? resolveFullSuggestion(s.text, issue.span, issue.suggestion)
          : undefined;

        const reasonsList = issue.reason
          ? (typeof issue.reason === 'string' && issue.reason.includes(' • ')
              ? issue.reason.split(' • ')
              : Array.isArray(issue.reason) ? issue.reason : [issue.reason])
          : undefined;

        return {
          ...s,
          type: labelType(issue.type),
          color: colorType(issue.type),
          reason: reasonsList,
          suggest: resolvedSuggest,
          span: issue.span,
          severity: issue.severity,
          safetyAlert: issue.safety_alert,
        };
      });

      setSentences(updated);
      setDecisions({});
      const detectedIssues = updated.filter((x) => x.type);
      if (detectedIssues.length > 0) {
        setSelectedId(detectedIssues[0].id);
      }
      showToast(`✓ Hoàn tất bởi ${provName} (${data.model || selectedModel}): ${detectedIssues.length} vấn đề.`);
    } catch (err: any) {
      showToast(`⚠️ Lỗi AI: ${err.message}. Đã giữ nguyên kết quả.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload .md or .txt file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-script', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSentences(data.sentences);
        setScriptTitle(`Kịch bản: ${file.name}`);
        setScriptMeta(`${data.count} câu · Đã tải từ máy`);
        setDecisions({});
        setSelectedId(1);
        showToast(`✓ Đã nạp ${data.count} câu từ file ${file.name}! Bấm "✦ Phân tích với AI".`);
        return;
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = String(event.target?.result || '');
        const lines = text
          .split(/\r?\n/)
          .map((x) => x.replace(/^\s*[-*#>\d.)]+\s*/, '').trim())
          .filter(Boolean);

        const newSentences: Sentence[] = lines.map((t, idx) => ({
          id: idx + 1,
          text: t,
        }));

        setSentences(newSentences);
        setScriptTitle(`Kịch bản: ${file.name}`);
        setScriptMeta(`${newSentences.length} câu · Đã tải từ máy`);
        setDecisions({});
        setSelectedId(1);
        showToast(`✓ Đã nạp ${newSentences.length} câu từ file ${file.name}!`);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  // Decision actions
  const handleDecide = (type: 'accepted' | 'kept') => {
    const current = sentences.find((s) => s.id === selectedId);
    if (!current) return;

    setDecisions((prev) => ({ ...prev, [selectedId]: type }));

    const rawSuggest = current.suggest || current.gold_suggest;
    if (type === 'accepted' && rawSuggest) {
      const finalText = resolveFullSuggestion(current.text, current.span || current.gold_span, rawSuggest);
      setAuditTrail((prev) => [
        ...prev,
        {
          id: current.id,
          type: current.type || 'Chỉnh sửa tối thiểu',
          original: current.text,
          final: finalText,
          decision: 'ACCEPTED',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setSentences((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, text: finalText, suggest: finalText } : s))
      );
      showToast(`✓ Đã chấp nhận gợi ý sửa cho câu ${selectedId}.`);
    } else if (type === 'kept') {
      setAuditTrail((prev) => [
        ...prev,
        {
          id: current.id,
          type: current.type || 'Giữ nguyên',
          original: current.text,
          final: current.text,
          decision: 'KEPT',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      showToast(`↩ Đã giữ nguyên câu ${selectedId}.`);
    }
  };

  // Manual edit save
  const handleSaveManualEdit = (newText: string) => {
    const current = sentences.find((s) => s.id === selectedId);
    if (!current) return;

    setDecisions((prev) => ({ ...prev, [selectedId]: 'edited' }));
    setAuditTrail((prev) => [
      ...prev,
      {
        id: current.id,
        type: current.type || 'Sửa thủ công',
        original: current.text,
        final: newText,
        decision: 'MANUAL_EDIT',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setSentences((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, text: newText } : s))
    );
    setIsManualEditOpen(false);
    showToast(`✓ Đã cập nhật câu ${selectedId} bằng nội dung sửa tay.`);
  };

  // Undo decision back to original sentence text
  const handleUndoDecision = () => {
    const origText = originalSentenceTexts[selectedId];
    if (origText) {
      setSentences((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, text: origText } : s))
      );
    }
    setDecisions((prev) => {
      const copy = { ...prev };
      delete copy[selectedId];
      return copy;
    });
    showToast(`↩ Đã khôi phục câu ${selectedId} về bản gốc.`);
  };

  // Add new sentence
  const handleAddSentence = (text: string) => {
    const nextId = sentences.length > 0 ? Math.max(...sentences.map((s) => s.id)) + 1 : 1;
    const newSentence: Sentence = { id: nextId, text };
    setSentences((prev) => [...prev, newSentence]);
    setOriginalSentenceTexts((prev) => ({ ...prev, [nextId]: text }));
    setSelectedId(nextId);
    showToast(`✓ Đã thêm câu ${nextId} vào kịch bản!`);
  };

  // Delete sentence
  const handleDeleteSentence = (id: number) => {
    setSentences((prev) => prev.filter((s) => s.id !== id));
    setDecisions((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    const remaining = sentences.filter((s) => s.id !== id);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    }
    showToast(`🗑 Đã xóa câu ${id}.`);
  };

  // Export report markdown
  const handleExport = async () => {
    try {
      const payload = {
        title: scriptTitle,
        reviewer: 'Đặng Vinh (Studio Team)',
        sentences: sentences.map((s) => ({ id: s.id, text: s.text })),
        auditTrail: auditTrail,
      };

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let mdText = '';
      if (res.ok) {
        mdText = await res.text();
      } else {
        mdText = `# BÁO CÁO NGHIỆM THU KỊCH BẢN — VLEARN SPOKEN-SCRIPT QA\n\n`;
        mdText += `- **Kịch bản:** ${scriptTitle}\n`;
        mdText += `- **Thời gian:** ${new Date().toLocaleString('vi-VN')}\n`;
        mdText += `- **Biên tập viên:** Đặng Vinh\n\n`;
        mdText += `## 1. Kịch bản sạch sau khi duyệt\n\n`;
        sentences.forEach((s) => {
          mdText += `${s.id}. ${s.text}\n\n`;
        });
        mdText += `## 2. Nhật ký duyệt (Audit Trail)\n\n`;
        auditTrail.forEach((a) => {
          mdText += `- Câu ${a.id}: **${a.decision}** -> "${a.final}"\n`;
        });
      }

      const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VLearn_QA_BaoCao_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Đã xuất file báo cáo nghiệm thu Markdown thành công!');
    } catch {
      showToast('⚠️ Không thể xuất báo cáo.');
    }
  };

  // Filtered sentences for display
  const filteredSentences = sentences.filter((s) => {
    if (onlyIssues && !s.type) return false;
    if (searchQuery) {
      return s.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const selectedSentence = sentences.find((s) => s.id === selectedId) || null;
  const currentSentenceIdx = sentences.findIndex((s) => s.id === selectedId) + 1;
  const issueCount = sentences.filter((s) => s.type).length;

  return (
    <div>
      {/* Top Header */}
      <TopNav
        onExport={handleExport}
        onComplete={() => setIsCompleteOpen(true)}
        onShowUserInfo={() => setIsUserInfoOpen(true)}
      />

      {/* Main 3-Column Layout */}
      <div className="app">
        {/* Left Column: Sidebar */}
        <Sidebar
          currentTab={currentSidebarTab}
          onSelectTab={(tab) => {
            setCurrentSidebarTab(tab);
            if (tab === 'home') showToast('🏠 Đang ở màn hình Studio Rà soát kịch bản.');
            else if (tab === 'library') showToast('📚 Thư viện kịch bản: 6 bài giảng mẫu sẵn có.');
            else if (tab === 'reports') setIsCompleteOpen(true);
            else if (tab === 'projects') showToast('📁 Dự án của tôi: Kịch bản video bài giảng VLearn.');
          }}
        />

        {/* Center Column: Main Script Editor */}
        <main className="main">
          <div className="headerCard">
            <div className="headerTop" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2>{scriptTitle}</h2>
                <span className="muted">{scriptMeta}</span>
              </div>

              <div className="actions" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                {/* AI Provider & Model Selector (Gemini / Groq / OpenRouter) */}
                <AIProviderSelector
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                  onProviderChange={(p, m) => {
                    setSelectedProvider(p);
                    setSelectedModel(m);
                  }}
                  onModelChange={setSelectedModel}
                  onOpenSettings={() => setIsAISettingsOpen(true)}
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                />
                <button
                  className="btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải kịch bản từ file .md hoặc .txt"
                >
                  ⇧ Tải file .md
                </button>

                <button
                  className="btn purple"
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing}
                  title="Phân tích văn nói với AI"
                >
                  {isAnalyzing ? '⏳ Đang phân tích...' : '✦ Phân tích với AI'}
                </button>
              </div>
            </div>

            {/* Presets & Flow Bar */}
            <FlowBar
              currentFlow={currentFlow}
              onSwitchFlow={handleSwitchFlow}
              goldenSetFilter={goldenSetFilter}
              onFilterGoldenSet={handleFilterGoldenSet}
              passCount={goldenSetPassCount}
              totalGoldenCases={21}
              passRate={goldenSetPassRate}
              hasEvaluated={hasEvaluatedGoldenSet}
              isEvaluating={isEvaluatingGoldenSet}
              onRunEvaluation={handleRunGoldenSetEvaluation}
            />
          </div>

          {/* Script Toolbar */}
          <ScriptToolbar
            currentView="script"
            onChangeView={(v) => {
              if (v === 'video') setIsVideoPreviewOpen(true);
            }}
            onlyIssues={onlyIssues}
            onToggleOnlyIssues={setOnlyIssues}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddSentence={() => setIsAddSentenceOpen(true)}
          />

          {/* Script List */}
          <ScriptList
            sentences={filteredSentences}
            selectedId={selectedId}
            onSelectSentence={setSelectedId}
            decisions={decisions}
          />

          {/* Footer Bar */}
          <div className="footer">
            <span>
              {issueCount > 0
                ? `Đã phát hiện ${issueCount} vấn đề trong ${sentences.length} câu`
                : '✓ Không phát hiện vấn đề nào (Kiểm soát False Positive = 0%)'}
            </span>

            <span className="page">
              Tổng: <b>{sentences.length}</b> câu &nbsp; | &nbsp;
              <button
                className="on"
                onClick={() => {
                  if (sentences.length > 0) setSelectedId(sentences[0].id);
                }}
              >
                1
              </button>
              <button
                onClick={() => {
                  if (sentences.length > 1) setSelectedId(sentences[Math.min(sentences.length - 1, 4)].id);
                }}
              >
                2
              </button>
            </span>
          </div>
        </main>

        {/* Right Column: Review Detail Panel */}
        <div className="rightWrap">
          <ReviewDetailPanel
            sentence={selectedSentence}
            currentIndex={currentSentenceIdx || 1}
            totalCount={sentences.length}
            decision={decisions[selectedId]}
            onDecide={handleDecide}
            onManualEdit={() => setIsManualEditOpen(true)}
            onUndoDecision={handleUndoDecision}
            onToast={showToast}
            onDeleteSentence={handleDeleteSentence}
          />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        onSave={handleSaveApiKeys}
        initialKeys={apiKeys}
      />

      <ManualEditModal
        isOpen={isManualEditOpen}
        sentenceId={selectedId}
        initialText={selectedSentence?.suggest || selectedSentence?.text || ''}
        onSave={handleSaveManualEdit}
        onClose={() => setIsManualEditOpen(false)}
      />

      <VideoPreviewModal
        isOpen={isVideoPreviewOpen}
        scriptTitle={scriptTitle}
        sentences={sentences}
        onClose={() => setIsVideoPreviewOpen(false)}
        onToast={showToast}
      />

      <CompleteReviewModal
        isOpen={isCompleteOpen}
        scriptTitle={scriptTitle}
        sentences={sentences}
        decisions={decisions}
        auditTrail={auditTrail}
        onClose={() => setIsCompleteOpen(false)}
        onExport={handleExport}
      />

      <AddSentenceModal
        isOpen={isAddSentenceOpen}
        onAdd={handleAddSentence}
        onClose={() => setIsAddSentenceOpen(false)}
      />

      <UserInfoModal
        isOpen={isUserInfoOpen}
        onClose={() => setIsUserInfoOpen(false)}
      />

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
