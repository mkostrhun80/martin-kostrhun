'use client';
/* eslint-disable @next/next/no-img-element */
import { assets } from '@/lib/site-config';
import { usePurpleLens } from './usePurpleLens';

/** Both scenes share identical geometry, so swapping the central asset preserves the lens. */
function HeroArtwork({ alternate = false }: { alternate?: boolean }) {
  return <div className={`hero-artwork${alternate ? ' hero-artwork-alternate' : ''}`} aria-hidden="true">
    <span className="hero-name hero-name-back">MARTIN</span>
    <div className="hero-photo-layer">
      <img src={alternate ? assets.heroLensPortrait : assets.heroPortrait}
        srcSet={alternate ? undefined : `${assets.heroPortraitSmall} 600w, ${assets.heroPortrait} 1086w`}
        sizes="(max-width: 760px) 69vw, 40vw" alt="" width="1086" height="1448"
        fetchPriority={alternate ? 'auto' : 'high'} draggable={false}/>
    </div>
    <span className="hero-name hero-name-front">KOSTRHUN<span className="hero-name-dot">.</span></span>
  </div>;
}

export function Hero() {
  const { heroRef, buttonRef, labelRef, phase } = usePurpleLens();
  return <section ref={heroRef} id="domu" className="hero hero-with-lens" aria-labelledby="hero-title" data-lens-phase={phase}>
    <h1 id="hero-title" className="sr-only">Martin Kostrhun — finanční specialista</h1>
    <HeroArtwork/>
    <div className="purple-lens-layer" aria-hidden="true">
      <HeroArtwork alternate/>
      <div className="portal-wash"/>
    </div>
    <div className="lens-rim" aria-hidden="true"><span className="lens-edge-mark"/><span className="lens-edge-mark second"/></div>
    <button ref={buttonRef} className="lens-hit" type="button" aria-label="Odhalit další vrstvu a pokračovat"
      tabIndex={phase === 'exploring' ? 0 : -1} disabled={phase !== 'exploring'}>
      <span className="sr-only">Volitelná interakce. Můžete také rovnou posunout stránku.</span>
    </button>
    <div className="lens-annotation" aria-hidden="true"><span ref={labelRef} className="lens-word">FINANCE</span><span className="lens-hint"><span className="pointer-hint">POHYBEM OBJEVUJ</span><span className="touch-hint">DOTYKEM OBJEVUJ</span><span>↗</span></span></div>
    <div className="hero-meta"><span>FINANČNÍ SPECIALISTA<br/><b>eDO FINANCE</b></span><span>HRADEC KRÁLOVÉ<br/>CZ / 2026</span></div>
    {assets.isPlaceholder && <p className="hero-photo-caption">ILUSTRAČNÍ PORTRÉT / DOČASNÁ FOTOGRAFIE</p>}
    <span className="sr-only">{assets.portraitAlt}</span>
    <div className="hero-note"><span className="tiny-cross" aria-hidden="true">＋</span><p>FINANCE,<br/>VE KTERÝCH<br/><em>MÁTE JASNO.</em></p><a className="text-link" href="#kontakt">DOMLUVIT SCHŮZKU <span>↗</span></a></div>
    <div className="hero-bottom"><a href="#pristup">POZNEJTE MŮJ PŘÍSTUP <span>↓</span></a><span>OSOBNĚ. SROZUMITELNĚ. DLOUHODOBĚ.</span><span>01 — 07</span></div>
  </section>;
}
