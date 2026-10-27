export const INTRO_SESSION_KEY = 'mk.signature.intro.v1';
export const INTRO_TIMING = { signature: 2500, name: 550, hold: 400, portrait: 600 } as const;

// Runs before the homepage is painted. Without JavaScript the settled page is
// the default; a hydration failure cannot leave an opaque intro over the site.
export const homeIntroBootstrap = `(() => {
  try {
    document.documentElement.dataset.cleanHero = String(scrollY < Math.min(180, innerHeight * .25));
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
