/**
 * ProductGrid component - Handles product grid rendering and filtering
 */
import { fetchProductsBySectionAndCategory, fetchFeaturedProducts } from '../utils/api.js';
import { createProductCards } from '../utils/helpers.js';

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

  // Set up tab click handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const category = tab.dataset.category;
      await handleCategoryChange(category, section, productGrid, count, emptyState, tabs);
    });
  });

  // Handle URL hash on load
  const initialCategory = window.location.hash.slice(1) || 'all';
  if (initialCategory !== 'all') {
    await handleCategoryChange(initialCategory, section, productGrid, count, emptyState, tabs);
  }
}

/**
 * Handle category change
 * @param {string} category - Category to filter by
 * @param {string} section - Section name
 * @param {HTMLElement} productGrid - Product grid element
 * @param {HTMLElement} count - Count element
 * @param {HTMLElement} emptyState - Empty state element
 * @param {Array} tabs - Tab elements
 */
async function handleCategoryChange(category, section, productGrid, count, emptyState, tabs) {
  const products = await fetchProductsBySectionAndCategory(section, category);
  renderProducts(products, productGrid, count, emptyState, tabs, category);
  updateUrlHash(category);
}

/**
 * Render products to the grid
 * @param {Array} products - Array of product objects
 * @param {HTMLElement} productGrid - Product grid element
 * @param {HTMLElement} count - Count element
 * @param {HTMLElement} emptyState - Empty state element
 * @param {Array} tabs - Tab elements
 * @param {string} category - Current category
 */
function renderProducts(products, productGrid, count, emptyState, tabs, category) {
  productGrid.innerHTML = createProductCards(products);
  if (count) count.textContent = String(products.length);
  if (emptyState) emptyState.hidden = products.length > 0;

  // Update aria-labelledby for accessibility
  const selectedTab = tabs.find(tab => tab.dataset.category === category);
  if (selectedTab) productGrid.setAttribute('aria-labelledby', selectedTab.id);
}

/**
 * Update URL hash without page reload
 * @param {string} category - Category to set in hash
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
}