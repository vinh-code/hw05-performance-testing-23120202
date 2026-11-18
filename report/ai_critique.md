# AI Critique

Trong bài này, AI hữu ích nhất ở việc tạo cấu trúc JMeter, correlation và script đọc raw JTL, nhưng phân tích ban đầu vẫn có nhiều điểm cần con người sửa. Sai lệch rõ nhất là AI xem p95 khoảng 1.863 ms trong HTML endurance 800 users như percentile của toàn bộ lần chạy. Khi tính lại trên tất cả mẫu raw JTL, p95 là 582 ms. HTML không giả, nhưng nó dùng cửa sổ thống kê giới hạn và phản ánh mạnh phần cuối bị suy giảm. AI cũng nhìn error rate toàn run 0,0428% rồi đánh giá khá nhẹ, trong khi cửa sổ cuối có error rate 1,492% và p95 4.540 ms. Điều này cho thấy số trung bình có thể che mất failure theo thời gian.

AI còn kết luận quá sớm rằng SQLite là root cause và RSS tăng là memory leak. Dữ liệu chỉ cho thấy latency tăng khi CPU backend giảm và I/O wait xuất hiện; chưa có profiler hoặc SQLite trace để chứng minh nguyên nhân. RSS cũng giảm sau một số chu kỳ, nên chưa thể gọi là leak. Khuyến nghị thêm index và connection pool vì thế chưa có đủ cơ sở. WAL có thể thử bằng A/B test, còn xóa cart sau checkout là đề xuất chắc chắn hơn vì phù hợp cả đặc tả và mã nguồn.

Nguyên tắc tôi rút ra là luôn kiểm tra phạm vi metric, xem biểu đồ theo từng cửa sổ thời gian, đối chiếu raw log với tài nguyên và phân biệt quan sát, giả thuyết với nguyên nhân đã chứng minh. AI nên được dùng để tăng tốc phân tích, không thay thế trách nhiệm đánh giá bằng chứng.

