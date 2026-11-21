# HW05 – Performance Testing

- Sinh viên: Phạm Quang Vinh
- MSSV: 23120202
- Workflow: Flow 4 – Cập nhật hồ sơ → Mua
- SUT: EShop backend API
- Công cụ chính: Apache JMeter 5.6.3
- Trạng thái hiện tại: đã có run chính thức, ảnh live, hardware evidence và PDF; còn thiếu URL video, public repository và GitHub issue đã publish

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
| Demo video | Đã quay local; chờ upload YouTube Unlisted và điền URL |
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
| Performance issue | 1 issue draft, chưa đăng GitHub |
| Demo video | Chưa có link |
| Public repository | Chưa publish |

## Provisional self-assessment

Điểm dưới đây phản ánh trạng thái hiện tại, vẫn trừ phần URL video và public links còn thiếu.

| No. | Criteria | Max | Provisional |
|---:|---|---:|---:|
| 1 | Task 1 – Load testing | 30 | 24 |
| 2 | Task 1 – Stress testing | 20 | 16 |
| 3 | Task 1 – Spike testing | 20 | 16 |
| 4 | Task 2 – AI analysis and misinterpretation hunt | 10 | 9 |
| 5 | Task 3 – Continuous Performance Testing proposal | 10 | 9 |
| 6 | Agent Skill | 10 | 9 |
| | **Total** | **100** | **83** |

