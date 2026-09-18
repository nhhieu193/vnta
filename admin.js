// admin.js - Admin Dashboard Logic

const { DISHES: DEFAULT_DISHES } = window.TNAG_DATA;

const CATEGORY_LABELS = {
  main: '🍲 Món chính',
  drink: '☕ Đồ uống',
  snack: '🍟 Ăn vặt',
  pub: '🍻 Món nhậu'
};

function getDishes() {
  try {
    const raw = localStorage.getItem('tnag_dishes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem('tnag_dishes', JSON.stringify(DEFAULT_DISHES));
  return DEFAULT_DISHES;
}

function saveDishes(list) {
  localStorage.setItem('tnag_dishes', JSON.stringify(list));
}

function computeBudgetRange(price) {
  if (price <= 35000) return '35k';
  if (price <= 60000) return '50k';
  if (price <= 85000) return '70k';
  return '100k';
}

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
  USER_DELETED:    { label: 'Xóa tài khoản',    icon: '🗑️', color: '#ef4444' },
  OPEN_PLAN:       { label: 'Mở kế hoạch',      icon: '📅', color: '#34d399' },
  CONFIRM_PLAN:    { label: 'Chốt kế hoạch',    icon: '🎉', color: '#f59e0b' },
  PLAN_CAFE_ADDED: { label: 'Thêm quán cà phê', icon: '☕', color: '#a3785c' },
  PLAN_MOVIE_ADDED:{ label: 'Thêm phim',        icon: '🎬', color: '#8b5cf6' },
  DISH_ADDED:      { label: 'Thêm món ăn',      icon: '🍲', color: '#10b981' },
  DISH_EDITED:     { label: 'Sửa món ăn',       icon: '✏️', color: '#3b82f6' },
  DISH_DELETED:    { label: 'Xóa món ăn',       icon: '🗑️', color: '#ef4444' }
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
  dishForm: document.getElementById('dish-form'),
  dishFormTitle: document.getElementById('dish-form-title'),
  dishName: document.getElementById('dish-name'),
  dishEmoji: document.getElementById('dish-emoji'),
  dishCategory: document.getElementById('dish-category'),
  dishCategoryName: document.getElementById('dish-category-name'),
  dishPrice: document.getElementById('dish-price'),
  dishOrigin: document.getElementById('dish-origin'),
  dishImage: document.getElementById('dish-image'),
  dishDesc: document.getElementById('dish-desc'),
  dishVeg: document.getElementById('dish-veg'),
  dishSubmitBtn: document.getElementById('dish-submit-btn'),
  dishCancelEditBtn: document.getElementById('dish-cancel-edit-btn'),

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
  previewBtnNo: document.getElementById('preview-btn-no'),

  // Plan tab
  planStatsGrid: document.getElementById('plan-stats-grid'),
  addCafeForm: document.getElementById('add-cafe-form'),
  newCafeName: document.getElementById('new-cafe-name'),
  newCafeNote: document.getElementById('new-cafe-note'),
  cafeTableBody: document.getElementById('cafe-table-body'),
  addMovieForm: document.getElementById('add-movie-form'),
  newMovieName: document.getElementById('new-movie-name'),
  newMovieNote: document.getElementById('new-movie-note'),
  movieTableBody: document.getElementById('movie-table-body'),
  planThankyouForm: document.getElementById('plan-thankyou-form'),
  planThankyouTitleInput: document.getElementById('plan-thankyou-title-input'),
  planThankyouMessageInput: document.getElementById('plan-thankyou-message-input'),
  resetPlanThankyou: document.getElementById('reset-plan-thankyou'),
  planRefreshBtn: document.getElementById('plan-refresh-btn'),
  planClearBtn: document.getElementById('plan-clear-btn'),
  planTableBody: document.getElementById('plan-table-body')
};

// ==========================================
// TAB NAVIGATION
// ==========================================
const TAB_TITLES = {
  food: '🍲 Kho Đồ Ăn',
  tracking: '📊 Hành Động User',
  users: '👥 Quản Lý Người Dùng',
  popup: '⚙️ Cài Đặt Popup',
  uisettings: '🎨 Cài Đặt Giao Diện',
  plan: '📅 Kế Hoạch'
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
  if (tabName === 'plan') renderPlanTab();

  // Close mobile sidebar
  DOM.sidebar.classList.remove('open');
}

// ==========================================
// TAB 1: KHO ĐỒ ĂN
// ==========================================
let currentFoodFilter = 'all';
let editingDishId = null;

function renderFoodStats() {
  const dishes = getDishes();
  const catCounts = {};
  dishes.forEach(d => {
    catCounts[d.category] = (catCounts[d.category] || 0) + 1;
  });

  const avgPrice = Math.round(dishes.reduce((s, d) => s + d.price, 0) / dishes.length);
  const vegCount = dishes.filter(d => d.isVegetarian).length;

  DOM.foodStatsGrid.innerHTML = `
    <div class="stat-card" data-color="orange">
      <span class="stat-icon">🍲</span>
      <span class="stat-label">Tổng số món</span>
      <span class="stat-value">${dishes.length}</span>
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
      <td><strong>${escapeHtml(dish.name)}</strong></td>
      <td>${escapeHtml(dish.categoryName || dish.category)}</td>
      <td>${dish.priceDisplay}</td>
      <td style="font-size: 0.82rem; color: var(--admin-text-muted);">${escapeHtml(dish.origin || '')}</td>
      <td>${dish.isVegetarian ? '<span class="veg-tag">🌱 Chay</span>' : '<span class="nonveg-tag">Mặn</span>'}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn-toggle-eye-row" onclick="editDish('${dish.id}')" title="Sửa món">✏️</button>
          <button type="button" class="btn-delete-user" onclick="deleteDish('${dish.id}')">🗑️ Xóa</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterFoodTable() {
  const query = (DOM.foodSearch.value || '').toLowerCase().trim();
  let filtered = getDishes();

  if (currentFoodFilter !== 'all') {
    filtered = filtered.filter(d => d.category === currentFoodFilter);
  }

  if (query) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(query) ||
      (d.origin || '').toLowerCase().includes(query) ||
      (d.categoryName || '').toLowerCase().includes(query)
    );
  }

  renderFoodTable(filtered);
}

function renderFoodTab() {
  renderFoodStats();
  filterFoodTable();
}

function resetDishForm() {
  editingDishId = null;
  DOM.dishForm.reset();
  DOM.dishCategory.value = 'main';
  DOM.dishFormTitle.textContent = '➕ Thêm Món Mới';
  DOM.dishSubmitBtn.innerHTML = '<span>➕ Thêm Món</span>';
  DOM.dishCancelEditBtn.style.display = 'none';
}

function fillDishForm(dish) {
  editingDishId = dish.id;
  DOM.dishName.value = dish.name;
  DOM.dishEmoji.value = dish.emoji || '';
  DOM.dishCategory.value = dish.category;
  DOM.dishCategoryName.value = dish.categoryName || '';
  DOM.dishPrice.value = dish.price;
  DOM.dishOrigin.value = dish.origin || '';
  DOM.dishImage.value = dish.image || '';
  DOM.dishDesc.value = dish.description || '';
  DOM.dishVeg.checked = !!dish.isVegetarian;
  DOM.dishFormTitle.textContent = '✏️ Sửa Món: ' + dish.name;
  DOM.dishSubmitBtn.innerHTML = '<span>💾 Lưu Thay Đổi</span>';
  DOM.dishCancelEditBtn.style.display = 'inline-flex';
  DOM.dishForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleDishFormSubmit(e) {
  e.preventDefault();
  const name = DOM.dishName.value.trim();
  const price = parseInt(DOM.dishPrice.value, 10);

  if (!name) {
    showAdminToast('Vui lòng nhập tên món!', 'error');
    return;
  }
  if (!price || price <= 0) {
    showAdminToast('Vui lòng nhập giá hợp lệ!', 'error');
    return;
  }

  const category = DOM.dishCategory.value;
  const dishData = {
    id: editingDishId || ('dish-custom-' + Date.now()),
    name,
    category,
    categoryName: DOM.dishCategoryName.value.trim() || CATEGORY_LABELS[category],
    price,
    priceDisplay: price.toLocaleString('vi-VN') + 'đ',
    budgetRange: computeBudgetRange(price),
    origin: DOM.dishOrigin.value.trim() || 'Việt Nam',
    isVegetarian: DOM.dishVeg.checked,
    emoji: DOM.dishEmoji.value.trim() || '🍽️',
    image: DOM.dishImage.value.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    description: DOM.dishDesc.value.trim() || `Món ăn "${name}" hấp dẫn.`
  };

  const dishes = getDishes();

  if (editingDishId) {
    const idx = dishes.findIndex(d => d.id === editingDishId);
    if (idx !== -1) dishes[idx] = dishData;
    saveDishes(dishes);
    logAdminAction('DISH_EDITED', `Sửa món "${name}"`);
    showAdminToast(`Đã lưu thay đổi món "${name}"!`, 'success');
  } else {
    dishes.push(dishData);
    saveDishes(dishes);
    logAdminAction('DISH_ADDED', `Thêm món "${name}"`);
    showAdminToast(`Đã thêm món "${name}"!`, 'success');
  }

  resetDishForm();
  renderFoodTab();
}

window.editDish = function (id) {
  const dish = getDishes().find(d => d.id === id);
  if (dish) fillDishForm(dish);
};

window.deleteDish = function (id) {
  const dishes = getDishes();
  const dish = dishes.find(d => d.id === id);
  if (!dish) return;

  if (confirm(`Xóa món "${dish.name}" khỏi kho đồ ăn? Món này cũng sẽ biến mất khỏi vòng quay của người dùng.`)) {
    saveDishes(dishes.filter(d => d.id !== id));
    logAdminAction('DISH_DELETED', `Xóa món "${dish.name}"`);
    showAdminToast(`Đã xóa món "${dish.name}"!`, 'success');
    if (editingDishId === id) resetDishForm();
    renderFoodTab();
  }
};

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
            <button type="button" class="btn-toggle-eye-row" onclick="toggleUserPwd('${u.id}')" title="${isPwdVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}">
              ${isPwdVisible ? '🙈' : '👁️'}
            </button>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td><span style="color:var(--admin-text-dim);font-size:0.85rem;">${u.createdAt || '16/09/2026'}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-toggle-eye-row" onclick="changeUserPassword('${u.id}')" title="Đổi mật khẩu">
              🔑 Đổi mật khẩu
            </button>
            <button type="button" class="btn-delete-user" ${isCurrent ? 'disabled title="Không thể xóa tài khoản của chính bạn"' : `onclick="deleteUser('${u.id}')"`}>
              🗑️ Xóa
            </button>
          </div>
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

window.changeUserPassword = function (userId) {
  const users = getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  const newPassword = prompt(`Nhập mật khẩu mới cho tài khoản "${target.username}":`);
  if (newPassword === null) return; // bấm Cancel
  if (!newPassword.trim()) {
    showAdminToast('Mật khẩu không được để trống!', 'error');
    return;
  }

  target.password = newPassword.trim();
  saveUsers(users);
  logAdminAction('USER_PASSWORD_CHANGED', `Đổi mật khẩu tài khoản "${target.username}"`);
  showAdminToast(`Đã đổi mật khẩu cho "${target.username}"!`, 'success');
  renderUsersTab();
};

function handleBulkChangePassword() {
  const users = getUsers();
  if (users.length === 0) return;

  const newPassword = prompt(`Nhập mật khẩu mới áp dụng cho TẤT CẢ ${users.length} tài khoản:`);
  if (newPassword === null) return; // bấm Cancel
  if (!newPassword.trim()) {
    showAdminToast('Mật khẩu không được để trống!', 'error');
    return;
  }

  if (!confirm(`Đổi mật khẩu cho toàn bộ ${users.length} tài khoản thành mật khẩu mới này? Hành động này không thể hoàn tác.`)) {
    return;
  }

  const trimmed = newPassword.trim();
  users.forEach(u => { u.password = trimmed; });
  saveUsers(users);
  logAdminAction('USER_PASSWORD_CHANGED_BULK', `Đổi mật khẩu hàng loạt cho ${users.length} tài khoản`);
  showAdminToast(`Đã đổi mật khẩu cho tất cả ${users.length} tài khoản!`, 'success');
  renderUsersTab();
}

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

  resetPreviewDemo();
}

// ==========================================
// PREVIEW POPUP: demo bấm "Có"/"Không" y hệt hành vi trang thật
// ==========================================
const PREVIEW_DEFAULT_QUESTIONS = [
  '😢 Sao lại chọn Không? Bạn không thích đồ ăn ngon sao?',
  '🥺 Một lần nữa thôi... Cho mình cơ hội nhé?',
  '😭 Bạn chắc chắn không muốn thử? Đồ ăn ở đây ngon lắm!',
  '💔 Nút "Có" đã rất to rồi... hãy bấm nó đi!'
];

let previewNoClickCount = 0;

function resetPreviewDemo() {
  previewNoClickCount = 0;
  DOM.previewBtnYes.className = 'preview-btn preview-btn-yes';
  DOM.previewBtnNo.className = 'preview-btn preview-btn-no';
}

function handlePreviewNoClick() {
  previewNoClickCount++;
  const growLevel = Math.min(previewNoClickCount, 4);
  DOM.previewBtnYes.className = 'preview-btn preview-btn-yes grow-' + growLevel;
  DOM.previewBtnNo.className = 'preview-btn preview-btn-no shrink-' + growLevel;

  const questions = DOM.popupNoQuestions.value.split('\n').map(q => q.trim()).filter(q => q.length > 0);
  const list = questions.length > 0 ? questions : PREVIEW_DEFAULT_QUESTIONS;
  const qIndex = Math.min(previewNoClickCount - 1, list.length - 1);

  DOM.previewExtra.style.display = 'block';
  DOM.previewQuestion.textContent = list[qIndex];
}

function handlePreviewYesClick() {
  showAdminToast('Demo: đây là lúc popup thật sự đóng lại và vào trang chính.');
  updatePreview();
}

// ==========================================
// TAB 5: CÀI ĐẶT GIAO DIỆN
// ==========================================
const DEFAULT_UI_SETTINGS = {
  ketBrandTitle: 'FIRST DATE ĂN GÌ 💕',
  ketBadge: 'YÊU LÀ CHIỀU · CHỌN MÓN TRONG 3 GIÂY',
  queBrandTitle: 'QUẺ DUYÊN TÌNH YÊU',
  queBadge: 'QUẺ DUYÊN · LẮNG NGHE TIẾNG LÒNG',
  brandLocationText: '💘 Nơi Duyên Số Bắt Đầu Từ Bữa Ăn',
  footerText: '© 2026 First Date Ăn Gì 💕 — Chúc đôi mình có một buổi hẹn hò ngọt ngào và một tình yêu dài lâu!'
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
// TAB 6: KẾ HOẠCH
// ==========================================
const DEFAULT_PLAN_THANKYOU = {
  title: 'Cảm ơn bạn!',
  message: 'Kế hoạch của bạn đã được ghi nhận. Chúc bạn có một buổi trưa thật vui vẻ!'
};

function getPlanCafes() {
  try {
    return JSON.parse(localStorage.getItem('tnag_plan_cafes') || '[]');
  } catch (e) {
    return [];
  }
}
function savePlanCafes(list) {
  localStorage.setItem('tnag_plan_cafes', JSON.stringify(list));
}

function getPlanMovies() {
  try {
    return JSON.parse(localStorage.getItem('tnag_plan_movies') || '[]');
  } catch (e) {
    return [];
  }
}
function savePlanMovies(list) {
  localStorage.setItem('tnag_plan_movies', JSON.stringify(list));
}

function getPlanThankyouSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('tnag_plan_thankyou') || 'null');
    return raw ? { ...DEFAULT_PLAN_THANKYOU, ...raw } : { ...DEFAULT_PLAN_THANKYOU };
  } catch (e) {
    return { ...DEFAULT_PLAN_THANKYOU };
  }
}

function getSubmittedPlans() {
  try {
    return JSON.parse(localStorage.getItem('tnag_plans') || '[]');
  } catch (e) {
    return [];
  }
}

function renderPlanStats() {
  const plans = getSubmittedPlans();
  const cafes = getPlanCafes();
  const movies = getPlanMovies();
  const cafeChoices = plans.filter(p => p.activity === 'cafe').length;
  const movieChoices = plans.filter(p => p.activity === 'movie').length;

  DOM.planStatsGrid.innerHTML = `
    <div class="stat-card" data-color="orange">
      <span class="stat-icon">📋</span>
      <span class="stat-label">Tổng kế hoạch đã chốt</span>
      <span class="stat-value">${plans.length}</span>
    </div>
    <div class="stat-card" data-color="green">
      <span class="stat-icon">☕</span>
      <span class="stat-label">Chọn Cà phê</span>
      <span class="stat-value">${cafeChoices}</span>
    </div>
    <div class="stat-card" data-color="blue">
      <span class="stat-icon">🎬</span>
      <span class="stat-label">Chọn Xem phim</span>
      <span class="stat-value">${movieChoices}</span>
    </div>
    <div class="stat-card" data-color="purple">
      <span class="stat-icon">📍</span>
      <span class="stat-label">Gợi ý (quán / phim)</span>
      <span class="stat-value">${cafes.length} / ${movies.length}</span>
    </div>
  `;
}

function renderCafeTable() {
  const cafes = getPlanCafes();
  if (cafes.length === 0) {
    DOM.cafeTableBody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><p class="empty-state-text">Chưa có quán cà phê nào</p></div></td></tr>`;
    return;
  }
  DOM.cafeTableBody.innerHTML = cafes.map((c, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td style="color: var(--admin-text-muted);">${escapeHtml(c.note || '')}</td>
      <td><button type="button" class="btn-delete-user" onclick="deletePlanCafe('${c.id}')">🗑️ Xóa</button></td>
    </tr>
  `).join('');
}

function renderMovieTable() {
  const movies = getPlanMovies();
  if (movies.length === 0) {
    DOM.movieTableBody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><p class="empty-state-text">Chưa có phim nào</p></div></td></tr>`;
    return;
  }
  DOM.movieTableBody.innerHTML = movies.map((m, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(m.name)}</strong></td>
      <td style="color: var(--admin-text-muted);">${escapeHtml(m.note || '')}</td>
      <td><button type="button" class="btn-delete-user" onclick="deletePlanMovie('${m.id}')">🗑️ Xóa</button></td>
    </tr>
  `).join('');
}

function handleAddCafe(e) {
  e.preventDefault();
  const name = DOM.newCafeName.value.trim();
  if (!name) {
    showAdminToast('Vui lòng nhập tên quán!', 'error');
    return;
  }
  const cafes = getPlanCafes();
  cafes.push({ id: 'cafe_' + Date.now(), name, note: DOM.newCafeNote.value.trim() });
  savePlanCafes(cafes);
  logAdminAction('PLAN_CAFE_ADDED', `Thêm quán cà phê "${name}"`);
  showAdminToast(`Đã thêm quán "${name}"!`, 'success');
  DOM.addCafeForm.reset();
  renderCafeTable();
  renderPlanStats();
}

function handleAddMovie(e) {
  e.preventDefault();
  const name = DOM.newMovieName.value.trim();
  if (!name) {
    showAdminToast('Vui lòng nhập tên phim!', 'error');
    return;
  }
  const movies = getPlanMovies();
  movies.push({ id: 'movie_' + Date.now(), name, note: DOM.newMovieNote.value.trim() });
  savePlanMovies(movies);
  logAdminAction('PLAN_MOVIE_ADDED', `Thêm phim "${name}"`);
  showAdminToast(`Đã thêm phim "${name}"!`, 'success');
  DOM.addMovieForm.reset();
  renderMovieTable();
  renderPlanStats();
}

window.deletePlanCafe = function (id) {
  if (!confirm('Xóa quán cà phê này khỏi danh sách gợi ý?')) return;
  savePlanCafes(getPlanCafes().filter(c => c.id !== id));
  renderCafeTable();
  renderPlanStats();
  showAdminToast('Đã xóa quán cà phê!');
};

window.deletePlanMovie = function (id) {
  if (!confirm('Xóa phim này khỏi danh sách gợi ý?')) return;
  savePlanMovies(getPlanMovies().filter(m => m.id !== id));
  renderMovieTable();
  renderPlanStats();
  showAdminToast('Đã xóa phim!');
};

function loadPlanThankyouSettings() {
  const settings = getPlanThankyouSettings();
  DOM.planThankyouTitleInput.value = settings.title;
  DOM.planThankyouMessageInput.value = settings.message;
}

function savePlanThankyouSettings() {
  const settings = {
    title: DOM.planThankyouTitleInput.value.trim() || DEFAULT_PLAN_THANKYOU.title,
    message: DOM.planThankyouMessageInput.value.trim() || DEFAULT_PLAN_THANKYOU.message
  };
  localStorage.setItem('tnag_plan_thankyou', JSON.stringify(settings));
  showAdminToast('Đã lưu popup cảm ơn thành công!');
}

function renderPlanTable() {
  const plans = getSubmittedPlans().slice().reverse();
  if (plans.length === 0) {
    DOM.planTableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">Chưa có kế hoạch nào được chốt</p></div></td></tr>`;
    return;
  }
  DOM.planTableBody.innerHTML = plans.map((p, idx) => {
    const d = new Date(p.timestamp);
    const timeStr = isNaN(d.getTime()) ? p.timestamp : d.toLocaleString('vi-VN');
    const activityText = p.activityLabel
      ? `${p.activityLabel}${p.activityChoice ? ' — ' + escapeHtml(p.activityChoice) : ''}`
      : '<span style="color: var(--admin-text-dim);">—</span>';
    return `
      <tr>
        <td>${plans.length - idx}</td>
        <td style="font-size: 0.78rem; color: var(--admin-text-dim);">${timeStr}</td>
        <td><strong>${escapeHtml(p.dishName || '')}</strong></td>
        <td>${escapeHtml(p.date || '')} ${escapeHtml(p.time || '')}</td>
        <td>${activityText}</td>
        <td style="font-size: 0.82rem; color: var(--admin-text-muted);">${escapeHtml(p.note || '')}</td>
        <td>${escapeHtml(p.user || '')}</td>
      </tr>
    `;
  }).join('');
}

function renderPlanTab() {
  renderPlanStats();
  renderCafeTable();
  renderMovieTable();
  loadPlanThankyouSettings();
  renderPlanTable();
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

  // Food tab: add/edit dish form
  if (DOM.dishForm) DOM.dishForm.addEventListener('submit', handleDishFormSubmit);
  if (DOM.dishCancelEditBtn) DOM.dishCancelEditBtn.addEventListener('click', resetDishForm);

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

  // Users tab: bulk change password
  const bulkChangePwdBtn = document.getElementById('btn-bulk-change-pwd');
  if (bulkChangePwdBtn) {
    bulkChangePwdBtn.addEventListener('click', handleBulkChangePassword);
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

  // Popup settings: demo bấm thử "Có"/"Không" trong khung xem trước
  if (DOM.previewBtnNo) DOM.previewBtnNo.addEventListener('click', handlePreviewNoClick);
  if (DOM.previewBtnYes) DOM.previewBtnYes.addEventListener('click', handlePreviewYesClick);

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

  // Plan tab: add cafe / movie
  if (DOM.addCafeForm) DOM.addCafeForm.addEventListener('submit', handleAddCafe);
  if (DOM.addMovieForm) DOM.addMovieForm.addEventListener('submit', handleAddMovie);

  // Plan tab: thank you popup settings
  if (DOM.planThankyouForm) {
    DOM.planThankyouForm.addEventListener('submit', (e) => {
      e.preventDefault();
      savePlanThankyouSettings();
    });
  }
  if (DOM.resetPlanThankyou) {
    DOM.resetPlanThankyou.addEventListener('click', () => {
      localStorage.removeItem('tnag_plan_thankyou');
      loadPlanThankyouSettings();
      showAdminToast('Đã khôi phục popup cảm ơn về mặc định!');
    });
  }

  // Plan tab: submitted plans
  if (DOM.planRefreshBtn) DOM.planRefreshBtn.addEventListener('click', renderPlanTable);
  if (DOM.planClearBtn) {
    DOM.planClearBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tất cả kế hoạch đã chốt? Thao tác này không thể hoàn tác.')) {
        localStorage.removeItem('tnag_plans');
        renderPlanTable();
        renderPlanStats();
        showAdminToast('Đã xóa tất cả kế hoạch!');
      }
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

