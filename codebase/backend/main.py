import os
import io
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, PlainTextResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from presets import PRESETS
from ai_service import analyze_sentences_multi_provider, AVAILABLE_PROVIDERS
from golden_eval import evaluate_golden_set
from tts_service import generate_vietnamese_audio, generate_comparison_audio
from parser_service import parse_script_content

load_dotenv()

app = FastAPI(
    title="VLearn Spoken-Script QA API",
    description="FastAPI Backend cho hệ thống rà soát kịch bản bài giảng tiếng Việt (Track C Đề 2) hỗ trợ Gemini, Groq, OpenRouter",
    version="2.1.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SentenceInput(BaseModel):
    id: int
    text: str

class GoldenEvalRequest(BaseModel):
    provider: Optional[str] = "gemini"
    model: Optional[str] = None
    custom_api_key: Optional[str] = None

class ReviewRequest(BaseModel):
    sentences: List[SentenceInput]
    provider: Optional[str] = "gemini"  # "gemini" | "groq" | "openrouter"
    model: Optional[str] = None
    custom_api_key: Optional[str] = None

class TTSRequest(BaseModel):
    text: Optional[str] = None
    original: Optional[str] = None
    suggested: Optional[str] = None
    mode: str = "single"  # "single" or "compare"

class ParseRequest(BaseModel):
    content: str

class AuditItem(BaseModel):
    id: int
    type: Optional[str] = ""
    original: str
    final: str
    decision: str

class ExportRequest(BaseModel):
    title: str
    reviewer: Optional[str] = "Đặng Vinh (Studio Team)"
    sentences: List[SentenceInput]
    auditTrail: List[AuditItem]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VLearn Spoken-Script QA Backend",
        "version": "2.1.0",
        "supported_providers": list(AVAILABLE_PROVIDERS.keys())
    }

@app.get("/api/providers")
def get_providers():
    """Returns list of supported AI providers (Gemini, Groq, OpenRouter Free) and their models."""
    return {"providers": AVAILABLE_PROVIDERS}

@app.get("/api/presets")
def list_presets():
    """Returns summary of all available preset experience paths."""
    summaries = []
    for pid, p in PRESETS.items():
        summaries.append({
            "id": pid,
            "title": p["title"],
            "meta": p["meta"],
            "description": p.get("description", ""),
            "count": len(p["sentences"])
        })
    return {"presets": summaries}

@app.get("/api/presets/{preset_id}")
def get_preset(preset_id: int):
    """Retrieves full preset data by ID (1 to 6)."""
    if preset_id not in PRESETS:
        raise HTTPException(status_code=404, detail=f"Preset {preset_id} không tồn tại.")
    return PRESETS[preset_id]

@app.post("/api/golden-set/evaluate")
async def evaluate_golden_set_api(req: GoldenEvalRequest):
    """
    Evaluates 21 Golden Set test cases on demand when user clicks Evaluate.
    """
    try:
        result = await evaluate_golden_set(
            provider=req.provider or "gemini",
            model=req.model,
            custom_api_key=req.custom_api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi đánh giá Golden Set: {str(e)}")

@app.post("/api/review")
async def review_script(req: ReviewRequest):
    """
    Analyzes script sentences using the chosen AI provider (Gemini, Groq, OpenRouter).
    Returns detected spoken delivery issues with reasons, minimal-diff suggestions, and safety alerts.
    """
    if not req.sentences:
        raise HTTPException(status_code=400, detail="Danh sách câu kịch bản không được rỗng.")
    if len(req.sentences) > 150:
        raise HTTPException(status_code=400, detail="Số câu vượt quá giới hạn (tối đa 150 câu).")

    sentences_dict = [{"id": s.id, "text": s.text} for s in req.sentences]
    
    result = await analyze_sentences_multi_provider(
        sentences=sentences_dict,
        provider=req.provider or "gemini",
        model=req.model,
        custom_api_key=req.custom_api_key
    )

    return result

@app.post("/api/tts")
def stream_tts(req: TTSRequest):
    """
    Streams authentic Vietnamese speech audio (MP3).
    Supports single sentence speech or before/after comparison mode.
    """
    try:
        if req.mode == "compare" and req.original and req.suggested:
            audio_fp = generate_comparison_audio(req.original, req.suggested)
        else:
            text = req.text or req.original or "Không có nội dung để đọc."
            audio_fp = generate_vietnamese_audio(text)

        return StreamingResponse(
            audio_fp,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=vietnamese_tts.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo giọng đọc tiếng Việt: {str(e)}")

@app.post("/api/parse-script")
def parse_script_text(req: ParseRequest):
    """Parses raw text or markdown into a structured sentence list."""
    sentences = parse_script_content(req.content)
    return {"sentences": sentences, "count": len(sentences)}

@app.post("/api/upload-script")
async def upload_script_file(file: UploadFile = File(...)):
    """Uploads a .md or .txt script file and parses it into sentences."""
    content = await file.read()
    decoded = content.decode("utf-8", errors="replace")
    sentences = parse_script_content(decoded)
    return {
        "filename": file.filename,
        "sentences": sentences,
        "count": len(sentences)
    }

@app.post("/api/export")
def export_report(req: ExportRequest):
    """Generates an audit report markdown document."""
    from datetime import datetime
    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    md = f"# BÁO CÁO NGHIỆM THU KỊCH BẢN — VLEARN SPOKEN-SCRIPT QA\n\n"
    md += f"- **Kịch bản:** {req.title}\n"
    md += f"- **Thời gian nghiệm thu:** {now_str}\n"
    md += f"- **Biên tập viên:** {req.reviewer}\n"
    md += f"- **Hệ thống thẩm duyệt:** VLearn Spoken-Script QA Agent (Track C Đề 2 - Multi-Provider Engine)\n\n"
    
    md += f"## 1. Kịch Bản Hoàn Chỉnh Sau Khi Duyệt (Clean Spoken Script)\n\n"
    for s in req.sentences:
        md += f"{s.id}. {s.text}\n\n"

    md += f"## 2. Nhật Ký Duyệt & Kiểm Tra (Audit Trail)\n\n"
    md += f"| Câu | Loại vấn đề | Quyết định | Nội dung câu chốt |\n"
    md += f"|---|---|---|---|\n"
    if not req.auditTrail:
        md += f"| - | - | Giữ nguyên kịch bản gốc | Không có thay đổi chỉnh sửa |\n"
    else:
        for a in req.auditTrail:
            md += f"| Câu {a.id} | {a.type or 'Không phân loại'} | **{a.decision}** | \"{a.final}\" |\n"

    return PlainTextResponse(content=md, media_type="text/markdown")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=False)
