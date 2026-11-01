'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type PartnerCategory } from '@/lib/partners';
import type { PartnerRibbon } from '@/lib/partner-ribbon';
import { sitePath } from '@/lib/site-path';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(change: () => void) {
  const query = matchMedia(motionQuery);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
}
const getMotion = () => matchMedia(motionQuery).matches;
const serverMotion = () => false;

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [playing, setPlaying] = useState(true), [unavailable, setUnavailable] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, serverMotion);
  const stage = useRef<HTMLDivElement>(null), ribbon = useRef<PartnerRibbon | null>(null);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const selection = useMemo(() => partners.map((partner, index) => ({ partner, index })).filter(({ partner }) => category === 'Všichni' || partner.category === category), [category]);
  const latest = useRef({ selection, playing });
  useEffect(() => {
    latest.current.selection = selection;
    ribbon.current?.setPartners(selection.map(item => item.index));
  }, [selection]);
  useEffect(() => { latest.current.playing = playing; ribbon.current?.setPlaying(playing); }, [playing]);

  useEffect(() => {
    const root = stage.current;
    if (!root || reduced || unavailable) return;
    const abort = new AbortController();
    let loading = false;
    const observer = new IntersectionObserver(entries => {
      if (loading || !entries.some(entry => entry.isIntersecting)) return;
      loading = true; observer.disconnect();
      void import('@/lib/partner-ribbon').then(({ createPartnerRibbon }) => {
        if (abort.signal.aborted) return null;
        return createPartnerRibbon(root, sitePath('/images/partners/ribbon-atlas.webp'), {
          indices: latest.current.selection.map(item => item.index), playing: latest.current.playing,
          signal: abort.signal, onUnavailable: () => setUnavailable(true),
        });
      }).then(controller => {
        if (!controller) return;
        if (abort.signal.aborted) { controller.dispose(); return; }
        ribbon.current = controller;
        controller.setPartners(latest.current.selection.map(item => item.index));
        controller.setPlaying(latest.current.playing);
      }).catch(() => { if (!abort.signal.aborted) setUnavailable(true); });
    }, { rootMargin: '250px' });
    observer.observe(root);
    return () => { abort.abort(); observer.disconnect(); ribbon.current?.dispose(); ribbon.current = null; };
  }, [reduced, unavailable]);

  const move = (direction: number) => { setPlaying(false); ribbon.current?.step(direction); };
  return <section id="zazemi" className="page-section partners-new partners-ribbon" aria-labelledby="partners-heading">
    <div className="partners-summary"><div><h2 id="partners-heading">Zázemí eDO finance.</h2><p>Možnosti napříč finančním trhem. Konkrétní nabídku posuzuji podle vaší situace.</p></div></div>
    <div className="partner-category" role="group" aria-label="Oblast partnerů">{(['Všichni', ...partnerCategories] as const).map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
    <noscript><style>{'.partner-ribbon-stage{height:auto!important;overflow:visible!important}'}</style></noscript>
    <div ref={stage} className="partner-ribbon-stage" data-static={reduced || unavailable ? 'true' : undefined}
      onPointerDown={event => { gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
      onPointerCancel={() => { gesture.current = null; }}
      onPointerUp={event => {
        const start = gesture.current; gesture.current = null;
        if (!start || start.id !== event.pointerId || reduced || unavailable) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}>
      <ul className="partner-ribbon-fallback" aria-label="Partneři eDO finance">{selection.map(({ partner }) => <li key={partner.name}>
        {partner.logo ? <img className={partner.logoLight ? 'logo-light' : undefined} src={sitePath(partner.logo)} alt={partner.name} width="220" height="100" loading="lazy"/> : <strong>{partner.shortName}</strong>}
      </li>)}</ul>
    </div>
    <div className="partner-ribbon-bottom">
      <p className="partner-ribbon-count" aria-live="polite">{selection.length} partnerů · {category === 'Všichni' ? '5 oblastí' : category}</p>
      <div className="partner-ribbon-actions">
        <button type="button" aria-label="Předchozí partneři" disabled={reduced || unavailable} onClick={() => move(-1)}><ArrowLeft size={18} aria-hidden="true"/></button>
        <button type="button" aria-label="Další partneři" disabled={reduced || unavailable} onClick={() => move(1)}><ArrowRight size={18} aria-hidden="true"/></button>
        <button type="button" className="partner-ribbon-play" disabled={reduced || unavailable} aria-pressed={playing && !reduced && !unavailable} onClick={() => setPlaying(value => !value)}>
          {playing && !reduced && !unavailable ? <Pause size={16} aria-hidden="true"/> : <Play size={16} aria-hidden="true"/>}
          {reduced ? 'Pohyb omezen' : unavailable ? 'Statický přehled' : playing ? 'Pozastavit pohyb' : 'Spustit pohyb'}
        </button>
      </div>
    </div>
    <details className="partner-ribbon-directory"><summary>Všichni partneři v této oblasti</summary><ul>{selection.map(({ partner }) => <li key={partner.name}>{partner.name}<span>{partner.category}</span></li>)}</ul></details>
    <a className="partner-ribbon-source" href={partnersSource} target="_blank" rel="noreferrer">Úplné informace o partnerech eDO finance <ArrowUpRight size={16} aria-hidden="true"/></a>
  </section>;
}
