import { sitePath } from './site-path';

const homepage = sitePath('/').replace(/\/+$/, '') || '/';

/** Runs before the homepage body, independently of the signature animation. */
export const homeScrollBootstrap = `(() => {
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    const path = location.pathname.replace(/\\/+$/, '') || '/';
    if (location.hash || !navigation || navigation.type !== 'reload' || path !== ${JSON.stringify(homepage)} || window.__mkHomeRefreshStarted) return;
    window.__mkHomeRefreshStarted = true;
    const root = document.documentElement;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    root.dataset.homeReload = 'pending';
    let interacted = false, loaded = document.readyState === 'complete', hydrated = false, finishing = false, stopped = false;
    let timer = 0, firstFrame = 0, secondFrame = 0;
    const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const reset = () => {
      if (stopped || interacted) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body && active !== root) active.blur();
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    const input = () => { interacted = true; delete root.dataset.homeReload; };
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame);
      history.scrollRestoration = previousRestoration;
      delete root.dataset.homeReload;
      inputEvents.forEach(name => removeEventListener(name, input));
      removeEventListener('pageshow', shown);
      removeEventListener('home-page-ready', ready);
      removeEventListener('pagehide', cleanup);
    };
    const finish = () => {
      if (stopped || finishing || !loaded || !hydrated) return;
      finishing = true;
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => { reset(); cleanup(); });
      });
    };
    const shown = () => { loaded = true; reset(); finish(); };
    const ready = () => { hydrated = true; reset(); finish(); };
    inputEvents.forEach(name => addEventListener(name, input, { passive: true }));
    addEventListener('pageshow', shown);
    addEventListener('home-page-ready', ready);
    addEventListener('pagehide', cleanup, { once: true });
    // A client-side failure must not leave browser restoration disabled forever.
    timer = setTimeout(() => { hydrated = true; finish(); }, 6500);
    reset();
  } catch {}
})();`;
