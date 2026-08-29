import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { ScrollTrigger } from '../lib/gsap';

export interface UseGsapOptions {
  scope?: React.RefObject<HTMLElement | null>;
  dependencies?: any[];
  revertOnUpdate?: boolean;
}

/**
 * Custom React hook that encapsulates GSAP animations and ScrollTrigger
 * inside a gsap.context() for bulletproof cleanup and hot-reloading safety.
 */
export function useGsapContext(
  animationCallback: (context: gsap.Context) => void,
  options: UseGsapOptions = {}
) {
  const { scope, dependencies = [] } = options;

  useEffect(() => {
    // Avoid running on server
    if (typeof window === 'undefined') return;

    // Create GSAP Context scoped to the ref or global
    const ctx = gsap.context((self) => {
      animationCallback(self);
    }, scope?.current || undefined);

    return () => {
      // Revert all animations and kill ScrollTriggers created in this context
      ctx?.revert();
    };
  }, dependencies);
}
