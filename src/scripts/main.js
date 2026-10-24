/**
 * Main entry point - Initializes all components
 */
import { initHeader, setActiveNavLink } from './components/Header.js';
import { initFooter } from './components/Footer.js';
import { initProductGrid, initFeaturedProducts } from './components/ProductGrid.js';
import { initCategoriesGrid } from './components/CategoriesGrid.js';
import { getCurrentPageSection } from './utils/helpers.js';

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize header (navigation, mobile menu, scroll effects)
  initHeader();
  setActiveNavLink();

  // Initialize footer (back-to-top, year)
  initFooter();

  // Initialize page-specific components
  const section = getCurrentPageSection();

  if (section === 'index') {
    // Home page - initialize featured products and categories grid
    await initFeaturedProducts();
    initCategoriesGrid();
  } else if (['furniture', 'decor', 'electronics'].includes(section)) {
    // Category pages - initialize product grid with filtering
    await initProductGrid(section);
  }
  // Contact page has no special JS initialization needed
});

/**
 * Handle page visibility changes (for performance)
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - could pause animations, etc.
  } else {
    // Page is visible - could resume animations, etc.
  }
});

/**
 * Handle errors globally
 */
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});