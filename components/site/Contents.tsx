import { indexSections } from '@/lib/site-sections';
import { assets } from '@/lib/site-config';
import { PictureFrame } from './PictureFrame';

const principles = [
  {
    title: 'Srozumitelnost bez nátlaku',
    text: 'Nejdřív si vyjasníme čísla, možnosti i rizika. Rozhodnutí děláte vždy v klidu a s plným přehledem.',
  },
  {
    title: 'Srovnání napříč trhem',
    text: 'Porovnávám konkrétní parametry bank, pojišťoven a investičních institucí místo jednoho univerzálního produktu.',
  },
  {
    title: 'Dlouhodobá péče',
    text: 'Podpisem smlouvy servis začíná. Průběžně hlídáme sazby, podmínky i změny ve vaší životní situaci.',
  },
];

export function Contents() {
  return (
    <section id="obsah" className="section-band band-stone" aria-labelledby="contents-heading">
      <div className="section-shell contents-grid">
        <figure className="editorial-media">
          <PictureFrame spec={assets.responsive.contents} />
        </figure>

        <div className="contents-body">
          <header className="section-header">
            <h2 id="contents-heading" className="section-heading-display">
              Plán místo náhod.
            </h2>
            <p className="section-lead">
              Každá finanční oblast souvisí s ostatními. Zvolte téma, které právě řešíte, nebo projděte zásady naší spolupráce.
            </p>
          </header>

          <ol className="principles-list">
            {principles.map(item => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>

          <nav className="index-links-list" aria-label="Rychlé odkazy na části webu">
            {indexSections.map(section => (
              <a key={section.id} href={`#${section.id}`}>
                <span className="index-link-top">{section.label} →</span>
                <p>{section.description}</p>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
