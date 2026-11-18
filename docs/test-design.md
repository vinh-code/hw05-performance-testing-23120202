# Thiết kế kiểm thử – Flow 4

## Mục tiêu

Đánh giá backend EShop dưới tải bình thường, tải tăng đến giới hạn và tải tăng đột ngột bằng cùng một workflow end-to-end.

## Luồng nghiệp vụ

| Bước | API | Nhóm | Correlation/assertion chính |
|---:|---|---|---|
| 1 | `POST /api/login` | Auth-heavy | HTTP 200, lấy JWT `token` |
| 2 | `GET /api/users/me` | Read-heavy | HTTP 200 |
| 3 | `PUT /api/users/me` | Transactional | HTTP 200, `Profile updated` |
| 4 | `GET /api/products?search=...` | Read-heavy | HTTP 200, lấy sản phẩm đầu tiên |
| 5 | `GET /api/products/:id` | Read-heavy | HTTP 200 |
| 6 | `POST /api/cart` | Transactional | HTTP 200, `Added to cart` |
| 7 | `POST /api/checkout` | Transactional | HTTP 200, lấy `orderId` |
| 8 | `GET /api/orders/:id` | Read-heavy | HTTP 200 |

## Dữ liệu

CSV cung cấp 500 tài khoản, thông tin hồ sơ và từ khóa tìm kiếm. Mỗi virtual user giữ bản sao dòng CSV được nhận ở vòng lặp đầu để tránh đổi danh tính giữa chừng. CSV được phép quay vòng nhưng các biến `vu_*` không thay đổi sau Once Only Controller.

## Mô hình tải ban đầu

| Scenario | Threads ban đầu | Ramp-up | Duration | Report view |
|---|---:|---:|---:|---|
| Load | 20 | 120 giây | 300 giây | Summary Report |
| Stress | 60 | 180 giây | 360 giây | Aggregate Report |
| Spike | baseline 5, burst 80 | burst ramp 2 giây | baseline 180 giây; burst từ giây 60–90 | View Results Tree, chỉ lưu lỗi |

Đây là giả thuyết thiết kế, không phải ngưỡng đã xác nhận. Sau smoke/baseline phải hiệu chỉnh theo phần cứng thực tế.

## Human review đối với đề xuất AI ban đầu

1. Không dùng một tài khoản cho mọi thread vì cập nhật hồ sơ và giỏ hàng sẽ tranh chấp dữ liệu.
2. Không dùng fixed `product_id` nếu đã thực hiện bước tìm kiếm; phải trích ID từ response để bảo toàn luồng end-to-end.
3. Không coi HTTP 200 là đủ; phải kiểm tra các biến động `token`, `product_id`, `order_id` không rỗng.
4. View Results Tree tiêu thụ tài nguyên, vì vậy chỉ cấu hình lưu lỗi và không dùng nó để đọc toàn bộ response trong lần chạy lớn.
5. Thông số thread chỉ là điểm bắt đầu. Ngưỡng ổn định phải lấy từ raw JTL và resource monitor.
6. Backend reset database khi restart nên seed dữ liệu là bước bắt buộc và phải được ghi trong bằng chứng chạy.
7. Spike phải có ba vùng quan sát: baseline trước spike, burst đột ngột và baseline sau spike để đánh giá phục hồi. Một thread group chỉ tăng tải rồi dừng là chưa đủ.
8. Endurance 800 users cho thấy nếu tiếp tục workflow sau một timeout, extractor trả `NOT_FOUND` và các request sau tạo lỗi dây chuyền 400/403/404. Test plan được sửa sang `startnextloop` để mỗi vòng lặp dừng tại lỗi gốc, tránh đếm lỗi phụ như lỗi độc lập.

