# Runbook – Flow 4

## 1. Khởi động lại SUT

Backend xóa và tạo lại database mỗi lần khởi động. Vì vậy phải seed user sau mỗi lần restart.

```bash
cd sut/backend
npm ci
node server.js
```

Giữ terminal này mở để quan sát lỗi backend.

## 2. Seed dữ liệu

Tại thư mục HW05:

```bash
./scripts/seed_test_users.sh
```

Script đọc `test-data/users.csv`, đăng ký tài khoản qua API và kiểm tra đăng nhập mẫu.

## 3. Smoke test

```bash
./scripts/run_scenario.sh load 1 1 25 smoke
```

Điều kiện đạt:

- JMeter trả exit code 0.
- Không có assertion failure trong `.jtl`.
- Tất cả tám request của workflow xuất hiện.
- `token`, `product_id` và `order_id` được trích xuất thành công.

## 4. Chạy chính thức

Thông số khởi đầu, phải điều chỉnh sau baseline:

```bash
./scripts/run_scenario.sh load 20 120 300 official
./scripts/run_scenario.sh stress 60 180 360 official
./scripts/run_scenario.sh spike 80 2 180 official
```

Ý nghĩa tham số: `scenario threads ramp_seconds duration_seconds run_label`.

Riêng Spike, `duration` là tổng thời gian baseline. Mặc định burst bắt đầu tại giây 60, kéo dài 30 giây, sau đó baseline tiếp tục để đo phục hồi. Có thể hiệu chỉnh bằng `BASELINE_THREADS`, `SPIKE_DELAY` và `SPIKE_DURATION`.

Mở `htop` cạnh terminal chạy JMeter và quay/chụp cùng một khung hình. Chạy từng scenario riêng, kiểm tra backend còn hoạt động giữa các lần chạy.

## 5. Endurance

Chỉ chọn tải sau khi đã tìm được ngưỡng ổn định. Ví dụ cú pháp:

```bash
./scripts/run_scenario.sh load THREADS RAMP_SECONDS 900 endurance
```

Không sao chép con số ví dụ vào báo cáo. Ghi CPU, RAM, RPS, p95 và error rate quan sát thực tế.

## 6. Lưu bằng chứng

- Raw JTL: `results/<scenario>/`
- HTML dashboard: `html-reports/<scenario>/`
- Resource/hardware: `evidence/`
- Log JMeter: `logs/`
- Video: ghi URL vào `evidence/video_link.txt`

Không sửa raw JTL. Nếu chạy lại, dùng `run_label` khác để giữ toàn bộ lịch sử.

