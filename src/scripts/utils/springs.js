/**
 * Spring Animation Utility
 * Lightweight spring implementation for fluid, interruptible animations
 * Based on Apple's spring parameters (damping ratio + response)
 * Respects prefers-reduced-motion for accessibility
 */

// Spring physics constants
const SPRING_DEFAULTS = {
  damping: 1,      // Critically damped (no overshoot) - Apple default for UI
  response: 0.35,  // How quickly it reaches target (seconds)
  velocity: 0      // Initial velocity (px/s)
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a spring animation using Web Animations API
 * Springs are inherently interruptible - new animations start from current value
 * Respects prefers-reduced-motion - becomes instant cross-fade
 *
 * @param {HTMLElement} element - Element to animate
 * @param {Object} keyframes - Keyframes object (e.g., { transform: ['translateX(100px)', 'translateX(0)'] })
 * @param {Object} options - Spring options
 * @param {number} options.damping - Damping ratio (1 = critically damped, < 1 = bouncy)
 * @param {number} options.response - Response time in seconds
 * @param {number} options.velocity - Initial velocity in px/s
 * @returns {Animation} - Web Animation object
 */
export function spring(element, keyframes, options = {}) {
  // Reduced motion: instant transition (cross-fade equivalent)
  if (prefersReducedMotion()) {
    const reducedKeyframes = {};
    Object.keys(keyframes).forEach(prop => {
      const values = keyframes[prop];
      // Jump directly to end value
      reducedKeyframes[prop] = [values[values.length - 1], values[values.length - 1]];
    });
    return element.animate(reducedKeyframes, {
      duration: 1,
      easing: 'linear',
      fill: 'forwards'
    });
  }

  const { damping = SPRING_DEFAULTS.damping, response = SPRING_DEFAULTS.response, velocity = SPRING_DEFAULTS.velocity } = options;

  // Convert Apple's damping/response to WAAPI spring easing
  // WAAPI spring() takes: spring(dampingRatio, stiffness)
  // We approximate: stiffness ≈ (2π / response)², dampingRatio = damping
  const stiffness = Math.pow(2 * Math.PI / response, 2);
  const easing = `spring(${damping} ${stiffness})`;

  // Duration is approximate - spring has no fixed duration
  // Use response * 3 as a reasonable max duration for the animation to settle
  const duration = response * 1000 * 3;

  return element.animate(keyframes, {
    duration,
    easing,
    fill: 'forwards'
  });
}

/**
 * Get reduced motion safe keyframes (for manual fallback)
 */
export function getReducedKeyframes(keyframes) {
  const reduced = {};
  Object.keys(keyframes).forEach(prop => {
    const values = keyframes[prop];
    reduced[prop] = [values[values.length - 1], values[values.length - 1]];
  });
  return reduced;
}

/**
 * Spring to a specific transform value
 * @param {HTMLElement} element
 * @param {string} transform - Target transform (e.g., 'translateX(0)')
 * @param {Object} options
 */
export function springTo(element, transform, options = {}) {
  const currentTransform = getComputedStyle(element).transform;
  return spring(element, { transform: [currentTransform, transform] }, options);
}

/**
 * Spring opacity
 */
export function springOpacity(element, targetOpacity, options = {}) {
  const currentOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
  return spring(element, { opacity: [currentOpacity, targetOpacity] }, options);
}

/**
 * Spring height (for expand/collapse)
 */
export function springHeight(element, targetHeight, options = {}) {
  const currentHeight = getComputedStyle(element).height;
  return spring(element, { height: [currentHeight, targetHeight] }, options);
}

/**
 * Cancel any running animations on an element
 */
export function cancelAnimations(element) {
  element.getAnimations().forEach(anim => anim.cancel());
}

/**
 * Get current animated value for a property (for interruptible handoff)
 */
export function getAnimatedValue(element, property) {
  const animations = element.getAnimations();
  for (const anim of animations) {
    const effect = anim.effect;
    if (effect && effect.getComputedTiming) {
      const timing = effect.getComputedTiming();
      if (timing.progress !== null) {
        // This is a simplified version - in practice you'd need to compute the actual value
        return getComputedStyle(element)[property];
      }
    }
  }
  return getComputedStyle(element)[property];
}

/**
 * Rubber-band function for overscroll resistance
 * Apple's formula: progressive resistance the further past boundary
 * @param {number} overshoot - Distance past boundary
 * @param {number} dimension - Container dimension
 * @param {number} constant - Resistance constant (default 0.55)
 * @returns {number} - Rubber-banded distance
 */
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Momentum projection - where will the gesture land?
 * Apple's exponential decay formula (not v²/2a)
 * @param {number} velocity - Release velocity in px/s
 * @param {number} decelerationRate - Decay factor (0.998 = standard, 0.99 = snappier)
 * @returns {number} - Projected distance
 */
export function projectMomentum(velocity, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

/**
 * Apple's standard spring presets
 */
export const SpringPresets = {
  // Default UI transitions - critically damped, no bounce
  ui: { damping: 1, response: 0.35 },

  // Repositioning (e.g., picture-in-picture)
  reposition: { damping: 1, response: 0.4 },

  // Rotation
  rotation: { damping: 0.8, response: 0.4 },

  // Drawers, sheets, bottom sheets
  drawer: { damping: 0.8, response: 0.3 },

  // Momentum-driven (flick, throw)
  momentum: { damping: 0.8, response: 0.35 },

  // Quick press feedback
  press: { damping: 1, response: 0.1 },

  // Snappy but damped
  snappy: { damping: 0.9, response: 0.25 }
};

/**
 * Create a spring animation with a preset
 */
export function springWithPreset(element, keyframes, presetName, customOptions = {}) {
  const preset = SpringPresets[presetName] || SpringPresets.ui;
  return spring(element, keyframes, { ...preset, ...customOptions });
}

export default { spring, springTo, springOpacity, springHeight, cancelAnimations, getAnimatedValue, rubberband, projectMomentum, SpringPresets, springWithPreset };