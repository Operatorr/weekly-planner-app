import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import { colors, easings } from "@/lib/animation-presets";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Hook that provides GSAP animations for drop zones.
 * Creates a pulsing glow effect when items are dragged over.
 */
export function useDropZoneAnimation() {
  const reducedMotion = useReducedMotion();
  const pulseAnimation = useRef<gsap.core.Tween | null>(null);

  const onDragOver = useCallback(
    (element: HTMLElement) => {
      if (reducedMotion) return;

      // Stop any existing pulse
      pulseAnimation.current?.kill();

      // Scale up and highlight
      gsap.to(element, {
        scale: 1.02,
        borderColor: colors.emberLight,
        backgroundColor: colors.emberSubtle,
        duration: 0.2,
        ease: easings.outExpo,
      });

      // Pulsing glow effect
      pulseAnimation.current = gsap.to(element, {
        boxShadow: "0 0 25px rgba(212, 100, 74, 0.2)",
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    [reducedMotion]
  );

  const onDragLeave = useCallback(
    (element: HTMLElement) => {
      if (reducedMotion) return;

      // Stop pulse animation
      pulseAnimation.current?.kill();
      pulseAnimation.current = null;

      // Reset to original state
      gsap.to(element, {
        scale: 1,
        borderColor: "",
        backgroundColor: "",
        boxShadow: "none",
        duration: 0.3,
        ease: easings.outExpo,
        clearProps: "scale,borderColor,backgroundColor,boxShadow",
      });
    },
    [reducedMotion]
  );

  return { onDragOver, onDragLeave, reducedMotion };
}

/**
 * Animate a successful drop with a brief highlight flash.
 */
export function animateDropSuccess(element: HTMLElement) {
  gsap.fromTo(
    element,
    { backgroundColor: "rgba(122, 155, 126, 0.2)" }, // sage highlight
    {
      backgroundColor: "rgba(122, 155, 126, 0)",
      duration: 0.5,
      ease: easings.outExpo,
      clearProps: "backgroundColor",
    }
  );
}
