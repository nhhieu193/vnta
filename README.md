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
- Backend: Node.js + Express, phục vụ file tĩnh và API lưu dữ liệu.
- Lưu trữ dữ liệu: SQLite (`db/app.db`) là nguồn sự thật, đồng bộ hai chiều với `localStorage`/`sessionStorage` trên trình duyệt qua `hydrate.js`.

## Hướng Dẫn Chạy (local / VPS)

```bash
npm install
npm start        # mặc định chạy ở cổng 3000, đổi bằng biến môi trường PORT
```

Sau đó truy cập `http://<host>:3000/index.html` (hoặc `/admin.html`).

Dữ liệu (log hành động user, danh sách user, cài đặt popup/giao diện, counter) được lưu vào
file SQLite tại `db/app.db`. File này **không** bị xóa khi restart server hay redeploy code —
chỉ cần giữ nguyên thư mục `db/` trên VPS (hoặc trỏ biến môi trường `DB_DIR` sang một
thư mục khác, ví dụ ổ đĩa gắn ngoài, để backup/di chuyển dễ hơn).

### Chạy nền trên VPS (khuyến nghị dùng pm2)

```bash
npm install -g pm2
pm2 start server.js --name trua-nay-an-gi
pm2 save
pm2 startup   # để tự khởi động lại khi VPS reboot
```

Nên đặt Nginx/Caddy làm reverse proxy phía trước (trỏ domain vào cổng 3000) và bật HTTPS.

### Backup dữ liệu

Chỉ cần sao lưu định kỳ file `db/app.db` (và `db/app.db-wal`, `db/app.db-shm` nếu có).

## Deploy: Frontend trên GitHub Pages (free) + Dữ liệu trên VPS

Có thể tách đôi: người dùng vào bằng link GitHub Pages miễn phí
(`https://<username>.github.io/<repo>/`), còn dữ liệu vẫn lưu ở SQLite trên VPS của bạn.

1. **Trên VPS**: chạy `server.js` như hướng dẫn ở trên, đặt phía sau Nginx/Caddy với domain
   riêng và **bắt buộc bật HTTPS** (Let's Encrypt) — GitHub Pages luôn chạy HTTPS nên trình
   duyệt sẽ chặn gọi API qua HTTP (mixed content).
   Giới hạn domain được phép gọi API bằng biến môi trường, ví dụ:
   ```bash
   ALLOWED_ORIGINS="https://<username>.github.io" pm2 start server.js --name trua-nay-an-gi
   ```
2. **Sửa `config.js`** trong repo, trỏ về domain API vừa cấu hình:
   ```js
   window.TNAG_API_BASE = 'https://api.miendomain.com';
   ```
3. **Push code lên GitHub**, vào Settings → Pages, chọn nhánh/thư mục chứa `index.html` làm
   nguồn build. GitHub sẽ cấp link dạng `https://<username>.github.io/<repo>/`.
4. Người dùng vào bằng link GitHub Pages đó; `hydrate.js` sẽ tự gọi API trên VPS để đọc/ghi
   dữ liệu, nên log/user/cài đặt vẫn dùng chung một SQLite thay vì mỗi người một bản riêng.

Lưu ý: GitHub Pages chỉ host được file tĩnh (HTML/CSS/JS) — không thể tự chạy `server.js`
hay SQLite trên đó, nên phần API bắt buộc phải chạy ở nơi có server thật (VPS) như trên.
# vnta
