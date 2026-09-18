# Vietnamese Spoken-Script QA Golden Set

## 1. Golden Set là gì?
Golden Set là bộ dữ liệu chuẩn (gồm 21 cases) dùng để đánh giá độ chính xác của AI Prototype (Agent review kịch bản tiếng Việt). Bộ dữ liệu này chứa cả những câu có lỗi (NEEDS_REVISION) và những câu hoàn toàn bình thường (CLEAN).

## 2. Dữ liệu lấy từ đâu?
Dữ liệu được trích xuất từ 10 kịch bản video (video scripts) thực tế đã được sử dụng trước đây.

## 3. Vì sao old video scripts được dùng làm nguồn dữ liệu?
Kịch bản video cũ phản ánh đúng thực tế văn phong, các lỗi thường gặp (như dịch word-by-word, lặp ý, câu quá dài) và cả những câu văn mang tính học thuật nhưng vẫn tự nhiên của đội ngũ sản xuất kịch bản. Việc dùng data thật giúp hệ thống AI được test trên môi trường sát với thực tế nhất.

## 4. Candidate screening khác với Gold Label như thế nào?
- **Candidate screening:** Là kết quả lọc thô ban đầu (có thể bằng Gemini hoặc AI khác) để tìm ra những câu có tiềm năng là lỗi hoặc sạch. Kết quả này chỉ mang tính tham khảo (candidate pool).
- **Gold Label:** Là nhãn chuẩn thức cuối cùng **đã được con người xác minh (human validation)**. Nhãn này mới là chân lý (ground truth) dùng để chấm điểm AI.

## 5. Taxonomy C0–C5
Bộ test được phân loại theo các tiêu chí sau:
- **C0 - CLEAN:** Câu tự nhiên, rõ nghĩa, phù hợp để nói thành lời (Dùng để test false positive).
- **C1 - WORD_MEANING_NUANCE:** Dùng từ sai nghĩa, sai sắc thái hoặc không tự nhiên trong văn nói tiếng Việt.
- **C2 - TRANSLATIONESE_AWKWARD_SYNTAX:** Câu có dấu hiệu dịch word-by-word, cú pháp cứng nhắc, khó nghe.
- **C3 - LONG_BREATH_OVERLOAD:** Câu quá dài, nhồi nhét nhiều ý, không có nhịp nghỉ tự nhiên.
- **C4 - REPETITION_REDUNDANCY:** Lặp từ, lặp ý, thừa thãi khiến nhịp đọc bị vấp.
- **C5 - NUMBER_ACRONYM_NAME_READABILITY:** Số liệu, tên riêng, tiếng Anh (code-switching) chèn vào không hợp lý gây khó đọc.
- **PRONUNCIATION_ONLY:** Nội dung đúng nhưng cần lưu ý cách phát âm (TTS/người đọc).

## 6. Cách một case được xác nhận là PASS
**Với case lỗi (NEEDS_REVISION):** AI PASS khi đáp ứng đủ 5 điều kiện:
1. Nhận diện đúng câu có lỗi (Detection).
2. Chỉ ra đúng/gần đúng đoạn gây lỗi (Span).
3. Phân loại đúng hoặc hợp lý (Category).
4. Giải thích đúng bản chất vấn đề (Explanation).
5. Đề xuất sửa tối thiểu, không làm sai nghĩa (Suggestion).

**Với case sạch (CLEAN):** AI PASS khi:
- Nhận diện đúng là CLEAN.
- Không tạo lỗi giả (false positive).
- Không đề xuất chỉnh sửa khi không cần thiết.

## 7. Quality Bar 70%
Prototype của nhóm được xem là "Đạt" nếu có **ít nhất 70%** số cases trong Golden Set đạt tiêu chí PASS. Đây là thước đo chất lượng do nhóm tự đặt ra cho CP3.

## 8. Cách đo false positive
Đo lường bằng cách cho AI chạy qua các cases **C0 (CLEAN)**. Nếu AI nhận diện nhầm một câu CLEAN thành câu có lỗi và đòi sửa, đó là một false positive (bắt lỗi sai). Tỷ lệ false positive càng thấp càng tốt.

## 9. Quy trình đánh giá
Quy trình xây dựng và sử dụng Golden Set:
`old scripts → screening → human validation → frozen Golden Set → AI evaluation`

## 10. LƯU Ý QUAN TRỌNG
> **Golden Set phải được freeze (chốt và không thay đổi) trước khi chạy evaluation chính thức.**
Không được sửa đổi Golden Set để "làm đẹp" kết quả của AI sau khi đã bắt đầu đo lường.
