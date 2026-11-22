# HW05 – Performance Testing

- Sinh viên: Phạm Quang Vinh
- MSSV: 23120202
- Workflow: Flow 4 – Cập nhật hồ sơ → Mua
- SUT: EShop backend API
- Công cụ chính: Apache JMeter 5.6.3
- Trạng thái hiện tại: đã có run chính thức, ảnh live, hardware evidence, PDF, video, public repository và GitHub issue

## Workflow API

`Login → Get profile → Update profile → Search products → Product detail → Add to cart → Checkout → Order detail`

Workflow bao phủ:

- Auth-heavy: `POST /api/login`
- Read-heavy: `GET /api/users/me`, `GET /api/products`, `GET /api/products/:id`, `GET /api/orders/:id`
- Transactional: `PUT /api/users/me`, `POST /api/cart`, `POST /api/checkout`

## Chạy nhanh

Đọc [runbook](docs/runbook.md) trước khi chạy. Không dùng kết quả smoke test làm kết quả nộp chính thức.

```bash
cd sut/backend
npm ci
node server.js
```

Ở terminal khác:

```bash
./scripts/seed_test_users.sh
./scripts/run_scenario.sh load 1 1 20 smoke
```

## Trạng thái bằng chứng

| Hạng mục | Trạng thái |
|---|---|
| Load plan | Đã chạy chính thức, 20 users |
| Stress plan | Đã chạy đến 1,000 users |
| Spike plan | Đã chạy baseline 20 + burst 1,000 users |
| Endurance | Đã xác nhận 300 users / khoảng 457 sustained req/s trong 10 phút |
| Resource screenshots | Đã chụp live cho Load, Stress, Spike và hardware trong `evidence/screenshots/` |
| Demo video | [YouTube Unlisted](https://youtu.be/tAsw4BRn0uI) |
| AI analysis từ raw JTL | Đã thực hiện và human review |

Không điền số liệu hiệu năng nếu chưa có raw `.jtl` và bằng chứng tài nguyên tương ứng.

## Test summary

| Hạng mục | Kết quả đã xác minh |
|---|---|
| Workflow | Login → Profile GET/PUT → Search/Detail → Cart → Checkout → Order detail |
| Endpoint groups | Auth-heavy, Read-heavy, Transactional |
| Load | 20 users, 7,392 samples, p95 15 ms, 0 lỗi |
| Stress | Đến 1,000 users, 220,812 samples, p95 79 ms, 0 lỗi |
| Spike | Baseline 20 + burst 1,000; burst p95 1,084 ms; settled recovery p95 12 ms |
| Endurance threshold | Highest verified stable tested level: 300 users, khoảng 457 sustained req/s trong 10 phút |
| Verified issues | 3: [performance degradation #1](https://github.com/vinh-code/hw05-performance-testing-23120202/issues/1), [checkout integrity #2](https://github.com/vinh-code/hw05-performance-testing-23120202/issues/2), [order authorization #3](https://github.com/vinh-code/hw05-performance-testing-23120202/issues/3) |
| Demo video | [https://youtu.be/tAsw4BRn0uI](https://youtu.be/tAsw4BRn0uI) |
| Public repository | [vinh-code/hw05-performance-testing-23120202](https://github.com/vinh-code/hw05-performance-testing-23120202) |

## Provisional self-assessment

Điểm dưới đây là tự đánh giá bảo thủ dựa trên chất lượng nội dung; các evidence và public links bắt buộc đã được bổ sung.

| No. | Criteria | Max | Provisional |
|---:|---|---:|---:|
| 1 | Task 1 – Load testing | 30 | 24 |
| 2 | Task 1 – Stress testing | 20 | 16 |
| 3 | Task 1 – Spike testing | 20 | 16 |
| 4 | Task 2 – AI analysis and misinterpretation hunt | 10 | 9 |
| 5 | Task 3 – Continuous Performance Testing proposal | 10 | 9 |
| 6 | Agent Skill | 10 | 9 |
| | **Total** | **100** | **83** |

