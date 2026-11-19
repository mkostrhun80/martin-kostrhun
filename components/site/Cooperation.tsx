import { ArrowRight } from 'lucide-react';
import { steps } from '@/lib/content';
import { assets } from '@/lib/site-config';
import { AppointmentLink } from './AppointmentLink';
import { PictureFrame } from './PictureFrame';

const stepPhases = [
  'První krok · Analýza',
  'Druhý krok · Návrh',
  'Třetí krok · Realizace',
  'Čtvrtý krok · Servis',
];

export function Cooperation() {
  return (
    <section id="spoluprace" className="section-band band-alabaster" aria-labelledby="cooperation-heading">
      <div className="section-shell cooperation-story">
        <div className="cooperation-sticky">
          <header className="section-header" data-reveal="mask" style={{ marginBottom: 0 }}>
            <h2 id="cooperation-heading" className="section-heading-display">
              Jak spolupráce probíhá.
            </h2>
            <p className="section-lead">
              Od prvního nezávazného seznámení přes srozumitelný návrh řešení až po pravidelný servis v dalších letech.
            </p>
          </header>

          <figure className="editorial-media" data-reveal="shutter">
            <PictureFrame spec={assets.responsive.process} className="editorial-plate" />
          </figure>

          <div>
            <AppointmentLink className="site-button">
              Domluvit první schůzku <ArrowRight size={16} aria-hidden="true" />
            </AppointmentLink>
          </div>
        </div>

        <ol className="cooperation-steps-list">
          {steps.map(([title, description], index) => (
            <li
              className="cooperation-step-card"
              key={title}
              data-process-step={index}
              data-reveal="stagger"
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <span className="cooperation-step-meta">{stepPhases[index]}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
