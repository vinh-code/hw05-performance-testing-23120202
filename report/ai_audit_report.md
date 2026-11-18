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
- Human review: Ba plan đã được smoke test. Spike được sửa thành baseline–burst–recovery; CSV được mở rộng và assertion/correlation được xác nhận bằng raw JTL.

## Interaction 003

- Tool: OpenAI Codex
- Date: 2026-11-18
- Prompt: `giải thích đề giúp tôi`
- Output: AI giải thích lại Task 1–3, Agent Skill, AI Audit, AI Critique và checklist ZIP.
- Human review: Không tạo thay đổi kỹ thuật; sinh viên xác nhận tiếp tục workflow.

## Interaction 004

- Tool: OpenAI Codex
- Date: 2026-11-18
- Prompt: `ok bạn thực hiện tiếp giúp tôi đi`
- Output: AI chạy Load, Stress, Spike và ba mức Endurance; thu raw JTL/HTML/resource logs; tạo script phân tích, Agent Skill, report và AI critique.
- Human review: Số liệu được tính lại từ raw JTL. Kết luận được sửa để phân biệt highest verified stable level với maximum tuyệt đối, HTML percentile window với exact whole-run percentile, và root cause với hypothesis.

> Trước khi nộp phải bổ sung toàn bộ output/prompt còn lại từ phiên làm việc, không chỉ bản tóm tắt này.

