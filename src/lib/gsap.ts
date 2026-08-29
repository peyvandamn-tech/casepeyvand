import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin with GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks if the user has requested reduced motion in their OS / browser settings
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Reusable animation helper for scroll-triggered fade-and-rise
 */
export const animateFadeUp = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    yOffset?: number;
    trigger?: HTMLElement | string;
    start?: string;
    stagger?: number;
  } = {}
) => {
  if (prefersReducedMotion()) return;

  const {
    delay = 0,
    duration = 0.8,
    yOffset = 30,
    trigger = element,
    start = 'top 85%',
    stagger = 0.1,
  } = options;

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: yOffset,
    },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start,
        toggleActions: 'play none none none',
        once: true,
      },
    }
  );
};

export { gsap, ScrollTrigger };
