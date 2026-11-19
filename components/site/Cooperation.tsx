import { ArrowRight } from 'lucide-react';
import { steps } from '@/lib/content';
import { AppointmentLink } from './AppointmentLink';

const stepDetails = ['Analýza', 'Návrh', 'Realizace', 'Servis'];

export function Cooperation() {
  return (
    <section id="spoluprace" className="section-band band-alabaster" aria-labelledby="cooperation-heading">
      <div className="section-shell">
        <header className="section-header">
          <h2 id="cooperation-heading" className="section-heading-display">
            Jak spolupráce probíhá.
          </h2>
          <p className="section-lead">
            Od prvního nezávazného seznámení přes srozumitelný návrh řešení až po pravidelný servis v dalších letech.
          </p>
        </header>

        <ol className="cooperation-grid">
          {steps.map(([title, description], index) => (
            <li className="cooperation-step-card" key={title}>
              <span className="cooperation-step-meta">
                {index + 1}. {stepDetails[index]}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>

        <div className="cooperation-footer-cta">
          <AppointmentLink className="site-button">
            Domluvit první schůzku <ArrowRight size={16} aria-hidden="true" />
          </AppointmentLink>
        </div>
      </div>
    </section>
  );
}
