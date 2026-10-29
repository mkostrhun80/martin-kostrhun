'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type PartnerCategory } from '@/lib/partners';
import { sitePath } from '@/lib/site-path';

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const shown = category === 'Všichni' ? partners : partners.filter(partner => partner.category === category);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.partner-cover-item'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const draw = () => {
      frame = 0;
      const viewport = root.getBoundingClientRect();
      const center = viewport.left + root.clientWidth / 2;
      let closest = 0, distance = Infinity;
      cards.forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const offset = bounds.left + bounds.width / 2 - center;
        const relative = Math.max(-1, Math.min(1, offset / (bounds.width * 1.45)));
        const proximity = 1 - Math.abs(relative);
        const cover = card.querySelector<HTMLElement>('.partner-cover')!;
        card.style.zIndex = String(Math.round(proximity * 100));
        cover.style.setProperty('--cover-turn', `${-relative * 55}deg`);
        cover.style.setProperty('--cover-scale', String(reduced.matches ? 1 : .82 + proximity * .18));
        cover.style.setProperty('--cover-depth', `${proximity * 55}px`);
        if (Math.abs(offset) < distance) { closest = index; distance = Math.abs(offset); }
      });
      setActive(current => current === closest ? current : closest);
    };
    const refresh = () => { if (!frame) frame = requestAnimationFrame(draw); };
    // Filters always start at their first partner, without an animated jump.
    root.scrollLeft = 0;
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(root);
    root.addEventListener('scroll', refresh, { passive: true });
    reduced.addEventListener('change', refresh);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      root.removeEventListener('scroll', refresh);
      reduced.removeEventListener('change', refresh);
    };
  }, [category]);

  const goTo = (index: number) => {
    const root = scroller.current;
    const card = root?.querySelectorAll<HTMLElement>('.partner-cover-item')[index];
    if (!root || !card) return;
    const bounds = card.getBoundingClientRect();
    root.scrollTo({ left: root.scrollLeft + bounds.left + bounds.width / 2 - root.getBoundingClientRect().left - root.clientWidth / 2,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const next = event.key === 'ArrowRight' ? Math.min(shown.length - 1, active + 1)
      : event.key === 'ArrowLeft' ? Math.max(0, active - 1)
      : event.key === 'Home' ? 0 : event.key === 'End' ? shown.length - 1 : null;
    if (next !== null) { event.preventDefault(); goTo(next); }
  };
  const current = shown[Math.min(active, shown.length - 1)];

  return <section id="zazemi" className="page-section partners-new partners-coverflow">
    <div className="partners-summary"><div><h2>Zázemí eDO finance<span>.</span></h2><p>Možnosti napříč finančním trhem. Konkrétní nabídku posuzuji podle vaší situace.</p></div></div>
    <div className="partner-category" role="group" aria-label="Oblast partnerů">{(['Všichni', ...partnerCategories] as const).map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
    <p className="sr-only" id="partner-scroll-help">Partnery posunete vodorovně prstem nebo posuvníkem. Po zaměření pásu můžete použít také šipky vlevo a vpravo.</p>
    <div ref={scroller} className="partner-cover-scroller" role="region" aria-label="Partneři eDO finance" aria-describedby="partner-scroll-help" tabIndex={0} onKeyDown={keyboard}>
      <ul className="partner-cover-track">{shown.map(partner => <li key={partner.name} className="partner-cover-item">
        <figure className="partner-cover">
          <div className="partner-cover-logo">{partner.logo ? <img className={partner.logoLight ? 'logo-light' : undefined} src={sitePath(partner.logo)} alt="" width="220" height="100" loading="lazy"/> : <strong>{partner.shortName}</strong>}</div>
          <figcaption><strong>{partner.shortName}</strong><span>{partner.category}</span></figcaption>
        </figure>
      </li>)}</ul>
    </div>
    <div className="partner-cover-controls">
      <p role="status" aria-live="polite" aria-atomic="true"><strong>{current?.shortName}</strong><span>{Math.min(active + 1, shown.length)} / {shown.length}</span></p>
      <div className="partner-cover-arrows"><button type="button" aria-label="Předchozí partner" disabled={active === 0} onClick={() => goTo(active - 1)}><ArrowLeft size={20} aria-hidden="true"/></button><button type="button" aria-label="Další partner" disabled={active >= shown.length - 1} onClick={() => goTo(active + 1)}><ArrowRight size={20} aria-hidden="true"/></button></div>
    </div>
    <a className="text-inline" href={partnersSource} target="_blank" rel="noreferrer">Úplné informace o partnerech eDO finance <ArrowUpRight size={16} aria-hidden="true"/></a>
  </section>;
}
