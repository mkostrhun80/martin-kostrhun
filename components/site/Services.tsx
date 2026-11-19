import { ButtonLabel } from './ButtonLabel';
import { AppointmentLink } from './AppointmentLink';
import { services } from '@/lib/content';

export function Services() {
  return <section id="sluzby" className="section services services-editorial services-unified" aria-labelledby="services-heading">
    <div className="services-intro"><h2 id="services-heading" className="display">S ČÍM<br/><em>POMÁHÁM.</em></h2><p>Od prvního bydlení po dlouhodobé zabezpečení. Vyberte oblast, kterou právě řešíte.</p></div>
    <div className="services-grid">{services.map(service => <article className="service-item services-card" id={`sluzba-${service.id}`} key={service.id}>
      <h3>{service.title}</h3>
      <p className="service-item-description">{service.description}</p>
      <AppointmentLink className="site-button" topic={service.title}><ButtonLabel>PROBRAT MOŽNOSTI</ButtonLabel></AppointmentLink>
    </article>)}</div>
  </section>;
}
