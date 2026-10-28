'use client';

import { useEffect, useId, useRef } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING } from '@/lib/home-intro';
import { signatureInk, signatureTraces, signatureViewBox, signatureUnderline, signatureTiming } from '@/lib/signature-lettering';

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
    const lengths = traces.map(path => path.getTotalLength());
    const nib = stage.querySelector<SVGGElement>('[data-pen-tip]')!;
    const underline = stage.querySelector<SVGPathElement>('[data-underline]')!;
    const underlineLength = underline.getTotalLength();
    delete stage.dataset.signatureComplete;
    delete stage.dataset.signatureLifted;
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
      // Motion functions ported from the supplied standalone HTML animation.
      const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
      const humanize = (p: number) => clamp(p + .011 * Math.sin(p * 6 * Math.PI) * Math.sin(Math.PI * p));
      const tick = (now: number) => {
        if (disposed || completed) return;
        if (root.dataset.homeIntro === 'ready') { finish(); return; }
        const elapsed = now - zero;
        let active: { path: SVGPathElement; distance: number } | null = null;
        for (let i = 0; i < traces.length; i++) {
          const path = traces[i];
          const stroke = signatureTraces[i];
          const p = humanize(smooth((elapsed - stroke.start) / stroke.duration));
          path.style.opacity = elapsed >= stroke.start ? '1' : '0';
          path.style.strokeDashoffset = String(1 - p);
          if (elapsed >= stroke.start && elapsed < stroke.start + stroke.duration) active = { path, distance: lengths[i] * p };
        }
        const progress = smooth((elapsed - signatureTiming.underline) / signatureTiming.underlineDuration);
        underline.style.strokeDashoffset = String(1 - progress);
        underline.style.opacity = elapsed >= signatureTiming.underline ? '1' : '0';
        if (elapsed >= signatureTiming.underline && elapsed < signatureTiming.underline + signatureTiming.underlineDuration) active = { path: underline, distance: underlineLength * progress };
        if (active) {
          const point = active.path.getPointAtLength(active.distance);
          nib.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
          nib.style.opacity = '1';
        } else nib.style.opacity = '0';
        if (elapsed >= signatureTiming.inkComplete) stage.dataset.signatureComplete = 'true';
        if (elapsed >= signatureTiming.lift) stage.dataset.signatureLifted = 'true';
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
        <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={signatureViewBox.width} height={signatureViewBox.height} style={{ maskType: 'luminance' }}>
          <rect width={signatureViewBox.width} height={signatureViewBox.height} fill="black"/>
          {signatureTraces.map((stroke, i) => <path key={i} data-pen-stroke d={stroke.path} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}/>) }
        </mask></defs>
        <path d={signatureInk} fill="currentColor" mask={`url(#${maskId})`}/>
        <path className="signature-solid-ink" d={signatureInk} fill="currentColor"/>
        <path data-underline d={signatureUnderline} fill="none" stroke="var(--light-brown)" strokeWidth="2" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}/>
        <g data-pen-tip aria-hidden="true" style={{ opacity: 0 }}><circle r="4" fill="var(--light-brown)" opacity=".18"/><circle r="1.4" fill="currentColor" opacity=".75"/></g>
      </svg>
    </div>
  </div>;
}
