# AI initial analysis draft

> Đây là output phân tích ban đầu của AI trước khi human review mã nguồn, percentile scope và time-window data.

AI nhận định rằng EShop hoạt động tốt ở 20 users và chịu được stress 1,000 users mà không phát sinh HTTP error. Spike làm p95 tăng mạnh nhưng hệ thống phục hồi về baseline. Endurance 800 users có error rate toàn run chỉ 0.0428%, nhưng p95 HTML khoảng 1,863 ms và max vượt 10 giây; endurance 500 users không lỗi nhưng chậm ở cuối; 300 users ổn định.

AI kết luận 300 users, khoảng 457 request/giây, là maximum stable throughput của máy. AI cho rằng nguyên nhân chính của degradation là SQLite lock/I/O saturation và có dấu hiệu memory leak vì RSS backend tăng theo thời gian. Các tối ưu được đề xuất gồm bật SQLite WAL, thêm index, thêm connection pool, cache product và chuyển sang PostgreSQL nếu cần concurrency cao hơn.

