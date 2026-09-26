'use client';
import { useEffect } from 'react';

// The hero owns its optional portal interaction; no loading screen gates the page.
export function Motion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
    }), { threshold: .12 });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (!preference.matches) { el.classList.add('reveal-ready'); observer.observe(el); }
    });
    const stepObserver = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting)), { rootMargin: '-30% 0px -30% 0px', threshold: 0 });
    document.querySelectorAll('[data-step]').forEach(el => stepObserver.observe(el));
    return () => { observer.disconnect(); stepObserver.disconnect(); };
  }, []);
  return null;
}
