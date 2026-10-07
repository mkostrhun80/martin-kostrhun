'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { partners, partnerCategories, partnersSource, type PartnerCategory } from '@/lib/partners';

export function Partners() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const previousHeight = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const visible = category === 'Všichni' ? partners : partners.filter(p => p.category === category);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.partners-title-line > span', { yPercent: 110, rotate: 3, stagger: .12, ease: 'power3.out',
        scrollTrigger: { trigger: '.partners-heading', start: 'top 85%', end: 'top 30%', scrub: .6 } });
      gsap.fromTo('.partners-orbit', { rotate: -35 }, { rotate: 115, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('.partners-count > strong', { yPercent: 80, opacity: .2, ease: 'power3.out',
        scrollTrigger: { trigger: '.partners-heading', start: 'top 80%', end: 'top 30%', scrub: .6 } });
    }, root);
    return () => media.revert();
  }, []);
  useLayoutEffect(() => {
    const box = viewport.current;
    if (!box) return;
    const end = box.scrollHeight;
    const start = previousHeight.current;
    previousHeight.current = null;
    if (start === null || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      box.style.height = 'auto'; ScrollTrigger.refresh(); return;
    }
    const tween = gsap.fromTo(box, { height: start }, { height: end, duration: .65, ease: 'power3.inOut',
      onComplete: () => { box.style.height = 'auto'; ScrollTrigger.refresh(); } });
    return () => { tween.kill(); box.style.height = 'auto'; };
  }, [expanded, category]);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (root.current) root.current.dataset.beltVisible = String(entry.isIntersecting);
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  function toggleExpanded() {
    previousHeight.current = viewport.current?.getBoundingClientRect().height ?? null;
    setExpanded(!expanded); setSelected(null);
    if (expanded) setCategory('Všichni');
  }
  function mark(partner: typeof partners[number], duplicate = false) {
    return <li className="partner-card" key={partner.name}><button type="button" className="partner-mark"
      tabIndex={duplicate ? -1 : undefined} aria-pressed={selected === partner.name} aria-label={partner.name}
      title={partner.name} onClick={() => setSelected(selected === partner.name ? null : partner.name)}>
      <div className="partner-logo" aria-hidden="true">{partner.logo ? <img className={partner.logoLight ? 'logo-light' : undefined}
        src={partner.logo} alt="" loading="lazy" width="160" height="64"/> : <strong>{partner.shortName}</strong>}</div>
      <span className="partner-name" aria-hidden="true">{partner.shortName}</span>
    </button></li>;
  }
  return <section ref={root} id="zazemi" className="section partners partners-with-belt" data-expanded={expanded} data-paused={paused}>
    <div className="section-top"><p className="eyebrow">ZÁZEMÍ / PARTNEŘI eDO FINANCE</p>
      <a className="text-link" href={partnersSource} target="_blank" rel="noreferrer">OFICIÁLNÍ PŘEHLED <span>↗</span></a></div>
    <div className="partners-heading">
      <h2 className="display"><span className="partners-title-line"><span>NAPŘÍČ</span></span><span className="partners-title-line"><span>FINANČNÍM</span></span><span className="partners-title-line"><span>TRHEM<em>.</em></span></span></h2>
      <div className="partners-count"><span className="partners-orbit" aria-hidden="true">✳</span><strong>{partners.length}</strong><p>partnerů eDO finance<br/>5 oblastí. Široké možnosti.</p></div>
    </div>
    <div ref={viewport} id="partner-overview" className="partner-overview">
      {expanded ? <div className="partner-expanded">
        <div className="partner-filters" role="group" aria-label="Oblast partnerů">
          {(['Všichni', ...partnerCategories] as const).map(item => <button type="button" key={item} aria-pressed={category === item}
            onClick={() => { previousHeight.current = viewport.current?.getBoundingClientRect().height ?? null; setCategory(item); setSelected(null); }}>
            {item}<sup>{item === 'Všichni' ? partners.length : partners.filter(p => p.category === item).length}</sup></button>)}
        </div>
        <p className="sr-only" role="status">Zobrazeno {visible.length} partnerů. {category}.</p>
        <ul className="partner-grid" data-selection={selected ? 'true' : undefined} aria-label="Partneři eDO finance">{visible.map(p => mark(p))}</ul>
      </div> : <div className="partner-belt" role="region" aria-label="Posouvající se přehled partnerů" tabIndex={0}>
        <div className="partner-belt-track">
          <ul className="partner-belt-group" aria-label="Partneři eDO finance">{partners.map(p => mark(p))}</ul>
          <ul className="partner-belt-group partner-belt-copy" aria-hidden="true">{partners.map(p => mark(p, true))}</ul>
        </div>
      </div>}
    </div>
    <div className="partner-belt-controls">
      <button className="text-link" type="button" aria-expanded={expanded} aria-controls="partner-overview" onClick={toggleExpanded}>
        {expanded ? 'SKRÝT' : 'ZOBRAZIT VŠECHNY'} <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
      </button>
      {!expanded && <button className="partner-belt-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? 'SPUSTIT POHYB' : 'POZASTAVIT POHYB'}
      </button>}
    </div>
    <div className="partners-bottom"><p className="partners-note">Konkrétní možnosti vždy posuzujeme podle vaší situace a aktuální nabídky.</p><a href={partnersSource} target="_blank" rel="noreferrer">PARTNEŘI eDO FINANCE <span>↗</span></a></div>
  </section>;
}
