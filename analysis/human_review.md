# Human review of AI analysis

## Corrections

1. **Không gọi 300 users là maximum tuyệt đối.** Đây chỉ là mức cao nhất ổn định trong các mức đã thử. Biên thực tế nằm giữa 300 và 500 users.
2. **Không dùng p95 HTML như whole-run exact p95.** Endurance 800 có HTML p95 khoảng 1,863 ms do bounded statistic window, trong khi exact p95 trên toàn raw JTL là 582 ms. Cần ghi rõ scope của cả hai.
3. **Whole-run error rate che khuất lỗi cuối run.** 0.0428% nhìn thấp, nhưng cửa sổ 600–630 giây có error rate 1.492% và p95 4,540 ms.
4. **SQLite saturation là giả thuyết, chưa phải root cause.** CPU backend giảm khi latency tăng và I/O wait khoảng 5%, phù hợp với chờ I/O/lock; tuy nhiên chưa có SQLite trace, profiler hoặc A/B test WAL.
5. **RSS tăng không tự động là memory leak.** RSS có các lần giảm do garbage collection. Backend không xóa `userCarts` sau checkout là lỗi thật và có thể làm dữ liệu tăng, nhưng cần heap profile để chứng minh leak.
6. **Không chấp nhận mọi tối ưu AI đề xuất.** Index và connection pool không có bằng chứng phù hợp với bottleneck. WAL chỉ nên được coi là thí nghiệm A/B. Xóa cart sau checkout là khuyến nghị có cơ sở trực tiếp từ đặc tả và mã nguồn.
7. **Tách lỗi gốc khỏi lỗi dây chuyền.** Run 800 ban đầu tiếp tục sau timeout, tạo `NOT_FOUND` và các lỗi phụ. Test plan đã được sửa thành `startnextloop`; kết luận threshold dựa chủ yếu vào timeout/latency và các rerun đã sửa.

