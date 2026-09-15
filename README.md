# CANTEEN GO – Hệ thống quản lý Canteen VWA

Bản build này bám theo đặc tả trong `Hosomauduan_nhom7(4).docx`: 3 vai trò Khách hàng / Staff / Admin, kiến trúc frontend–backend–MySQL, đặt món, khung giờ nhận, thanh toán giả lập, hóa đơn, lịch sử, xử lý đơn, kho, đánh giá và báo cáo.

## 1. Công nghệ
- Frontend: HTML + CSS + JavaScript thuần, responsive.
- Backend: Node.js + Express + JWT + bcryptjs.
- Database: MySQL 8+.
- API REST: `/api/...`.

## 2. Cài MySQL
1. Mở MySQL Workbench.
2. File → Open SQL Script → chọn `database/canteen_go.sql`.
3. Bấm tia sét để chạy toàn bộ script.
4. Kiểm tra đã có database `canteen_go`.

## 3. Cấu hình backend
Mở Terminal trong thư mục `backend`:

```bash
npm install
```

Copy `.env.example` thành `.env` và sửa:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=canteen_go
JWT_SECRET=canteen-go-demo-secret
```

Sau đó chạy:

```bash
npm start
```

Mở trình duyệt: `http://localhost:3000`

## 4. Tài khoản demo
- Khách hàng – sinh viên: `student@vwa.edu.vn` / `123456`
- Khách hàng – giảng viên: `teacher@vwa.edu.vn` / `123456`
- Staff: `staff@canteen.vn` / `123456`
- Admin: `admin@canteen.vn` / `123456`

Các tài khoản demo được backend tự tạo bằng mật khẩu đã hash khi server khởi động; không lưu mật khẩu dạng plain text trong database.

## 5. Luồng demo nên chạy
### Khách hàng
Đăng nhập → Trang chủ → Thực đơn → Chi tiết món → Thêm giỏ → Chọn giờ nhận → Xác nhận đặt → Thanh toán giả lập → Lịch sử đơn → Theo dõi trạng thái → đánh giá sau khi Staff hoàn tất.

### Staff
Đăng nhập → Quản lý đơn → Xử lý: Xác nhận → Đang chuẩn bị → Sẵn sàng nhận → Đã giao.

### Admin
Đăng nhập → Tổng quan → Quản lý món → Danh mục → Đơn hàng → Người dùng & tài khoản → Kho & nguồn cung → Báo cáo & thống kê.

## 6. Kết nối frontend – backend
Frontend không cần sửa URL khi chạy cùng server vì dùng `/api`. Express phục vụ thư mục `frontend` và API cùng cổng 3000.

Nếu muốn chạy frontend riêng bằng Live Server, sửa `const API='/api';` trong `frontend/js/app.js` thành `const API='http://localhost:3000/api';` và bật CORS.

## 7. Ghi chú
Google OAuth trong đặc tả là điểm mở rộng cần Client ID/Secret thật của nhóm. Bản demo hiện có luồng đăng ký ngoài đơn vị và nút đăng nhập theo vai trò để không phụ thuộc credential bên ngoài.
