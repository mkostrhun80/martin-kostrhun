'use client';
/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { siteConfig } from '@/lib/site-config';
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
    <span className="hero-name hero-name-front hero-dot-only">KOSTRHUN<span className="hero-name-dot">.</span></span>
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
    <div className="hero-meta"><span>Finanční specialista · eDO finance</span><span>Hradec Králové<br/>osobně i online</span></div>
    {assets.isPlaceholder && <p className="hero-photo-caption">ILUSTRAČNÍ PORTRÉT / DOČASNÁ FOTOGRAFIE</p>}
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><p>eDO<br/><em>finance.</em></p><div className="hero-actions"><AppointmentLink className="site-button hero-appointment"><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink><a className="hero-explore" href="#obsah">Prohlédnout web ↓</a></div></div>
    <div className="hero-bottom"><a href={siteConfig.phoneHref}>{siteConfig.phone}</a><span>HRADEC KRÁLOVÉ · OSOBNĚ I ONLINE</span></div>
  </section></>;
}
