/**
 * Card Interactions - Spring-based press/hover for product & category cards
 * Implements Apple's fluid interface principles:
 * - Instant press feedback (Response principle)
 * - Spring release with velocity handoff
 * - Interruptible animations
 */
import { springWithPreset, cancelAnimations, SpringPresets } from './springs.js';

/**
 * Initialize spring interactions on product cards
 * @param {NodeList|Array} cards - Product card elements
 */
export function initProductCardInteractions(cards) {
  cards.forEach(card => {
    setupPressInteraction(card, {
      pressScale: 0.98,
      hoverLift: -4,
      hoverShadow: 'var(--shadow)',
      useSpringRelease: true
    });
    setupImageZoom(card);
  });
}

/**
 * Initialize spring interactions on category cards
 * @param {NodeList|Array} cards - Category card elements
 */
export function initCategoryCardInteractions(cards) {
  cards.forEach(card => {
    setupPressInteraction(card, {
      pressScale: 0.99,
      hoverLift: -4,
      hoverShadow: 'var(--shadow)',
      useSpringRelease: true
    });
    setupBackgroundZoom(card);
  });
}

/**
 * Setup press/hover interaction with spring physics
 */
function setupPressInteraction(card, options = {}) {
  const {
    pressScale = 0.98,
    hoverLift = -4,
    hoverShadow = 'var(--shadow)',
    useSpringRelease = true
  } = options;

  let isPressed = false;
  let pressAnimation = null;

  // Pointer down - instant press feedback (Response principle)
  const handlePointerDown = (event) => {
    // Ignore if clicking on links/buttons inside
    if (event.target.closest('a, button')) return;

    isPressed = true;
    cancelAnimations(card);

    // Instant press - no spring, just immediate (Apple: respond on pointer-down)
    card.style.transition = 'transform 80ms ease-out, box-shadow 80ms ease-out';
    card.style.transform = `scale(${pressScale})`;
    card.style.boxShadow = 'none';
  };

  // Pointer up/leave - spring release
  const handlePointerUp = () => {
    if (!isPressed) return;
    isPressed = false;

    if (useSpringRelease) {
      // Spring back to hover or rest state
      const isHovered = card.matches(':hover');
      const targetTransform = isHovered ? `translateY(${hoverLift}px)` : 'translateY(0) scale(1)';
      const targetShadow = isHovered ? hoverShadow : 'none';

      pressAnimation = springWithPreset(card, {
        transform: [card.style.transform, targetTransform],
        boxShadow: ['none', targetShadow]
      }, 'ui');
    } else {
      // Fallback to CSS transition
      card.style.transition = 'transform 200ms cubic-bezier(.2,.7,.2,1), box-shadow 200ms cubic-bezier(.2,.7,.2,1)';
      const isHovered = card.matches(':hover');
      card.style.transform = isHovered ? `translateY(${hoverLift}px)` : 'translateY(0) scale(1)';
      card.style.boxShadow = isHovered ? hoverShadow : 'none';
    }
  };

  // Pointer enter - hover lift with spring
  const handlePointerEnter = () => {
    if (isPressed) return;
    cancelAnimations(card);
    springWithPreset(card, {
      transform: ['translateY(0)', `translateY(${hoverLift}px)`],
      boxShadow: ['none', hoverShadow]
    }, 'ui');
  };

  // Pointer leave - spring back to rest
  const handlePointerLeave = () => {
    if (isPressed) return;
    cancelAnimations(card);
    springWithPreset(card, {
      transform: [card.style.transform, 'translateY(0)'],
      boxShadow: [hoverShadow, 'none']
    }, 'ui');
  };

  // Use pointer events for unified mouse/touch handling
  card.addEventListener('pointerdown', handlePointerDown);
  card.addEventListener('pointerup', handlePointerUp);
  card.addEventListener('pointerleave', handlePointerUp);
  card.addEventListener('pointercancel', handlePointerUp);
  card.addEventListener('pointerenter', handlePointerEnter);
  card.addEventListener('pointerleave', handlePointerLeave);

  // Cleanup on remove
  const observer = new MutationObserver(() => {
    if (!document.body.contains(card)) {
      card.removeEventListener('pointerdown', handlePointerDown);
      card.removeEventListener('pointerup', handlePointerUp);
      card.removeEventListener('pointerleave', handlePointerUp);
      card.removeEventListener('pointercancel', handlePointerUp);
      card.removeEventListener('pointerenter', handlePointerEnter);
      card.removeEventListener('pointerleave', handlePointerLeave);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Setup image zoom on hover for product cards
 */
function setupImageZoom(card) {
  const image = card.querySelector('.product-image');
  if (!image) return;

  card.addEventListener('pointerenter', () => {
    if (card.matches(':active')) return;
    springWithPreset(image, {
      transform: ['scale(1)', 'scale(1.04)']
    }, 'snappy');
  });

  card.addEventListener('pointerleave', () => {
    springWithPreset(image, {
      transform: ['scale(1.04)', 'scale(1)']
    }, 'snappy');
  });
}

/**
 * Setup background zoom on hover for category cards
 */
function setupBackgroundZoom(card) {
  const bg = card.querySelector('::before') || card; // Pseudo-element can't be targeted directly
  // We'll use the card's transform which affects the pseudo-element
  card.addEventListener('pointerenter', () => {
    if (card.matches(':active')) return;
    springWithPreset(card, {
      // The ::before transform is handled by CSS :hover::before
      // Here we just ensure the spring is smooth
    }, 'snappy');
  });
}

/**
 * Staggered entrance animation for a grid of cards
 * @param {NodeList|Array} cards - Card elements
 * @param {Object} options - Animation options
 */
export function staggerEntrance(cards, options = {}) {
  const { delay = 60, preset = 'ui', startTransform = 'translateY(20px)', startOpacity = 0 } = options;

  cards.forEach((card, index) => {
    card.style.opacity = String(startOpacity);
    card.style.transform = startTransform;

    setTimeout(() => {
      springWithPreset(card, {
        opacity: [startOpacity, 1],
        transform: [startTransform, 'translateY(0)']
      }, preset);
    }, index * delay);
  });
}

/**
 * Animate cards out (for filtering/page transitions)
 */
export function animateCardsOut(cards, options = {}) {
  const { preset = 'press', stagger = 15 } = options;

  return Promise.all(cards.map((card, index) => new Promise(resolve => {
    setTimeout(() => {
      const anim = springWithPreset(card, {
        opacity: [1, 0],
        transform: ['translateY(0)', 'translateY(-8px)']
      }, preset);
      anim.onfinish = resolve;
    }, index * stagger);
  })));
}

/**
 * Animate cards in
 */
export function animateCardsIn(cards, options = {}) {
  const { preset = 'ui', stagger = 15, startTransform = 'translateY(8px)', startOpacity = 0 } = options;

  return Promise.all(cards.map((card, index) => new Promise(resolve => {
    card.style.opacity = String(startOpacity);
    card.style.transform = startTransform;

    setTimeout(() => {
      const anim = springWithPreset(card, {
        opacity: [startOpacity, 1],
        transform: [startTransform, 'translateY(0)']
      }, preset);
      anim.onfinish = resolve;
    }, index * stagger);
  })));
}

export default {
  initProductCardInteractions,
  initCategoryCardInteractions,
  staggerEntrance,
  animateCardsOut,
  animateCardsIn
};