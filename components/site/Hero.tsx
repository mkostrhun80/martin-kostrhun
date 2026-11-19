import { ArrowRight } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { PictureFrame } from './PictureFrame';

export function Hero() {
  return (
    <section id="domu" className="hero-editorial" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-headline">
            Martin Kostrhun.
            <br />
            Finance v souvislostech.
          </h1>
          <p className="hero-lead">{siteConfig.introduction}</p>
          <div className="hero-trust-strip" aria-label="Základní fakta spolupráce">
            <span>Hradec Králové a online</span>
            <span>Vázaný zástupce eDO finance</span>
            <span>Ověřitelné v registru ČNB</span>
          </div>
          <div className="hero-actions">
            <AppointmentLink className="site-button">Domluvit úvodní konzultaci</AppointmentLink>
            <a className="site-link-inline" href="#sluzby">
              Přehled služeb <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <figure className="hero-media">
          <PictureFrame spec={assets.responsive.hero} priority />
        </figure>
      </div>
    </section>
  );
}
