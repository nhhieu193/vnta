// hydrate.js - Đồng bộ localStorage với MySQL qua API /api/kv
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
    'tnag_dishes',
    'tnag_music'
  ];

  // Các key dạng "nhật ký" mà nhiều thiết bị cùng ghi thêm (điện thoại người dùng + máy admin).
  // Không ghi đè cả mảng (thiết bị nào lưu sau sẽ xóa mất dòng của thiết bị kia), mà chỉ gửi
  // các dòng MỚI thêm lên để server nối vào. Giá trị = số dòng tối đa server giữ lại.
  var APPEND_KEYS = {
    tnag_user_actions: 500,
    tnag_plans: 500
  };

  // API_BASE trống = cùng domain (relative path). Khai báo window.TNAG_API_BASE trong
  // config.js nếu frontend và API chạy khác domain.
  var API_BASE = (window.TNAG_API_BASE || '').replace(/\/+$/, '');
  // Khớp với API_KEY trên server (nếu có cấu hình) để tránh người lạ gọi thẳng API.
  var API_KEY = window.TNAG_API_KEY || '';

  var nativeSetItem = Storage.prototype.setItem;
  var nativeRemoveItem = Storage.prototype.removeItem;

  // Giá trị lần cuối đã khớp với server của từng key, để tính các dòng mới cần gửi
  var lastSynced = {};

  function headers(json) {
    var h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (API_KEY) h['X-API-Key'] = API_KEY;
    return h;
  }

  function reportError(key, err) {
    console.warn('[hydrate] Không lưu được "' + key + '" lên server:', err);
    try { window.dispatchEvent(new CustomEvent('tnag-sync-error', { detail: { key: key } })); } catch (e) {}
  }

  function parseArray(str) {
    try { var v = JSON.parse(str || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }

  // 1) Kéo dữ liệu mới nhất từ server về localStorage (đồng bộ, chặn tải trang
  //    một chút để đảm bảo code chạy sau đọc được dữ liệu đã đồng bộ).
  //
  //    QUAN TRỌNG: nếu bước này thất bại (server đang restart, mất mạng...), thiết bị
  //    sẽ TẮT việc đẩy dữ liệu lên server trong suốt phiên này. Nếu không, các đoạn
  //    code "nếu localStorage rỗng thì tự ghi giá trị mặc định" (getUsers,
  //    getPopupSettings...) sẽ ghi đè dữ liệu mặc định/rỗng lên server, xóa mất dữ
  //    liệu thật mà các thiết bị khác đã tích lũy trước đó.
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
          nativeSetItem.call(window.localStorage, key, data[key]);
          lastSynced[key] = data[key];
        } else {
          // Server chưa có key này: dòng cũ còn trong máy (nếu có) coi như chưa gửi
          lastSynced[key] = APPEND_KEYS[key] ? '[]' : null;
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

  function pushAppend(key, value) {
    // Chỉ gửi những dòng chưa có trong bản đã khớp với server
    var seen = {};
    parseArray(lastSynced[key]).forEach(function (item) { seen[JSON.stringify(item)] = true; });
    var items = parseArray(value).filter(function (item) { return !seen[JSON.stringify(item)]; });
    lastSynced[key] = value;
    if (!items.length) return;
    fetch(API_BASE + '/api/kv/' + encodeURIComponent(key) + '/append', {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ items: items, max: APPEND_KEYS[key] })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }).catch(function (err) { reportError(key, err); });
  }

  function pushReplace(key, value) {
    lastSynced[key] = value;
    fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify({ value: value })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }).catch(function (err) { reportError(key, err); });
  }

  // 2) Ghi đè setItem/removeItem để mọi thay đổi được đẩy lên server
  //    (chỉ khi bước 1 ở trên thành công, xem giải thích phía trên).
  Storage.prototype.setItem = function (key, value) {
    nativeSetItem.apply(this, arguments);
    if (syncEnabled && this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      if (APPEND_KEYS[key]) pushAppend(key, String(value));
      else pushReplace(key, String(value));
    }
  };

  Storage.prototype.removeItem = function (key) {
    nativeRemoveItem.apply(this, arguments);
    if (syncEnabled && this === window.localStorage && SYNC_KEYS.indexOf(key) !== -1) {
      lastSynced[key] = APPEND_KEYS[key] ? '[]' : null;
      fetch(API_BASE + '/api/kv/' + encodeURIComponent(key), { method: 'DELETE', headers: headers(false) })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); })
        .catch(function (err) { reportError(key, err); });
    }
  };

  // 3) Cho trang admin kéo lại dữ liệu mới nhất (vd. bấm "Làm mới" để thấy log / kế hoạch
  //    mà điện thoại người dùng vừa gửi lên), không cần tải lại cả trang.
  window.TNAG_SYNC = {
    enabled: syncEnabled,
    refresh: function (keys) {
      if (!syncEnabled) return Promise.resolve(false);
      return fetch(API_BASE + '/api/kv', { headers: headers(false), cache: 'no-store' })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (data) {
          (keys || SYNC_KEYS).forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              nativeSetItem.call(window.localStorage, key, data[key]);
              lastSynced[key] = data[key];
            }
          });
          return true;
        })
        .catch(function (err) { console.warn('[hydrate] Làm mới thất bại:', err); return false; });
    }
  };
})();
