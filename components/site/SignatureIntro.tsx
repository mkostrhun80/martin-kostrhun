'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { INTRO_SESSION_KEY, INTRO_TIMING, SIGNATURE_MOTION } from '@/lib/home-intro';

type SignatureArtworkData = typeof import('@/lib/signature-lettering');

export function SignatureIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const maskId = `signature-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [artwork, setArtwork] = useState<SignatureArtworkData | null>(null);
  const [phase, setPhase] = useState<'draw' | 'retract'>('draw');

  useEffect(() => {
    const root = document.documentElement;
    const stage = ref.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!stage || root.dataset.homeIntro !== 'pending') return;

    let disposed = false;
    let completed = false;
    let retractTimer = 0;
    let enterTimer = 0;
    let finishTimer = 0;

    const markPlayed = () => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {
        /* Storage may be disabled. */
      }
    };

    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      clearTimeout(retractTimer);
      clearTimeout(enterTimer);
      clearTimeout(finishTimer);
      root.dataset.homeIntro = 'ready';
      markPlayed();
      dispatchEvent(new Event('home-intro-ready'));
    };

    const skip = () => finish();
    const key = (event: KeyboardEvent) => {
      if (['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        finish();
      }
    };
    const visibility = () => {
      if (document.hidden) finish();
    };
    const preference = () => {
      if (reduced.matches) finish();
    };

    stage.addEventListener('click', skip);
    addEventListener('wheel', skip, { passive: true });
    addEventListener('touchmove', skip, { passive: true });
    addEventListener('keydown', key);
    addEventListener('hashchange', skip);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);

    if (location.hash || scrollY > 8 || reduced.matches) {
      finish();
    } else {
      void import('@/lib/signature-lettering').then(data => {
        if (disposed || completed || root.dataset.homeIntro !== 'pending') return;
        setArtwork(data);
        setPhase('draw');
        retractTimer = window.setTimeout(() => {
          if (!disposed && !completed) setPhase('retract');
        }, SIGNATURE_MOTION.retract);
        enterTimer = window.setTimeout(() => {
          if (!disposed && !completed) root.dataset.homeIntro = 'entering';
        }, INTRO_TIMING.signature);
        finishTimer = window.setTimeout(finish, INTRO_TIMING.signature + INTRO_TIMING.duration);
      }).catch(finish);
    }

    return () => {
      disposed = true;
      clearTimeout(retractTimer);
      clearTimeout(enterTimer);
      clearTimeout(finishTimer);
      stage.removeEventListener('click', skip);
      removeEventListener('wheel', skip);
      removeEventListener('touchmove', skip);
      removeEventListener('keydown', key);
      removeEventListener('hashchange', skip);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
      queueMicrotask(() => {
        if (!document.querySelector('.signature-intro')) root.dataset.homeIntro = 'ready';
      });
    };
  }, []);

  return (
    <div ref={ref} className="signature-intro hero-entry-cover" data-phase={phase} aria-hidden="true">
      <div className="signature-stage">
        {artwork && (
          <svg
            viewBox={`0 0 ${artwork.signatureViewBox.width} ${artwork.signatureViewBox.height + 104}`}
            className="signature-art"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={artwork.signatureViewBox.width}
                height={artwork.signatureViewBox.height}
                style={{ maskType: 'luminance' }}
              >
                <rect width={artwork.signatureViewBox.width} height={artwork.signatureViewBox.height} fill="black" />
                {artwork.signatureTraces.map((stroke, index) => (
                  <path
                    key={index}
                    className="signature-mask-stroke"
                    d={stroke.path}
                    fill="none"
                    stroke="white"
                    strokeWidth={artwork.signatureStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    style={{ '--delay': `${(((index * 17) % 7) / 6) * SIGNATURE_MOTION.stagger}ms` } as CSSProperties}
                  />
                ))}
              </mask>
            </defs>
            <path
              className="signature-ink-path"
              d={artwork.signatureInk}
              fill="currentColor"
              fillRule={artwork.signatureFillRule}
              mask={`url(#${maskId})`}
            />
            <path
              className="signature-underline"
              d="M68 204 C220 184 500 184 746 192 C650 194 550 201 456 208"
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
            <text className="signature-descriptor" x={artwork.signatureViewBox.width / 2} y="258" textAnchor="middle">
              finance &amp; reality
            </text>
          </svg>
        )}
      </div>
    </div>
  );
}
