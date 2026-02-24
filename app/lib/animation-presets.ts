import { gsap } from "./gsap-config";

// Match existing CSS custom properties for consistent feel
export const easings = {
  outExpo: "expo.out", // matches --ease-out-expo
  inOutExpo: "expo.inOut", // matches --ease-in-out-expo
  spring: "back.out(1.7)", // matches --ease-spring
};

// Reusable animation configurations
export const presets = {
  fadeUp: {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: easings.outExpo },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.4, ease: easings.outExpo },
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1, duration: 0.4, ease: easings.outExpo },
  },
  slideRight: {
    from: { opacity: 0, x: 20 },
    to: { opacity: 1, x: 0, duration: 0.5, ease: easings.outExpo },
  },
  slideLeft: {
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0, duration: 0.5, ease: easings.outExpo },
  },
};

// Drag animation presets for enhanced dnd-kit feedback
export const dragPresets = {
  lift: {
    scale: 1.02,
    boxShadow: "0 12px 40px rgba(44, 40, 37, 0.12)",
    duration: 0.2,
    ease: easings.outExpo,
  },
  drop: {
    scale: 1,
    boxShadow: "0 1px 2px rgba(44, 40, 37, 0.04)",
    duration: 0.3,
    ease: easings.spring,
  },
  hover: {
    scale: 1.01,
    duration: 0.15,
    ease: easings.outExpo,
  },
};

// Design system colors for animations
export const colors = {
  ember: "rgba(212, 100, 74, 1)", // #D4644A
  emberLight: "rgba(212, 100, 74, 0.4)",
  emberSubtle: "rgba(212, 100, 74, 0.08)",
  sage: "rgba(122, 155, 126, 1)", // #7A9B7E
  sky: "rgba(107, 155, 195, 1)", // #6B9BC3
  amber: "rgba(212, 164, 74, 1)", // #D4A44A
  ink: "rgba(44, 40, 37, 1)",
};

// Helper function to create reduced motion safe animations
export function createAnimation(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
  reducedMotion: boolean
): gsap.core.Tween {
  if (reducedMotion) {
    // Instant state change with no animation
    return gsap.set(target, { ...vars, duration: 0 }) as gsap.core.Tween;
  }
  return gsap.to(target, vars);
}

// Helper to create staggered animations
export function staggerIn(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars,
  stagger: number = 0.1,
  reducedMotion: boolean = false
): gsap.core.Tween {
  if (reducedMotion) {
    return gsap.set(targets, { opacity: 1, x: 0, y: 0 }) as gsap.core.Tween;
  }
  return gsap.from(targets, {
    opacity: 0,
    y: 20,
    stagger,
    duration: 0.6,
    ease: easings.outExpo,
    ...vars,
  });
}

// Celebration particle colors
export const celebrationColors = [
  colors.sage,
  colors.ember,
  colors.sky,
  colors.amber,
];
