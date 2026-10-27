'use client';
/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { useEffect, useRef } from 'react';

function HeroArtwork() {
  return <div className="hero-artwork" aria-hidden="true">
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
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const clean = String(scrollY < Math.min(180, (ref.current?.offsetHeight ?? innerHeight) * .25));
      if (root.dataset.cleanHero !== clean) root.dataset.cleanHero = clean;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      delete root.dataset.cleanHero;
    };
  }, []);
  return <><div id="domu" aria-hidden="true"/><section ref={ref} className="hero hero-signature" aria-labelledby="hero-title">
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork/>
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><div className="hero-actions"><AppointmentLink className="site-button hero-appointment"><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink></div></div>
  </section></>;
}
