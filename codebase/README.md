# 🎓 VLearn Vietnamese Spoken-Script QA Studio (FastAPI + Next.js)

Hệ thống AI hỗ trợ rà soát và biên tập kịch bản video bài giảng tiếng Việt (Track C Đề 2), kiến trúc phân tách hiện đại: **FastAPI Backend (Python)** và **Next.js Component Frontend (React/TypeScript)**.

---

## 🌟 Điểm Nổi Bật

1. **Flow Thật**:
   - Tải file kịch bản `.md` hoặc `.txt` bất kỳ từ máy tính hoặc tự gõ thêm câu trực tiếp.
   - Bấm **✦ Phân tích với AI** để gọi Gemini AI lõi phân tích từng câu theo thời gian thực (real-time).
   - Tự động gắn nhãn lỗi theo Taxonomy: `TOO_LONG`, `AWKWARD_SPOKEN`, `TRANSLATIONESE`, `TERM_PRONUNCIATION`, `COMPLEX_SENTENCE`, `AMBIGUOUS_PRONOUN`, `UNGROUNDED_CLAIM`.
   - Cung cấp lý do sư phạm và gợi ý sửa tối thiểu (*minimal diff*).

2. **Text to Speech (TTS) Tiếng Việt Chuẩn**:
   - Khắc phục hoàn toàn tình trạng phát âm tiếng Anh: Tích hợp engine phát âm tiếng Việt chuẩn đa tầng (Backend `gTTS` streaming MP3 + Trình duyệt Web Speech API `vi-VN`).
   - Bấm **🔊 Nghe thử (TTS)** để nghe máy đọc so sánh: *"Trước khi sửa: ..."* và *"Sau khi sửa: ..."*.
   - Cho phép nghe riêng từng câu gốc hoặc câu gợi ý sửa.

3. **Thành phần chính**:
   - **Top Nav**: `⇧ Export` (xuất file báo cáo Markdown có Audit Trail), `✓ Hoàn tất duyệt` (modal tổng kết nghiệm thu), avatar người dùng.
   - **Sidebar**: Chuyển đổi linh hoạt giữa các màn hình Trang chủ, Lesson Studio, Rà soát kịch bản, Thư viện, Dự án, Báo cáo.
   - **Flow Bar**: Nạp nhanh 6 preset (Happy Path, Low-confidence, Safety, Correction, Clean, và bộ 21 cases Golden Set Eval).
   - **Script Toolbar**: `☷ Kịch bản`, `▻ Chế độ xem video (preview)` (Teleprompter chạy chữ), `＋ Thêm câu`, Checkbox `Chỉ hiển thị câu có lỗi`, ô tìm kiếm.
   - **Detail Panel**: `✓ Chấp nhận gợi ý` (cập nhật kịch bản sang màu xanh lá), `Giữ nguyên`, `✎ Sửa tay` (mở popup gõ trực tiếp), `↩ Khôi phục câu gốc`.

---

## 🚀 Khởi Chạy Nhanh

### Cách 1: Chạy 1 click (Khuyên dùng)
Double-click file **`start_all.bat`** (hoặc chạy file PowerShell **`start_all.ps1`**):
```powershell
.\codebase\start_all.ps1
```
Trình duyệt sẽ mở tại: **`http://localhost:3000`**

---

### Cách 2: Chạy thủ công từng phần

#### Bước 1: Khởi chạy FastAPI Backend (Port 8000)
```powershell
cd codebase/backend
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI): **`http://127.0.0.1:8000/docs`**

#### Bước 2: Khởi chạy Next.js Frontend (Port 3000)
```powershell
cd codebase/frontend
npm install
npm run dev
```
Mở giao diện người dùng: **`http://localhost:3000`**

---

## 📁 Cấu Trúc Dự Án

```
codebase/
├── backend/                       # FastAPI Backend
│   ├── main.py                    # REST API: /api/review, /api/tts, /api/presets, /api/export
│   ├── gemini_service.py          # Gemini AI QA analysis + Heuristic Fallback
│   ├── tts_service.py             # Vietnamese TTS audio streamer (gTTS)
│   ├── parser_service.py          # Markdown/Text script sentence extractor
│   ├── presets.py                 # Dữ liệu 6 kịch bản mẫu & 21 cases Golden Set
│   └── requirements.txt           # fastapi, uvicorn, google-genai, gTTS, pydantic
│
├── frontend/                      # Next.js Application (React + TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Main VLearn Studio Dashboard
│   │   │   ├── layout.tsx         # Global layout & metadata
│   │   │   └── globals.css        # Chuẩn giao diện nguyên bản VLearn
│   │   ├── components/
│   │   │   ├── TopNav.tsx         # Thanh tiêu đề, Export, Hoàn tất duyệt
│   │   │   ├── Sidebar.tsx        # Menu chức năng Studio bên trái
│   │   │   ├── FlowBar.tsx        # Dải chọn 6 Preset & Golden Set Dashboard
│   │   │   ├── ScriptToolbar.tsx  # Toolbar: Kịch bản, Teleprompter, Tìm kiếm, Thêm câu
│   │   │   ├── ScriptList.tsx     # Danh sách câu, highlight lỗi, badge trạng thái
│   │   │   ├── ReviewDetailPanel.tsx # Góp ý AI, lý do, gợi ý sửa, quyết định duyệt
│   │   │   ├── TTSPlayer.tsx      # Engine phát âm tiếng Việt chuẩn (Câu gốc vs Sửa)
│   │   │   ├── VideoPreviewModal.tsx # Trình đọc Teleprompter & Video Preview
│   │   │   ├── ManualEditModal.tsx# Hộp thoại chỉnh sửa thủ công
│   │   │   ├── CompleteReviewModal.tsx # Tổng kết nghiệm thu kịch bản
│   │   │   ├── AddSentenceModal.tsx # Hộp thoại thêm câu mới
│   │   │   ├── UserInfoModal.tsx  # Thông tin hệ thống & biên tập viên
│   │   │   └── Toast.tsx          # Thông báo tương tác thời gian thực
│   │   └── types/
│   │       └── index.ts           # Type definitions
│   └── package.json
│
├── start_all.bat                  # Script khởi chạy Windows 1-click
└── start_all.ps1                  # Script PowerShell khởi chạy tự động
```

---

## 🔑 Cấu Hình API Key (Tùy Chọn)
File `.env` nằm tại thư mục `backend/.env` (và `codebase/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
PORT=8000
```
*(Nếu chưa cấu hình API key, hệ thống tích hợp sẵn Bộ phân tích Heuristic Spoken-QA thông minh để đảm bảo mọi luồng hoạt động mượt mà 100%).*
