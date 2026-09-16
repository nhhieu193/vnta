// admin.js - Admin Dashboard Logic

const { DISHES } = window.TNAG_DATA;

// ==========================================
// ACTION TYPES REFERENCE
// ==========================================
const ACTION_TYPES = {
  LOGIN:           { label: 'Đăng nhập',       icon: '🔐', color: '#3b82f6' },
  POPUP_YES:       { label: 'Popup: Có',        icon: '✅', color: '#22c55e' },
  POPUP_NO:        { label: 'Popup: Không',      icon: '❌', color: '#ef4444' },
  SPIN_WHEEL:      { label: 'Quay vòng',        icon: '🎯', color: '#fc8019' },
  SHAKE_QUE:       { label: 'Xin quẻ',          icon: '🎋', color: '#dc2626' },
  SWITCH_THEME:    { label: 'Đổi chế độ',       icon: '🎨', color: '#8b5cf6' },
  CHANGE_CATEGORY: { label: 'Đổi danh mục',     icon: '📂', color: '#14b8a6' },
  CHANGE_BUDGET:   { label: 'Đổi ngân sách',    icon: '💰', color: '#f59e0b' },
  TOGGLE_VEG:      { label: 'Lọc chay',         icon: '🌱', color: '#22c55e' },
  ADD_DISH:        { label: 'Thêm món',          icon: '➕', color: '#60a5fa' },
  REMOVE_DISH:     { label: 'Xóa món',           icon: '🗑️', color: '#f87171' },
  SEARCH_CATALOG:  { label: 'Tìm kiếm',         icon: '🔍', color: '#a78bfa' },
  VIEW_RESULT:     { label: 'Xem kết quả',      icon: '👁️', color: '#fb923c' },
  SHARE_DISH:      { label: 'Chia sẻ',           icon: '🔗', color: '#06b6d4' },
  CLICK_MAPS:      { label: 'Quán gần đây',     icon: '📍', color: '#4ade80' },
  CLICK_DELIVERY:  { label: 'Đặt món',           icon: '🛵', color: '#ec4899' },
  SPIN_AGAIN:      { label: 'Quay lại',          icon: '🔄', color: '#fdba74' },
  TOGGLE_SOUND:    { label: 'Âm thanh',          icon: '🔊', color: '#94a3b8' },
  CLICK_HEART:     { label: 'Bấm tim',           icon: '💖', color: '#f472b6' },
  QUICK_RANDOM:    { label: 'Random 8 món',      icon: '🎲', color: '#93c5fd' },
  QUICK_FILTER:    { label: 'Từ bộ lọc',         icon: '⚡', color: '#fcd34d' },
  QUICK_RESET:     { label: 'Khôi phục gốc',    icon: '🔄', color: '#cbd5e1' },
  USER_ADDED:      { label: 'Thêm tài khoản',   icon: '👤', color: '#10b981' },
  USER_DELETED:    { label: 'Xóa tài khoản',    icon: '🗑️', color: '#ef4444' }
};

// ==========================================
// DOM REFERENCES
// ==========================================
const DOM = {
  navItems: document.querySelectorAll('.nav-item'),
  tabs: document.querySelectorAll('.tab-content'),
  headerTitle: document.getElementById('header-title'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  sidebar: document.getElementById('admin-sidebar'),

  // Header & Session
  adminUserGreeting: document.getElementById('admin-user-greeting'),
  adminLogoutBtn: document.getElementById('admin-logout-btn'),
  adminToast: document.getElementById('admin-toast'),

  // Food tab
  foodStatsGrid: document.getElementById('food-stats-grid'),
  foodSearch: document.getElementById('food-search'),
  foodFilterChips: document.getElementById('food-filter-chips'),
  foodTableBody: document.getElementById('food-table-body'),

  // Tracking tab
  trackingStatsGrid: document.getElementById('tracking-stats-grid'),
  trackingRefreshBtn: document.getElementById('tracking-refresh-btn'),
  trackingClearBtn: document.getElementById('tracking-clear-btn'),
  trackingTableBody: document.getElementById('tracking-table-body'),
  actionLegend: document.getElementById('action-legend'),

  // Users tab
  usersStatsGrid: document.getElementById('users-stats-grid'),
  addUserForm: document.getElementById('add-user-form'),
  newUsername: document.getElementById('new-username'),
  newPassword: document.getElementById('new-password'),
  newRole: document.getElementById('new-role'),
  toggleNewPwdBtn: document.getElementById('toggle-new-pwd-btn'),
  usersSearch: document.getElementById('users-search'),
  usersTableBody: document.getElementById('users-table-body'),

  // Popup settings tab
  popupForm: document.getElementById('popup-settings-form'),
  popupTitle: document.getElementById('popup-title'),
  popupMessage: document.getElementById('popup-message'),
  popupYesText: document.getElementById('popup-yes-text'),
  popupNoText: document.getElementById('popup-no-text'),
  popupNoQuestions: document.getElementById('popup-no-questions'),
  resetPopupSettings: document.getElementById('reset-popup-settings'),

  // UI settings tab
  uiSettingsForm: document.getElementById('uisettings-form'),
  uiBrandLocation: document.getElementById('ui-brand-location'),
  uiKetTitle: document.getElementById('ui-ket-title'),
  uiQueTitle: document.getElementById('ui-que-title'),
  uiKetBadge: document.getElementById('ui-ket-badge'),
  uiQueBadge: document.getElementById('ui-que-badge'),
  uiFooterText: document.getElementById('ui-footer-text'),
  resetUiSettings: document.getElementById('reset-uisettings'),

  // Preview
  previewTitle: document.getElementById('preview-title'),
  previewMessage: document.getElementById('preview-message'),
  previewExtra: document.getElementById('preview-extra'),
  previewQuestion: document.getElementById('preview-question'),
  previewBtnYes: document.getElementById('preview-btn-yes'),
  previewBtnNo: document.getElementById('preview-btn-no')
};

// ==========================================
// TAB NAVIGATION
// ==========================================
const TAB_TITLES = {
  food: '🍲 Kho Đồ Ăn',
  tracking: '📊 Hành Động User',
  users: '👥 Quản Lý Người Dùng',
  popup: '⚙️ Cài Đặt Popup',
  uisettings: '🎨 Cài Đặt Giao Diện'
};

function switchTab(tabName) {
  DOM.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  DOM.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.id === 'tab-' + tabName);
  });
  DOM.headerTitle.textContent = TAB_TITLES[tabName] || '';

  if (tabName === 'tracking') renderTrackingTab();
  if (tabName === 'food') renderFoodTab();
  if (tabName === 'users') renderUsersTab();
  if (tabName === 'popup') loadPopupSettings();
  if (tabName === 'uisettings') loadUiSettings();

  // Close mobile sidebar
  DOM.sidebar.classList.remove('open');
}

// ==========================================
// TAB 1: KHO ĐỒ ĂN
// ==========================================
let currentFoodFilter = 'all';

function renderFoodStats() {
  const catCounts = {};
  DISHES.forEach(d => {
    catCounts[d.category] = (catCounts[d.category] || 0) + 1;
  });

  const avgPrice = Math.round(DISHES.reduce((s, d) => s + d.price, 0) / DISHES.length);
  const vegCount = DISHES.filter(d => d.isVegetarian).length;

  DOM.foodStatsGrid.innerHTML = `
    <div class="stat-card" data-color="orange">
      <span class="stat-icon">🍲</span>
      <span class="stat-label">Tổng số món</span>
      <span class="stat-value">${DISHES.length}</span>
    </div>
    <div class="stat-card" data-color="green">
      <span class="stat-icon">🌱</span>
      <span class="stat-label">Món chay</span>
      <span class="stat-value">${vegCount}</span>
    </div>
    <div class="stat-card" data-color="blue">
      <span class="stat-icon">💰</span>
      <span class="stat-label">Giá trung bình</span>
      <span class="stat-value">${avgPrice.toLocaleString('vi-VN')}đ</span>
    </div>
    <div class="stat-card" data-color="purple">
      <span class="stat-icon">📂</span>
      <span class="stat-label">Danh mục</span>
      <span class="stat-value">${Object.keys(catCounts).length}</span>
    </div>
  `;
}

function renderFoodTable(dishes) {
  if (dishes.length === 0) {
    DOM.foodTableBody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p class="empty-state-text">Không tìm thấy món ăn nào</p>
        </div>
      </td></tr>
    `;
    return;
  }

  DOM.foodTableBody.innerHTML = dishes.map(dish => `
    <tr>
      <td style="color: var(--admin-text-dim); font-size: 0.78rem;">${dish.id}</td>
      <td style="font-size: 1.4rem;">${dish.emoji}</td>
      <td><strong>${dish.name}</strong></td>
      <td>${dish.categoryName || dish.category}</td>
      <td>${dish.priceDisplay}</td>
      <td style="font-size: 0.82rem; color: var(--admin-text-muted);">${dish.origin}</td>
      <td>${dish.isVegetarian ? '<span class="veg-tag">🌱 Chay</span>' : '<span class="nonveg-tag">Mặn</span>'}</td>
    </tr>
  `).join('');
}

function filterFoodTable() {
  const query = (DOM.foodSearch.value || '').toLowerCase().trim();
  let filtered = DISHES;

  if (currentFoodFilter !== 'all') {
    filtered = filtered.filter(d => d.category === currentFoodFilter);
  }

  if (query) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.origin.toLowerCase().includes(query) ||
      d.categoryName.toLowerCase().includes(query)
    );
  }

  renderFoodTable(filtered);
}

function renderFoodTab() {
  renderFoodStats();
  filterFoodTable();
}

// ==========================================
// TAB 2: HÀNH ĐỘNG USER (TRACKING)
// ==========================================
function getTrackingActions() {
  try {
    return JSON.parse(localStorage.getItem('tnag_user_actions') || '[]');
  } catch (e) {
    return [];
  }
}

function renderTrackingStats() {
  const actions = getTrackingActions();
  const totalActions = actions.length;
  const loginCount = actions.filter(a => a.action === 'LOGIN').length;
  const spinCount = actions.filter(a => a.action === 'SPIN_WHEEL').length;
  const queCount = actions.filter(a => a.action === 'SHAKE_QUE').length;
  const noCount = actions.filter(a => a.action === 'POPUP_NO').length;

  DOM.trackingStatsGrid.innerHTML = `
    <div class="stat-card" data-color="orange">
      <span class="stat-icon">📊</span>
      <span class="stat-label">Tổng hành động</span>
      <span class="stat-value">${totalActions}</span>
    </div>
    <div class="stat-card" data-color="blue">
      <span class="stat-icon">🔐</span>
      <span class="stat-label">Lượt đăng nhập</span>
      <span class="stat-value">${loginCount}</span>
    </div>
    <div class="stat-card" data-color="green">
      <span class="stat-icon">🎯</span>
      <span class="stat-label">Lượt quay</span>
      <span class="stat-value">${spinCount + queCount}</span>
    </div>
    <div class="stat-card" data-color="red">
      <span class="stat-icon">❌</span>
      <span class="stat-label">Popup: Từ chối</span>
      <span class="stat-value">${noCount}</span>
    </div>
  `;
}

function renderActionLegend() {
  DOM.actionLegend.innerHTML = Object.entries(ACTION_TYPES).map(([key, info]) => `
    <div class="legend-item">
      <span class="action-badge action-${key}">${info.icon} ${info.label}</span>
    </div>
  `).join('');
}

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (e) {
    return iso;
  }
}

function renderTrackingTable() {
  const actions = getTrackingActions();

  if (actions.length === 0) {
    DOM.trackingTableBody.innerHTML = `
      <tr><td colspan="4">
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p class="empty-state-text">Chưa có hành động nào được ghi nhận</p>
        </div>
      </td></tr>
    `;
    return;
  }

  // Show newest first
  const reversed = [...actions].reverse();
  DOM.trackingTableBody.innerHTML = reversed.map((act, idx) => {
    const typeInfo = ACTION_TYPES[act.action] || { label: act.action, icon: '❓' };
    return `
      <tr>
        <td style="color: var(--admin-text-dim); font-size: 0.78rem;">${actions.length - idx}</td>
        <td style="font-size: 0.82rem; white-space: nowrap;">${formatTimestamp(act.timestamp)}</td>
        <td><span class="action-badge action-${act.action}">${typeInfo.icon} ${typeInfo.label}</span></td>
        <td style="font-size: 0.85rem; color: var(--admin-text-muted);">${act.detail || '—'}</td>
      </tr>
    `;
  }).join('');
}

function renderTrackingTab() {
  renderTrackingStats();
  renderActionLegend();
  renderTrackingTable();
}

// ==========================================
// SESSION & AUTH
// ==========================================
function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem('tnag_current_user') || localStorage.getItem('tnag_current_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function checkAdminSession() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    // If not admin or not logged in, redirect to login page
    window.location.href = 'index.html';
    return false;
  }
  if (DOM.adminUserGreeting) {
    DOM.adminUserGreeting.innerHTML = `Xin chào, <strong>${escapeHtml(user.username)}</strong>`;
  }
  return true;
}

function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
    sessionStorage.removeItem('tnag_current_user');
    localStorage.removeItem('tnag_current_user');
    logAdminAction('LOGIN', 'Admin đã đăng xuất');
    window.location.href = 'index.html';
  }
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function logAdminAction(actionType, detail) {
  try {
    const actions = JSON.parse(localStorage.getItem('tnag_user_actions') || '[]');
    actions.push({
      timestamp: new Date().toISOString(),
      action: actionType,
      detail: detail
    });
    if (actions.length > 500) actions.splice(0, actions.length - 500);
    localStorage.setItem('tnag_user_actions', JSON.stringify(actions));
  } catch (e) {}
}

// ==========================================
// TAB 3: QUẢN LÝ USER
// ==========================================
const DEFAULT_USERS = [
  { id: 'u_admin', username: 'admin', password: 'admin', role: 'admin', createdAt: '16/09/2026' },
  { id: 'u_user', username: 'user', password: '123456', role: 'user', createdAt: '16/09/2026' }
];

function getUsers() {
  try {
    const raw = localStorage.getItem('tnag_users');
    if (!raw) {
      localStorage.setItem('tnag_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('tnag_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('tnag_users', JSON.stringify(users));
}

let visiblePasswords = new Set();
let currentUsersSearch = '';

function renderUsersStats(users) {
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const currentUser = getCurrentUser();

  DOM.usersStatsGrid.innerHTML = `
    <div class="stat-card" data-color="purple">
      <span class="stat-icon">👥</span>
      <span class="stat-label">Tổng số tài khoản</span>
      <span class="stat-value">${users.length}</span>
    </div>
    <div class="stat-card" data-color="orange">
      <span class="stat-icon">🛡️</span>
      <span class="stat-label">Quản trị viên (Admin)</span>
      <span class="stat-value">${adminCount}</span>
    </div>
    <div class="stat-card" data-color="blue">
      <span class="stat-icon">👤</span>
      <span class="stat-label">Người dùng thường</span>
      <span class="stat-value">${userCount}</span>
    </div>
    <div class="stat-card" data-color="green">
      <span class="stat-icon">🟢</span>
      <span class="stat-label">Phiên hiện tại</span>
      <span class="stat-value" style="font-size: 1.25rem;">${currentUser ? escapeHtml(currentUser.username) : 'admin'}</span>
    </div>
  `;
}

function filterUsersTable() {
  const users = getUsers();
  const query = currentUsersSearch.toLowerCase().trim();
  const filtered = users.filter(u => {
    return !query ||
      u.username.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query);
  });
  renderUsersTable(filtered);
}

function renderUsersTable(filteredUsers) {
  const currentUser = getCurrentUser();
  const currentUsername = currentUser ? currentUser.username.toLowerCase() : 'admin';

  if (filteredUsers.length === 0) {
    DOM.usersTableBody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p class="empty-state-text">Không tìm thấy tài khoản người dùng nào</p>
        </div>
      </td></tr>
    `;
    return;
  }

  DOM.usersTableBody.innerHTML = filteredUsers.map((u, index) => {
    const isCurrent = u.username.toLowerCase() === currentUsername;
    const isPwdVisible = visiblePasswords.has(u.id);
    const pwdDisplay = isPwdVisible ? u.password : '••••••••';
    const roleBadge = u.role === 'admin'
      ? `<span class="badge-role role-admin">🛡️ Admin</span>`
      : `<span class="badge-role role-user">👤 User</span>`;

    return `
      <tr>
        <td><strong>${index + 1}</strong></td>
        <td>
          <div class="user-cell">
            <span class="user-avatar">${u.role === 'admin' ? '🛡️' : '👤'}</span>
            <span class="user-name-text">${escapeHtml(u.username)}</span>
            ${isCurrent ? '<span class="badge-current-user">Bạn</span>' : ''}
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="pwd-masked" id="pwd-val-${u.id}">${escapeHtml(pwdDisplay)}</span>
            <button type="button" class="btn-toggle-eye" onclick="toggleUserPwd('${u.id}')" title="${isPwdVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}">
              ${isPwdVisible ? '🙈' : '👁️'}
            </button>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td><span style="color:var(--admin-text-dim);font-size:0.85rem;">${u.createdAt || '16/09/2026'}</span></td>
        <td>
          <button type="button" class="btn-delete-user" ${isCurrent ? 'disabled title="Không thể xóa tài khoản của chính bạn"' : `onclick="deleteUser('${u.id}')"`}>
            🗑️ Xóa
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderUsersTab() {
  const users = getUsers();
  renderUsersStats(users);
  filterUsersTable();
}

function handleAddUser(e) {
  e.preventDefault();
  const username = (DOM.newUsername ? DOM.newUsername.value.trim() : '');
  const password = (DOM.newPassword ? DOM.newPassword.value : '');
  const role = (DOM.newRole ? DOM.newRole.value : 'user');

  if (!username) {
    showAdminToast('Vui lòng nhập tên đăng nhập!', 'error');
    return;
  }
  if (!password) {
    showAdminToast('Vui lòng nhập mật khẩu!', 'error');
    return;
  }

  const users = getUsers();
  const isDuplicate = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (isDuplicate) {
    showAdminToast(`Tên đăng nhập "${username}" đã tồn tại!`, 'error');
    return;
  }

  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

  const newUser = {
    id: 'u_' + Date.now(),
    username: username,
    password: password,
    role: role,
    createdAt: dateStr
  };

  users.push(newUser);
  saveUsers(users);

  logAdminAction('USER_ADDED', `Thêm tài khoản "${username}" (vai trò: ${role})`);
  showAdminToast(`Đã thêm tài khoản "${username}" thành công!`, 'success');

  DOM.addUserForm.reset();
  renderUsersTab();
}

function deleteUser(userId) {
  const users = getUsers();
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) return;

  const currentUser = getCurrentUser();
  if (currentUser && targetUser.username.toLowerCase() === currentUser.username.toLowerCase()) {
    showAdminToast('Không thể xóa tài khoản Admin đang đăng nhập!', 'error');
    return;
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  if (targetUser.role === 'admin' && adminCount <= 1) {
    showAdminToast('Hệ thống phải có ít nhất 1 tài khoản Admin!', 'error');
    return;
  }

  if (confirm(`Bạn có chắc muốn xóa tài khoản "${targetUser.username}"? Hành động này không thể hoàn tác.`)) {
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    logAdminAction('USER_DELETED', `Xóa tài khoản "${targetUser.username}" (${targetUser.role})`);
    showAdminToast(`Đã xóa tài khoản "${targetUser.username}"!`, 'success');
    renderUsersTab();
  }
}

window.toggleUserPwd = function (userId) {
  if (visiblePasswords.has(userId)) {
    visiblePasswords.delete(userId);
  } else {
    visiblePasswords.add(userId);
  }
  filterUsersTable();
};

window.deleteUser = deleteUser;

// ==========================================
// TAB 4: CÀI ĐẶT POPUP
// ==========================================
const DEFAULT_POPUP = {
  title: '',
  message: '',
  yesText: 'Có',
  noText: 'Không',
  noQuestions: []
};

function getPopupSettings() {
  try {
    return JSON.parse(localStorage.getItem('tnag_popup_settings') || 'null') || { ...DEFAULT_POPUP };
  } catch (e) {
    return { ...DEFAULT_POPUP };
  }
}

function loadPopupSettings() {
  const settings = getPopupSettings();
  DOM.popupTitle.value = settings.title || '';
  DOM.popupMessage.value = settings.message || '';
  DOM.popupYesText.value = settings.yesText || 'Có';
  DOM.popupNoText.value = settings.noText || 'Không';
  DOM.popupNoQuestions.value = (settings.noQuestions || []).join('\n');
  updatePreview();
}

function savePopupSettings() {
  const settings = {
    title: DOM.popupTitle.value.trim(),
    message: DOM.popupMessage.value.trim(),
    yesText: DOM.popupYesText.value.trim() || 'Có',
    noText: DOM.popupNoText.value.trim() || 'Không',
    noQuestions: DOM.popupNoQuestions.value.split('\n').map(q => q.trim()).filter(q => q.length > 0)
  };
  localStorage.setItem('tnag_popup_settings', JSON.stringify(settings));
  showAdminToast('Đã lưu cài đặt popup thành công!');
}

function updatePreview() {
  const title = DOM.popupTitle.value.trim() || 'Tiêu đề popup';
  const message = DOM.popupMessage.value.trim() || 'Nội dung popup sẽ hiện ở đây...';
  const yesText = DOM.popupYesText.value.trim() || 'Có';
  const noText = DOM.popupNoText.value.trim() || 'Không';
  const questions = DOM.popupNoQuestions.value.split('\n').map(q => q.trim()).filter(q => q.length > 0);

  DOM.previewTitle.textContent = title;
  DOM.previewMessage.textContent = message;
  DOM.previewBtnYes.textContent = yesText;
  DOM.previewBtnNo.textContent = noText;

  if (questions.length > 0) {
    DOM.previewExtra.style.display = 'block';
    DOM.previewQuestion.textContent = questions[0];
  } else {
    DOM.previewExtra.style.display = 'none';
  }
}

// ==========================================
// TAB 5: CÀI ĐẶT GIAO DIỆN
// ==========================================
const DEFAULT_UI_SETTINGS = {
  ketBrandTitle: 'TRƯA NAY ĂN GÌ',
  ketBadge: 'CHỌN MÓN NGAY · 3 GIÂY QUYẾT ĐỊNH',
  queBrandTitle: 'QUẺ TRƯA MAY MẮN',
  queBadge: 'QUẺ TRƯA · CHIÊM NGHIỆM VỊ GIÁC',
  brandLocationText: '✨ Bữa Trưa Huyền Diệu 🎋',
  footerText: '© 2026 Trưa Nay Ăn Gì — Chúc bạn có một bữa trưa ngon miệng và tràn đầy năng lượng!'
};

function getUiSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('tnag_ui_settings') || 'null');
    return raw ? { ...DEFAULT_UI_SETTINGS, ...raw } : { ...DEFAULT_UI_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_UI_SETTINGS };
  }
}

function loadUiSettings() {
  const settings = getUiSettings();
  DOM.uiBrandLocation.value = settings.brandLocationText;
  DOM.uiKetTitle.value = settings.ketBrandTitle;
  DOM.uiQueTitle.value = settings.queBrandTitle;
  DOM.uiKetBadge.value = settings.ketBadge;
  DOM.uiQueBadge.value = settings.queBadge;
  DOM.uiFooterText.value = settings.footerText;
}

function saveUiSettings() {
  const settings = {
    brandLocationText: DOM.uiBrandLocation.value.trim() || DEFAULT_UI_SETTINGS.brandLocationText,
    ketBrandTitle: DOM.uiKetTitle.value.trim() || DEFAULT_UI_SETTINGS.ketBrandTitle,
    queBrandTitle: DOM.uiQueTitle.value.trim() || DEFAULT_UI_SETTINGS.queBrandTitle,
    ketBadge: DOM.uiKetBadge.value.trim() || DEFAULT_UI_SETTINGS.ketBadge,
    queBadge: DOM.uiQueBadge.value.trim() || DEFAULT_UI_SETTINGS.queBadge,
    footerText: DOM.uiFooterText.value.trim() || DEFAULT_UI_SETTINGS.footerText
  };
  localStorage.setItem('tnag_ui_settings', JSON.stringify(settings));
  showAdminToast('Đã lưu cài đặt giao diện thành công!');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showAdminToast(message, type = 'success') {
  let container = DOM.adminToast || document.getElementById('admin-toast');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast';
    container.className = 'admin-toast';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEvents() {
  // Tab Navigation
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Mobile menu toggle
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener('click', () => {
      DOM.sidebar.classList.toggle('open');
    });
  }

  // Logout button
  if (DOM.adminLogoutBtn) {
    DOM.adminLogoutBtn.addEventListener('click', handleLogout);
  }

  // Food tab: search
  if (DOM.foodSearch) {
    DOM.foodSearch.addEventListener('input', filterFoodTable);
  }

  // Food tab: category filter chips
  if (DOM.foodFilterChips) {
    DOM.foodFilterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      DOM.foodFilterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFoodFilter = chip.dataset.cat;
      filterFoodTable();
    });
  }

  // Tracking tab: refresh
  if (DOM.trackingRefreshBtn) {
    DOM.trackingRefreshBtn.addEventListener('click', renderTrackingTab);
  }

  // Tracking tab: clear all
  if (DOM.trackingClearBtn) {
    DOM.trackingClearBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tất cả log hành động? Thao tác này không thể hoàn tác.')) {
        localStorage.removeItem('tnag_user_actions');
        renderTrackingTab();
        showAdminToast('Đã xóa tất cả log hành động!');
      }
    });
  }

  // Users tab: add user form
  if (DOM.addUserForm) {
    DOM.addUserForm.addEventListener('submit', handleAddUser);
  }

  // Users tab: toggle eye in new password input
  if (DOM.toggleNewPwdBtn && DOM.newPassword) {
    DOM.toggleNewPwdBtn.addEventListener('click', () => {
      const isPwd = DOM.newPassword.type === 'password';
      DOM.newPassword.type = isPwd ? 'text' : 'password';
      DOM.toggleNewPwdBtn.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // Users tab: search
  if (DOM.usersSearch) {
    DOM.usersSearch.addEventListener('input', (e) => {
      currentUsersSearch = e.target.value;
      filterUsersTable();
    });
  }

  // Popup settings: form submit
  if (DOM.popupForm) {
    DOM.popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      savePopupSettings();
    });
  }

  // Popup settings: live preview update
  [DOM.popupTitle, DOM.popupMessage, DOM.popupYesText, DOM.popupNoText, DOM.popupNoQuestions].forEach(el => {
    if (el) el.addEventListener('input', updatePreview);
  });

  // Popup settings: reset
  if (DOM.resetPopupSettings) {
    DOM.resetPopupSettings.addEventListener('click', () => {
      localStorage.removeItem('tnag_popup_settings');
      loadPopupSettings();
      showAdminToast('Đã khôi phục cài đặt popup về mặc định!');
    });
  }

  // UI settings: form submit
  if (DOM.uiSettingsForm) {
    DOM.uiSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUiSettings();
    });
  }

  // UI settings: reset
  if (DOM.resetUiSettings) {
    DOM.resetUiSettings.addEventListener('click', () => {
      localStorage.removeItem('tnag_ui_settings');
      loadUiSettings();
      showAdminToast('Đã khôi phục cài đặt giao diện về mặc định!');
    });
  }
}

// ==========================================
// INIT
// ==========================================
function init() {
  if (!checkAdminSession()) return;
  renderFoodTab();
  renderTrackingTab();
  renderUsersTab();
  loadPopupSettings();
  setupEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

