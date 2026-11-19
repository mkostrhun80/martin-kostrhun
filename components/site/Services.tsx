import { services } from '@/lib/content';
import { AppointmentLink } from './AppointmentLink';
import { FinanceCalculator } from './FinanceCalculator';

const serviceCtaLabels: Record<string, string> = {
  investice: 'Nastavit investice →',
  bydleni: 'Probrat hypotéku →',
  plan: 'Sestavit finanční plán →',
  pojisteni: 'Prověřit pojištění →',
  stari: 'Naplánovat zajištění →',
  podnikani: 'Řešit firemní finance →',
};

const groups = [
  {
    key: 'Budovat',
    title: 'Budovat majetek a bydlení',
    subtitle: 'Financování nemovitostí, systematické investování a jeden propojený plán.',
  },
  {
    key: 'Chránit',
    title: 'Chránit příjem a budoucnost',
    subtitle: 'Zajištění rodiny, dlouhodobá rezerva na stáří a ochrana podnikání.',
  },
] as const;

export function Services() {
  return (
    <section id="sluzby" className="section-band band-alabaster" aria-labelledby="services-heading">
      <div className="section-shell">
        <header className="section-header">
          <h2 id="services-heading" className="section-heading-display">
            S čím pomáhám.
          </h2>
          <p className="section-lead">
            Od prvního bydlení po dlouhodobé zabezpečení. Vyberte oblast, kterou právě řešíte, nebo si udělejte rychlý orientační propočet.
          </p>
        </header>

        <div className="services-groups">
          {groups.map(group => {
            const items = services.filter(service => service.group === group.key);
            return (
              <div className="service-group" key={group.key}>
                <p className="service-group-title">{group.title}</p>
                <p className="service-group-sub">{group.subtitle}</p>
                {items.map(service => (
                  <article
                    className="service-ledger-row"
                    id={`sluzba-${service.id}`}
                    key={service.id}
                  >
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <AppointmentLink className="site-link-inline service-cta" topic={service.title}>
                      {serviceCtaLabels[service.id] ?? 'Probrat možnosti →'}
                    </AppointmentLink>
                  </article>
                ))}
              </div>
            );
          })}
        </div>

        <FinanceCalculator />
      </div>
    </section>
  );
}
