import React, { useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  staggerChildren?: number;
  className?: string;
  triggerHook?: string;
  scale?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 30,
  staggerChildren,
  className = '',
  triggerHook = 'top 85%',
  scale = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      if (!elementRef.current || prefersReducedMotion()) return;

      let x = 0;
      let y = 0;

      if (direction === 'up') y = distance;
      if (direction === 'down') y = -distance;
      if (direction === 'left') x = distance;
      if (direction === 'right') x = -distance;

      const target = staggerChildren
        ? elementRef.current.children
        : elementRef.current;

      gsap.fromTo(
        target,
        {
          opacity: 0,
          x,
          y,
          scale: scale ? 0.95 : 1,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration,
          delay,
          stagger: staggerChildren,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elementRef.current,
            start: triggerHook,
            once: true,
          },
        }
      );
    },
    { scope: elementRef, dependencies: [direction, delay, duration, distance, staggerChildren] }
  );

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};
