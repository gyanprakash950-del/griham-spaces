/**
 * Header component - Handles navigation, mobile menu, and scroll effects
 * Mobile menu uses spring-driven, interruptible sheet animation (Apple fluid interfaces)
 */
import { springWithPreset, cancelAnimations, SpringPresets } from '../utils/springs.js';

let mobileMenuAnimation = null;
let isMenuOpen = false;

/**
 * Initialize header functionality
 */
export function initHeader() {
  initMobileMenu();
  initScrollEffect();
  initSmoothScroll();
}

/**
 * Initialize mobile menu as a spring-driven sheet
 * - Interruptible: can be grabbed mid-animation
 * - Uses Apple's drawer preset (damping: 0.8, response: 0.3)
 * - Rubber-bands at boundaries
 */
function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (!navToggle || !navMenu) return;

  // Set initial state - menu starts off-screen (translated down)
  navMenu.style.transform = 'translateY(-100%)';
  navMenu.style.opacity = '0';
  navMenu.style.transition = 'none'; // Disable CSS transitions, we use springs

  navToggle.addEventListener('click', () => toggleMenu(navMenu, navToggle));

  // Close menu when clicking a link
  navMenu.addEventListener('click', event => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu(navMenu, navToggle);
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu(navMenu, navToggle);
      navToggle.focus();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', event => {
    if (isMenuOpen &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)) {
      closeMenu(navMenu, navToggle);
    }
  });

  // Touch drag support for interruptibility
  initMenuDrag(navMenu, navToggle);
}

/**
 * Toggle menu open/closed with spring animation
 */
function toggleMenu(navMenu, navToggle) {
  if (isMenuOpen) {
    closeMenu(navMenu, navToggle);
  } else {
    openMenu(navMenu, navToggle);
  }
}

/**
 * Open menu with spring animation
 */
function openMenu(navMenu, navToggle) {
  // Cancel any running animation (interruptibility)
  cancelAnimations(navMenu);

  isMenuOpen = true;
  navToggle.setAttribute('aria-expanded', 'true');
  navMenu.hidden = false;
  navMenu.style.display = 'flex';

  // Animate from current position (interruptible) to open state
  mobileMenuAnimation = springWithPreset(navMenu, {
    transform: ['translateY(-100%)', 'translateY(0)'],
    opacity: [0, 1]
  }, 'drawer');

  // Stagger nav links entrance
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link, index) => {
    link.style.opacity = '0';
    link.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      springWithPreset(link, {
        transform: ['translateY(-10px)', 'translateY(0)'],
        opacity: [0, 1]
      }, 'ui', { delay: index * 30 });
    }, 50);
  });
}

/**
 * Close menu with spring animation
 */
function closeMenu(navMenu, navToggle) {
  // Cancel any running animation (interruptibility)
  cancelAnimations(navMenu);

  isMenuOpen = false;
  navToggle.setAttribute('aria-expanded', 'false');

  mobileMenuAnimation = springWithPreset(navMenu, {
    transform: ['translateY(0)', 'translateY(-100%)'],
    opacity: [1, 0]
  }, 'drawer');

  mobileMenuAnimation.onfinish = () => {
    if (!isMenuOpen) {
      navMenu.hidden = true;
      navMenu.style.display = 'none';
    }
  };

  // Fade out links
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link, index) => {
    springWithPreset(link, {
      transform: ['translateY(0)', 'translateY(-10px)'],
      opacity: [1, 0]
    }, 'press', { delay: index * 15 });
  });
}

/**
 * Initialize drag-to-close for mobile menu (interruptibility)
 * Allows user to drag menu down to close, with rubber-band resistance
 */
function initMenuDrag(navMenu, navToggle) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let animationFrame = null;

  const handlePointerDown = (event) => {
    if (!isMenuOpen) return;
    // Only allow drag from the menu area, not links
    if (event.target.closest('.nav-link')) return;

    isDragging = true;
    startY = event.clientY || event.touches?.[0]?.clientY || 0;
    cancelAnimations(navMenu); // Interrupt any animation
    navMenu.style.transition = 'none';
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    currentY = event.clientY || event.touches?.[0]?.clientY || 0;
    const deltaY = currentY - startY;

    // Only allow dragging down (to close)
    if (deltaY > 0) {
      // Apply rubber-band resistance
      const menuHeight = navMenu.offsetHeight;
      const rubberbandedY = deltaY < menuHeight
        ? deltaY
        : deltaY + (deltaY - menuHeight) * 0.3; // Progressive resistance

      navMenu.style.transform = `translateY(${rubberbandedY - menuHeight}px)`;
      navMenu.style.opacity = String(1 - rubberbandedY / menuHeight);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const deltaY = currentY - startY;
    const menuHeight = navMenu.offsetHeight;

    if (deltaY > menuHeight * 0.3) {
      // Drag far enough - close with spring
      closeMenu(navMenu, navToggle);
    } else {
      // Snap back open with spring
      springWithPreset(navMenu, {
        transform: [navMenu.style.transform, 'translateY(0)'],
        opacity: [parseFloat(navMenu.style.opacity), 1]
      }, 'drawer');
    }
  };

  // Pointer events (works for both mouse and touch)
  navMenu.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointermove', handlePointerMove);
  document.addEventListener('pointerup', handlePointerUp);
  document.addEventListener('pointercancel', handlePointerUp);
}

/**
 * Initialize header scroll effect (shadow + gradient mask on scroll)
 */
function initScrollEffect() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(event) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        const header = document.getElementById('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Set active navigation link based on current page
 */
export function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}