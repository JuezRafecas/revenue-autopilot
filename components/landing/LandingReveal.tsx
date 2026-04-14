'use client';

import { useEffect } from 'react';

/**
 * Global IntersectionObserver that toggles data-in-view on elements
 * marked with data-reveal="true". CSS in [data-theme='kaszek'] reads
 * this attribute to trigger fade/translate transitions.
 *
 * If prefers-reduced-motion is active, every reveal element is marked
 * in-view immediately so content stays legible.
 */
export function LandingReveal() {
  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal="true"]'),
    );

    if (reducedMotion) {
      targets.forEach((el) => el.setAttribute('data-in-view', 'true'));
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.setAttribute('data-in-view', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute('data-in-view', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => {
      // Above-the-fold reveals fire immediately so the hero doesn't flash empty.
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.setAttribute('data-in-view', 'true');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
