# HW05 – Performance Testing

- Sinh viên: Phạm Quang Vinh
- MSSV: 23120202
- Workflow: Flow 4 – Cập nhật hồ sơ → Mua
- SUT: EShop backend API
- Công cụ chính: Apache JMeter 5.6.3
- Trạng thái hiện tại: ba test plan đã qua smoke/structure check; kết quả chính thức chưa chạy

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
| Load plan | Đã tạo, chờ chạy chính thức |
| Stress plan | Đã tạo và kiểm tra kỹ thuật, chờ hiệu chỉnh tải và chạy chính thức |
| Spike plan | Đã tạo baseline–burst–recovery và kiểm tra kỹ thuật, chờ chạy chính thức |
| Endurance | Chưa chạy |
| Resource screenshots | Chưa chụp |
| Demo video | Chưa quay |
| AI analysis từ raw JTL | Chưa thực hiện |

Không điền số liệu hiệu năng nếu chưa có raw `.jtl` và bằng chứng tài nguyên tương ứng.

