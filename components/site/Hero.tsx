'use client';
/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { assets } from '@/lib/site-config';
import { ContactModal } from './ContactModal';
import { useRef, type RefObject } from 'react';
import { HeroFlow, HeroContours } from './HeroFlow';

/** The organic reveal stays registered with the photograph and typography. */
function HeroArtwork({ alternate = false, heroRef }: { alternate?: boolean; heroRef?: RefObject<HTMLElement | null> }) {
  return <div className={`hero-artwork${alternate ? ' hero-artwork-alternate' : ''}`} aria-hidden="true">
    {!alternate && <HeroContours/>}
    <span className="hero-name hero-name-back">MARTIN</span>
    <div className="hero-photo-layer">
      <img src={alternate ? assets.heroLensPortrait : assets.heroPortrait}
        alt="" width="800" height="1200"
        fetchPriority={alternate ? 'auto' : 'high'} draggable={false}/>
    </div>
    {heroRef && <HeroFlow heroRef={heroRef}/>}
    <span className="hero-name hero-name-front">KOSTRHUN<span className="hero-name-dot">.</span></span>
    <div className="hero-photo-type" aria-hidden="true">
      <span className="hero-name hero-name-back">MARTIN</span>
      <span className="hero-name hero-name-front">KOSTRHUN<span className="hero-name-dot">.</span></span>
    </div>
  </div>;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  return <><div id="domu" aria-hidden="true"/><section ref={heroRef} className="hero hero-with-lens hero-with-flow" aria-labelledby="hero-title">
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork heroRef={heroRef}/>
    <div className="hero-meta"><span>FINANČNÍ SPECIALISTA</span><span>HRADEC KRÁLOVÉ<br/>CZ / 2026</span></div>
    {assets.isPlaceholder && <p className="hero-photo-caption">ILUSTRAČNÍ PORTRÉT / DOČASNÁ FOTOGRAFIE</p>}
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><span className="tiny-cross" aria-hidden="true">＋</span><p>FINANCE,<br/>VE KTERÝCH<br/><em>MÁTE JASNO.</em></p><div className="hero-actions"><ContactModal className="site-button hero-appointment"/><a className="site-button site-button-quiet" href="#spoluprace"><ButtonLabel>PRŮBĚH SPOLUPRÁCE</ButtonLabel></a></div></div>
    <div className="hero-bottom"><span>OSOBNĚ. SROZUMITELNĚ. DLOUHODOBĚ.</span><span>01 — 07</span></div>
  </section></>;
}
