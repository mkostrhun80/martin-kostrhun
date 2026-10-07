/* eslint-disable @next/next/no-img-element */
import { services } from '@/lib/content';
import { assets } from '@/lib/site-config';

/** All six services stay visible in ordinary document flow, including without JS. */
export function Services() {
  return <section id="sluzby" className="section services services-editorial">
    <div className="section-top"><p className="eyebrow">03 / S ČÍM POMÁHÁM</p><p>To, na čem vám záleží.<br/>To, co má smysl řešit.</p></div>
    <p className="services-statement">NEJDŘÍV CÍL.<br/><em>POTOM ŘEŠENÍ.</em></p>
    <nav className="services-index" aria-label="Přejít na službu">{services.map((s,i)=><a key={s.id} href={`#sluzba-${s.id}`}><span>0{i+1}</span>{s.title}<span aria-hidden="true">↘</span></a>)}</nav>
    {['Budovat', 'Chránit'].map((group, gi) => <div className={`service-chapter ${gi ? 'service-chapter-protect' : ''}`} key={group}>
      <div className="service-chapter-heading"><span className="eyebrow">{gi ? '04 — 06 / JISTOTA' : '01 — 03 / MOŽNOSTI'}</span><h2 className="display">{group}<em>.</em></h2>
        <figure><img src={gi ? assets.aboutPortrait : assets.editorialPortrait01} alt="" width="1200" height="800" loading="lazy"/>{assets.isPlaceholder && <figcaption>ILUSTRAČNÍ PORTRÉT</figcaption>}</figure>
      </div>
      <div className="service-chapter-items">{services.filter(s=>s.group===group).map((s,i)=><article className="service-item" id={`sluzba-${s.id}`} key={s.id}>
        <span className="service-item-number" aria-hidden="true">0{gi*3+i+1}</span>
        <div><h3>{s.title}</h3><p className="service-item-short">{s.short}</p><p className="service-item-description">{s.description}</p><a className="text-link" href="#kontakt">PROBRAT MOŽNOSTI <span>↗</span></a></div>
      </article>)}</div>
    </div>)}
  </section>;
}
