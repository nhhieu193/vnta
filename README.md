# Trưa Nay Ăn Gì? — Swiggy Food Spin & Admin Dashboard

Ứng dụng web giúp giải quyết câu hỏi "Trưa nay ăn gì?" với giao diện hiện đại phong cách Swiggy, hỗ trợ Vòng quay may mắn, Lắc Quẻ Trưa, phân quyền đăng nhập và bảng điều khiển Admin toàn diện.

## Tính Năng Nổi Bật

1. **Vòng Quay Món Ăn (Food Wheel)**: Quay ngẫu nhiên theo ngân sách, danh mục và bộ lọc món chay.
2. **Lắc Quẻ Trưa (Fortune Sticks)**: Trải nghiệm xin quẻ ẩm thực truyền thống với âm thanh sống động.
3. **Đăng Nhập Phân Quyền Chung (Unified Login)**:
   - Đăng nhập chung tại `index.html`.
   - **Tài khoản Admin** (`admin` / `admin`): Tự động chuyển hướng vào `admin.html`.
   - **Tài khoản User** (`user` / `123456`): Mở Consent Popup và tiếp tục trải nghiệm chọn món.
4. **Bảng Điều Khiển Admin (Admin Dashboard)**:
   - **Kho Đồ Ăn**: Thống kê, tìm kiếm, lọc theo danh mục toàn bộ kho món ăn.
   - **Hành Động User**: Log theo dõi 22+ hành vi tương tác của người dùng.
   - **Quản Lý User**: Thêm, xóa, xem danh sách tài khoản và mật khẩu.
   - **Cài Đặt Popup**: Tùy chỉnh nội dung tiêu đề, thông điệp, câu hỏi khi chọn "Không".

## Công Nghệ Sử Dụng

- HTML5, CSS3 (Vanilla CSS, Modern Glassmorphism & Dark Theme), JavaScript (ES6+).
- Lưu trữ dữ liệu: `localStorage` & `sessionStorage`.

## Hướng Dẫn Chạy

Mở trực tiếp file `index.html` trên bất kỳ trình duyệt web hiện đại nào.
