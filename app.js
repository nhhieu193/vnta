// app.js - First Date Ăn Gì? (Vòng Quay Tròn & Hiệu Ứng Tim Bay Liên Tục)

// ==========================================
// USER ACTION TRACKING SYSTEM
// ==========================================
window.TNAG_TRACKER = (function () {
  const STORAGE_KEY = 'tnag_user_actions';

  function getActions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function log(action, detail = '') {
    const actions = getActions();
    actions.push({
      timestamp: new Date().toISOString(),
      action: action,
      detail: detail
    });
    // Keep last 500 entries max
    if (actions.length > 500) actions.splice(0, actions.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { log, getActions, clear };
})();

// ==========================================
// LOGIN + CONSENT POPUP HANDLER
// ==========================================
(function initLoginAndConsent() {
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginUsernameInput = document.getElementById('login-username');
  const loginPasswordInput = document.getElementById('login-password');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const consentOverlay = document.getElementById('consent-overlay');
  const consentBtnYes = document.getElementById('consent-btn-yes');
  const consentBtnNo = document.getElementById('consent-btn-no');
  const consentTitle = document.getElementById('consent-title');
  const consentMessage = document.getElementById('consent-message');
  const consentExtraContent = document.getElementById('consent-extra-content');
  const consentQuestion = document.getElementById('consent-question');

  if (!loginOverlay) return;

  // Default accounts initialization
  const DEFAULT_USERS = [
    { id: 'u_admin', username: 'admin', password: 'admin', role: 'admin', createdAt: '2026-09-16' },
    { id: 'u_user', username: 'user', password: '123456', role: 'user', createdAt: '2026-09-16' }
  ];

  const savedUser = (function () {
    try {
      const raw = sessionStorage.getItem('tnag_current_user') || localStorage.getItem('tnag_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  function updateUserHeaderProfile(user) {
    const wrap = document.getElementById('user-header-profile');
    const nameEl = document.getElementById('user-display-name');
    const adminLink = document.getElementById('admin-quick-link');
    const logoutBtn = document.getElementById('user-logout-btn');
    if (!wrap) return;

    if (user) {
      wrap.style.display = 'inline-flex';
      if (nameEl) nameEl.textContent = user.username;
      if (adminLink) {
        adminLink.style.display = user.role === 'admin' ? 'inline-flex' : 'none';
      }
    } else {
      wrap.style.display = 'none';
    }

    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = 'true';
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('tnag_current_user');
        localStorage.removeItem('tnag_current_user');
        window.location.reload();
      });
    }
  }

  if (savedUser) {
    loginOverlay.style.display = 'none';
    document.body.classList.remove('login-active');
    updateUserHeaderProfile(savedUser);
  } else {
    document.body.classList.add('login-active');
  }

  let noClickCount = 0;

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

  // Ensure default users exist immediately
  getUsers();

  // Load popup settings from admin config (localStorage)
  function getPopupSettings() {
    try {
      return JSON.parse(localStorage.getItem('tnag_popup_settings') || 'null');
    } catch (e) {
      return null;
    }
  }

  function applyPopupContent() {
    const settings = getPopupSettings();
    if (settings) {
      if (settings.title && consentTitle) consentTitle.textContent = settings.title;
      if (settings.message && consentMessage) consentMessage.textContent = settings.message;
      if (settings.yesText) document.getElementById('consent-yes-text').textContent = settings.yesText;
      if (settings.noText) document.getElementById('consent-no-text').textContent = settings.noText;
    }
  }

  function showConsentPopup() {
    applyPopupContent();
    consentOverlay.style.display = 'flex';
  }

  // Clear error message on input
  if (loginUsernameInput && loginPasswordInput) {
    [loginUsernameInput, loginPasswordInput].forEach(input => {
      input.addEventListener('input', function () {
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
      });
    });
  }

  // LOGIN submit → validate credentials → redirect or show consent popup
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = (loginUsernameInput ? loginUsernameInput.value.trim() : '');
    const password = (loginPasswordInput ? loginPasswordInput.value : '');

    const users = getUsers();
    const matchedUser = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!matchedUser) {
      if (loginErrorMsg) {
        loginErrorMsg.textContent = '❌ Tên đăng nhập hoặc mật khẩu không đúng!';
        loginErrorMsg.style.display = 'block';
        loginErrorMsg.style.animation = 'none';
        void loginErrorMsg.offsetWidth; // reflow to trigger animation
        loginErrorMsg.style.animation = 'shake 0.4s ease-in-out';
      }
      window.TNAG_TRACKER.log('LOGIN', 'Đăng nhập thất bại: ' + (username || 'trống'));
      return;
    }

    // Save session
    const sessionData = JSON.stringify({
      id: matchedUser.id,
      username: matchedUser.username,
      role: matchedUser.role
    });
    sessionStorage.setItem('tnag_current_user', sessionData);
    localStorage.setItem('tnag_current_user', sessionData);

    window.TNAG_TRACKER.log('LOGIN', 'Đăng nhập thành công: ' + matchedUser.username + ' (' + matchedUser.role + ')');
    updateUserHeaderProfile(matchedUser);

    if (matchedUser.role === 'admin') {
      loginOverlay.classList.add('fade-out');
      setTimeout(function () {
        window.location.href = 'admin.html';
      }, 400);
      return;
    }

    // Regular user flow
    loginOverlay.classList.add('fade-out');
    setTimeout(function () {
      loginOverlay.style.display = 'none';
      document.body.classList.remove('login-active');
      showConsentPopup();
    }, 600);
  });

  // CONSENT: "Có" → close popup, enter app
  if (consentBtnYes) {
    consentBtnYes.addEventListener('click', function () {
      window.TNAG_TRACKER.log('POPUP_YES', 'User chấp nhận (sau ' + noClickCount + ' lần từ chối)');
      consentOverlay.classList.add('fade-out');
      setTimeout(function () {
        consentOverlay.style.display = 'none';
      }, 500);
    });
  }

  // CONSENT: "Không" → grow "Có" button + show question
  if (consentBtnNo) {
    consentBtnNo.addEventListener('click', function () {
      noClickCount++;
      window.TNAG_TRACKER.log('POPUP_NO', 'User từ chối lần ' + noClickCount);

      // Grow "Có" button
      const growLevel = Math.min(noClickCount, 4);
      consentBtnYes.className = 'consent-btn consent-btn-yes grow-' + growLevel;

      // Shrink "Không" button
      consentBtnNo.className = 'consent-btn consent-btn-no shrink-' + growLevel;

      // Show extra content with question from admin settings
      consentExtraContent.style.display = 'block';
      const settings = getPopupSettings();
      const questions = (settings && settings.noQuestions) ? settings.noQuestions : [];

      if (questions.length > 0) {
        const qIndex = Math.min(noClickCount - 1, questions.length - 1);
        consentQuestion.textContent = questions[qIndex];
      } else {
        // Default questions if admin hasn't configured
        const defaultQs = [
          '😢 Sao lại chọn Không? Bạn không thích đồ ăn ngon sao?',
          '🥺 Một lần nữa thôi... Cho mình cơ hội nhé?',
          '😭 Bạn chắc chắn không muốn thử? Đồ ăn ở đây ngon lắm!',
          '💔 Nút "Có" đã rất to rồi... hãy bấm nó đi!'
        ];
        const qIndex = Math.min(noClickCount - 1, defaultQs.length - 1);
        consentQuestion.textContent = defaultQs[qIndex];
      }
    });
  }
})();

// Access data from window.TNAG_DATA and sound from window.sound
const { DISHES: DEFAULT_DISHES, FORTUNES } = window.TNAG_DATA;

function getDishes() {
  try {
    const raw = localStorage.getItem('tnag_dishes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_DISHES;
}

const DISHES = getDishes();
const sound = window.sound;

// Default initial 8 dishes for the circular wheel
const DEFAULT_WHEEL_IDS = ['dish-1', 'dish-2', 'dish-3', 'dish-4', 'dish-5', 'dish-6', 'dish-7', 'dish-8'];

// Vibrant foodie slice color palette
const SLICE_COLORS = [
  '#fc8019', // Vivid Orange
  '#1ba672', // Fresh Veg Green
  '#e23744', // Zesty Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cool Cyan
  '#f59e0b', // Golden Amber
  '#ec4899', // Pink
  '#3b82f6', // Ocean Blue
  '#14b8a6', // Teal
  '#f97316'  // Deep Orange
];

// ==========================================
// UI SETTINGS (Admin-configurable brand text)
// ==========================================
const DEFAULT_UI_SETTINGS = {
  ketBrandTitle: 'FIRST DATE ĂN GÌ',
  ketBadge: 'CHỌN MÓN NGAY · 3 GIÂY QUYẾT ĐỊNH',
  queBrandTitle: 'QUẺ TRƯA MAY MẮN',
  queBadge: 'QUẺ TRƯA · CHIÊM NGHIỆM VỊ GIÁC',
  brandLocationText: '✨ Bữa Trưa Huyền Diệu 🎋',
  footerText: '© 2026 First Date Ăn Gì — Chúc bạn có một bữa trưa ngon miệng và tràn đầy năng lượng!'
};

function getUiSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('tnag_ui_settings') || 'null');
    return raw ? { ...DEFAULT_UI_SETTINGS, ...raw } : { ...DEFAULT_UI_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_UI_SETTINGS };
  }
}

// ==========================================
// PLAN (KẾ HOẠCH) — dữ liệu do admin cung cấp
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

function getPlanMovies() {
  try {
    return JSON.parse(localStorage.getItem('tnag_plan_movies') || '[]');
  } catch (e) {
    return [];
  }
}

function getPlanThankyouSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('tnag_plan_thankyou') || 'null');
    return raw ? { ...DEFAULT_PLAN_THANKYOU, ...raw } : { ...DEFAULT_PLAN_THANKYOU };
  } catch (e) {
    return { ...DEFAULT_PLAN_THANKYOU };
  }
}

function savePlanEntry(plan) {
  try {
    const plans = JSON.parse(localStorage.getItem('tnag_plans') || '[]');
    plans.push(plan);
    if (plans.length > 500) plans.splice(0, plans.length - 500);
    localStorage.setItem('tnag_plans', JSON.stringify(plans));
  } catch (e) {}
}

// ==========================================
// APPLICATION STATE
// ==========================================
const state = {
  theme: 'ket-hoi-tho-lun',
  category: 'main',
  budget: '50k',
  isVegetarian: false,
  isSpinning: false,
  queState: 'idle', // 'idle' | 'shaking' | 'ready'
  activeDish: null,
  activeFortune: null,
  planActivity: null, // 'cafe' | 'movie' | 'walk' | null
  planActivityChoice: null,

  // Circular Wheel State
  wheelDishes: [],
  currentAngle: 0,
  lastWonIndex: -1
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
  body: document.body,
  brandTitle: document.getElementById('brand-title'),
  brandIcon: document.getElementById('brand-icon'),
  brandLocation: document.getElementById('brand-location'),
  siteFooterText: document.getElementById('footer-text'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIcon: document.getElementById('sound-icon'),
  soundText: document.getElementById('sound-text'),
  
  // Theme buttons
  btnThemeKet: document.getElementById('btn-theme-ket'),
  btnThemeQue: document.getElementById('btn-theme-que'),
  
  // Banner
  bannerBadge: document.getElementById('banner-badge'),
  bannerTitle: document.getElementById('banner-title'),
  bannerSubtitle: document.getElementById('banner-subtitle'),

  // Arenas
  arenaKet: document.getElementById('arena-ket'),
  arenaQue: document.getElementById('arena-que'),

  // Circular Wheel Elements
  wheelCanvas: document.getElementById('wheel-canvas'),
  wheelPointer: document.getElementById('wheel-pointer'),
  wheelCenterHub: document.getElementById('wheel-center-hub'),
  wheelCountBadge: document.getElementById('wheel-count-badge'),
  addDishForm: document.getElementById('add-dish-form'),
  addDishInput: document.getElementById('add-dish-input'),
  wheelChipsContainer: document.getElementById('wheel-chips-container'),
  btnQuickRandom: document.getElementById('btn-quick-random'),
  btnQuickFilter: document.getElementById('btn-quick-filter'),
  btnQuickReset: document.getElementById('btn-quick-reset'),

  // Quẻ elements
  bambooCylinder: document.getElementById('bamboo-cylinder'),
  fannedSticksGroup: document.getElementById('fanned-sticks-group'),
  mysterySticks: document.querySelectorAll('.mystery-stick'),
  fallenStickWrapper: document.getElementById('fallen-stick-wrapper'),
  fallenStickHead: document.getElementById('fallen-stick-head'),
  fallenStickText: document.getElementById('fallen-stick-text'),
  queInstruction: document.getElementById('que-instruction'),
  queStep1: document.getElementById('que-step-1'),
  queStep2: document.getElementById('que-step-2'),
  queStep3: document.getElementById('que-step-3'),

  // Controls
  catButtons: document.querySelectorAll('.cat-btn'),
  budgetSelect: document.getElementById('budget-select'),
  vegCheckbox: document.getElementById('veg-checkbox'),
  ctaActionBtn: document.getElementById('cta-action-btn'),
  ctaIcon: document.getElementById('cta-icon'),
  ctaText: document.getElementById('cta-text'),

  // Catalog
  catalogCountText: document.getElementById('catalog-count-text'),
  catalogSearch: document.getElementById('catalog-search'),
  catalogGrid: document.getElementById('catalog-grid'),

  // Modal
  resultModal: document.getElementById('result-modal'),
  resultDialog: document.getElementById('result-dialog'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalHeaderBadge: document.getElementById('modal-header-badge'),
  modalFoodImg: document.getElementById('modal-food-img'),
  modalDishName: document.getElementById('modal-dish-name'),
  modalCategory: document.getElementById('modal-category'),
  modalOrigin: document.getElementById('modal-origin'),
  modalVegTag: document.getElementById('modal-veg-tag'),
  modalDishPrice: document.getElementById('modal-dish-price'),
  modalDishDesc: document.getElementById('modal-dish-desc'),
  modalFortuneBox: document.getElementById('modal-fortune-box'),
  fortunePoemTitle: document.getElementById('fortune-poem-title'),
  fortunePoemText: document.getElementById('fortune-poem-text'),
  fortuneAdvice: document.getElementById('fortune-advice'),

  // Post-spin decision buttons
  modalDecisionBanner: document.getElementById('modal-decision-banner'),
  btnRemoveWinner: document.getElementById('btn-remove-winner'),
  btnKeepWinner: document.getElementById('btn-keep-winner'),

  // Floating Hearts & Mobile Nav
  floatingHeartsContainer: document.getElementById('floating-hearts-container'),
  heartSourceBtn: document.getElementById('heart-source-btn'),
  navBtnSpin: document.getElementById('nav-btn-spin'),
  navBtnQue: document.getElementById('nav-btn-que'),

  // Links & actions
  btnGmaps: document.getElementById('btn-gmaps'),
  btnDelivery: document.getElementById('btn-delivery'),
  btnShare: document.getElementById('btn-share'),
  btnSpinAgain: document.getElementById('btn-spin-again'),
  btnAgainText: document.getElementById('btn-again-text'),
  toastMsg: document.getElementById('toast-msg'),

  // Plan (Kế hoạch)
  btnAddPlan: document.getElementById('btn-add-plan'),
  planModal: document.getElementById('plan-modal'),
  planModalCloseBtn: document.getElementById('plan-modal-close-btn'),
  planDishEmoji: document.getElementById('plan-dish-emoji'),
  planDishName: document.getElementById('plan-dish-name'),
  planDate: document.getElementById('plan-date'),
  planTime: document.getElementById('plan-time'),
  planActivityChips: document.getElementById('plan-activity-chips'),
  planCafeDetail: document.getElementById('plan-cafe-detail'),
  planCafeList: document.getElementById('plan-cafe-list'),
  planMovieDetail: document.getElementById('plan-movie-detail'),
  planMovieList: document.getElementById('plan-movie-list'),
  planNote: document.getElementById('plan-note'),
  btnConfirmPlan: document.getElementById('btn-confirm-plan'),
  planThankyouModal: document.getElementById('plan-thankyou-modal'),
  planThankyouTitle: document.getElementById('plan-thankyou-title'),
  planThankyouMessage: document.getElementById('plan-thankyou-message'),
  planThankyouCloseBtn: document.getElementById('plan-thankyou-close-btn')
};

// Canvas context
let ctx = null;

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  // Set up Canvas
  if (DOM.wheelCanvas) {
    setupCanvas();
  }

  // Load initial dishes onto wheel
  loadInitialWheelDishes();

  // Check URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  if (themeParam === 'que-trua' || themeParam === 'ket-hoi-tho-lun') {
    state.theme = themeParam;
  }

  // Audio setup
  updateAudioButton();

  // Apply Theme
  applyTheme(state.theme, false);

  // Render Catalog
  renderCatalog(DISHES);

  // Start continuous floating hearts animation!
  startContinuousHearts();

  // Bind Events
  setupEventListeners();

  // Check if a dish was requested via URL
  const dishParam = urlParams.get('dish');
  if (dishParam) {
    const targetDish = DISHES.find(d => d.id === dishParam || dishParam.includes(d.id));
    if (targetDish) {
      setTimeout(() => openResultModal(targetDish), 300);
    }
  }
}

// ==========================================
// CONTINUOUS FLOATING HEARTS (GÓC DƯỚI TRÁI)
// ==========================================
const HEART_EMOJIS = ['💖', '❤️', '🧡', '💕', '💓', '💗', '✨'];

function spawnHeart() {
  if (!DOM.floatingHeartsContainer) return;

  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  
  // Pick random emoji
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

  // Randomized parameters for realistic floating wave
  const size = Math.floor(Math.random() * 14) + 18; // 18px - 32px
  const dx1 = (Math.random() * 20 - 8).toFixed(1) + 'px';
  const dx2 = (Math.random() * 26 - 16).toFixed(1) + 'px';
  const dx3 = (Math.random() * 24 - 10).toFixed(1) + 'px';
  const dx4 = (Math.random() * 20 - 10).toFixed(1) + 'px';
  const rot1 = (Math.random() * 24 - 12).toFixed(1) + 'deg';
  const rot2 = (Math.random() * 24 - 12).toFixed(1) + 'deg';
  const duration = (Math.random() * 0.8 + 2.8).toFixed(2) + 's';

  heart.style.fontSize = `${size}px`;
  heart.style.setProperty('--dx1', dx1);
  heart.style.setProperty('--dx2', dx2);
  heart.style.setProperty('--dx3', dx3);
  heart.style.setProperty('--dx4', dx4);
  heart.style.setProperty('--rot1', rot1);
  heart.style.setProperty('--rot2', rot2);
  heart.style.animationDuration = duration;

  DOM.floatingHeartsContainer.appendChild(heart);

  // Remove element after animation ends
  setTimeout(() => {
    if (heart.parentNode) {
      heart.parentNode.removeChild(heart);
    }
  }, 3600);
}

function startContinuousHearts() {
  // Continuous heart spawning loop running from start
  spawnHeart();
  setInterval(() => {
    spawnHeart();
    // Occasionally spawn a twin heart
    if (Math.random() < 0.3) {
      setTimeout(spawnHeart, 250);
    }
  }, 850);
}

function burstHearts(count = 6) {
  for (let i = 0; i < count; i++) {
    setTimeout(spawnHeart, i * 80);
  }
  sound.playTick(1.4);
}

// ==========================================
// WHEEL DISHES MANAGEMENT
// ==========================================
function loadInitialWheelDishes() {
  const saved = localStorage.getItem('tnag_custom_wheel');
  if (saved) {
    try {
      state.wheelDishes = JSON.parse(saved);
    } catch (e) {
      state.wheelDishes = [];
    }
  }
  if (!state.wheelDishes || state.wheelDishes.length === 0) {
    resetToDefaultWheel();
  } else {
    renderWheelAndChips();
  }
}

function resetToDefaultWheel() {
  state.wheelDishes = DEFAULT_WHEEL_IDS.map(id => DISHES.find(d => d.id === id)).filter(Boolean);
  saveWheelDishes();
  renderWheelAndChips();
  showToast('Đã khôi phục danh sách món mặc định!');
}

function saveWheelDishes() {
  localStorage.setItem('tnag_custom_wheel', JSON.stringify(state.wheelDishes));
}

function renderWheelAndChips() {
  DOM.wheelCountBadge.textContent = `${state.wheelDishes.length} món`;
  renderChips();
  drawWheel(state.currentAngle);
}

function renderChips() {
  DOM.wheelChipsContainer.innerHTML = '';
  if (state.wheelDishes.length === 0) {
    DOM.wheelChipsContainer.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">Vòng quay đang trống. Hãy thêm món ăn vào nhé!</span>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  state.wheelDishes.forEach((dish, idx) => {
    const chip = document.createElement('div');
    chip.className = 'wheel-chip';
    const color = SLICE_COLORS[idx % SLICE_COLORS.length];

    chip.innerHTML = `
      <span class="chip-color-dot" style="background-color: ${color};"></span>
      <span class="chip-name" title="${dish.name}">${dish.name}</span>
      <button type="button" class="chip-del-btn" data-index="${idx}" title="Xóa món này khỏi vòng quay">&times;</button>
    `;

    chip.querySelector('.chip-del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      removeDishFromWheel(idx);
    });

    fragment.appendChild(chip);
  });

  DOM.wheelChipsContainer.appendChild(fragment);
}

function addDishToWheel(dishName) {
  const trimmed = dishName.trim();
  if (!trimmed) return;

  const existing = DISHES.find(d => d.name.toLowerCase() === trimmed.toLowerCase());
  const newDish = existing ? { ...existing } : {
    id: `custom-${Date.now()}`,
    name: trimmed,
    category: state.category,
    categoryName: 'Món tùy chọn',
    price: 50000,
    priceDisplay: '50.000đ',
    origin: 'Tự chọn',
    isVegetarian: state.isVegetarian,
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    description: `Món ăn tùy chọn "${trimmed}" do bạn thêm vào vòng quay.`
  };

  state.wheelDishes.push(newDish);
  saveWheelDishes();
  renderWheelAndChips();
  showToast(`Đã thêm "${trimmed}" vào vòng quay!`);
  sound.playTick(1.2);
}

function removeDishFromWheel(index) {
  if (index < 0 || index >= state.wheelDishes.length) return;
  const removed = state.wheelDishes.splice(index, 1)[0];
  saveWheelDishes();
  renderWheelAndChips();
  showToast(`Đã xóa "${removed.name}" khỏi vòng quay!`);
}

function loadRandom8Dishes() {
  const shuffled = [...DISHES].sort(() => 0.5 - Math.random());
  state.wheelDishes = shuffled.slice(0, 8);
  saveWheelDishes();
  renderWheelAndChips();
  showToast('Đã chọn ngẫu nhiên 8 món ăn phong phú!');
  sound.playTick(1.1);
}

function loadFromCurrentFilters() {
  const filtered = getFilteredDishes();
  if (filtered.length === 0) {
    showToast('Không có món nào thỏa mãn bộ lọc hiện tại.');
    return;
  }
  state.wheelDishes = filtered.slice(0, 12);
  saveWheelDishes();
  renderWheelAndChips();
  showToast(`Đã nạp ${state.wheelDishes.length} món theo bộ lọc!`);
  sound.playTick(1.1);
}

// ==========================================
// CIRCULAR WHEEL CANVAS RENDERER
// ==========================================
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const size = 460;
  DOM.wheelCanvas.width = size * dpr;
  DOM.wheelCanvas.height = size * dpr;
  ctx = DOM.wheelCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

function drawWheel(angle = 0) {
  if (!ctx) return;
  const canvasSize = 460;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const radius = cx - 12;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const total = state.wheelDishes.length;
  if (total === 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 18, 33, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Vòng quay chưa có món', cx, cy - 10);
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Thêm món vào danh sách bên cạnh!', cx, cy + 15);
    ctx.restore();
    return;
  }

  const arc = (Math.PI * 2) / total;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Draw Slices
  for (let i = 0; i < total; i++) {
    const startAngle = i * arc;
    const endAngle = startAngle + arc;
    const dish = state.wheelDishes[i];
    const baseColor = SLICE_COLORS[i % SLICE_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = baseColor;
    ctx.fill();

    // Slice divider line with metallic crisp shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Render Slice Text
    ctx.save();
    const midAngle = startAngle + arc / 2;
    ctx.rotate(midAngle);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;

    const fontSize = total > 12 ? 11 : total > 8 ? 13 : 14;
    ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", sans-serif`;

    let displayName = dish.name;
    const maxChars = total > 10 ? 12 : 16;
    if (displayName.length > maxChars) {
      displayName = displayName.substring(0, maxChars - 1) + '…';
    }

    const textRadius = radius - 24;
    ctx.fillText(displayName, textRadius, 0);

    ctx.restore();
  }

  // Outer glowing gold / mystical rim
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
  ctx.shadowBlur = 14;
  ctx.stroke();

  // Inner subtle secondary gold ring
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ==========================================
// PHYSICAL WHEEL SPIN ENGINE
// ==========================================
function spinCircularWheel() {
  if (state.isSpinning) return;
  if (state.wheelDishes.length < 2) {
    showToast('Cần ít nhất 2 món ăn trên vòng quay để xoay!');
    return;
  }

  state.isSpinning = true;
  DOM.ctaActionBtn.disabled = true;

  sound.init();
  sound.playSpinStart();

  const total = state.wheelDishes.length;
  const arc = (Math.PI * 2) / total;

  const winnerIndex = Math.floor(Math.random() * total);
  state.lastWonIndex = winnerIndex;
  const winningDish = state.wheelDishes[winnerIndex];

  // Pointer at 12 o'clock (-PI/2 or 3PI/2)
  const winnerSliceMid = winnerIndex * arc + arc / 2;
  const pointerTarget = (3 * Math.PI / 2);
  const targetAngleInCycle = (pointerTarget - winnerSliceMid + Math.PI * 4) % (Math.PI * 2);

  const jitter = (Math.random() - 0.5) * (arc * 0.65);
  const fullRevs = (6 + Math.floor(Math.random() * 3)) * (Math.PI * 2);
  const currentMod = state.currentAngle % (Math.PI * 2);
  const deltaAngle = fullRevs + (targetAngleInCycle - currentMod + Math.PI * 4) % (Math.PI * 2) + jitter;

  const startAngle = state.currentAngle;
  const duration = 5200;
  const startTime = performance.now();
  let lastSliceTick = -1;

  function easeOutCubicBezier(t) {
    return 1 - Math.pow(1 - t, 3.8);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubicBezier(progress);

    state.currentAngle = startAngle + deltaAngle * eased;
    drawWheel(state.currentAngle);

    const pointerAngleOnWheel = (pointerTarget - state.currentAngle + Math.PI * 200) % (Math.PI * 2);
    const currentSliceUnderPointer = Math.floor(pointerAngleOnWheel / arc);

    if (currentSliceUnderPointer !== lastSliceTick) {
      lastSliceTick = currentSliceUnderPointer;
      sound.playTick(1.0 - progress * 0.3);

      DOM.wheelPointer.classList.add('bounce');
      setTimeout(() => DOM.wheelPointer.classList.remove('bounce'), 60);
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      state.isSpinning = false;
      DOM.ctaActionBtn.disabled = false;

      sound.playWin();
      burstHearts(4);

      setTimeout(() => {
        openResultModal(winningDish);
      }, 450);
    }
  }

  requestAnimationFrame(frame);
}

// ==========================================
// THEME SWITCHING
// ==========================================
function applyTheme(newTheme, updateUrl = true) {
  const uiSettings = getUiSettings();
  state.theme = newTheme;
  DOM.body.className = `theme-${newTheme}`;

  if (DOM.brandLocation) DOM.brandLocation.textContent = uiSettings.brandLocationText;
  if (DOM.siteFooterText) DOM.siteFooterText.textContent = uiSettings.footerText;

  if (newTheme === 'ket-hoi-tho-lun') {
    DOM.btnThemeKet.classList.add('active');
    DOM.btnThemeQue.classList.remove('active');
    DOM.btnThemeKet.setAttribute('aria-selected', 'true');
    DOM.btnThemeQue.setAttribute('aria-selected', 'false');

    DOM.brandIcon.textContent = '🍲';
    DOM.brandTitle.textContent = uiSettings.ketBrandTitle;
    DOM.bannerBadge.textContent = uiSettings.ketBadge;
    DOM.bannerTitle.textContent = 'Hôm nay ăn gì?';
    DOM.bannerSubtitle.textContent = 'Xoay vòng tròn tự chọn món ăn ngẫu nhiên hoặc lắc quẻ trưa thư giãn!';

    DOM.arenaKet.classList.add('active');
    DOM.arenaQue.classList.remove('active');

    DOM.ctaIcon.textContent = '🎯';
    DOM.ctaText.textContent = 'QUAY CHỌN MÓN';
    DOM.btnAgainText.textContent = 'Quay lần nữa';

    DOM.navBtnSpin.classList.add('active');
    DOM.navBtnQue.classList.remove('active');

    setTimeout(() => drawWheel(state.currentAngle), 50);
  } else {
    DOM.btnThemeQue.classList.add('active');
    DOM.btnThemeKet.classList.remove('active');
    DOM.btnThemeQue.setAttribute('aria-selected', 'true');
    DOM.btnThemeKet.setAttribute('aria-selected', 'false');

    DOM.brandIcon.textContent = '🎋';
    DOM.brandTitle.textContent = uiSettings.queBrandTitle;
    DOM.bannerBadge.textContent = uiSettings.queBadge;
    DOM.bannerTitle.textContent = 'Lắc quẻ tầm vị';
    DOM.bannerSubtitle.textContent = 'Cầu một chữ an, thưởng một bữa lành. Lắc ống quẻ tre nhận thông điệp bữa trưa!';

    DOM.arenaQue.classList.add('active');
    DOM.arenaKet.classList.remove('active');

    DOM.ctaIcon.textContent = '🎋';
    DOM.ctaText.textContent = 'XIN MỘT QUẺ';
    DOM.btnAgainText.textContent = 'Xin quẻ khác';

    DOM.navBtnQue.classList.add('active');
    DOM.navBtnSpin.classList.remove('active');

    resetQueState();
  }

  if (updateUrl) {
    try {
      const url = new URL(window.location);
      url.searchParams.set('theme', newTheme);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  }
}

// ==========================================
// FILTER LOGIC
// ==========================================
function getFilteredDishes() {
  return DISHES.filter(dish => {
    if (dish.category !== state.category) return false;
    if (state.isVegetarian && !dish.isVegetarian) return false;
    if (state.budget === '35k' && dish.price > 35000) return false;
    if (state.budget === '50k' && (dish.price < 35000 || dish.price > 60000)) return false;
    if (state.budget === '70k' && (dish.price < 60000 || dish.price > 85000)) return false;
    if (state.budget === '100k' && dish.price < 85000) return false;
    return true;
  });
}

function getPoolWithFallback() {
  let pool = getFilteredDishes();
  if (pool.length === 0) {
    pool = DISHES.filter(d => d.category === state.category);
    if (state.isVegetarian) {
      const vegPool = pool.filter(d => d.isVegetarian);
      if (vegPool.length > 0) pool = vegPool;
    }
  }
  return pool.length > 0 ? pool : DISHES;
}

function pickWeightedDish(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==========================================
// QUẺ TRƯA ENGINE (TRẢI 5 QUẺ -> THU HỘP -> LẮC & RỚT 1 QUẺ)
// ==========================================
function resetQueState() {
  state.queState = 'idle';
  if (DOM.bambooCylinder) DOM.bambooCylinder.classList.remove('shaking');
  if (DOM.fannedSticksGroup) DOM.fannedSticksGroup.classList.remove('gathering-in');
  if (DOM.fallenStickWrapper) DOM.fallenStickWrapper.classList.remove('popping-out');
  
  if (DOM.queStep1) DOM.queStep1.className = 'step-badge active';
  if (DOM.queStep2) DOM.queStep2.className = 'step-badge';
  if (DOM.queStep3) DOM.queStep3.className = 'step-badge';

  if (DOM.queInstruction) DOM.queInstruction.textContent = 'Bấm "XIN MỘT QUẺ" để trải 5 quẻ bí mật lên bàn!';
  DOM.ctaActionBtn.disabled = false;
  DOM.ctaText.textContent = 'XIN MỘT QUẺ';
}

function startQueProcess() {
  if (state.queState !== 'idle' || state.isSpinning) return;
  state.queState = 'running';
  DOM.ctaActionBtn.disabled = true;

  sound.init();

  // Giai đoạn 1: 5 Quẻ che tên trải xòe ra bàn
  if (DOM.queStep1) DOM.queStep1.className = 'step-badge active';
  if (DOM.queStep2) DOM.queStep2.className = 'step-badge';
  if (DOM.queStep3) DOM.queStep3.className = 'step-badge';

  if (DOM.fannedSticksGroup) DOM.fannedSticksGroup.classList.remove('gathering-in');
  if (DOM.fallenStickWrapper) DOM.fallenStickWrapper.classList.remove('popping-out');
  if (DOM.queInstruction) DOM.queInstruction.textContent = '📜 5 quẻ bí mật được trải xòe trên bàn trà...';

  sound.playStickDraw();

  // Giai đoạn 2 (sau 1.4s): Thu 5 quẻ và bỏ vào trong hộp quẻ tre
  setTimeout(() => {
    if (DOM.queStep1) DOM.queStep1.className = 'step-badge';
    if (DOM.queStep2) DOM.queStep2.className = 'step-badge active';
    if (DOM.fannedSticksGroup) DOM.fannedSticksGroup.classList.add('gathering-in');
    if (DOM.queInstruction) DOM.queInstruction.textContent = '📥 Đang thu 5 quẻ bỏ gọn vào hộp quẻ tre...';
    sound.playTick(0.85);
  }, 1400);

  // Giai đoạn 3 (sau 2.3s): Lắc hộp quẻ
  setTimeout(() => {
    if (DOM.queStep2) DOM.queStep2.className = 'step-badge';
    if (DOM.queStep3) DOM.queStep3.className = 'step-badge active';
    if (DOM.bambooCylinder) DOM.bambooCylinder.classList.add('shaking');
    if (DOM.queInstruction) DOM.queInstruction.textContent = '🎋 Đang lắc hộp quẻ chiêm nghiệm vị giác...';

    sound.playBambooShake();
    // Second rattle pulse
    setTimeout(() => sound.playBambooShake(), 650);
  }, 2300);

  // Giai đoạn 4 (sau 3.7s): Rớt ra 1 quẻ duy nhất!
  setTimeout(() => {
    if (DOM.bambooCylinder) DOM.bambooCylinder.classList.remove('shaking');

    // Pick fortune & dish
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    const pool = getPoolWithFallback();
    const dish = pickWeightedDish(pool);

    // Update single fallen stick UI
    if (DOM.fallenStickHead) DOM.fallenStickHead.textContent = fortune.tag || 'THƯỢNG CÁT';
    if (DOM.fallenStickText) DOM.fallenStickText.textContent = fortune.title.split(' ')[0] || 'AN NHIÊN';

    if (DOM.fallenStickWrapper) DOM.fallenStickWrapper.classList.add('popping-out');
    if (DOM.queInstruction) DOM.queInstruction.textContent = `✨ Một quẻ may mắn đã rớt ra ngoài: "${fortune.title}"!`;

    sound.playWin();
    burstHearts(6);

    // Giai đoạn 5 (sau 5.0s): Mở hộp thoại giải thơ quẻ và gợi ý món ăn
    setTimeout(() => {
      openResultModal(dish, fortune);
      resetQueState();
    }, 1350);
  }, 3700);
}

// ==========================================
// RESULT MODAL
// ==========================================
function openResultModal(dish, fortune = null) {
  state.activeDish = dish;
  state.activeFortune = fortune;
  window.TNAG_TRACKER.log('VIEW_RESULT', 'Xem kết quả: ' + dish.name);

  DOM.modalDishName.textContent = dish.name;
  DOM.modalCategory.textContent = dish.categoryName || 'Món ăn';
  DOM.modalOrigin.textContent = dish.origin || 'Việt Nam';
  DOM.modalDishPrice.textContent = `Giá tham khảo: ${dish.priceDisplay || '50.000đ'} / người`;
  DOM.modalDishDesc.textContent = dish.description;

  if (DOM.modalVegTag) {
    DOM.modalVegTag.style.display = dish.isVegetarian ? 'inline' : 'none';
  }

  DOM.modalFoodImg.src = dish.image;
  DOM.modalFoodImg.alt = dish.name;
  DOM.modalFoodImg.onerror = () => {
    DOM.modalFoodImg.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80';
  };

  // Only show decision banner in wheel mode
  if (state.theme === 'ket-hoi-tho-lun') {
    DOM.modalDecisionBanner.style.display = 'block';
  } else {
    DOM.modalDecisionBanner.style.display = 'none';
  }

  // Fortune box for Quẻ trưa
  if (fortune || state.theme === 'que-trua') {
    const activeFortune = fortune || FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    DOM.modalFortuneBox.style.display = 'block';
    DOM.fortunePoemTitle.textContent = `📜 ${activeFortune.title} · ${activeFortune.tag}`;
    DOM.fortunePoemText.textContent = `"${activeFortune.poem}"`;
    DOM.fortuneAdvice.textContent = `💡 Lời khuyên: ${activeFortune.advice}`;
  } else {
    DOM.modalFortuneBox.style.display = 'none';
  }

  const mapQuery = encodeURIComponent(`${dish.name} gần đây`);
  DOM.btnGmaps.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const deliveryQuery = encodeURIComponent(dish.name);
  DOM.btnDelivery.href = `https://shopeefood.vn/search?query=${deliveryQuery}`;

  DOM.resultModal.classList.add('open');
}

function closeResultModal() {
  DOM.resultModal.classList.remove('open');
}

// ==========================================
// PLAN MODAL (KẾ HOẠCH)
// ==========================================
function renderPlanSuggestionList(container, items, activityType) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="plan-empty-hint">Chưa có gợi ý nào từ admin.</p>`;
    return;
  }
  container.innerHTML = items.map(item => `
    <button type="button" class="plan-suggestion-card" data-activity="${activityType}" data-name="${escapeHtmlAttr(item.name)}">
      <span class="plan-suggestion-name">${escapeHtmlAttr(item.name)}</span>
      ${item.note ? `<span class="plan-suggestion-note">${escapeHtmlAttr(item.note)}</span>` : ''}
    </button>
  `).join('');

  container.querySelectorAll('.plan-suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const alreadySelected = card.classList.contains('selected');
      container.querySelectorAll('.plan-suggestion-card').forEach(c => c.classList.remove('selected'));
      if (alreadySelected) {
        state.planActivityChoice = null;
      } else {
        card.classList.add('selected');
        state.planActivityChoice = card.dataset.name;
      }
    });
  });
}

function escapeHtmlAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function selectPlanActivity(activity) {
  state.planActivity = activity;
  state.planActivityChoice = null;

  DOM.planActivityChips.querySelectorAll('.plan-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.activity === activity);
  });

  DOM.planCafeDetail.style.display = activity === 'cafe' ? 'block' : 'none';
  DOM.planMovieDetail.style.display = activity === 'movie' ? 'block' : 'none';

  if (activity === 'cafe') {
    renderPlanSuggestionList(DOM.planCafeList, getPlanCafes(), 'cafe');
  } else if (activity === 'movie') {
    renderPlanSuggestionList(DOM.planMovieList, getPlanMovies(), 'movie');
  }
}

function openPlanModal() {
  if (!state.activeDish) return;
  window.TNAG_TRACKER.log('OPEN_PLAN', 'Mở kế hoạch cho món: ' + state.activeDish.name);

  DOM.planDishEmoji.textContent = state.activeDish.emoji || '🍲';
  DOM.planDishName.textContent = state.activeDish.name;

  const now = new Date();
  DOM.planDate.value = now.toISOString().slice(0, 10);
  DOM.planTime.value = now.toTimeString().slice(0, 5);
  DOM.planNote.value = '';

  state.planActivity = null;
  state.planActivityChoice = null;
  DOM.planActivityChips.querySelectorAll('.plan-chip').forEach(chip => chip.classList.remove('active'));
  DOM.planCafeDetail.style.display = 'none';
  DOM.planMovieDetail.style.display = 'none';

  closeResultModal();
  DOM.planModal.classList.add('open');
}

function closePlanModal() {
  DOM.planModal.classList.remove('open');
}

const PLAN_ACTIVITY_LABELS = { cafe: 'Cà phê', movie: 'Xem phim', walk: 'Dạo phố' };

function submitPlan() {
  const dish = state.activeDish;
  if (!dish) return;

  const currentUser = (function () {
    try {
      const raw = sessionStorage.getItem('tnag_current_user') || localStorage.getItem('tnag_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const plan = {
    id: 'plan_' + Date.now(),
    timestamp: new Date().toISOString(),
    dishName: dish.name,
    date: DOM.planDate.value || '',
    time: DOM.planTime.value || '',
    activity: state.planActivity,
    activityLabel: state.planActivity ? PLAN_ACTIVITY_LABELS[state.planActivity] : '',
    activityChoice: state.planActivityChoice,
    note: DOM.planNote.value.trim(),
    user: currentUser ? currentUser.username : 'khách'
  };

  savePlanEntry(plan);
  window.TNAG_TRACKER.log('CONFIRM_PLAN', `Chốt kế hoạch: ${dish.name}${plan.activityLabel ? ' → ' + plan.activityLabel : ''}${plan.activityChoice ? ' (' + plan.activityChoice + ')' : ''}`);

  closePlanModal();

  const thankyou = getPlanThankyouSettings();
  DOM.planThankyouTitle.textContent = thankyou.title;
  DOM.planThankyouMessage.textContent = thankyou.message;
  DOM.planThankyouModal.classList.add('open');
}

function closePlanThankyouModal() {
  DOM.planThankyouModal.classList.remove('open');
}

// ==========================================
// FOOD CATALOG RENDERING & SEARCH
// ==========================================
function renderCatalog(dishes) {
  DOM.catalogGrid.innerHTML = '';
  DOM.catalogCountText.textContent = `Khám phá hơn ${dishes.length} món ngon đặc sắc phổ biến`;

  if (dishes.length === 0) {
    DOM.catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</p>
        <p>Không tìm thấy món ăn nào phù hợp với từ khóa này.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  dishes.forEach((dish, idx) => {
    const card = document.createElement('article');
    card.className = 'catalog-item-card';

    // Randomized rating & delivery time
    const rating = (4.4 + (idx % 6) * 0.1).toFixed(1);
    const deliveryTime = 20 + (idx % 4) * 5;

    card.innerHTML = `
      <div class="catalog-img-wrap">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'" />
        <div class="catalog-tag-overlay">
          <span class="${dish.isVegetarian ? 'swiggy-veg-icon' : 'swiggy-nonveg-icon'}" title="${dish.isVegetarian ? 'Món Chay' : 'Món Mặn'}"></span>
          <span class="delivery-time-badge">⚡ ${deliveryTime} PHÚT</span>
        </div>
      </div>
      <div class="catalog-body">
        <div>
          <div class="catalog-meta-row">
            <span class="rating-badge">★ ${rating}</span>
            <span class="catalog-meta">${dish.categoryName} • ${dish.origin}</span>
          </div>
          <h3 class="catalog-dish-title">${dish.name}</h3>
        </div>
        <div class="catalog-price-row">
          <span class="catalog-price">${dish.priceDisplay}</span>
          <span class="order-link-text">Đặt món →</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openResultModal(dish);
    });

    fragment.appendChild(card);
  });

  DOM.catalogGrid.appendChild(fragment);
}

function handleCatalogSearch(e) {
  const query = (e.target.value || '').toLowerCase().trim();
  if (!query) {
    renderCatalog(DISHES);
    return;
  }

  const filtered = DISHES.filter(dish => {
    return dish.name.toLowerCase().includes(query) ||
           dish.origin.toLowerCase().includes(query) ||
           dish.categoryName.toLowerCase().includes(query) ||
           dish.description.toLowerCase().includes(query);
  });

  renderCatalog(filtered);
}

// ==========================================
// SHARING & UTILITIES
// ==========================================
function showToast(message) {
  DOM.toastMsg.textContent = message;
  DOM.toastMsg.classList.add('show');
  setTimeout(() => {
    DOM.toastMsg.classList.remove('show');
  }, 2400);
}

function copyShareLink() {
  let urlStr = window.location.href;
  try {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('theme', state.theme);
    if (state.activeDish) {
      url.searchParams.set('dish', state.activeDish.id);
    }
    urlStr = url.toString();
  } catch (e) {}

  const textToCopy = `First date ăn gì? Hãy thử "${state.activeDish ? state.activeDish.name : 'quay món'}" tại: ${urlStr}`;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Đã sao chép liên kết chia sẻ món ăn!');
    }).catch(() => {
      showToast('Đã lưu liên kết món ăn!');
    });
  } else {
    const input = document.createElement('input');
    input.value = textToCopy;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Đã sao chép liên kết chia sẻ món ăn!');
  }
}

function updateAudioButton() {
  const isMuted = sound.isMuted();
  DOM.soundIcon.textContent = isMuted ? '🔇' : '🔊';
  DOM.soundText.textContent = isMuted ? 'Tắt' : 'Bật';
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Theme Buttons
  DOM.btnThemeKet.addEventListener('click', () => { window.TNAG_TRACKER.log('SWITCH_THEME', 'Vòng quay chọn món'); applyTheme('ket-hoi-tho-lun'); });
  DOM.btnThemeQue.addEventListener('click', () => { window.TNAG_TRACKER.log('SWITCH_THEME', 'Quẻ trưa may mắn'); applyTheme('que-trua'); });

  // Mobile Bottom Navigation Bar
  if (DOM.navBtnSpin) {
    DOM.navBtnSpin.addEventListener('click', () => {
      applyTheme('ket-hoi-tho-lun');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (DOM.navBtnQue) {
    DOM.navBtnQue.addEventListener('click', () => {
      applyTheme('que-trua');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Floating Heart Button Interactive Tap
  if (DOM.heartSourceBtn) {
    DOM.heartSourceBtn.addEventListener('click', () => {
      window.TNAG_TRACKER.log('CLICK_HEART', 'Bấm nút tim');
      burstHearts(8);
    });
  }

  // Sound Toggle
  DOM.soundToggleBtn.addEventListener('click', () => {
    sound.toggleMute();
    updateAudioButton();
    window.TNAG_TRACKER.log('TOGGLE_SOUND', sound.isMuted() ? 'Tắt âm thanh' : 'Bật âm thanh');
    if (!sound.isMuted()) sound.playTick();
  });

  // Category Tabs
  DOM.catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.category;
      window.TNAG_TRACKER.log('CHANGE_CATEGORY', 'Đổi danh mục: ' + btn.dataset.category);
    });
  });

  // Budget Select
  DOM.budgetSelect.addEventListener('change', (e) => {
    state.budget = e.target.value;
    window.TNAG_TRACKER.log('CHANGE_BUDGET', 'Đổi ngân sách: ' + e.target.value);
  });

  // Vegetarian Checkbox
  DOM.vegCheckbox.addEventListener('change', (e) => {
    state.isVegetarian = e.target.checked;
    window.TNAG_TRACKER.log('TOGGLE_VEG', e.target.checked ? 'Bật lọc chay' : 'Tắt lọc chay');
  });

  // Main Action CTA Button
  DOM.ctaActionBtn.addEventListener('click', () => {
    if (state.theme === 'ket-hoi-tho-lun') {
      window.TNAG_TRACKER.log('SPIN_WHEEL', 'Quay vòng chọn món');
      spinCircularWheel();
    } else {
      window.TNAG_TRACKER.log('SHAKE_QUE', 'Xin quẻ trưa');
      startQueProcess();
    }
  });

  // Wheel center hub click also spins
  if (DOM.wheelCenterHub) {
    DOM.wheelCenterHub.addEventListener('click', () => {
      if (state.theme === 'ket-hoi-tho-lun') spinCircularWheel();
    });
  }

  // Add Dish Form Submit
  if (DOM.addDishForm) {
    DOM.addDishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = DOM.addDishInput.value;
      if (val) {
        window.TNAG_TRACKER.log('ADD_DISH', 'Thêm món: ' + val);
        addDishToWheel(val);
        DOM.addDishInput.value = '';
      }
    });
  }

  // Quick Action Buttons
  if (DOM.btnQuickRandom) DOM.btnQuickRandom.addEventListener('click', () => { window.TNAG_TRACKER.log('QUICK_RANDOM', 'Ngẫu nhiên 8 món'); loadRandom8Dishes(); });
  if (DOM.btnQuickFilter) DOM.btnQuickFilter.addEventListener('click', () => { window.TNAG_TRACKER.log('QUICK_FILTER', 'Lấy từ bộ lọc'); loadFromCurrentFilters(); });
  if (DOM.btnQuickReset) DOM.btnQuickReset.addEventListener('click', () => { window.TNAG_TRACKER.log('QUICK_RESET', 'Khôi phục gốc'); resetToDefaultWheel(); });

  // Post-Spin Decision: Xóa món vừa trúng
  if (DOM.btnRemoveWinner) {
    DOM.btnRemoveWinner.addEventListener('click', () => {
      if (state.activeDish) {
        window.TNAG_TRACKER.log('REMOVE_DISH', 'Xóa món: ' + state.activeDish.name);
        const idx = state.wheelDishes.findIndex(d => d.name === state.activeDish.name || d.id === state.activeDish.id);
        if (idx !== -1) {
          removeDishFromWheel(idx);
        }
      }
      closeResultModal();
    });
  }

  // Post-Spin Decision: Để lại & Quay tiếp
  if (DOM.btnKeepWinner) {
    DOM.btnKeepWinner.addEventListener('click', () => {
      closeResultModal();
      showToast('Đã giữ lại món trên vòng quay. Hãy quay tiếp nhé!');
    });
  }

  // Sticks click for Quẻ Trưa
  if (DOM.mysterySticks) {
    DOM.mysterySticks.forEach(stick => {
      stick.addEventListener('click', () => {
        startQueProcess();
      });
    });
  }

  // Catalog search input
  DOM.catalogSearch.addEventListener('input', (e) => {
    if (e.target.value.length > 0) window.TNAG_TRACKER.log('SEARCH_CATALOG', 'Tìm kiếm: ' + e.target.value);
    handleCatalogSearch(e);
  });

  // Modal events
  DOM.modalCloseBtn.addEventListener('click', closeResultModal);
  DOM.resultModal.addEventListener('click', (e) => {
    if (e.target === DOM.resultModal) closeResultModal();
  });

  DOM.btnShare.addEventListener('click', () => { window.TNAG_TRACKER.log('SHARE_DISH', 'Chia sẻ: ' + (state.activeDish ? state.activeDish.name : '')); copyShareLink(); });

  // Plan modal events
  if (DOM.btnAddPlan) DOM.btnAddPlan.addEventListener('click', openPlanModal);
  if (DOM.planModalCloseBtn) DOM.planModalCloseBtn.addEventListener('click', closePlanModal);
  if (DOM.planModal) {
    DOM.planModal.addEventListener('click', (e) => {
      if (e.target === DOM.planModal) closePlanModal();
    });
  }
  if (DOM.planActivityChips) {
    DOM.planActivityChips.querySelectorAll('.plan-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const activity = chip.dataset.activity;
        selectPlanActivity(state.planActivity === activity ? null : activity);
      });
    });
  }
  if (DOM.btnConfirmPlan) DOM.btnConfirmPlan.addEventListener('click', submitPlan);
  if (DOM.planThankyouCloseBtn) DOM.planThankyouCloseBtn.addEventListener('click', closePlanThankyouModal);
  if (DOM.planThankyouModal) {
    DOM.planThankyouModal.addEventListener('click', (e) => {
      if (e.target === DOM.planThankyouModal) closePlanThankyouModal();
    });
  }

  DOM.btnSpinAgain.addEventListener('click', () => {
    window.TNAG_TRACKER.log('SPIN_AGAIN', 'Quay/xin lại lần nữa');
    closeResultModal();
    if (state.theme === 'ket-hoi-tho-lun') {
      setTimeout(() => spinCircularWheel(), 250);
    } else {
      setTimeout(() => startQueProcess(), 250);
    }
  });

  // Keyboard shortcut Esc to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeResultModal();
  });
}

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
