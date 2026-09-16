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

## Deploy: Frontend GitHub Pages + Domain HTTPS free từ Render + Data trên VPS

Kiến trúc 3 phần, tất cả free trừ VPS bạn đã có sẵn:

```
Trình duyệt --HTTPS--> GitHub Pages (frontend tĩnh)
Trình duyệt --HTTPS--> Render (chỉ để có domain + SSL free) --HTTP nội bộ--> VPS (server.js + SQLite)
```

GitHub Pages luôn chạy HTTPS nên trình duyệt sẽ chặn gọi thẳng tới VPS nếu VPS chỉ có
IP/HTTP. Thay vì tự cấu hình domain + SSL cho VPS, dùng Render làm lớp trung gian: Render
cấp sẵn domain `https://<tên-app>.onrender.com` có SSL miễn phí, chỉ việc forward request
sang VPS. Code phần proxy này nằm ở thư mục [`render-proxy/`](render-proxy/server.js).

**1. Chạy server chính trên VPS** (dữ liệu lưu ở đây):
```bash
npm install
ALLOWED_ORIGINS="https://<username>.github.io" API_KEY="<chuỗi bí mật tự đặt>" pm2 start server.js --name trua-nay-an-gi
pm2 save && pm2 startup
```
Mở port server đang chạy (mặc định 3000) trên firewall VPS để Render gọi vào được.

`API_KEY` là tùy chọn nhưng khuyên dùng — không có nó, ai biết URL API cũng đọc/ghi
được thẳng dữ liệu (kể cả mật khẩu user) mà không cần qua trang web. Giá trị này phải
khớp với `window.TNAG_API_KEY` trong [`config.js`](config.js).

**2. Deploy `render-proxy/` lên Render**:
- Trên Render Dashboard: **New +** → **Web Service** → chọn repo `nhhieu193/vnta`.
- **Root Directory**: `render-proxy`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variable**: `VPS_ORIGIN` = `http://<ip-vps>:3000` (đổi cổng nếu khác)
- Deploy xong Render cấp domain dạng `https://vnta-proxy.onrender.com`.
- Lưu ý gói Render free sẽ "ngủ" sau ~15 phút không có request, lần gọi đầu tiên sau đó
  chậm khoảng 30–50 giây để khởi động lại — người dùng đầu tiên trong ngày có thể phải chờ.

**3. Trỏ frontend về domain Render**, sửa [`config.js`](config.js):
```js
window.TNAG_API_BASE = 'https://vnta-proxy.onrender.com';
```

**4. Push code lên GitHub và bật Pages**:
```bash
git add .
git commit -m "feat: thêm backend SQLite + proxy Render cho GitHub Pages"
git push -u origin main
```
Vào repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)`.
GitHub cấp link `https://nhhieu193.github.io/vnta/` — đây là link người dùng sẽ vào.

Người dùng vào bằng link GitHub Pages đó; `hydrate.js` sẽ gọi API qua domain Render, Render
forward vào VPS, dữ liệu (log/user/cài đặt) lưu chung một file SQLite trên VPS thay vì mỗi
người một bản `localStorage` riêng.

## Deploy: Trỏ thẳng vào VPS (không qua Render) — khuyên dùng vì VPS không bao giờ ngủ

Cách trên dùng Render chỉ để có domain HTTPS miễn phí, nhưng gói free của Render sẽ
"ngủ" sau ~15 phút không có request, lần gọi đầu tiên sau đó chậm 30–50 giây. Nếu VPS của
bạn chạy 24/7 không nghỉ, tốt hơn nên cấp HTTPS trực tiếp cho VPS và bỏ hẳn lớp Render.

VPS chưa có domain riêng? Dùng dịch vụ miễn phí **nip.io** — biến địa chỉ IP thành một
domain thật (`<ip-vps>.nip.io`) để xin SSL Let's Encrypt được, không cần mua domain.

**1. Tạo website trỏ tới app Node.js trong aaPanel**:
- aaPanel → **Website** → **Add site**.
- Domain: `<ip-vps-thay-dấu-chấm-bằng-gạch>.nip.io` (ví dụ IP `103.109.187.123` →
  domain `103-109-187-123.nip.io`).
- Sau khi tạo xong, vào site đó → **Reverse Proxy** (hoặc "Proxy ngược") → thêm rule trỏ
  về `http://127.0.0.1:3000` (cổng server.js đang chạy).

**2. Xin SSL miễn phí**:
- Vẫn trong site đó → tab **SSL** → chọn **Let's Encrypt** → Apply.
  (Cần port 80 mở ra ngoài để Let's Encrypt xác thực domain.)
- Xong, site có thể truy cập qua `https://103-109-187-123.nip.io`.

**3. Cập nhật `config.js`**, trỏ thẳng về domain VPS thay vì Render:
```js
window.TNAG_API_BASE = 'https://103-109-187-123.nip.io';
```

**4. Cập nhật `ALLOWED_ORIGINS`** trên VPS (không đổi, vẫn là domain GitHub Pages vì đó
mới là nơi trình duyệt người dùng gửi request đi):
```bash
pm2 delete trua-nay-an-gi
ALLOWED_ORIGINS="https://<username>.github.io" API_KEY="<chuỗi bí mật>" pm2 start server.js --name trua-nay-an-gi
pm2 save
```

Sau bước này có thể xóa Web Service trên Render (không cần nữa) — Render chỉ còn hữu ích
nếu sau này VPS đổi IP hoặc bạn muốn có lớp trung gian dự phòng.
# vnta
