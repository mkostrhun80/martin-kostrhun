/* eslint-disable @next/next/no-img-element */
import { ButtonLabel } from './ButtonLabel';
import { AppointmentLink } from './AppointmentLink';
import { services } from '@/lib/content';
import { assets } from '@/lib/site-config';

export function Services() {
  return <section id="sluzby" className="section services services-editorial">
    <div className="services-intro"><h2 className="display">S ČÍM<br/><em>POMÁHÁM.</em></h2><p>Od prvního bydlení po dlouhodobé zabezpečení. Vyberte oblast, kterou právě řešíte.</p></div>
    {['Budovat', 'Chránit'].map((group, gi) => <div className={`service-chapter ${gi ? 'service-chapter-protect' : ''}`} key={group}>
      <div className="service-chapter-heading"><h3 className="display">{gi ? <>OCHRANA<br/>&amp; ZAJIŠTĚNÍ<em>.</em></> : <>BYDLENÍ<br/>&amp; INVESTICE<em>.</em></>}</h3>
        <figure><img src={gi ? assets.aboutPortrait : assets.editorialPortrait01} alt={gi ? '' : 'Martin Kostrhun při práci'} width="1200" height="800" loading={gi ? 'lazy' : 'eager'}/></figure>
      </div>
      <div className="service-chapter-items">{services.filter(s=>s.group===group).map(s=><article className="service-item" id={`sluzba-${s.id}`} key={s.id}>
        <div><h4>{s.title}</h4><p className="service-item-description">{s.description}</p><AppointmentLink className="site-button" topic={s.title}><ButtonLabel>PROBRAT MOŽNOSTI</ButtonLabel></AppointmentLink></div>
      </article>)}</div>
    </div>)}
  </section>;
}
