'use client';

import { useEffect } from 'react';

/** Lightweight IntersectionObserver choreography, ink-fill spans and adaptive header contrast. */
export function ScrollChoreography() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector<HTMLElement>('.site-header');
    const darkChapters = [...document.querySelectorAll<HTMLElement>('[data-chapter="dark"]')];
    const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const steps = [...document.querySelectorAll<HTMLElement>('[data-process-step]')];

    const updateHeaderTheme = () => {
      if (!header || !darkChapters.length) return;
      const probeY = (header.offsetHeight || 76) + 28;
      const isDark = darkChapters.some(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom > probeY;
      });
      header.dataset.headerTheme = isDark ? 'dark' : 'light';
    };

    updateHeaderTheme();
    let themeRaf = 0;
    const onScrollOrResize = () => {
      if (themeRaf) return;
      themeRaf = requestAnimationFrame(() => {
        themeRaf = 0;
        updateHeaderTheme();
      });
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Scroll reveal choreography
    let revealObserver: IntersectionObserver | null = null;
    let onReady: (() => void) | null = null;
    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('is-in'));
    } else {
      const revealInViewport = () => {
        const limit = window.innerHeight * 0.98;
        reveals.forEach(el => {
          if (el.getBoundingClientRect().top <= limit) {
            el.classList.add('is-in');
          }
        });
      };
      onReady = revealInViewport;

      revealInViewport();
      revealObserver = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
              entry.target.classList.add('is-in');
              revealObserver?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
      );

      reveals.forEach(el => {
        if (!el.classList.contains('is-in')) revealObserver?.observe(el);
      });

      window.addEventListener('home-intro-ready', revealInViewport);
      window.addEventListener('hashchange', revealInViewport);
    }

    // Ink fill statement setup when view timelines are supported
    if (!reduced && typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) {
      document.querySelectorAll<HTMLElement>('[data-fill]').forEach(el => {
        if (el.dataset.fillReady === 'true') return;
        const text = (el.textContent || '').trim();
        if (!text) return;
        el.dataset.fillReady = 'true';
        const words = text.split(/\s+/);
        el.textContent = '';
        words.forEach((word, index) => {
          const span = document.createElement('span');
          span.textContent = word;
          el.append(span);
          if (index < words.length - 1) el.append(' ');
        });
        el.classList.add('is-filling');
      });
    }

    // Cooperation sticky stage active step tracking
    let stepObserver: IntersectionObserver | null = null;
    if (steps.length && 'IntersectionObserver' in window) {
      steps[0]?.setAttribute('data-active', 'true');
      stepObserver = new IntersectionObserver(
        entries => {
          const visible = entries.filter(e => e.isIntersecting);
          if (!visible.length) return;
          const target = visible[0].target as HTMLElement;
          steps.forEach(step => {
            if (step === target) step.setAttribute('data-active', 'true');
            else step.removeAttribute('data-active');
          });
        },
        { rootMargin: '-38% 0px -42% 0px', threshold: 0 },
      );
      steps.forEach(step => stepObserver?.observe(step));
    }

    return () => {
      cancelAnimationFrame(themeRaf);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (onReady) {
        window.removeEventListener('home-intro-ready', onReady);
        window.removeEventListener('hashchange', onReady);
      }
      revealObserver?.disconnect();
      stepObserver?.disconnect();
    };
  }, []);

  return null;
}
