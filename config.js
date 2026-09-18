// config.js - Chỉ cần chỉnh khi deploy frontend lên GitHub Pages (domain khác VPS).
// Để trống ('') vì frontend + API cùng domain calaci.store (server.js phục vụ cả hai qua Node.js Project + Proxy trong aaPanel).
window.TNAG_API_BASE = '';

// Phải khớp với biến môi trường API_KEY khi chạy server.js trên VPS (xem README).
// Để trống nếu chưa cấu hình API_KEY trên server.
window.TNAG_API_KEY = '';
