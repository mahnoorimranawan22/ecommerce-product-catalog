# 🛍️ ShopVault — E-Commerce Product Catalog

A fully client-side e-commerce product catalog built with **HTML**, **CSS**, and **JavaScript**, powered by the [Fake Store API](https://fakestoreapi.com). No build tools or dependencies required.

---

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in any modern browser

> **Note:** An internet connection is required to fetch products from the Fake Store API.

```
ecommerce-product-catalog/
├── index.html      # Main page — structure & markup
├── style.css       # Design system, components, responsive layout
├── script.js       # All app logic — API, cart, filters, localStorage
├── favicon.png     # App icon
└── README.md       # This file
```

---

## ✨ Features

### 🗂️ Product Catalog
| Feature | Description |
|---|---|
| Display All Products | Loads all 20 products from the Fake Store API on page load |
| Skeleton Loader | Animated placeholder cards shown while products are fetching |
| Search by Title | Debounced real-time search filters products as you type |
| Filter by Category | Dropdown populated dynamically from the API |
| Sort Options | Price: Low → High · Price: High → Low · Rating: Best First |
| Empty State | Friendly message when no products match the current filters |

### 🔍 Product Detail
| Feature | Description |
|---|---|
| Detail Modal | Click any product card to view full image, title, description, price, and star rating |
| Add to Cart | Add directly from the modal or from the product card |
| Close Modal | Click ✕, click outside the modal, or press `Escape` |

### 🛒 Shopping Cart
| Feature | Description |
|---|---|
| Add to Cart | One-click add from card or modal; badge updates instantly |
| Update Quantity | `+` / `−` buttons per item; removing at qty 1 removes the item |
| Remove Item | `✕` button removes individual items |
| Clear Cart | Empties all items at once |
| Total Price | Recalculates live on every change |
| localStorage | Cart persists across page refreshes |
| Toast Alerts | "Added to cart" confirmation notification on every add |

### 🎨 UI / UX
| Feature | Description |
|---|---|
| Dark / Light Mode | Toggle in the header; preference saved to localStorage |
| Responsive Design | 6 breakpoints: 1400px · 1024px · 768px · 640px · 480px · 360px |
| Favicon | Custom icon for browser tabs and bookmarks |
| Accessibility | ARIA roles, labels, and keyboard navigation (`Escape` closes overlays) |
| Error Handling | Detects offline status, HTTP errors; logs diagnostics to console (F12) |

---

## 🌐 API Reference

Base URL: `https://fakestoreapi.com`

| Endpoint | Usage |
|---|---|
| `GET /products` | Fetch all products |
| `GET /products/categories` | Fetch all category names |

The API URL is defined as a single constant in `script.js`:
```js
const API_URL = "https://fakestoreapi.com/products";
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| `≥ 1400px` | Large desktop — wider cards |
| `≤ 1024px` | Tablet landscape — adjusted sidebar & modal |
| `≤ 768px` | Tablet portrait — stacked controls, full-width cart |
| `≤ 640px` | Mobile — 2-column grid, compact cards |
| `≤ 480px` | Small mobile — cart footer stacks vertically |
| `≤ 360px` | Tiny phone — single-column grid |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup with ARIA accessibility
- **CSS3** — Custom properties, CSS Grid, Flexbox, animations
- **Vanilla JavaScript (ES2020)** — No frameworks or libraries
- **Fake Store API** — Free mock e-commerce REST API

---

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
