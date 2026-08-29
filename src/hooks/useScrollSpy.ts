import { useState, useEffect } from 'react';

/**
 * Tracks the currently active section ID based on viewport scroll position
 */
export function useScrollSpy(sectionIds: string[], offset: number = 120): string {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(id);
            return;
          }
        }
      }

      // If scrolled all the way to top
      if (window.scrollY < 200) {
        setActiveId('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeId;
}
