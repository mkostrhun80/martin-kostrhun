export const INTRO_SESSION_KEY = 'mk.signature.hero.v4';
export const SIGNATURE_MOTION = { start: 20, draw: 440, stagger: 40, complete: 480, retract: 720, retractDuration: 200 } as const;
export const INTRO_TIMING = { signature: 920, duration: 240 } as const;

// Runs before the homepage is painted. Without JavaScript the settled page is
// the default; a hydration failure cannot leave an opaque intro over the site.
export const homeIntroBootstrap = `(() => {
  try {
    if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const replay = new URLSearchParams(location.search).get('intro') === 'replay';
    if (replay) {
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (location.hash || scrollY > 8 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { if (!replay && sessionStorage.getItem('${INTRO_SESSION_KEY}') === '1') return; } catch {}
    document.documentElement.dataset.homeIntro = 'pending';
    window.setTimeout(() => {
      if (document.documentElement.dataset.homeIntro !== 'ready') {
        document.documentElement.dataset.homeIntro = 'ready';
        dispatchEvent(new Event('home-intro-ready'));
      }
    }, 6500);
  } catch {}
})();`;
