# AI SPEC — Vietnamese Spoken-Script QA (Agent Review Kịch Bản Video Bài Giảng) · Nhóm VGV · Phòng E403 (Lớp 3B)

**Hướng:** [ ] A — VLearn &nbsp;&nbsp; [ ] B — Trợ lý Discord &nbsp;&nbsp; [x] C — Lesson Studio &nbsp;&nbsp; [ ] D — Adaptive &nbsp;&nbsp; [ ] E — Làn mở  
**Loại:** [ ] Tối ưu tính năng có sẵn &nbsp;&nbsp; [x] Tính năng mới

---

## §1. User & Job

### 1.1 Job Executor + Workflow
- **Job executor:** Biên tập viên nội dung (script editor) / người viết kịch bản video VLearn, hoặc Giảng viên / Lab Coach phụ trách nghiệm thu kịch bản bài giảng trước khi chuyển qua khâu sản xuất media.
- **Workflow hiện tại:**
  ```
  [1. Nhận tài liệu thô] 
         ↓
  [2. Soạn kịch bản nháp ~40 câu] 
         ↓
  [3. Đọc nhẩm / đọc to rà soát thủ công từng câu] ← [ĐIỂM NGHẼN: 45–60 phút, mỏi mắt, dễ sót câu sượng]
         ↓
  [4. Thu âm giọng đọc (MC/TTS)] 
         ↓
  [5. Dựng hình Motion Graphic khớp theo audio] 
         ↓
  [6. Phát hành video / Khắc phục sự cố nếu câu thoại bị vấp]
  ```

### 1.2 Core JTBD (Job-to-be-Done)
> *"Rà soát và chuẩn hoá câu từ kịch bản bài giảng tiếng Việt trước khi thu âm để người đọc đọc trôi chảy, tự nhiên và không phải thu lại sau khi dựng video."*
- **Job Story:** Khi duyệt kịch bản bài giảng giáo dục để đưa vào sản xuất video, tôi muốn phát hiện chính xác các câu văn nói bị sượng, cấu trúc câu dịch, câu quá dài gây đứt hơi và các thuật ngữ khó đọc, để tôi có thể sửa nhanh chóng trước khi thu âm mà không phải viết lại toàn bộ kịch bản.

### 1.3 Problem Statement (Không chữ AI)
Khi biên tập kịch bản video bài giảng giáo dục, người biên tập phải đọc nhẩm và đọc to thủ công từng câu vì không có công cụ phát hiện lỗi văn nói chuyên biệt; việc rà soát thủ công tốn 45–60 phút cho mỗi kịch bản 40 câu mà vẫn dễ bỏ sót câu sượng hoặc câu quá dài, dẫn đến việc khi video đã dựng xong mới phát hiện lỗi thì phải thu lại âm thanh của cả 3 câu liền kề và dựng lại toàn bộ cảnh tương ứng, gây lãng phí thời gian và ngân sách sản xuất.

### 1.4 Evidence (Bằng chứng đạt chuẩn Track C)

#### A. Phỏng vấn Mom Test chuyên sâu (n = 3 người chuyên môn Studio & Lab Coach):
- **Đối tượng phỏng vấn:** 1 Biên tập viên Studio VLearn, 1 Lab Coach phụ trách duyệt bài giảng AI20k, 1 Content Creator chuyên sản xuất video bài giảng ngắn.
- **Tỷ lệ xác nhận:** **3/3 người (100%)** xác nhận khâu rà soát kịch bản văn nói hoàn toàn làm thủ công, ngốn 45–60 phút/kịch bản 40 câu và luôn tiềm ẩn rủi ro sót lỗi.
- **Hậu quả chi phí:** Cả 3 người đều từng nếm trải cảm giác video dựng xong bị phản hồi là "giọng đọc ngang, vấp" và phải làm lại rất cực.

#### B. Mining dữ liệu thực tế từ Repo (`data/studio-pack/` & `data/vlearn-pack/`):
- **Dữ liệu phân tích:** Kịch bản mẫu thật `data/studio-pack/c5-feedbackradar/video-mau/kich-ban-d1.md` (39 câu lời thoại, 3.637 ký tự):
  - **8/39 câu (20.5%)** có độ dài vượt quá 28 từ/câu — vượt ngưỡng breath-group tối ưu cho văn nói tiếng Việt (20–25 từ), gây khó khăn khi đọc liền mạch.
  - **5 cụm** acronym/code-switch tiếng Anh (`AI`, `LLM`, `prompt`, `API`, `token`) chưa có chỉ dẫn phát âm cho Voice talent hoặc TTS.
- **Quy luật chi phí Studio** (`data/studio-pack/c5-feedbackradar/bang-chi-phi-lam-lai.md`): Khi sửa 1 câu lời đọc, phải thu lại 3 câu (ảnh hưởng dây chuyền N-1, N, N+1 do ngữ cảnh âm điệu) và render lại cảnh tương ứng.

#### C. ≥5 Quote và ví dụ nguyên văn có nguồn:
1. *"Nhiều câu lúc viết nhìn rất trí thức, nhưng thu âm MC vấp liên tục vì dài hơn 30 từ không có dấu phẩy ngắt nhịp. Có câu dịch từ tài liệu nước ngoài như 'tiến hành việc thực hiện tối ưu' nghe cực kỳ giả tạo."* — *(Biên tập viên Studio VLearn, Log phỏng vấn Mom Test 17/9)*
2. *"Duyệt kịch bản AI sinh sợ nhất là nó lặp từ và câu văn không tự nhiên. Nhưng kêu nó sửa thì nó viết lại toàn bộ kịch bản, đảo lộn hết thuật ngữ chuẩn mình đã chốt."* — *(Lab Coach VLearn, Log phỏng vấn Mom Test 17/9)*
3. *"Mỗi lần kịch bản lọt một câu sai nhịp, bên thu âm phải đọc lại, kéo theo bên dựng phải cắt dựng lại cả đoạn 15–20 giây, trễ deadline giao bài cả ngày."* — *(Biên tập viên âm thanh/Dựng phim Studio, Log phỏng vấn Mom Test 17/9)*
4. *"Bên trong bộ lọc, phần tính toán đã học từ các ví dụ ấy được gọi là mô hình học máy."* — *(`data/studio-pack/c5-feedbackradar/video-mau/kich-ban-d1.md`, Câu 10 — cấu trúc câu dài, lặp đại từ chỉ định "ấy", cấu trúc bị động gượng gạo khi nói).*
5. *"Một công cụ đánh dấu thư nào có thể là thư rác, còn một trợ lý viết giúp bạn lời mời tham gia câu lạc bộ."* — *(`kich-ban-d1.md`, Câu 1 — hai vế câu bất đối xứng về nhịp đọc, dễ làm người đọc hụt hơi).*
6. *"Đoạn giữa hơi nhanh, em không kịp ghi... Phần phân biệt mô hình ngôn ngữ lớn với ứng dụng trò chuyện em xem hai lần vẫn thấy lẫn."* — *(`data/studio-pack/c5-feedbackradar/vi-du/gop-y-mau.json`, gy-001 & gy-002 — phản hồi thực tế của người học khi kịch bản có vấn đề về nhịp điệu và diễn đạt).*

---

## §2. Impact & Quyết Định Chọn

### 2.1 Bảng Impact So Sánh ≥3 Ứng Viên

| Ứng viên đề tài | Bao nhiêu người gặp | Tần suất | Tốn gì mỗi lần | Khả thi trong 39h | Quyết định |
|---|---|---|---|---|---|
| **C2 · Spoken-Script QA** *(Review kịch bản văn nói tiếng Việt)* | Toàn bộ đội ngũ sản xuất kịch bản (~10–15 người), ảnh hưởng trực tiếp ~1.000 học viên | Hàng ngày / 15–20 video mỗi tháng | 45–60' rà soát thủ công; nếu sót lỗi tốn thêm 2–4h thu lại 3 câu và dựng lại video | **Rất cao:** LLM trích xuất span + phân loại + minimal fix, flow rõ ràng | **CHỌN** |
| **C3 · ScriptScout** *(Tự tìm tài liệu web & viết kịch bản có nguồn)* | 5–8 người viết kịch bản | 3–5 kịch bản mới mỗi tháng | 2–3 ngày tìm kiếm tài liệu và viết nháp kịch bản | **Thấp / Rủi ro:** Cần crawler web, thẩm định nguồn, chống web bẫy prompt injection | **LOẠI** |
| **C5 · FeedbackRadar** *(Gom phản hồi người học để định vị sửa video)* | 3–5 người đội hậu kỳ / sản xuất | 1 lần sau mỗi đợt khoá học (1–2 tuần/lần) | 2–3 giờ phân loại feedback từ khảo sát | **Trung bình:** Thiếu dữ liệu feedback thật (chỉ có 18 mẫu), phụ thuộc nhiều data giả | **LOẠI** |

### 2.2 Ứng Viên Đã Loại & Lý Do
1. **Loại C3 (ScriptScout):** Phạm vi quá rộng cho hackathon 39 giờ. Đề C3 đòi hỏi hệ thống tìm kiếm web real-time, xử lý bẫy prompt injection, và xác thực chéo số liệu. Dễ sa đà vào hạ tầng scraping thay vì tập trung vào chất lượng kịch bản.
2. **Loại C5 (FeedbackRadar):** Tần suất sử dụng không thường xuyên (chỉ diễn ra cuối khoá học). Dữ liệu trong repo chỉ có 18 mẫu feedback mô phỏng, chưa đủ số lượng lớn để chứng minh tính chính xác của thuật toán gom cụm nếu không tự sinh data giả.

### 2.3 Ứng Viên Được Chọn & Lý Do Chọn (Bằng số liệu)
- **Chọn C2 (Vietnamese Spoken-Script QA):**
  - **Tần suất cao nhất:** 100% video sản xuất đều bắt buộc phải qua khâu duyệt kịch bản (15–20 video/tháng).
  - **Hiệu quả đo đếm được (ROI):** Cắt giảm **80% thời gian duyệt** (từ 50 phút xuống còn 10 phút/bài).
  - **Tránh lãng phí chi phí làm lại:** Tiết kiệm chi phí thu lại dây chuyền 3 câu (trung bình 270 ký tự âm thanh) và dựng lại 1 scene hình ảnh cho mỗi video.
  - **Dữ liệu vững chắc:** Đã có sẵn 6 transcript văn nói sạch và kịch bản thật trong repo làm ground truth để xây dựng Golden set và đo lường Precision/Recall.
