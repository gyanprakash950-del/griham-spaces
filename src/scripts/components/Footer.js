/**
 * Footer component - Handles back-to-top button and footer interactions
 * Back-to-top uses spring animation for fluid appearance/disappearance
 */
import { springWithPreset, SpringPresets } from '../utils/springs.js';

let backToTopAnimation = null;

/**
 * Initialize footer functionality
 */
export function initFooter() {
  initBackToTop();
  initCurrentYear();
}

/**
 * Initialize back-to-top button with spring animation
 */
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  // Initial state - hidden and scaled down
  backToTop.style.opacity = '0';
  backToTop.style.transform = 'scale(0.8) translateY(20px)';
  backToTop.style.transition = 'none';
  backToTop.hidden = true;

  // Throttled scroll handler for better performance
  let ticking = false;
  let isVisible = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const shouldShow = window.scrollY >= 500;
        if (shouldShow !== isVisible) {
          isVisible = shouldShow;
          animateBackToTop(backToTop, shouldShow);
        }
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
 * Animate back-to-top button with spring
 */
function animateBackToTop(button, show) {
  if (backToTopAnimation) {
    backToTopAnimation.cancel();
  }

  if (show) {
    button.hidden = false;
    backToTopAnimation = springWithPreset(button, {
      opacity: [0, 1],
      transform: ['scale(0.8) translateY(20px)', 'scale(1) translateY(0)']
    }, 'snappy');
  } else {
    backToTopAnimation = springWithPreset(button, {
      opacity: [1, 0],
      transform: ['scale(1) translateY(0)', 'scale(0.8) translateY(20px)']
    }, 'press');
    backToTopAnimation.onfinish = () => {
      if (!isVisible) button.hidden = true;
    };
  }
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