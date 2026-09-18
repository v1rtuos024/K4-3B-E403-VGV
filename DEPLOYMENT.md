# 🚀 Hướng Dẫn Deploy Dự Án Lên Vercel & Render

Dự án VLearn Spoken-Script QA có kiến trúc hiện đại phân tách giữa **FastAPI Backend (Python)** và **Next.js Frontend (React/TypeScript)**. 

Phương án triển khai chuẩn công nghiệp, tối ưu tốc độ và **100% miễn phí**:
- 🌐 **Frontend (Next.js)** $\rightarrow$ Deploy lên **Vercel** (CDN toàn cầu, tốc độ tải cực nhanh, chứng chỉ SSL tự động).
- ⚙️ **Backend (FastAPI)** $\rightarrow$ Deploy lên **Render** (hỗ trợ Python 3.11, uvicorn, streaming âm thanh gTTS, REST API).

---

## 📌 Cách 1: Vercel (Frontend) + Render (Backend) — Khuyên Dùng Nhất ⭐

### BƯỚC 1: Deploy Backend lên Render (Lấy URL API trước)

1. Truy cập [Render Dashboard](https://dashboard.render.com/) và đăng nhập (bằng GitHub).
2. Bấm nút **New +** $\rightarrow$ chọn **Web Service**.
3. Chọn repository GitHub: `K4-3B-E403-VGV`.
4. Điền các thông tin cấu hình:
   - **Name:** `vlearn-spoken-qa-api` (hoặc tên tùy chọn)
   - **Region:** `Singapore` (để tốc độ về Việt Nam nhanh nhất)
   - **Branch:** `02889-NguyenThanhVinh` (hoặc branch bạn muốn deploy)
   - **Root Directory:** `codebase/backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. Thêm các biến môi trường tại mục **Environment Variables**:
   - `GEMINI_API_KEY`: *(dán API key của bạn)*
   - `GEMINI_MODEL`: `gemini-3.7-flash`
   - `PYTHON_VERSION`: `3.11.9`
6. Bấm **Create Web Service**. Chờ 1–2 phút để Render build xong.
7. Khi thành công, copy URL Backend của bạn (ví dụ: `https://vlearn-spoken-qa-api.onrender.com`).
   - Bạn có thể kiểm tra API bằng cách truy cập: `https://your-api-url.onrender.com/docs`.

---

### BƯỚC 2: Deploy Frontend lên Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và đăng nhập bằng GitHub.
2. Bấm **Add New...** $\rightarrow$ chọn **Project**.
3. Chọn repository `K4-3B-E403-VGV` và bấm **Import**.
4. Cấu hình dự án trên Vercel:
   - **Framework Preset:** `Next.js` (Vercel tự động nhận diện)
   - **Root Directory:** Bấm **Edit** $\rightarrow$ chọn thư mục `codebase/frontend`
5. Mục **Environment Variables**, thêm biến:
   - **Key:** `BACKEND_API_URL`
   - **Value:** `https://vlearn-spoken-qa-api.onrender.com` *(dán URL Render ở Bước 1 vào đây, không có dấu gạch chéo ở cuối)*
6. Bấm nút **Deploy**.
7. Chờ khoảng 30–45 giây, Vercel sẽ cấp cho bạn một domain trực tiếp (ví dụ: `https://vlearn-spoken-qa-frontend.vercel.app`)!

> **Tại sao không bị lỗi CORS?**  
> `next.config.js` đã được cấu hình tự động rewrite mọi request từ `/api/*` sang `BACKEND_API_URL`. Nhờ vậy trình duyệt không bao giờ gặp lỗi CORS hay Mixed Content.

---

## 📌 Cách 2: Deploy Toàn Bộ Lên Render (1-Click Blueprint)

Nếu bạn muốn quản lý cả Frontend và Backend trong cùng một trang Render:

1. Đẩy code lên GitHub (file `render.yaml` đã được tạo sẵn ở thư mục gốc).
2. Vào [Render Blueprints](https://dashboard.render.com/blueprints) $\rightarrow$ bấm **New Blueprint Instance**.
3. Chọn repo `K4-3B-E403-VGV`.
4. Render sẽ tự động đọc file `render.yaml` và tạo ra cả 2 service:
   - `vlearn-spoken-qa-api` (Backend Python)
   - `vlearn-spoken-qa-frontend` (Frontend Next.js)
5. Nhập giá trị cho `GEMINI_API_KEY` khi Render yêu cầu $\rightarrow$ Bấm **Apply**.
6. Render sẽ tự động liên kết URL giữa 2 service!

---

## 📌 Lưu Ý Quan Trọng Khi Dùng Free Tier

1. **Cơ chế Cold Start của Render Free Tier:**
   - Sau 15 phút không có lượt truy cập, service Render sẽ tạm "ngủ".
   - Lần gọi đầu tiên sau khi ngủ có thể mất ~30 giây để khởi động lại. Các lần gọi sau đó sẽ phản hồi tức thì (< 1 giây).
2. **Key Gemini AI:**
   - Đảm bảo biến `GEMINI_API_KEY` đã được thêm trên Render. Nếu chưa có key, hệ thống tự động chạy chế độ Mock Flow thông minh và vẫn hiển thị đầy đủ 4 đường trải nghiệm + 21 cases Golden Set.
