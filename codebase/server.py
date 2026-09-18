import os
from typing import Literal
from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()
app = Flask(__name__, static_folder='.')

IssueType = Literal['TOO_LONG','AWKWARD_SPOKEN','TRANSLATIONESE','TERM_PRONUNCIATION','COMPLEX_SENTENCE']
Severity = Literal['low','medium','high']

class Issue(BaseModel):
    sentence_id: int
    type: IssueType
    span: str = Field(description='Exact problematic substring copied from the sentence')
    reason: str
    severity: Severity
    suggestion: str = Field(description='Minimal-diff rewrite; preserve meaning and author voice')

class ReviewResult(BaseModel):
    issues: list[Issue]

SYSTEM = '''Bạn là Vietnamese Spoken-Script QA Agent cho video bài giảng VLearn.
Phân tích văn bản để tìm vấn đề khiến câu khó/nặng khi đọc thành lời.
Chỉ dùng 5 nhãn: TOO_LONG, AWKWARD_SPOKEN, TRANSLATIONESE, TERM_PRONUNCIATION, COMPLEX_SENTENCE.
Nguyên tắc: không rewrite toàn bộ; không thêm/thay đổi kiến thức chuyên môn; chỉ sửa tối thiểu; nếu câu ổn thì không tạo issue; span phải là chuỗi con chính xác của câu gốc; ưu tiên lỗi thực sự ảnh hưởng spoken delivery/TTS. Một câu có thể có nhiều lỗi nếu thật sự cần.'''

@app.get('/')
def index():
    return send_from_directory('.', 'index.html')

@app.post('/api/review')
def review():
    key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not key:
        return jsonify(error='Thiếu GEMINI_API_KEY. Hãy tạo file .env từ .env.example.'), 500
    payload = request.get_json(silent=True) or {}
    sentences = payload.get('sentences') or []
    if not sentences or len(sentences) > 100:
        return jsonify(error='Cần 1–100 câu để phân tích.'), 400
    cleaned=[]
    for s in sentences:
        try: sid=int(s['id']); text=str(s['text']).strip()
        except Exception: continue
        if text: cleaned.append({'id':sid,'text':text[:4000]})
    prompt = SYSTEM + '\n\nKỊCH BẢN JSON:\n' + __import__('json').dumps(cleaned, ensure_ascii=False)
    try:
        client = genai.Client(api_key=key)
        model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
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
        valid_ids={x['id'] for x in cleaned}; text_by_id={x['id']:x['text'] for x in cleaned}
        issues=[]
        for i in result.issues:
            if i.sentence_id not in valid_ids: continue
            if i.span and i.span not in text_by_id[i.sentence_id]: continue
            issues.append(i.model_dump())
        return jsonify(issues=issues, model=os.getenv('GEMINI_MODEL','gemini-2.5-flash'))
    except Exception as e:
        app.logger.exception('Gemini call failed')
        return jsonify(error=f'Gemini call thất bại: {type(e).__name__}: {e}'), 502

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.getenv('PORT','5000')), debug=True)
