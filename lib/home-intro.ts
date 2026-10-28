import { signatureTiming } from './signature-lettering';

export const INTRO_SESSION_KEY = 'mk.signature.hero.v1';
export const INTRO_TIMING = { signature: signatureTiming.fade, duration: 1800 } as const;

// Runs before the homepage is painted. Without JavaScript the settled page is
// the default; a hydration failure cannot leave an opaque intro over the site.
export const homeIntroBootstrap = `(() => {
  try {
    const replay = new URLSearchParams(location.search).get('intro') === 'replay';
    if (replay) {
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
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
    }, 13500);
  } catch {}
})();`;
