# Live performance evidence

Các ảnh trong thư mục này được chụp từ các lần **rerun trực tiếp ngày 2026-11-21**, không trích từ video demo. Mỗi ảnh hiển thị đồng thời:

- bên trái: stdout thật của JMeter 5.6.3 chạy non-GUI;
- bên phải: CPU, RAM, RSS, system load và `vmstat` của đúng backend PID;
- phía trên: scenario, threads, ramp-up, duration, backend PID và giây chụp.

Các rerun dùng database sạch và seed lại 1.100 test users trước mỗi scenario. Chúng dùng để bổ sung bằng chứng live; số liệu phân tích chính trong báo cáo vẫn lấy từ các run chính thức ngày 2026-11-18.

## Ảnh và artifact đối chiếu

### Load

- Ảnh: `01-load-live.png`
- Cấu hình: 20 users, ramp-up 120 giây, duration 300 giây.
- Thời điểm chụp: khoảng giây 150, test vẫn đang chạy.
- Backend PID: 103625.
- Rerun validation: 7.451 request samples, p95 10 ms, 0 lỗi.
- Metadata: `../resource-logs/load/evidence-live-load_20261121_230559_metadata.txt`
- Resource logs: cùng prefix `evidence-live-load_20261121_230559`.
- Raw JTL cục bộ: `results/load/evidence-live-load_20261121_230559_20261121_230559.jtl`.
- HTML report cục bộ: `html-reports/load/evidence-live-load_20261121_230559_20261121_230559/`.

### Stress

- Ảnh: `02-stress-live.png`
- Cấu hình: 1.000 users, ramp-up 60 giây, duration 180 giây.
- Thời điểm chụp: khoảng giây 90, sau ramp-up.
- Backend PID: 114993.
- Rerun validation: 226.005 request samples, p95 44 ms, 0 lỗi.
- Metadata: `../resource-logs/stress/evidence-live-stress_20261121_231152_metadata.txt`
- Resource logs: cùng prefix `evidence-live-stress_20261121_231152`.
- Raw JTL cục bộ: `results/stress/evidence-live-stress_20261121_231152_20261121_231152.jtl`.
- HTML report cục bộ: `html-reports/stress/evidence-live-stress_20261121_231152_20261121_231152/`.

### Spike

- Ảnh: `03-spike-live.png`
- Cấu hình: baseline 20 users; burst thêm 1.000 users; spike delay 60 giây; burst 30 giây; total duration 180 giây.
- Thời điểm chụp: khoảng giây 70, trong burst.
- Backend PID: 124489.
- Rerun validation: 43.263 request samples, p95 491 ms, 0 lỗi.
- Metadata: `../resource-logs/spike/evidence-live-spike_20261121_231549_metadata.txt`
- Resource logs: cùng prefix `evidence-live-spike_20261121_231549`.
- Raw JTL cục bộ: `results/spike/evidence-live-spike_20261121_231549_20261121_231549.jtl`.
- HTML report cục bộ: `html-reports/spike/evidence-live-spike_20261121_231549_20261121_231549/`.

### Hardware

- Ảnh: `04-hardware-spec.png`
- Nội dung: Ubuntu/kernel, model máy, CPU/core/thread/cache, RAM/swap, physical storage, Java, Node.js và JMeter 5.6.3.
- Bảng text đầy đủ: `../hardware_spec.txt`.

## Lưu ý về tính xác thực

Ảnh được lưu tự động trong lúc process JMeter còn hoạt động. Không ghép ảnh và không dùng kết quả demo video. Các raw JTL/HTML rerun được giữ cục bộ vì `.gitignore` mặc định loại chúng khỏi Git; bộ raw JTL/HTML chính thức ngày 2026-11-18 vẫn là bộ được chọn để nộp và phân tích trong báo cáo.
