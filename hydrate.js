// hydrate.js - Đồng bộ localStorage với SQLite qua API /api/kv
// Phải load TRƯỚC app.js/admin.js để dữ liệu server có sẵn trong localStorage
// trước khi các đoạn code khác đọc localStorage.
(function () {
  var SYNC_KEYS = [
    'tnag_user_actions',
    'tnag_users',
    'tnag_popup_settings',
    'tnag_ui_settings'
  ];

  // API_BASE trống = cùng domain (relative path). Khi frontend host trên GitHub Pages
  // và API chạy trên VPS domain khác, khai báo window.TNAG_API_BASE trong config.js.
  var API_BASE = (window.TNAG_API_BASE || '').replace(/\/+$/, '');

  // 1) Kéo dữ liệu mới nhất từ server về localStorage (đồng bộ, chặn tải trang
  //    một chút để đảm bảo code chạy sau đọc được dữ liệu đã đồng bộ).
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/kv', false);
    xhr.send(null);
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      SYNC_KEYS.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(key, data[key]);
        }
      });
    }
  } catch (e) {
    // Server chưa sẵn sàng (vd. mở file trực tiếp không qua server) -> dùng localStorage cũ
  }

  // 2) Ghi đè setItem/removeItem để mọi thay đổi được đẩy lên server
  var nativeSetItem = Storage.prototype.setItem;
  var nativeRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function (key, value) {
    nativeSetItem.apply(this, arguments);
    if (this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: value })
      }).catch(function () {});
    }
  };

  Storage.prototype.removeItem = function (key) {
    nativeRemoveItem.apply(this, arguments);
    if (this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), { method: 'DELETE' }).catch(function () {});
    }
  };
})();
