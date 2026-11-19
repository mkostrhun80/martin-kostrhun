import { ArrowRight } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { PictureFrame } from './PictureFrame';

const heroFacts = [
  { value: '68+', label: 'finančních partnerů' },
  { value: 'Registr ČNB', label: 'ověřitelná praxe' },
  { value: '90 minut', label: 'úvodní konzultace' },
  { value: 'Osobně i online', label: 'Hradec Králové a ČR' },
];

export function Hero() {
  return (
    <section
      id="domu"
      className="hero-editorial band-navy has-contours"
      data-chapter="dark"
      aria-labelledby="hero-title"
    >
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-headline">
            <span className="hero-headline-line">Martin Kostrhun.</span>
            <span className="hero-headline-line">Finance v souvislostech.</span>
          </h1>
          <p className="hero-lead">{siteConfig.introduction}</p>

          <div className="hero-actions">
            <AppointmentLink className="site-button site-button-gold">
              Domluvit úvodní konzultaci <ArrowRight size={16} aria-hidden="true" />
            </AppointmentLink>
            <a className="site-link-inline site-link-inline-dark" href="#kalkulacka">
              Orientační kalkulačka <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <dl className="hero-proof-strip" aria-label="Základní fakta spolupráce">
            {heroFacts.map(item => (
              <div key={item.value} className="hero-proof-item">
                <dt>{item.value}</dt>
                <dd>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="hero-media">
          <PictureFrame spec={assets.responsive.hero} priority className="editorial-plate hero-plate" />
        </figure>
      </div>
    </section>
  );
}
