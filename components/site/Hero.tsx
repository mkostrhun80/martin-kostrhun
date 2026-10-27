'use client';
/* eslint-disable @next/next/no-img-element */
import { assets } from '@/lib/site-config';
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
    <span className="hero-name hero-name-front">KOSTRHUN</span>
  </div>;
}

export function Hero() {
  return <><div id="domu" aria-hidden="true"/><section className="hero hero-signature" aria-labelledby="hero-title">
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork/>
    {assets.isPlaceholder && <p className="hero-photo-caption">ILUSTRAČNÍ PORTRÉT / DOČASNÁ FOTOGRAFIE</p>}
    <span className="sr-only">{assets.portraitAlt}</span>
  </section></>;
}
