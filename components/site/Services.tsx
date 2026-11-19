import { services } from '@/lib/content';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { FinanceCalculator } from './FinanceCalculator';
import { PictureFrame } from './PictureFrame';

const serviceCtaLabels: Record<string, string> = {
  investice: 'Nastavit investice',
  bydleni: 'Probrat hypotéku',
  plan: 'Sestavit finanční plán',
  pojisteni: 'Prověřit pojištění',
  stari: 'Naplánovat zajištění',
  podnikani: 'Řešit firemní finance',
};

export function Services() {
  const buildServices = services.filter(s => s.group === 'Budovat');
  const protectServices = services.filter(s => s.group === 'Chránit');

  return (
    <section id="sluzby" className="services-editorial-wrapper" aria-labelledby="services-heading">
      {/* Chapter A: Budovat majetek a bydlení (Warm Linen, Asymmetric Portrait + Editorial Ledger) */}
      <div className="section-band band-linen">
        <div className="section-shell services-build-split">
          <div className="services-lead-col">
            <header className="section-header" data-reveal="mask">
              <h2 id="services-heading" className="section-heading-display">
                S čím pomáhám.
              </h2>
              <p className="section-lead">
                Budování majetku, promyšlené financování bydlení a jeden propojený plán bez zbytečných kompromisů.
              </p>
            </header>

            <figure className="editorial-media" data-reveal="shutter">
              <PictureFrame spec={assets.responsive.services} className="editorial-plate" />
            </figure>
          </div>

          <div className="services-ledger-col" aria-label="Budovat majetek a bydlení">
            {buildServices.map((service, index) => (
              <article
                className="service-ledger-row"
                id={`sluzba-${service.id}`}
                key={service.id}
                data-reveal="stagger"
                style={{ '--stagger': index } as React.CSSProperties}
              >
                <div className="service-ledger-head">
                  <h3>{service.title}</h3>
                  <span className="service-tagline">{service.short}</span>
                </div>
                <p>{service.description}</p>
                <AppointmentLink className="site-link-inline service-cta" topic={service.title}>
                  <span>{serviceCtaLabels[service.id] ?? 'Probrat možnosti'} →</span>
                </AppointmentLink>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter B: Chránit příjem a budoucnost (Sovereign Navy, Full-Width Horizontal Bands) */}
      <div className="section-band band-navy has-contours" data-chapter="dark">
        <div className="section-shell">
          <header className="section-header" data-reveal="mask">
            <h2 className="section-heading-display">
              Ochrana příjmu a rezervy.
            </h2>
            <p className="section-lead">
              Když se situace změní, dobrý finanční plán podrží vaši rodinu, životní úroveň i podnikání.
            </p>
          </header>

          <div className="services-protect-bands" aria-label="Chránit příjem a budoucnost">
            {protectServices.map((service, index) => (
              <article
                className="service-navy-band"
                id={`sluzba-${service.id}`}
                key={service.id}
                data-reveal="stagger"
                style={{ '--stagger': index } as React.CSSProperties}
              >
                <div className="service-navy-title-col">
                  <div className="service-navy-bar" aria-hidden="true" />
                  <h3>{service.title}</h3>
                  <p className="service-navy-short">{service.short}</p>
                </div>
                <div className="service-navy-body-col">
                  <p className="service-navy-desc">{service.description}</p>
                  <AppointmentLink className="site-link-inline site-link-inline-dark service-cta" topic={service.title}>
                    <span>{serviceCtaLabels[service.id] ?? 'Probrat možnosti'} →</span>
                  </AppointmentLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter C: Interactive Calculator (Warm Alabaster) */}
      <div className="section-band band-alabaster">
        <div className="section-shell">
          <FinanceCalculator />
        </div>
      </div>
    </section>
  );
}
