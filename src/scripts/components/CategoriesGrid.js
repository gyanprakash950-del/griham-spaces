/**
 * CategoriesGrid component - Handles category grid interactions
 * Uses spring animations for fluid card interactions (Apple fluid interfaces)
 */
import { initCategoryCardInteractions, staggerEntrance } from '../utils/cardInteractions.js';

/**
 * Initialize category grid interactions
 */
export function initCategoriesGrid() {
  const categoriesGrid = document.querySelector('.categories-grid');
  if (!categoriesGrid) return;

  const categoryCards = categoriesGrid.querySelectorAll('.category-card');
  if (categoryCards.length === 0) return;

  // Initialize spring interactions
  initCategoryCardInteractions(categoryCards);

  // Stagger entrance on page load
  staggerEntrance(categoryCards, { delay: 80, startTransform: 'translateY(20px)', startOpacity: 0 });
}

export default { initCategoriesGrid };