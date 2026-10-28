'use client';

import { useEffect, useId, useRef } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING } from '@/lib/home-intro';
import { signatureInk, signatureTraces } from '@/lib/signature-paths';
import { sitePath } from '@/lib/site-path';

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
    let mediaTimer = 0;
    const video = stage.querySelector<HTMLVideoElement>('video')!;
    const drawing = stage.querySelector<HTMLElement>('.signature-stage')!;
    let mode: 'waiting' | 'video' | 'fallback' = 'waiting';
    let zero = performance.now();
    let signatureFinishedAt: number | null = null;
    const useFallback = () => {
      if (disposed || completed || mode === 'fallback' || signatureFinishedAt !== null) return;
      clearTimeout(mediaTimer);
      mode = 'fallback';
      video.pause();
      delete drawing.dataset.signatureMedia;
      zero = performance.now();
    };
    const playing = () => {
      if (disposed || completed || mode !== 'waiting') return;
      clearTimeout(mediaTimer);
      mode = 'video';
      drawing.dataset.signatureMedia = 'video';
      zero = performance.now();
    };
    const ended = () => {
      if (!disposed && !completed && mode === 'video') signatureFinishedAt = performance.now();
    };
    const traces = Array.from(stage.querySelectorAll<SVGPathElement>('[data-pen-stroke]'));
    const underline = stage.querySelector<SVGPathElement>('[data-underline]')!;
    const markPlayed = () => { try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch { /* Storage may be disabled. */ } };
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      cancelAnimationFrame(frame);
      clearTimeout(mediaTimer);
      video.pause();
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
    video.addEventListener('playing', playing);
    video.addEventListener('ended', ended);
    video.addEventListener('error', useFallback);

    if (location.hash || scrollY > 8 || reduced.matches) finish();
    else {
      const portraitAt = INTRO_TIMING.name + INTRO_TIMING.hold;
      const end = portraitAt + INTRO_TIMING.portrait;
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      // Only first-visit intros fetch the supplied 11–20 second reference clip.
      // Keep the original vector drawing when autoplay or the connection fails.
      video.muted = true;
      video.preload = 'auto';
      mediaTimer = window.setTimeout(() => { if (mode === 'waiting') useFallback(); }, 1250);
      void video.play().catch(useFallback);
      const tick = (now: number) => {
        if (disposed || root.dataset.homeIntro === 'ready') return;
        const elapsed = now - zero;
        if (mode === 'fallback') {
          const referenceTime = .48 + clamp(elapsed / 2100) * (6.31 - .48);
          traces.forEach((path, i) => {
            const stroke = signatureTraces[i];
            const p = clamp((referenceTime - stroke.start) / stroke.duration);
            path.style.strokeDashoffset = String(1 - p);
          });
          underline.style.strokeDashoffset = String(1 - clamp((elapsed - 2110) / 230));
          if (elapsed >= INTRO_TIMING.signature && signatureFinishedAt === null) signatureFinishedAt = now;
        }
        // A stalled video must also hand control back to the page.
        if (mode === 'video' && elapsed >= INTRO_TIMING.referenceLimit && signatureFinishedAt === null) {
          video.pause();
          signatureFinishedAt = now;
        }
        if (signatureFinishedAt !== null) {
          const handoff = now - signatureFinishedAt;
          root.dataset.homeIntro = handoff >= portraitAt ? 'portrait' : 'name';
          if (handoff >= end) { finish(); return; }
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(mediaTimer);
      video.pause();
      delete drawing.dataset.signatureMedia;
      video.removeEventListener('playing', playing);
      video.removeEventListener('ended', ended);
      video.removeEventListener('error', useFallback);
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
      <video className="signature-video" src={sitePath('/video/signature-opening.mp4')} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} aria-hidden="true"/>
      <svg viewBox="0 0 814 173" className="signature-art" aria-hidden="true" focusable="false">
        <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="814" height="173">
          <rect width="814" height="173" fill="black"/>
          {signatureTraces.map((stroke, i) => <path key={i} data-pen-stroke d={stroke.path} fill="none" stroke="white" strokeWidth="23" strokeLinejoin="round" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }}/>) }
        </mask></defs>
        <path d={signatureInk} fill="currentColor" fillRule="evenodd" mask={`url(#${maskId})`}/>
        <path data-underline d="M30 148 Q410 159 788 141" fill="none" stroke="var(--light-brown)" strokeWidth="2.8" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }}/>
      </svg>
    </div>
  </div>;
}
