'use client';

import { useEffect, useId, useRef } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING, SIGNATURE_MOTION } from '@/lib/home-intro';
import { signatureInk, signatureTraces, signatureViewBox } from '@/lib/signature-lettering';

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
    const traces = Array.from(stage.querySelectorAll<SVGPathElement>('[data-pen-stroke]'));
    const solidInk = stage.querySelector<SVGPathElement>('.signature-solid-ink')!;
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
      const end = INTRO_TIMING.signature + INTRO_TIMING.duration;
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      // The recording reveals short fragments across the whole signature at
      // once, holds the finished ink, then contracts those same fragments.
      const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
      const tick = (now: number) => {
        if (disposed || completed) return;
        if (root.dataset.homeIntro === 'ready') { finish(); return; }
        const elapsed = now - zero;
        const retract = smooth((elapsed - SIGNATURE_MOTION.retract) / SIGNATURE_MOTION.retractDuration);
        for (let i = 0; i < traces.length; i++) {
          const path = traces[i];
          const delay = ((i * 17) % 7) / 6 * SIGNATURE_MOTION.stagger;
          const reveal = smooth((elapsed - SIGNATURE_MOTION.start - delay) / SIGNATURE_MOTION.draw);
          const p = reveal * (1 - retract);
          // Grow each mask route out from its middle, then reverse it. The
          // visible ink always remains the original clean font outline.
          path.style.strokeDasharray = `${p.toFixed(4)} 1`;
          path.style.strokeDashoffset = String(-(1 - p) / 2);
          path.style.opacity = String(Math.min(1, p * 8));
        }
        solidInk.style.opacity = elapsed < SIGNATURE_MOTION.complete ? '0' : String(
          smooth((elapsed - SIGNATURE_MOTION.complete) / 100) *
          (1 - smooth((elapsed - SIGNATURE_MOTION.retract) / 70))
        );
        if (elapsed >= INTRO_TIMING.signature) root.dataset.homeIntro = 'entering';
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

  return <div ref={ref} className="signature-intro hero-entry-cover" aria-hidden="true">
    <div className="signature-stage">
      <svg viewBox={`0 0 ${signatureViewBox.width} ${signatureViewBox.height}`} className="signature-art" aria-hidden="true" focusable="false" shapeRendering="geometricPrecision">
        <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={signatureViewBox.width} height={signatureViewBox.height} style={{ maskType: 'luminance' }}>
          <rect width={signatureViewBox.width} height={signatureViewBox.height} fill="black"/>
          {signatureTraces.map((stroke, i) => <path key={i} data-pen-stroke d={stroke.path} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: '0 1', strokeDashoffset: -.5, opacity: 0 }}/>) }
        </mask></defs>
        <path d={signatureInk} fill="currentColor" mask={`url(#${maskId})`}/>
        <path className="signature-solid-ink" d={signatureInk} fill="currentColor"/>
      </svg>
    </div>
  </div>;
}
