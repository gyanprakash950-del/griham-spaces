/**
 * ProductGrid component - Handles product grid rendering and filtering
 * Uses spring animations for fluid category transitions (Apple fluid interfaces)
 */
import { fetchProductsBySectionAndCategory, fetchFeaturedProducts } from '../utils/api.js';
import { createProductCards } from '../utils/helpers.js';
import { springWithPreset, cancelAnimations } from '../utils/springs.js';
import { initProductCardInteractions, staggerEntrance } from '../utils/cardInteractions.js';

let currentCategory = 'all';
let isAnimating = false;

/**
 * Initialize the product grid for a specific section
 * @param {string} section - Section name (furniture, decor, electronics)
 */
export async function initProductGrid(section) {
  const productGrid = document.getElementById('productsGrid');
  const count = document.getElementById('visibleCount');
  const emptyState = document.getElementById('noProducts');
  const tabs = [...document.querySelectorAll('.filter-tab')];

  if (!productGrid) return;

  // Initial load - show all products
  const allProducts = await fetchProductsBySectionAndCategory(section, 'all');
  renderProducts(allProducts, productGrid, count, emptyState, tabs, 'all');
  // Initialize spring interactions on initial cards
  const initialCards = productGrid.querySelectorAll('.product-card');
  initProductCardInteractions(initialCards);
  staggerEntrance(initialCards, { delay: 40 });

  // Set up tab click handlers with spring animation
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const category = tab.dataset.category;
      if (category !== currentCategory && !isAnimating) {
        await handleCategoryChange(category, section, productGrid, count, emptyState, tabs);
      }
    });
  });

  // Handle URL hash on load
  const initialCategory = window.location.hash.slice(1) || 'all';
  if (initialCategory !== 'all') {
    await handleCategoryChange(initialCategory, section, productGrid, count, emptyState, tabs);
  }
}

/**
 * Handle category change with spring animation
 * - Cross-fades old products out, new products in
 * - Uses spring for fluid, interruptible transition
 */
async function handleCategoryChange(category, section, productGrid, count, emptyState, tabs) {
  if (isAnimating) return;
  isAnimating = true;

  // Update tab states immediately (UI responsiveness)
  updateTabStates(tabs, category);

  // Fetch new products
  const products = await fetchProductsBySectionAndCategory(section, category);

  // Animate transition: fade out -> swap content -> fade in
  await animateProductTransition(productGrid, products, count, emptyState);

  currentCategory = category;
  updateUrlHash(category);
  isAnimating = false;
}

/**
 * Animate product grid transition with spring
 */
function animateProductTransition(productGrid, products, count, emptyState) {
  return new Promise(resolve => {
    // Phase 1: Fade out current content with spring
    const fadeOut = springWithPreset(productGrid, {
      opacity: [1, 0],
      transform: ['translateY(0)', 'translateY(-8px)']
    }, 'ui');

    fadeOut.onfinish = () => {
      // Swap content
      productGrid.innerHTML = createProductCards(products);
      if (count) count.textContent = String(products.length);
      if (emptyState) emptyState.hidden = products.length > 0;

      // Initialize spring interactions on new cards
      const newCards = productGrid.querySelectorAll('.product-card');
      initProductCardInteractions(newCards);

      // Stagger entrance
      staggerEntrance(newCards, { delay: 40 }).then(resolve);
    };
  });
}

/**
 * Update tab active states
 */
function updateTabStates(tabs, category) {
  tabs.forEach(tab => {
    const selected = tab.dataset.category === category;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  // Update aria-labelledby for accessibility
  const selectedTab = tabs.find(tab => tab.dataset.category === category);
  const productGrid = document.getElementById('productsGrid');
  if (selectedTab && productGrid) {
    productGrid.setAttribute('aria-labelledby', selectedTab.id);
  }
}

/**
 * Update URL hash without page reload
 */
function updateUrlHash(category) {
  const hash = category === 'all' ? '' : `#${category}`;
  history.replaceState(null, '', `${window.location.pathname}${hash}`);
}

/**
 * Initialize featured products grid (for home page)
 * @param {string} containerId - ID of the container element
 */
export async function initFeaturedProducts(containerId = 'featuredProducts') {
  const featuredGrid = document.getElementById(containerId);
  if (!featuredGrid) return;

  const products = await fetchFeaturedProducts();
  featuredGrid.innerHTML = createProductCards(products.slice(0, 4));

  // Initialize spring interactions and stagger entrance
  const cards = featuredGrid.querySelectorAll('.product-card');
  initProductCardInteractions(cards);
  staggerEntrance(cards, { delay: 60 });
}