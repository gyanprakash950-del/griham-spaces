/**
 * Helper utilities for rendering and formatting
 */

/**
 * Create a product card HTML element from product data
 * @param {Object} product - Product data object
 * @returns {string} HTML string for the product card
 */
export function createProductCard(product) {
  const message = encodeURIComponent(product.whatsappMessage || `Hello, I'm interested in the ${product.name}. Please share details.`);
  const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        ${badge}
      </div>
      <div class="product-info">
        <span class="product-category">${product.sectionLabel}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom">
          <span class="product-price">${product.price}</span>
          <a class="product-enquire" href="https://wa.me/918969343308?text=${message}" target="_blank" rel="noopener noreferrer">Ask on WhatsApp →</a>
        </div>
      </div>
    </article>`;
}

/**
 * Create multiple product cards from an array of products
 * @param {Array} products - Array of product objects
 * @returns {string} HTML string for all product cards
 */
export function createProductCards(products) {
  return products.map(createProductCard).join('');
}

/**
 * Debounce function to limit rate of function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function to limit rate of function execution
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get the current page section from the URL pathname
 * @returns {string} Page section (furniture, decor, electronics, contact, index)
 */
export function getCurrentPageSection() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path.replace('.html', '');
}

/**
 * Format price for display
 * @param {string|number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (typeof price === 'number') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return price;
}

/**
 * Check if element is in viewport
 * @param {Element} element - DOM element to check
 * @param {number} threshold - Threshold ratio (0-1)
 * @returns {boolean} Whether element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
    rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) * threshold
  );
}