/**
 * Footer component - Handles back-to-top button and footer interactions
 */

/**
 * Initialize footer functionality
 */
export function initFooter() {
  initBackToTop();
  initCurrentYear();
}

/**
 * Initialize back-to-top button
 */
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  // Throttled scroll handler for better performance
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        backToTop.hidden = window.scrollY < 500;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Keyboard support
  backToTop.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Initial check
  handleScroll();
}

/**
 * Initialize current year in copyright notice
 */
function initCurrentYear() {
  const yearElements = document.querySelectorAll('[data-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

/**
 * Initialize WhatsApp link tracking (optional analytics)
 */
export function initWhatsAppTracking() {
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
    link.addEventListener('click', () => {
      // Could add analytics tracking here
      console.log('WhatsApp link clicked:', link.href);
    });
  });
}