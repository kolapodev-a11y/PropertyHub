// ============================================================
// main.js — Shared utilities and homepage logic
// ============================================================

import { setupNavAuth } from "./auth.js";
import { getListingsRealtime, renderCard } from "./listings.js";
import { showToast } from "./upload.js";

// ─── Boot on every page ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupNavAuth();
  setupMobileMenu();

  // Homepage featured listings
  const grid = document.getElementById("featured-grid");
  if (grid) loadFeaturedListings(grid);

  // Search bar
  const searchForm = document.getElementById("hero-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("hero-search-input").value.trim();
      if (q) window.location.href = `sell-house.html?q=${encodeURIComponent(q)}`;
    });
  }
});

// ─── Mobile hamburger menu ───────────────────────────────────
function setupMobileMenu() {
  const toggle  = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (toggle && navMenu) {
    toggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }
}

// ─── Load featured listings on homepage ─────────────────────
function loadFeaturedListings(container) {
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>Loading listings…</p></div>`;
  const unsubscribe = getListingsRealtime(null, (listings) => {
    if (listings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🏠</span>
          <h3>No listings yet</h3>
          <p>Be the first to post a property or phone!</p>
        </div>`;
      return;
    }
    const top8 = listings.slice(0, 8);
    container.innerHTML = top8.map(renderCard).join("");
  });
  return unsubscribe;
}

// ─── Load category-specific listings ────────────────────────
export function loadCategoryListings(category, containerId, emptyMsg = "No listings in this category yet.") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>Loading…</p></div>`;

  // URL query filter
  const urlParams = new URLSearchParams(window.location.search);
  const q         = urlParams.get("q") || "";

  const unsubscribe = getListingsRealtime(category, (listings) => {
    let filtered = listings;
    if (q) {
      const qLow = q.toLowerCase();
      filtered = listings.filter(l =>
        (l.title || "").toLowerCase().includes(qLow) ||
        (l.description || "").toLowerCase().includes(qLow) ||
        (l.locationName || "").toLowerCase().includes(qLow)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>${q ? `No results for "${q}"` : emptyMsg}</h3>
          <p>${q ? "Try a different search term." : "Check back soon or post the first listing!"}</p>
        </div>`;
      return;
    }
    container.innerHTML = filtered.map(renderCard).join("");
  });

  return unsubscribe;
}

// ─── Initialize a category page ─────────────────────────────
export function initCategoryPage(category, emptyMsg) {
  document.addEventListener("DOMContentLoaded", () => {
    setupNavAuth();
    setupMobileMenu();
    loadCategoryListings(category, "listings-grid", emptyMsg);

    // Post listing button
    const postBtn = document.querySelectorAll(".post-listing-btn");
    postBtn.forEach(btn => {
      btn.addEventListener("click", () => {
        window.location.href = `upload.html?cat=${category}`;
      });
    });

    // Search filter on page
    const filterInput = document.getElementById("page-search");
    if (filterInput) {
      filterInput.addEventListener("input", (e) => {
        const q   = e.target.value.toLowerCase();
        const cards = document.querySelectorAll(".listing-card");
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? "" : "none";
        });
      });
    }
  });
}

export { showToast };
