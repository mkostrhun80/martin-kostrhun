import { steps } from '@/lib/content';
import { AppointmentLink } from './AppointmentLink';
import { ButtonLabel } from './ButtonLabel';

const stepDetails = ['Osobně i online', 'Podle vašich cílů', 'Společně', 'Průběžně'];

export function Cooperation() {
  return <section id="spoluprace" className="section cooperation" aria-labelledby="cooperation-heading">
    <header className="cooperation-heading">
      <p className="eyebrow cooperation-label">POSTUP SPOLUPRÁCE</p>
      <h2 id="cooperation-heading" className="display">JAK SPOLUPRÁCE<br/><em>PROBÍHÁ.</em></h2>
    </header>
    <ol className="cooperation-timeline" role="list">
      {steps.map(([title, description], index) => <li className="cooperation-step" key={title}>
        <span className="cooperation-dot" aria-hidden="true"/>
        <article className="cooperation-card" aria-labelledby={`cooperation-step-${index + 1}`}>
          <div className="cooperation-card-meta">
            <span className="cooperation-number" aria-hidden="true">{index + 1}</span>
            <span className="cooperation-detail">{stepDetails[index]}</span>
          </div>
          <h3 id={`cooperation-step-${index + 1}`}>{title}</h3>
          <p>{description}</p>
        </article>
      </li>)}
    </ol>
    <div className="cooperation-action"><AppointmentLink><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink></div>
  </section>;
}
