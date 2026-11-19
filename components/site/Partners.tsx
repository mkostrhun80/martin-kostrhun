'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type Partner, type PartnerCategory } from '@/lib/partners';
import { filterPartners, isMarqueePaused, splitPartnerRows } from '@/lib/partner-motion';
import { sitePath } from '@/lib/site-path';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(change: () => void) {
  const query = matchMedia(motionQuery);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
}
const getMotion = () => matchMedia(motionQuery).matches;
const serverMotion = () => false;

function PartnerCard({ partner, ariaHidden = false }: { partner: Partner; ariaHidden?: boolean }) {
  return (
    <div
      className="partner-logo-card"
      data-logo-light={partner.logoLight ? 'true' : undefined}
      aria-hidden={ariaHidden || undefined}
    >
      {partner.logo ? (
        <img
          src={sitePath(partner.logo)}
          alt={ariaHidden ? '' : partner.name}
          width={140}
          height={44}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <strong>{partner.shortName}</strong>
      )}
    </div>
  );
}

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [manualShift, setManualShift] = useState(0);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, serverMotion);
  const sectionRef = useRef<HTMLElement>(null);

  const selection = useMemo(() => filterPartners(partners, category), [category]);
  const [rowA, rowB] = useMemo(() => splitPartnerRows(selection), [selection]);
  const compactStatic = selection.length <= 6;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        setInView(entries.some(entry => entry.isIntersecting));
      },
      { rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const paused = isMarqueePaused({ playing, reduced, inView });

  function selectCategory(next: PartnerCategory | 'Všichni') {
    setCategory(next);
    setManualShift(0);
  }

  function nudge(direction: -1 | 1) {
    setPlaying(false);
    const maxShift = Math.max(0, (Math.max(rowA.length, rowB.length) - 4) * 198);
    setManualShift(current => Math.max(-maxShift, Math.min(0, current - direction * 240)));
  }

  function togglePlaying() {
    setManualShift(0);
    setPlaying(value => !value);
  }

  return (
    <section
      ref={sectionRef}
      id="zazemi"
      className="section-band band-alabaster"
      aria-labelledby="partners-heading"
    >
      <div className="section-shell">
        <header className="section-header">
          <h2 id="partners-heading" className="section-heading-display">
            Zázemí eDO finance.
          </h2>
          <p className="section-lead">
            Díky zázemí eDO finance mám přístup k desítkám bank, pojišťoven a investičních partnerů. Konkrétní řešení vybírám podle vaší situace, nikoli podle jedné značky.
          </p>
        </header>

        <div className="partners-controls-bar">
          <div className="partner-category-tabs" role="group" aria-label="Oblast partnerů">
            {(['Všichni', ...partnerCategories] as const).map(value => (
              <button
                type="button"
                key={value}
                aria-pressed={category === value}
                onClick={() => selectCategory(value)}
              >
                {value}
              </button>
            ))}
          </div>

          {!compactStatic && (
            <div className="partner-marquee-actions">
              <button
                type="button"
                aria-label="Posunout partnery doleva"
                onClick={() => nudge(-1)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Posunout partnery doprava"
                onClick={() => nudge(1)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={reduced}
                aria-pressed={playing && !reduced}
                onClick={togglePlaying}
              >
                {playing && !reduced ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
                <span>{reduced ? 'Pohyb omezen' : playing ? 'Pozastavit' : 'Spustit'}</span>
              </button>
            </div>
          )}
        </div>

        {compactStatic ? (
          <div className="partner-static-grid" aria-label="Partneři v kategorii">
            {selection.map(partner => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="partner-marquee-viewport" data-paused={paused ? 'true' : 'false'}>
            {[rowA, rowB].map((rowItems, rowIndex) => (
              <div
                key={rowIndex}
                className={rowIndex === 1 ? 'partner-marquee-row partner-marquee-row-reverse' : 'partner-marquee-row'}
              >
                <div
                  className="partner-marquee-track"
                  style={
                    manualShift !== 0 && !playing
                      ? { transform: `translate3d(${manualShift}px, 0, 0)`, animation: 'none', transition: 'transform 260ms ease' }
                      : undefined
                  }
                >
                  {rowItems.map(partner => (
                    <PartnerCard key={partner.name} partner={partner} />
                  ))}
                  {rowItems.map(partner => (
                    <PartnerCard key={`${partner.name}-dup`} partner={partner} ariaHidden />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="partner-meta-row">
          <p aria-live="polite">
            {selection.length} partnerů · {category === 'Všichni' ? '5 oblastí' : category}
          </p>
          <a className="site-link-inline" href={partnersSource} target="_blank" rel="noreferrer">
            Úplné informace o partnerech eDO finance <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <details className="partner-directory">
          <summary>Abecední přehled partnerů v této oblasti ({selection.length})</summary>
          <ul>
            {selection.map(partner => (
              <li key={partner.name}>
                <strong>{partner.name}</strong>
                <span>{partner.category}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
