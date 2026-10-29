'use client';
/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { HeroContours } from './HeroFlow';

function HeroArtwork() {
  return <div className="hero-artwork" aria-hidden="true">
    <HeroContours/>
    <div className="hero-name-group">
      <span className="hero-name hero-name-back">MARTIN</span>
      <span className="hero-name hero-name-front">KOSTRHUN<span className="hero-name-dot">.</span></span>
    </div>
    <div className="hero-photo-layer">
      <img src={assets.heroPortrait}
        alt="" width="800" height="1200"
        fetchPriority="high" draggable={false}/>
    </div>
  </div>;
}

export function Hero() {
  return <><div id="domu" aria-hidden="true"/><section className="hero hero-signature" aria-labelledby="hero-title">
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork/>
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><div className="hero-actions"><AppointmentLink className="site-button hero-appointment"><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink></div></div>
  </section></>;
}
