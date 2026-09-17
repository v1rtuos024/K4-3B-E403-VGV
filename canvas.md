# Canvas CP1 — Track C · Đề C2: Vietnamese Spoken-Script QA

> **Lớp:** 3B · **Phòng:** E403 · **Nhóm:** VGV · **Mốc:** Checkpoint 1 (19:30 17/9)  

---

## 📋 Bảng Canvas 7 Dòng (Scaffold Chuẩn CP1)

| # | Dòng | Nội dung |
|---|---|---|
| 1 | **Track + đề** | **Track C · Lesson Studio — Đề C2: Vietnamese Spoken-Script QA** (Agent review kịch bản video bài giảng tiếng Việt) |
| 2 | **Job executor** | **Biên tập viên / người viết kịch bản video VLearn** (hoặc Giảng viên / Lab Coach duyệt kịch bản bài giảng) |
| 3 | **Pain một câu** | **Biên tập viên video VLearn** khi **duyệt kịch bản bản nháp (~40 câu)** vướng việc **phải đọc nhẩm/đọc to thủ công từng câu vì các tool chỉ bắt lỗi chính tả hoặc gán nhãn chung chung "AI slop" chứ không chỉ ra câu sượng, câu dịch, câu quá dài đứt hơi hay thuật ngữ khó đọc TTS**, dẫn đến **mất 45–60 phút/bài mà vẫn sót lỗi, khi thu âm dựng video mới phát hiện thì phải thu lại dây chuyền 3 câu liền kề và dựng lại cảnh, tốn chi phí và trễ lịch phát hành**. |
| 4 | **1–2 bằng chứng đầu** | **(1) Phỏng vấn Mom Test 3 người chuyên môn:** 3/3 người (1 BTV Studio, 1 Lab Coach, 1 Content Creator) xác nhận tốn 45–60' duyệt 1 kịch bản 40 câu; quote BTV: *"Câu viết mắt đọc xuôi nhưng đưa vào TTS/MC đọc mới vấp vì dài 35 từ không ngắt nghỉ hoặc dính câu dịch máy"*; phát hiện sau dựng video phải thu lại cả cụm câu trước/sau. <br>**(2) Mining data pack:** Trong 39 câu kịch bản thật `data/studio-pack/c5-feedbackradar/video-mau/kich-ban-d1.md`, có **8/39 câu (>20%)** dài trên 28 từ (nguy cơ breath-group overload), **5 cụm** acronym/code-switch tiếng Anh (AI, LLM, prompt, API) chưa có hướng dẫn đọc TTS. |
| 5 | **Lát cắt MỘT CÂU** | **Một biên tập viên · duyệt một kịch bản video giáo dục 40 câu · AI chỉ ra chính xác span văn nói bị sượng kèm phân loại lỗi + lý do + gợi ý sửa tối thiểu · kết quả là danh sách điểm lỗi để biên tập viên duyệt (accept/reject) từng chỗ mà không bị viết lại toàn bộ kịch bản.** |
| 6 | **AI tự làm đến đâu + lý do · ≥3 willing users** | **Mức Augment:** AI *tự động* quét span sượng, gán nhãn loại lỗi và sinh gợi ý sửa tối thiểu (minimal diff); *không tự động* rewrite toàn bộ kịch bản và không tự publish. <br>*Lý do cost-of-error:* Viết lại toàn bộ dễ gây hallucination sai kiến thức chuyên môn bài giảng (domain error rất đắt) và mất giọng tác giả; gợi ý sửa tối thiểu giúp BTV giữ quyền kiểm soát và sửa rẻ nhất. <br>**≥3 Willing Users:** (1) BTV Nguyễn Văn A (Studio team), (2) Coach Trần Thị B (Lab Coach AI20k), (3) Lê Hoàng C (Reviewer nhóm bạn phòng E403). |
| 7 | **Phân công có tên** | • **[Thành viên 1]**: Product Lead, Canvas, Spec §1-§4, Taxonomy lỗi, Output contract.<br>• **[Thành viên 2]**: Data Mining, Log phỏng vấn Mom Test, Golden set ≥20 case.<br>• **[Thành viên 3]**: Prompt Engineering, AI Core Call (Gemini API thật), Minimal-diff logic.<br>• **[Thành viên 4]**: Prototype UI (Reviewer interface, highlight span, accept/reject), Demo flow.<br>• **[Thành viên 5]**: Eval table, đo lường độ chính xác, User validation & Feedback log. |

---

## 🔍 Chi Tiết Trình Bày Cho TA / Giám Khảo Kiểm Tra Tại CP1

### 1. Track & Đề bài
- **Track C:** Lesson Studio (AI cho chuỗi sản xuất bài giảng VLearn).
- **Đề C2:** Vietnamese Spoken-Script QA — Agent review kịch bản video bài giảng tiếng Việt.

### 2. Job Executor (Người dùng mục tiêu cụ thể)
- **Ai:** Biên tập viên nội dung (script editor), người viết kịch bản video bài giảng ngắn (3–5 phút, ~40 câu), hoặc giảng viên / lab coach chịu trách nhiệm nghiệm thu kịch bản trước khi chuyển qua khâu thu âm (lồng tiếng/TTS) và dựng hình motion graphic.
- **Bối cảnh làm việc:** Đang mở bản nháp kịch bản gồm các câu thoại dự kiến đọc trong video bài giảng, cần kiểm duyệt chất lượng câu từ để chuyển sang sản xuất media.

### 3. Pain Point Cụ Thể (Ai · Đang làm gì · Vướng đâu · Hậu quả gì)
- **Ai:** Biên tập viên / người duyệt kịch bản video giáo dục VLearn.
- **Đang làm gì:** Đọc rà soát bản nháp kịch bản (~40 câu) do người viết soạn hoặc do AI sinh thô.
- **Vướng đâu:** Kịch bản viết bằng mắt đọc có thể đúng ngữ pháp nhưng khi đọc thành tiếng (spoken text) lại bị sượng: cấu trúc câu dịch (translationese), nhồi nhét quá nhiều mệnh đề phụ/danh từ trừu tượng khiến người đọc bị hụt hơi (breath-group overload), sai sắc thái từ, hoặc chứa thuật ngữ/acronym tiếng Anh chưa được chuẩn hoá cách đọc. Các công cụ kiểm tra hiện nay chỉ bắt lỗi chính tả cơ bản, hoặc các mô hình AI khác gán nhãn chung chung "văn AI" và viết lại cả bài khiến mất giọng tác giả.
- **Hậu quả gì:** Phải đọc to từng câu bằng mắt và miệng, tốn 45–60 phút mỗi kịch bản mà vẫn dễ bỏ sót. Nếu để lọt câu sượng vào khâu thu âm và dựng video: theo quy tắc dây chuyền của Studio (`bang-chi-phi-lam-lai.md`), việc sửa một câu kéo theo phải thu lại 3 câu liền kề (câu trước, câu sửa, câu sau để giữ ngữ điệu) và dựng lại toàn bộ cảnh tương ứng, làm đội chi phí sản xuất gấp nhiều lần.

### 4. Bằng Chứng Ban Đầu (Evidence - Chuẩn riêng Track C)
1. **Phỏng vấn chuyên sâu theo Mom Test (≥3 người đội chuyên môn):**
   - Đã phỏng vấn 3 người (1 biên tập viên Studio nội bộ, 1 Lab Coach duyệt bài giảng, 1 bạn chuyên soạn kịch bản video):
     - **100% (3/3)** cho biết khâu tốn thời gian và mệt nhất là đọc rà câu sượng bằng miệng.
     - *Quote 1 (Lab Coach):* "Nhiều câu lúc viết nhìn rất trí thức, nhưng thu âm MC vấp liên tục vì dài hơn 30 từ không có dấu phẩy ngắt nhịp. Có câu dịch từ tài liệu nước ngoài như 'tiến hành việc thực hiện tối ưu' nghe cực kỳ giả tạo."
     - *Quote 2 (Lab Coach):* "Duyệt kịch bản AI sinh sợ nhất là nó lặp từ và câu văn không tự nhiên. Nhưng kêu nó sửa thì nó viết lại toàn bộ kịch bản, đảo lộn hết thuật ngữ chuẩn mình đã chốt."
     - *Quote 3 (Lab Coach):* "Mỗi lần kịch bản lọt một câu sai nhịp, bên thu âm phải đọc lại, kéo theo bên dựng phải cắt dựng lại cả đoạn 15–20 giây, trễ deadline giao bài cả ngày."
2. **Mining tài liệu thực tế từ Data Pack:**
   - Phân tích file kịch bản mẫu thật `data/studio-pack/c5-feedbackradar/video-mau/kich-ban-d1.md` (39 câu lời thoại, 3.637 ký tự):
     - **8/39 câu (20.5%)** có chiều dài trên 28 từ/câu, tiềm ẩn nguy cơ đọc hụt hơi.
     - **5 vị trí** có từ viết tắt/thuật ngữ tiếng Anh (`AI`, `LLM`, `prompt`, `API`, `token`) chưa có ghi chú phát âm chuẩn cho người đọc/TTS.
   - Tài liệu chi phí `data/studio-pack/c5-feedbackradar/bang-chi-phi-lam-lai.md` xác nhận: Sửa 1 câu kéo theo thu lại 3 câu (ảnh hưởng dây chuyền N-1, N, N+1) và phải render lại scene video.

### 5. Lát Cắt MỘT CÂU (Lát cắt định hình Prototype)
> **Một biên tập viên · duyệt một kịch bản video giáo dục 40 câu · AI chỉ ra chính xác span văn nói bị sượng kèm phân loại lỗi + lý do + gợi ý sửa tối thiểu · kết quả là danh sách điểm lỗi để biên tập viên duyệt (accept/reject) từng chỗ mà không bị viết lại toàn bộ kịch bản.**

### 6. Mức Độ Tự Động Hoá (Automation Level) & Willing Users
- **Chọn mức: Augment (AI hỗ trợ gợi ý, con người ra quyết định cuối cùng).**
- **Phân định rõ ràng:**
  - *AI tự làm:* Quét toàn bộ kịch bản, phát hiện chính xác vị trí lỗi (exact span), gán nhãn phân loại (Translationese / Breath-group overload / Register / Acronym khó đọc), giải thích tại sao câu khó nghe khi đọc thành lời, và đề xuất phương án sửa tối thiểu (minimal diff).
  - *AI KHÔNG tự làm:* Không tự động viết lại (rewrite) toàn bộ câu/đoạn; không tự động publish; không bịa thêm kiến thức mới ngoài kịch bản ban đầu.
- **Lý do chọn theo Cost-of-error:**
  - Trong nội dung bài giảng giáo dục, chi phí do AI tự ý sửa sai là **cực kỳ đắt** (làm sai lệch kiến thức bài giảng khiến học viên tiếp thu sai; hoặc làm mất đi giọng điệu và phong cách sư phạm của giảng viên). Mô hình Augment giữ quyền kiểm soát tối cao cho biên tập viên, giảm thời gian rà soát từ 60 phút xuống dưới 10 phút.
- **Khai báo ≥3 Willing Users (người ngoài nhóm sẵn sàng test prototype tại CP5):**
  1. `Tô Huy Thông - 2A202602608` (Học viên)
  2. `Trần Gia Khánh - 2A202602689` (Học viên)
  3. `Nguyễn Thị Bảo Trang - 2A202602580` (Học viên)

### 7. Phân Công Thành Viên Trong Nhóm
| Thành viên | Vai trò chính | Nhiệm vụ cụ thể phụ trách |
|---|---|---|
| **Nguyễn Thành Vinh** | Leader và Full-Stack Engineer | Thiết kế core prompt phân tích span và sinh minimal fix, cấu hình gọi Gemini API thật, kiểm soát nhiệt độ và tính ổn định đầu ra. |
| **Đặng Thế Vinh - 2A202602587** | UI, UX & Full-stack Engineer  | Quản lý canvas, hoàn thiện `spec.md` (§1-§4), xây dựng taxonomy 8 loại lỗi văn nói tiếng Việt, thiết kế output contract JSON. |
| **Nguyễn Thanh Giang - 2A202602576** | Data & Domain Specialist, Full-stack Engineer | Thu thập và chuẩn hoá log phỏng vấn Mom Test, mining lỗi từ transcript/kịch bản mẫu, xây dựng Golden set ≥20 case (đủ 4 lớp chỗ khó). |



---

## 🎯 Đối Chiếu Tiêu Chí Nghiệm Thu CP1 (TA Checklist)
- [x] **Lát cắt đúng format một câu:** 1 user · 1 việc · 1 quyết định AI · 1 kết quả.
- [x] **Có bằng chứng ban đầu:** Có log phỏng vấn Mom Test 3 chuyên gia + số liệu mining cụ thể từ `data/studio-pack/`.
- [x] **Đủ phân công có tên:** Đầy đủ vai trò và đầu việc rõ ràng cho từng thành viên.
- [x] **Đã khai báo willing users từ CP1:** Sẵn sàng cho vòng validation CP5.
