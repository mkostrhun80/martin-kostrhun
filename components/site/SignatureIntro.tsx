'use client';

import { useEffect, useId, useRef } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING } from '@/lib/home-intro';
import { signatureLettering, signatureViewBox, signatureUnderline, signatureTiming } from '@/lib/signature-lettering';

export function SignatureIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const maskId = `signature-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const root = document.documentElement;
    const stage = ref.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!stage || root.dataset.homeIntro !== 'pending') return;
    let frame = 0;
    let disposed = false;
    let completed = false;
    const letters = Array.from(stage.querySelectorAll<SVGRectElement>('[data-letter-reveal]'));
    const underline = stage.querySelector<SVGPathElement>('[data-underline]')!;
    const markPlayed = () => { try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch { /* Storage may be disabled. */ } };
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      cancelAnimationFrame(frame);
      root.dataset.homeIntro = 'ready';
      markPlayed();
      dispatchEvent(new Event('home-intro-ready'));
    };
    const skip = () => finish();
    const key = (event: KeyboardEvent) => {
      if (['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) finish();
    };
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (reduced.matches) finish(); };
    stage.addEventListener('click', skip);
    addEventListener('wheel', skip, { passive: true });
    addEventListener('touchmove', skip, { passive: true });
    addEventListener('keydown', key);
    addEventListener('hashchange', skip);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);

    if (location.hash || scrollY > 8 || reduced.matches) finish();
    else {
      const zero = performance.now();
      const portraitAt = INTRO_TIMING.signature + INTRO_TIMING.name + INTRO_TIMING.hold;
      const end = portraitAt + INTRO_TIMING.portrait;
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      const tick = (now: number) => {
        if (disposed || completed) return;
        if (root.dataset.homeIntro === 'ready') { finish(); return; }
        const elapsed = now - zero;
        letters.forEach((rect, i) => {
          const letter = signatureLettering[i];
          const p = clamp((elapsed - letter.start) / letter.duration);
          // A restrained writing cadence preserves the font's smooth curves.
          const flow = p - Math.sin(p * Math.PI * 2) * .06;
          rect.setAttribute('width', String(letter.width * flow));
        });
        underline.style.strokeDashoffset = String(1 - clamp((elapsed - signatureTiming.underline) / signatureTiming.underlineDuration));
        if (elapsed >= INTRO_TIMING.signature) root.dataset.homeIntro = elapsed >= portraitAt ? 'portrait' : 'name';
        if (elapsed >= end) { finish(); return; }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stage.removeEventListener('click', skip);
      removeEventListener('wheel', skip);
      removeEventListener('touchmove', skip);
      removeEventListener('keydown', key);
      removeEventListener('hashchange', skip);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
      // Client navigation must never carry the homepage's hidden chrome along.
      queueMicrotask(() => { if (!document.querySelector('.signature-intro')) root.dataset.homeIntro = 'ready'; });
    };
  }, []);

  return <div ref={ref} className="signature-intro">
    <div className="signature-stage" role="status" aria-label="Martin Kostrhun — úvodní podpis">
      <svg viewBox={`0 0 ${signatureViewBox.width} ${signatureViewBox.height}`} className="signature-art" aria-hidden="true" focusable="false" shapeRendering="geometricPrecision">
        <defs>{signatureLettering.map((letter, i) => <clipPath key={i} id={`${maskId}-${i}`} clipPathUnits="userSpaceOnUse"><rect data-letter-reveal x={letter.left} y="0" width="0" height={signatureViewBox.height}/></clipPath>)}</defs>
        {signatureLettering.map((letter, i) => <path key={i} d={letter.path} fill="currentColor" clipPath={`url(#${maskId}-${i})`}/>)}
        <path data-underline d={signatureUnderline} fill="none" stroke="var(--light-brown)" strokeWidth="2" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }}/>
      </svg>
    </div>
  </div>;
}
