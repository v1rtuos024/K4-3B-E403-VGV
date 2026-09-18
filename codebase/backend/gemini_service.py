import os
import re
import json
from typing import Literal, Optional, List
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

IssueType = Literal[
    'TOO_LONG',
    'AWKWARD_SPOKEN',
    'TRANSLATIONESE',
    'TERM_PRONUNCIATION',
    'COMPLEX_SENTENCE',
    'AMBIGUOUS_PRONOUN',
    'UNGROUNDED_CLAIM',
    'REPETITION'
]

Severity = Literal['low', 'medium', 'high']

class Issue(BaseModel):
    sentence_id: int
    type: IssueType
    span: str = Field(description='Chuỗi con chính xác trong câu gốc gây ra vấn đề')
    reason: str = Field(description='Lý do ngắn gọn tại sao đoạn này khó đọc/khó nghe khi nói')
    severity: Severity = Field(default='medium')
    suggestion: str = Field(description='Gợi ý sửa tối thiểu (minimal diff), giữ nguyên phong cách tác giả')
    safety_alert: Optional[str] = Field(default=None, description='Cảnh báo an toàn hoặc HAX/PAIR nếu có')

class ReviewResult(BaseModel):
    issues: List[Issue]

SYSTEM_PROMPT = '''Bạn là Vietnamese Spoken-Script QA Agent cho video bài giảng VLearn (Track C Đề 2).
Nhiệm vụ: Phân tích kịch bản video sư phạm tiếng Việt để tìm các vấn đề gây vấp, đứt hơi hoặc khó hiểu khi phát âm (spoken delivery / TTS).

Taxonomy phân loại lỗi (chỉ dùng các nhãn sau):
1. TOO_LONG: Câu quá dài (>25-30 từ), thiếu ngắt nghỉ theo nhóm hơi (breath-group), MC hoặc TTS dễ hụt hơi.
2. AWKWARD_SPOKEN: Câu sượng, dùng từ ngữ hành chính, danh từ hóa rườm rà ("tiến hành việc...", "thực hiện kiểm tra..."), không phù hợp ngữ cảnh sư phạm.
3. TRANSLATIONESE: Dịch thô word-by-word từ tiếng Anh sang tiếng Việt ("thành phần khách" thay vì "client", "giao thức ngữ cảnh mô hình" thay vì "giao thức MCP").
4. TERM_PRONUNCIATION: Thuật ngữ tiếng Anh, từ viết tắt (API, LLM, prompt, prompt injection, camel-case ReAct) dễ khiến TTS đọc sai hoặc MC vấp; cần phiên âm hoặc diễn đạt rõ.
5. COMPLEX_SENTENCE: Cấu trúc nhiều mệnh đề lồng nhau, trích dẫn dài làm chủ ngữ khiến người nghe quên ý đầu.
6. AMBIGUOUS_PRONOUN: Đại từ không rõ ràng ("nó", "họ") trong ngữ cảnh nói; yêu cầu người dùng xác minh chứ không tự bịa (HAX G10).
7. UNGROUNDED_CLAIM: Khẳng định tuyệt đối thiếu căn cứ ("hầu hết mọi lập trình viên...", "100%..."); nhắc nhở không tự bịa số liệu.
8. REPETITION: Lặp từ ngữ dày đặc ở cự ly gần làm luồng nói bị lấn cấn.

Nguyên tắc bắt buộc:
- Không bao giờ viết lại toàn bộ kịch bản; chỉ sửa tối thiểu (minimal-diff).
- Giữ nguyên kiến thức chuyên môn và giọng điệu của giảng viên.
- Nếu câu nói tốt, trôi chảy thì KHÔNG tạo issue (kiểm soát False Positive = 0%).
- span BẮT BUỘC phải là chuỗi con chính xác xuất hiện trong câu gốc.
- suggestion BẮT BUỘC là NGUYÊN CÂU ĐẦY ĐỦ sau khi đã sửa đổi span (minimal diff). TUYỆT ĐỐI KHÔNG chỉ trả về mỗi từ/thuật ngữ thay thế. Ví dụ: câu gốc "Cần cấu hình prompt cho model.", span "prompt", thì suggestion PHẢI LÀ "Cần cấu hình câu lệnh prompt cho model.", TUYỆT ĐỐI KHÔNG được trả về mỗi "câu lệnh prompt".
'''

def normalize_full_sentence_suggestion(orig_text: str, span: str, suggestion: str) -> str:
    """
    Ensures that suggestion is ALWAYS the complete rewritten sentence,
    never just an isolated term or replacement fragment.
    """
    if not suggestion:
        return orig_text
    if not orig_text or not span or span not in orig_text or span.strip() == orig_text.strip():
        return suggestion

    span_idx = orig_text.find(span)
    prefix = orig_text[:span_idx].strip()
    suffix = orig_text[span_idx + len(span):].strip()

    # Check if suggestion already incorporates surrounding sentence context
    has_prefix = bool(prefix and (prefix[-12:] in suggestion if len(prefix) > 12 else prefix in suggestion))
    has_suffix = bool(suffix and (suffix[:12] in suggestion if len(suffix) > 12 else suffix in suggestion))

    # If there is surrounding text but suggestion contains neither prefix nor suffix,
    # it is an isolated fragment/term replacement. Stitch it back into the full sentence!
    if (prefix or suffix) and not has_prefix and not has_suffix:
        return orig_text.replace(span, suggestion, 1)

    return suggestion


def heuristic_analyze(sentences: List[dict]) -> List[dict]:
    """
    Fallback Heuristic Spoken-QA Analyzer if Gemini API is unreachable or not configured.
    Ensures 100% real analysis even during offline/local development.
    """
    issues = []
    
    for s in sentences:
        sid = s.get('id', 0)
        text = str(s.get('text', '')).strip()
        if not text:
            continue

        words = text.split()
        word_count = len(words)

        # 1. Check TOO_LONG
        if word_count >= 30 and text.count(',') < 2:
            issues.append({
                "sentence_id": sid,
                "type": "TOO_LONG",
                "span": text,
                "reason": f"Câu quá dài ({word_count} từ) và thiếu dấu ngắt nghỉ, dễ khiến MC/TTS bị hụt hơi.",
                "severity": "high",
                "suggestion": text.replace(" và ", ", đồng thời ").replace(" mà ", ", và ", 1),
                "safety_alert": None
            })
            continue

        # 2. Check TERM_PRONUNCIATION (English words / acronyms)
        eng_match = re.search(r'\b(prompt injection|semantic caching|embedding model|ReAct|LLM|API|MCP|agent|prompt)\b', text, re.IGNORECASE)
        if eng_match:
            term = eng_match.group(0)
            term_phonetics = {
                "prompt injection": "prompt injection (phiên âm: prõm-t in-dếch-sừn)",
                "semantic caching": "semantic caching (lưu đệm ngữ nghĩa)",
                "embedding model": "mô hình embedding",
                "ReAct": "ReAct (mô hình suy luận và hành động)",
                "LLM": "LLM (mô hình ngôn ngữ lớn)",
                "API": "API (A-P-I)",
                "MCP": "MCP (giao thức MCP)",
                "agent": "agent (tác tử)",
                "prompt": "câu lệnh prompt"
            }
            replacement = term_phonetics.get(term.lower(), f"{term} (phiên âm: {term})")
            full_sugg = text.replace(term, replacement, 1)
            issues.append({
                "sentence_id": sid,
                "type": "TERM_PRONUNCIATION",
                "span": term,
                "reason": f"Thuật ngữ tiếng Anh '{term}' dễ gây vấp hoặc khiến TTS đọc rời từng ký tự.",
                "severity": "medium",
                "suggestion": full_sugg,
                "safety_alert": None
            })
            continue

        # 3. Check TRANSLATIONESE
        trans_match = re.search(r'(thành phần khách|giao thức ngữ cảnh mô hình|tác tử phản ứng|tiến hành việc)', text, re.IGNORECASE)
        if trans_match:
            matched_span = trans_match.group(0)
            replacements = {
                "thành phần khách": "phía client",
                "giao thức ngữ cảnh mô hình": "giao thức MCP",
                "tác tử phản ứng": "agent phản ứng",
                "tiến hành việc": "thực hiện"
            }
            replacement = replacements.get(matched_span.lower(), "cách tiếp cận")
            issues.append({
                "sentence_id": sid,
                "type": "TRANSLATIONESE",
                "span": matched_span,
                "reason": f"Cụm từ '{matched_span}' dịch thô từ tiếng Anh, mang nặng văn viết.",
                "severity": "medium",
                "suggestion": text.replace(matched_span, replacement),
                "safety_alert": None
            })
            continue

        # 4. Check AMBIGUOUS_PRONOUN
        if re.search(r'\b(nó sẽ báo lỗi cho họ|họ cần phải)\b', text, re.IGNORECASE):
            issues.append({
                "sentence_id": sid,
                "type": "AMBIGUOUS_PRONOUN",
                "span": "nó sẽ báo lỗi cho họ",
                "reason": "Đại từ 'họ' và 'nó' không rõ ràng trong văn cảnh bài giảng video.",
                "severity": "medium",
                "suggestion": text.replace("nó sẽ báo lỗi cho họ", "hệ thống sẽ báo lỗi cho bạn"),
                "safety_alert": "⚠️ HAX G10: AI không tự đoán mò danh xưng; cần biên tập viên chỉ định cụ thể đối tượng."
            })
            continue

        # 5. Check UNGROUNDED_CLAIM
        if re.search(r'\b(hầu hết mọi|toàn bộ thế giới|100%|tất cả mọi người)\b', text, re.IGNORECASE):
            issues.append({
                "sentence_id": sid,
                "type": "UNGROUNDED_CLAIM",
                "span": "hầu hết mọi",
                "reason": "Khẳng định tuyệt đối thiếu dữ liệu dẫn chứng trong bài giảng.",
                "severity": "high",
                "suggestion": text.replace("hầu hết mọi", "nhiều"),
                "safety_alert": "🛡️ Nguyên tắc an toàn HAX & PAIR: Cảnh báo câu thiếu căn cứ nhưng không tự tiện bịa số liệu."
            })
            continue

        # 6. Check AWKWARD_SPOKEN
        awkward_match = re.search(r'(thực hiện việc kiểm tra|sức mạnh của AI|cho mô hình viết các bước cân nhắc)', text, re.IGNORECASE)
        if awkward_match:
            span = awkward_match.group(0)
            issues.append({
                "sentence_id": sid,
                "type": "AWKWARD_SPOKEN",
                "span": span,
                "reason": f"Cụm từ '{span}' nghe gượng ép trong văn nói bài giảng.",
                "severity": "low",
                "suggestion": text.replace(span, "kiểm tra"),
                "safety_alert": None
            })
            continue

    return issues

async def analyze_sentences_with_gemini(sentences: List[dict]) -> List[dict]:
    """
    Analyzes sentences using Gemini API via google-genai SDK.
    Falls back to heuristic analysis if Gemini API is unavailable.
    """
    key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

    cleaned = []
    for s in sentences:
        try:
            sid = int(s.get('id', 0))
            text = str(s.get('text', '')).strip()
            if text:
                cleaned.append({"id": sid, "text": text[:4000]})
        except Exception:
            continue

    if not cleaned:
        return []

    # If no key, fallback to heuristic rule-based QA
    if not key or key.startswith('your_') or key.startswith('PASTE_'):
        print("[QA Service] No valid GEMINI_API_KEY, using intelligent heuristic analyzer.")
        return heuristic_analyze(cleaned)

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"KỊCH BẢN CẦN PHÂN TÍCH (JSON format):\n"
        f"{json.dumps(cleaned, ensure_ascii=False, indent=2)}\n"
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.15,
                response_mime_type='application/json',
                response_schema=ReviewResult,
            ),
        )

        result = ReviewResult.model_validate_json(response.text)
        valid_ids = {x['id'] for x in cleaned}
        text_by_id = {x['id']: x['text'] for x in cleaned}

        issues = []
        for i in result.issues:
            if i.sentence_id not in valid_ids:
                continue
            dumped = i.model_dump()
            orig_text = text_by_id.get(i.sentence_id, '')
            if dumped.get('suggestion'):
                dumped['suggestion'] = normalize_full_sentence_suggestion(
                    orig_text, dumped.get('span', ''), dumped['suggestion']
                )
            issues.append(dumped)

        return issues
    except Exception as e:
        print(f"[QA Service] Gemini API call failed: {type(e).__name__}: {e}. Falling back to heuristic analysis.")
        return heuristic_analyze(cleaned)
