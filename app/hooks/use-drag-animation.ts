import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import { dragPresets, easings } from "@/lib/animation-presets";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Hook that provides GSAP-enhanced drag animations for dnd-kit.
 * Adds visual polish (scale, rotation, shadow) while dnd-kit handles positioning.
 */
export function useDragAnimation() {
  const reducedMotion = useReducedMotion();
  const activeElement = useRef<HTMLElement | null>(null);

  const onDragStart = useCallback(
    (element: HTMLElement) => {
      if (reducedMotion) return;

      activeElement.current = element;
      gsap.to(element, {
        ...dragPresets.lift,
        rotation: 1, // Slight rotation for visual feedback
      });
    },
    [reducedMotion]
  );

  const onDragMove = useCallback(
    (element: HTMLElement, delta: { x: number; y: number }) => {
      if (reducedMotion) return;

      // Dynamic rotation based on horizontal movement direction
      const rotation = Math.min(Math.max(delta.x * 0.015, -2), 2);
      gsap.to(element, {
        rotation,
        duration: 0.1,
        ease: "power1.out",
      });
    },
    [reducedMotion]
  );

  const onDragEnd = useCallback(
    (element: HTMLElement) => {
      if (reducedMotion) return;

      gsap.to(element, {
        ...dragPresets.drop,
        rotation: 0,
        clearProps: "boxShadow,transform",
      });
      activeElement.current = null;
    },
    [reducedMotion]
  );

  const onDragCancel = useCallback(
    (element: HTMLElement) => {
      if (reducedMotion) return;

      gsap.to(element, {
        ...dragPresets.drop,
        rotation: 0,
        clearProps: "boxShadow,transform",
      });
      activeElement.current = null;
    },
    [reducedMotion]
  );

  return {
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
    reducedMotion,
  };
}

/**
 * Creates celebration particles when a task is completed.
 * Spawns small colored dots that animate outward and fade.
 */
export function createCompletionParticles(x: number, y: number) {
  const colors = ["#7A9B7E", "#D4644A", "#6B9BC3", "#D4A44A"]; // sage, ember, sky, amber

  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: ${colors[i % colors.length]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${x}px;
      top: ${y}px;
    `;
    document.body.appendChild(particle);

    // Random direction for each particle
    const angle = (i / 6) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 15,
      opacity: 0,
      scale: 0,
      duration: 0.5,
      ease: easings.outExpo,
      onComplete: () => particle.remove(),
    });
  }
}
