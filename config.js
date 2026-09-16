// config.js - Chỉ cần chỉnh khi deploy frontend lên GitHub Pages (domain khác VPS).
// Để trống ('') nếu chạy frontend + API cùng domain (VD: mở thẳng qua server.js trên VPS).
window.TNAG_API_BASE = 'https://fdwta.onrender.com';

// Phải khớp với biến môi trường API_KEY khi chạy server.js trên VPS (xem README).
// Không phải bí mật tuyệt đối (ai xem view-source cũng thấy), chỉ để chặn bot/người
// lạ dò ra URL API rồi gọi thẳng mà không qua trang web.
window.TNAG_API_KEY = 'wCe3-XNVPK3M1aJJhgTGfxrdCiknfvnM';
