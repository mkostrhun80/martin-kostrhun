export const INTRO_SESSION_KEY = 'mk.signature.intro.v1';
export const INTRO_TIMING = { signature: 2500, name: 550, hold: 400, portrait: 600 } as const;

// Runs before the homepage is painted. Without JavaScript the settled page is
// the default; a hydration failure cannot leave an opaque intro over the site.
export const homeIntroBootstrap = `(() => {
  try {
    // A reload starts at the hero. Keep native restoration disabled until the
    // browser has finished its pageshow restoration and the following layout.
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.type === 'reload') {
      const restoration = history.scrollRestoration;
      history.scrollRestoration = 'manual';
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
      let interacted = false;
      const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
      const markInteraction = () => { interacted = true; };
      inputEvents.forEach(name => addEventListener(name, markInteraction, { passive: true }));
      const reset = () => scrollTo({ top: 0, left: 0, behavior: 'instant' });
      reset();
      const finishReload = () => requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!interacted) reset();
        history.scrollRestoration = restoration;
        inputEvents.forEach(name => removeEventListener(name, markInteraction));
      }));
      if (document.readyState === 'complete') finishReload();
      else addEventListener('pageshow', finishReload, { once: true });
    }
    if (location.hash || scrollY > 8 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { if (sessionStorage.getItem('${INTRO_SESSION_KEY}') === '1') return; } catch {}
    document.documentElement.dataset.homeIntro = 'pending';
    window.setTimeout(() => {
      if (document.documentElement.dataset.homeIntro !== 'ready') {
        document.documentElement.dataset.homeIntro = 'ready';
      }
    }, 6500);
  } catch {}
})();`;
