// hydrate.js - Đồng bộ localStorage với SQLite qua API /api/kv
// Phải load TRƯỚC app.js/admin.js để dữ liệu server có sẵn trong localStorage
// trước khi các đoạn code khác đọc localStorage.
(function () {
  var SYNC_KEYS = [
    'tnag_user_actions',
    'tnag_users',
    'tnag_popup_settings',
    'tnag_ui_settings',
    'tnag_plan_cafes',
    'tnag_plan_movies',
    'tnag_plan_thankyou',
    'tnag_plans',
    'tnag_dishes'
  ];

  // API_BASE trống = cùng domain (relative path). Khi frontend host trên GitHub Pages
  // và API chạy trên VPS domain khác, khai báo window.TNAG_API_BASE trong config.js.
  var API_BASE = (window.TNAG_API_BASE || '').replace(/\/+$/, '');
  // Khớp với API_KEY trên server (nếu có cấu hình) để tránh người lạ gọi thẳng API.
  var API_KEY = window.TNAG_API_KEY || '';

  // 1) Kéo dữ liệu mới nhất từ server về localStorage (đồng bộ, chặn tải trang
  //    một chút để đảm bảo code chạy sau đọc được dữ liệu đã đồng bộ).
  //
  //    QUAN TRỌNG: nếu bước này thất bại (server đang restart, Render "ngủ" chưa
  //    kịp dậy, mất mạng...), thiết bị sẽ TẮT việc đẩy dữ liệu lên server trong
  //    suốt phiên này. Nếu không, các đoạn code "nếu localStorage rỗng thì tự
  //    ghi giá trị mặc định" (getUsers, getPopupSettings...) sẽ ghi đè dữ liệu
  //    mặc định/rỗng lên server, xóa mất dữ liệu thật mà các thiết bị khác đã
  //    tích lũy trước đó.
  var syncEnabled = false;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/kv', false);
    if (API_KEY) xhr.setRequestHeader('X-API-Key', API_KEY);
    xhr.send(null);
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      SYNC_KEYS.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(key, data[key]);
        }
      });
      syncEnabled = true;
    } else {
      console.warn('[hydrate] Không lấy được dữ liệu từ server (status ' + xhr.status + ') — tắt đồng bộ ghi trong phiên này, chỉ dùng dữ liệu local.');
    }
  } catch (e) {
    // Server chưa sẵn sàng (vd. mở file trực tiếp không qua server, mất mạng...)
    console.warn('[hydrate] Không kết nối được server — tắt đồng bộ ghi trong phiên này, chỉ dùng dữ liệu local.');
  }

  // 2) Ghi đè setItem/removeItem để mọi thay đổi được đẩy lên server
  //    (chỉ khi bước 1 ở trên thành công, xem giải thích phía trên).
  var nativeSetItem = Storage.prototype.setItem;
  var nativeRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function (key, value) {
    nativeSetItem.apply(this, arguments);
    if (syncEnabled && this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      var headers = { 'Content-Type': 'application/json' };
      if (API_KEY) headers['X-API-Key'] = API_KEY;
      fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ value: value })
      }).catch(function () {});
    }
  };

  Storage.prototype.removeItem = function (key) {
    nativeRemoveItem.apply(this, arguments);
    if (syncEnabled && this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      var headers = {};
      if (API_KEY) headers['X-API-Key'] = API_KEY;
      fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), { method: 'DELETE', headers: headers }).catch(function () {});
    }
  };
})();
