/* =====================================================
   E-Commerce Product Catalog — script.js
   API: https://fakestoreapi.com
===================================================== */

// ───────── API CONFIG ─────────
const API_URL = "https://fakestoreapi.com/products";

// ───────── STATE ─────────
const state = {
    allProducts: [],
    categories: [],
    cart: [],            // [ { product, qty } ]
    detailProduct: null,
};

// ───────── DOM REFS ─────────
const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const resultsCount = document.getElementById('results-count');
const errorBanner = document.getElementById('error-banner');

// Cart DOM
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartBtn = document.getElementById('cart-btn');
const cartBadge = document.getElementById('cart-badge');
const cartItemsList = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

// Modal DOM
const productOverlay = document.getElementById('product-overlay');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalRating = document.getElementById('modal-rating');
const modalRatCount = document.getElementById('modal-rating-count');
const modalAddBtn = document.getElementById('modal-add-cart');

// Toast
const toastContainer = document.getElementById('toast-container');

// Theme
const themeBtn = document.getElementById('theme-btn');

// ───────── INIT ─────────
(async function init() {
    loadCartFromStorage();
    renderCart();
    setupEventListeners();
    await fetchData();
})();

// ───────── FETCH ─────────
async function fetchData() {
    showSkeletons(12);
    hideError();
    try {
        const [products, categories] = await Promise.all([
            fetch(API_URL).then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText} — ${API_URL}`);
                return r.json();
            }),
            fetch(`${API_URL}/categories`).then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText} — ${API_URL}/categories`);
                return r.json();
            }),
        ]);
        state.allProducts = products;
        state.categories = categories;
        populateCategorySelect(categories);
        applyFilters();
    } catch (err) {
        // ── Diagnostic logging ──────────────────────────────────────
        console.group('%c[ShopVault] Product fetch failed', 'color:#ef4444;font-weight:700');
        console.error('Error type   :', err.name);
        console.error('Message      :', err.message);
        console.error('Stack trace  :', err.stack);
        console.info(
            'Hint: Verify the API endpoint is reachable.\n' +
            `  Products URL  → ${API_URL}\n` +
            `  Categories URL→ ${API_URL}/categories\n` +
            '  Check: network tab, CORS headers, or internet connectivity.'
        );
        console.groupEnd();
        // ── User-facing message ──────────────────────────────────────
        const isOffline = !navigator.onLine;
        const isHttpError = err.message.startsWith('HTTP');
        let userMsg;
        if (isOffline) {
            userMsg = '⚠️  You appear to be offline. Please check your internet connection and refresh.';
        } else if (isHttpError) {
            userMsg = `⚠️  Server error: ${err.message}. Please try again later.`;
        } else {
            userMsg = `⚠️  Could not connect to the Fake Store API. Open the browser console (F12) for diagnostic details.`;
        }
        showError(userMsg);
        grid.innerHTML = '';
    }
}

function populateCategorySelect(cats) {
    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = capitalize(c);
        categorySelect.appendChild(opt);
    });
}

// ───────── FILTER / SORT / RENDER ─────────
function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    let list = [...state.allProducts];

    // Search
    if (query) {
        list = list.filter(p => p.title.toLowerCase().includes(query));
    }

    // Category
    if (category) {
        list = list.filter(p => p.category === category);
    }

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating.rate - a.rating.rate);

    renderProducts(list);
}

function renderProducts(list) {
    grid.innerHTML = '';

    resultsCount.textContent = `${list.length} product${list.length !== 1 ? 's' : ''}`;

    if (!list.length) {
        grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">No products found</div>
        <p class="empty-state__text">Try a different search term, category, or sorting option.</p>
      </div>`;
        return;
    }

    list.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const inCart = state.cart.find(i => i.product.id === product.id);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.innerHTML = `
    <div class="product-card__img-wrap">
      <img class="product-card__img" src="${product.image}" alt="${escHtml(product.title)}" loading="lazy">
      <span class="product-card__badge">${escHtml(product.category)}</span>
    </div>
    <div class="product-card__body">
      <h2 class="product-card__title">${escHtml(product.title)}</h2>
      <div class="product-card__rating">
        <div class="stars" aria-label="Rating: ${product.rating.rate} out of 5">
          ${buildStars(product.rating.rate)}
        </div>
        <span class="rating-count">(${product.rating.count})</span>
      </div>
      <div class="product-card__footer">
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="btn-add-cart" data-id="${product.id}" id="card-add-${product.id}" aria-label="Add ${escHtml(product.title)} to cart">
          🛒 ${inCart ? 'In Cart' : 'Add'}
        </button>
      </div>
    </div>`;

    // Click card → modal (but not if button clicked)
    card.addEventListener('click', e => {
        if (e.target.closest('.btn-add-cart')) return;
        openDetailModal(product);
    });

    // Add to cart button
    card.querySelector('.btn-add-cart').addEventListener('click', e => {
        e.stopPropagation();
        addToCart(product.id);
    });

    return card;
}

// ───────── STAR BUILDER ─────────
function buildStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += `<span class="star full">★</span>`;
        else if (rating >= i - 0.5) html += `<span class="star half">★</span>`;
        else html += `<span class="star empty">★</span>`;
    }
    return html;
}

// ───────── SKELETON LOADER ─────────
function showSkeletons(count) {
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        grid.innerHTML += `
      <div class="skeleton" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40 h-20"></div>
        </div>
      </div>`;
    }
}

// ───────── PRODUCT DETAIL MODAL ─────────
function openDetailModal(product) {
    state.detailProduct = product;
    modalImg.src = product.image;
    modalImg.alt = product.title;
    modalCategory.textContent = capitalize(product.category);
    modalTitle.textContent = product.title;
    modalDesc.textContent = product.description;
    modalPrice.textContent = `$${product.price.toFixed(2)}`;
    modalRating.innerHTML = buildStars(product.rating.rate);
    modalRatCount.textContent = `${product.rating.rate} (${product.rating.count})`;
    modalAddBtn.dataset.id = product.id;
    productOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    productOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.detailProduct = null;
}

// ───────── CART LOGIC ─────────
function addToCart(productId) {
    const product = state.allProducts.find(p => p.id === Number(productId));
    if (!product) return;

    const existing = state.cart.find(i => i.product.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({ product, qty: 1 });
    }

    saveCartToStorage();
    renderCart();
    updateCardBtn(product.id);
    showToast(`"${product.title.substring(0, 30)}…" added to cart`);
}

function updateQty(productId, delta) {
    const item = state.cart.find(i => i.product.id === Number(productId));
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCartToStorage();
    renderCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.product.id !== Number(productId));
    saveCartToStorage();
    renderCart();
    updateCardBtn(productId);
}

function clearCart() {
    state.cart = [];
    saveCartToStorage();
    renderCart();
    // Refresh all card buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.textContent = '🛒 Add';
    });
}

function updateCardBtn(productId) {
    const btn = document.getElementById(`card-add-${productId}`);
    if (!btn) return;
    const inCart = state.cart.find(i => i.product.id === Number(productId));
    btn.textContent = inCart ? '🛒 In Cart' : '🛒 Add';
}

// ───────── RENDER CART ─────────
function renderCart() {
    const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = state.cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

    // Badge
    if (totalItems > 0) {
        cartBadge.textContent = totalItems > 99 ? '99+' : totalItems;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }

    // Count in drawer header
    cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    // Total
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    // Items list
    if (!state.cart.length) {
        cartItemsList.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p class="cart-empty__text">Your cart is empty.<br>Add some products to get started!</p>
      </div>`;
        return;
    }

    cartItemsList.innerHTML = '';
    state.cart.forEach(({ product, qty }) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.setAttribute('data-cart-id', product.id);
        el.innerHTML = `
      <div class="cart-item__img-wrap">
        <img class="cart-item__img" src="${product.image}" alt="${escHtml(product.title)}" loading="lazy">
      </div>
      <div class="cart-item__info">
        <div class="cart-item__name">${escHtml(product.title)}</div>
        <div class="cart-item__price">$${(product.price * qty).toFixed(2)}</div>
      </div>
      <div class="cart-item__controls">
        <button class="qty-btn qty-minus" data-id="${product.id}" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn qty-plus"  data-id="${product.id}" aria-label="Increase quantity">+</button>
      </div>
      <button class="cart-item__remove" data-id="${product.id}" aria-label="Remove item">✕</button>`;

        el.querySelector('.qty-minus').addEventListener('click', e => { e.stopPropagation(); updateQty(product.id, -1); });
        el.querySelector('.qty-plus').addEventListener('click', e => { e.stopPropagation(); updateQty(product.id, 1); });
        el.querySelector('.cart-item__remove').addEventListener('click', e => { e.stopPropagation(); removeFromCart(product.id); });

        cartItemsList.appendChild(el);
    });
}

// ───────── LOCALSTORAGE ─────────
function saveCartToStorage() {
    localStorage.setItem('ecom_cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem('ecom_cart');
        if (raw) state.cart = JSON.parse(raw);
    } catch { state.cart = []; }
}

// ───────── CART DRAWER OPEN / CLOSE ─────────
function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ───────── TOAST ─────────
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-dot"></span>${msg}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 2600);
}

// ───────── ERROR ─────────
function showError(msg) {
    errorBanner.textContent = '⚠️  ' + msg;
    errorBanner.classList.add('visible');
}

function hideError() {
    errorBanner.classList.remove('visible');
}

// ───────── THEME TOGGLE ─────────
(function initTheme() {
    const saved = localStorage.getItem('ecom_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ecom_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// ───────── EVENT LISTENERS ─────────
function setupEventListeners() {
    // Search — debounced
    let searchTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 280);
    });

    categorySelect.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Cart open/close
    cartBtn.addEventListener('click', openCart);
    cartOverlay.addEventListener('click', closeCart);
    document.getElementById('cart-close-btn').addEventListener('click', closeCart);
    document.getElementById('clear-cart-btn').addEventListener('click', () => {
        if (state.cart.length) { clearCart(); showToast('Cart cleared'); }
    });

    // Modal close
    productOverlay.addEventListener('click', e => {
        if (e.target === productOverlay) closeDetailModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeDetailModal);

    // Modal add to cart
    modalAddBtn.addEventListener('click', () => {
        addToCart(modalAddBtn.dataset.id);
    });

    // Theme toggle
    themeBtn.addEventListener('click', toggleTheme);

    // Keyboard accessibility
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeDetailModal();
            closeCart();
        }
    });
}

// ───────── HELPERS ─────────
function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
