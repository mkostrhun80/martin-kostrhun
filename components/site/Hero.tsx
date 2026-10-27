'use client';
/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { siteConfig } from '@/lib/site-config';
import { HeroContours } from './HeroFlow';

function HeroArtwork() {
  return <div className="hero-artwork" aria-hidden="true">
    <HeroContours/>
    <span className="hero-name hero-name-back">MARTIN</span>
    <div className="hero-photo-layer">
      <img src={assets.heroPortrait}
        alt="" width="800" height="1200"
        fetchPriority="high" draggable={false}/>
    </div>
    <span className="hero-name hero-name-front">KOSTRHUN<span className="hero-name-dot">.</span></span>
  </div>;
}

export function Hero() {
  return <><div id="domu" aria-hidden="true"/><section className="hero hero-signature" aria-labelledby="hero-title">
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork/>
    <div className="hero-meta"><span>Finanční specialista · eDO finance</span><span>Hradec Králové<br/>osobně i online</span></div>
    {assets.isPlaceholder && <p className="hero-photo-caption">ILUSTRAČNÍ PORTRÉT / DOČASNÁ FOTOGRAFIE</p>}
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><p>eDO<br/><em>finance.</em></p><div className="hero-actions"><AppointmentLink className="site-button hero-appointment"><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink><a className="hero-explore" href="#obsah">Prohlédnout web ↓</a></div></div>
    <div className="hero-bottom"><a href={siteConfig.phoneHref}>{siteConfig.phone}</a><span>HRADEC KRÁLOVÉ · OSOBNĚ I ONLINE</span></div>
  </section></>;
}
