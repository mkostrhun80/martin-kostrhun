'use client';

import { useEffect } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING } from '@/lib/home-intro';

/** Reveal the actual hero composition together; no separate signature screen. */
export function HeroEntrance() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.homeIntro !== 'pending') return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, completed = false, started = false;
    let timer = 0, fontTimer = 0, frame = 0;
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      clearTimeout(timer); clearTimeout(fontTimer); cancelAnimationFrame(frame);
      root.dataset.homeIntro = 'ready';
      try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch {}
      dispatchEvent(new Event('home-intro-ready'));
    };
    const begin = () => {
      if (disposed || completed || started) return;
      if (root.dataset.homeIntro === 'ready') { finish(); return; }
      started = true;
      clearTimeout(fontTimer);
      root.dataset.homeIntro = 'entering';
      timer = window.setTimeout(finish, INTRO_TIMING.duration);
    };
    const key = (event: KeyboardEvent) => {
      if (['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) finish();
    };
    const preference = () => { if (reduced.matches) finish(); };
    const visibility = () => { if (document.hidden) finish(); };
    addEventListener('wheel', finish, { passive: true });
    addEventListener('touchmove', finish, { passive: true });
    addEventListener('pointerdown', finish, { passive: true });
    addEventListener('keydown', key);
    addEventListener('hashchange', finish);
    reduced.addEventListener('change', preference);
    document.addEventListener('visibilitychange', visibility);
    if (reduced.matches || location.hash || scrollY > 8) finish();
    else {
      // Keep typography stable without holding the page on a slow font request.
      fontTimer = window.setTimeout(begin, 1000);
      void document.fonts.ready.then(() => {
        if (!disposed && !completed && !started) frame = requestAnimationFrame(begin);
      });
    }
    return () => {
      disposed = true;
      clearTimeout(timer); clearTimeout(fontTimer); cancelAnimationFrame(frame);
      removeEventListener('wheel', finish);
      removeEventListener('touchmove', finish);
      removeEventListener('pointerdown', finish);
      removeEventListener('keydown', key);
      removeEventListener('hashchange', finish);
      reduced.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', visibility);
      queueMicrotask(() => { if (!document.querySelector('.hero-entry-cover')) root.dataset.homeIntro = 'ready'; });
    };
  }, []);
  return <div className="hero-entry-cover" aria-hidden="true"/>;
}
