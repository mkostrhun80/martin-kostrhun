'use client';

import { useEffect, useRef } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING } from '@/lib/home-intro';
import { sitePath } from '@/lib/site-path';

export function SignatureIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const stage = ref.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!stage || root.dataset.homeIntro !== 'pending') return;
    const video = stage.querySelector<HTMLVideoElement>('video')!;
    let frame = 0, mediaTimer = 0;
    let disposed = false, completed = false;
    let playbackStartedAt: number | null = null;
    let signatureFinishedAt: number | null = null;

    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      cancelAnimationFrame(frame);
      clearTimeout(mediaTimer);
      video.pause();
      root.dataset.homeIntro = 'ready';
      try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch { /* Storage may be disabled. */ }
      dispatchEvent(new Event('home-intro-ready'));
    };
    // If media cannot play, continue to the hero; never substitute the old signature.
    const handoff = () => {
      if (disposed || completed || signatureFinishedAt !== null) return;
      clearTimeout(mediaTimer);
      video.pause();
      signatureFinishedAt = performance.now();
    };
    const playing = () => {
      if (disposed || completed || signatureFinishedAt !== null) { video.pause(); return; }
      clearTimeout(mediaTimer);
      playbackStartedAt ??= performance.now();
    };
    const key = (event: KeyboardEvent) => {
      if (['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) finish();
    };
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (reduced.matches) finish(); };
    stage.addEventListener('click', finish);
    addEventListener('wheel', finish, { passive: true });
    addEventListener('touchmove', finish, { passive: true });
    addEventListener('keydown', key);
    addEventListener('hashchange', finish);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);
    video.addEventListener('playing', playing);
    video.addEventListener('ended', handoff);
    video.addEventListener('error', handoff);

    if (location.hash || scrollY > 8 || reduced.matches) finish();
    else {
      // Safari needs the muted inline video to be visible before play is requested.
      // The poster keeps the reference visible while its first frame is decoded.
      video.muted = true;
      video.preload = 'auto';
      mediaTimer = window.setTimeout(handoff, 6000);
      void video.play().catch(handoff);
      const portraitAt = INTRO_TIMING.name + INTRO_TIMING.hold;
      const end = portraitAt + INTRO_TIMING.portrait;
      const tick = (now: number) => {
        if (disposed || completed) return;
        if (root.dataset.homeIntro === 'ready') { finish(); return; }
        if (playbackStartedAt !== null && now - playbackStartedAt >= INTRO_TIMING.referenceLimit) handoff();
        if (signatureFinishedAt !== null) {
          const elapsed = now - signatureFinishedAt;
          root.dataset.homeIntro = elapsed >= portraitAt ? 'portrait' : 'name';
          if (elapsed >= end) { finish(); return; }
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
      video.removeEventListener('playing', playing);
      video.removeEventListener('ended', handoff);
      video.removeEventListener('error', handoff);
      stage.removeEventListener('click', finish);
      removeEventListener('wheel', finish);
      removeEventListener('touchmove', finish);
      removeEventListener('keydown', key);
      removeEventListener('hashchange', finish);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
      queueMicrotask(() => { if (!document.querySelector('.signature-intro')) root.dataset.homeIntro = 'ready'; });
    };
  }, []);

  return <div ref={ref} className="signature-intro">
    <div className="signature-stage" role="status" aria-label="Martin Kostrhun — úvodní podpis">
      <video className="signature-video" src={sitePath('/video/signature-opening.mp4')} poster={sitePath('/video/signature-opening-poster.jpg')} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} aria-hidden="true"/>
    </div>
  </div>;
}
