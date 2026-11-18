# HW05 – Performance Testing

- Sinh viên: Phạm Quang Vinh
- MSSV: 23120202
- Workflow: Flow 4 – Cập nhật hồ sơ → Mua
- SUT: EShop backend API
- Công cụ chính: Apache JMeter 5.6.3
- Trạng thái hiện tại: đã chạy Load, Stress, Spike và Endurance; còn thiếu ảnh/video và PDF cuối

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
| Resource screenshots | Chưa chụp |
| Demo video | Chưa quay |
| AI analysis từ raw JTL | Đã thực hiện và human review |

Không điền số liệu hiệu năng nếu chưa có raw `.jtl` và bằng chứng tài nguyên tương ứng.

