# AI Audit Report

Tuyên bố: **I use AI tools for the following tasks.**

## Quy tắc ghi log

Mỗi interaction phải chứa tên công cụ, thời gian, prompt nguyên văn, output và phần sửa/đánh giá của sinh viên. Không thay raw output bằng kết luận do sinh viên tự viết.

## Interaction 001

- Tool: OpenAI Codex
- Date: 2026-11-17
- Prompt: `hãy đọc đề và giải thích đề sau đó gợi ý workflow giúp tôi 1 2 có người chọn r`
- Output: AI giải thích yêu cầu, so sánh Flow 3–5 và đề xuất Flow 4.
- Human review: Sinh viên chấp nhận Flow 4 vì bao phủ Auth, Read và Transactional; quyết định cuối cùng phải được ghi vào bảng chọn của nhóm.

## Interaction 002

- Tool: OpenAI Codex
- Date: 2026-11-17
- Prompt: `ok bắt đầu làm giúp tôi`
- Output: AI kiểm tra mã nguồn EShop, dựng bộ khung báo cáo, dữ liệu, test plans và scripts chạy.
- Human review: `TBD sau khi xem diff và chạy smoke test.`

> Trước khi nộp phải bổ sung toàn bộ output/prompt còn lại từ phiên làm việc, không chỉ bản tóm tắt này.

