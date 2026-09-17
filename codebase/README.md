# VLearn Vietnamese Spoken-Script QA — Gemini Demo (4 Flows)

Giao diện nguyên bản đặc trưng của VLearn Lesson Studio (Track C Đề 2), tích hợp trọn vẹn **4 Đường Đi Trải Nghiệm** (Happy Path, Low-confidence, Failure/Safety, Correction/Audit) và gọi Gemini AI thật ở lõi.

---

## 1. Khởi Chạy Nhanh

Bạn có thể chạy bằng **Node.js** (khuyên dùng - không cần cài đặt thư viện) hoặc **Python**:

### Cách 1: Chạy bằng Node.js (Khuyên dùng, chạy ngay lập tức)
```powershell
cd codebase/vlearn_gemini_demo
node server.js
```
Mở trình duyệt: **`http://127.0.0.1:5000`**

### Cách 2: Chạy bằng Python Flask
```powershell
cd codebase/vlearn_gemini_demo
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py server.py
```
Mở trình duyệt: **`http://127.0.0.1:5000`**

---

## 2. Thử 4 Đường Đi Trải Nghiệm Trên Giao Diện VLearn

Ngay dưới tên kịch bản trên giao diện VLearn, bạn sẽ thấy thanh nút chọn nhanh:

1. **1. Happy Path:**
   - Kịch bản D1 mẫu (8 câu): Có câu quá dài đứt hơi (đỏ), thuật ngữ tiếng Anh (vàng), câu sượng (xanh), câu dịch (tím).
   - Bấm vào từng câu để xem lý do và gợi ý sửa tối thiểu.
   - Bấm **🔊 Nghe thử (TTS)** để nghe Web Speech API đọc câu gốc và câu gợi ý sửa.
   - Bấm **✓ Chấp nhận gợi ý** để cập nhật kịch bản (đổi sang màu xanh lá).

2. **2. Low-confidence (Mơ hồ):**
   - Kịch bản câu thoại có đại từ không rõ ràng (*"nó sẽ báo lỗi cho họ"*).
   - AI hiển thị thẻ màu vàng **Cần xác minh** kèm ghi chú cảnh báo: AI không đoán mò, yêu cầu biên tập viên chọn đối tượng cụ thể.

3. **3. Failure & Safety:**
   - Kịch bản chứa khẳng định thiếu căn cứ (*"hầu hết mọi lập trình viên..."*) và yêu cầu ngoài phạm vi (*"viết lại theo phong cách kiếm hiệp"*).
   - Hệ thống hiển thị hộp cảnh báo: **Tuyệt đối không tự bịa số liệu** và **Từ chối viết lại toàn bộ kịch bản**.

4. **4. Correction (Sửa tay & Audit):**
   - Biên tập viên bấm **✓ Chấp nhận gợi ý**, **Giữ nguyên** hoặc bấm **✎ Sửa tay** để tự gõ câu sửa.
   - Bấm nút **⇧ Export** ở thanh trên cùng để xuất báo cáo Markdown hoàn chỉnh kèm bảng Audit Trail.

5. **5. Kịch bản sạch (False Positive Test):**
   - Kịch bản chuẩn do giảng viên viết, hệ thống hiển thị **0 lỗi (False Positive = 0%)**.

---

## 3. Cấu Hình Gemini AI Thật
Để kích hoạt gọi AI thật khi bấm **✦ Phân tích với AI**, tạo file `.env` trong thư mục `vlearn_gemini_demo/` (hoặc thư mục gốc repo):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```
*(Nếu chưa có API key, hệ thống tự động chạy chế độ Mock Flow thông minh mà không bị lỗi).*
