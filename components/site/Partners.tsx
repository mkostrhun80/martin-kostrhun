'use client';
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type Partner, type PartnerCategory } from '@/lib/partners';
import { filterPartners } from '@/lib/partner-motion';
import { sitePath } from '@/lib/site-path';

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div
      className="partner-logo-card"
      data-logo-light={partner.logoLight ? 'true' : undefined}
    >
      {partner.logo ? (
        <img
          src={sitePath(partner.logo)}
          alt={partner.name}
          width={140}
          height={44}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <strong>{partner.shortName}</strong>
      )}
    </div>
  );
}

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [showAll, setShowAll] = useState(false);

  const selection = useMemo(() => filterPartners(partners, category), [category]);

  const featuredAll = useMemo(() => {
    const picks: Partner[] = [];
    const seenLogos = new Set<string>();
    for (const cat of ['Banky a úvěry', 'Investice', 'Pojištění', 'Penzijní spoření'] as const) {
      let added = 0;
      for (const partner of partners) {
        if (partner.category !== cat || !partner.logo || seenLogos.has(partner.logo)) continue;
        seenLogos.add(partner.logo);
        picks.push(partner);
        added++;
        if (added >= 3) break;
      }
    }
    return picks;
  }, []);

  const visiblePartners = category === 'Všichni' && !showAll ? featuredAll : selection;

  return (
    <section
      id="zazemi"
      className="section-band band-linen"
      aria-labelledby="partners-heading"
    >
      <div className="section-shell">
        <header className="section-header" data-reveal="mask">
          <h2 id="partners-heading" className="section-heading-display">
            Zázemí eDO finance.
          </h2>
          <p className="section-lead">
            Díky zázemí eDO finance mám přístup k desítkám bank, pojišťoven a investičních partnerů. Konkrétní řešení vybírám podle vaší situace, nikoli podle jedné značky.
          </p>
        </header>

        <div className="partners-controls-bar">
          <div className="partner-category-tabs" role="group" aria-label="Oblast partnerů">
            {(['Všichni', ...partnerCategories] as const).map(value => (
              <button
                type="button"
                key={value}
                aria-pressed={category === value}
                onClick={() => {
                  setCategory(value);
                  setShowAll(false);
                }}
              >
                {value}
              </button>
            ))}
          </div>

          {category === 'Všichni' && (
            <button
              type="button"
              className="partner-expand-btn"
              aria-expanded={showAll}
              onClick={() => setShowAll(value => !value)}
            >
              {showAll ? 'Zobrazit výběr institucí' : `Zobrazit všechny (${partners.length})`}
            </button>
          )}
        </div>

        <div className="partner-static-grid" aria-label="Přehled finančních partnerů">
          {visiblePartners.map(partner => (
            <PartnerCard key={`${partner.category}-${partner.name}`} partner={partner} />
          ))}
        </div>

        <div className="partner-meta-row">
          <p aria-live="polite">
            {selection.length} partnerů · {category === 'Všichni' ? '5 oblastí' : category}
          </p>
          <a className="site-link-inline" href={partnersSource} target="_blank" rel="noreferrer">
            Úplné informace o partnerech eDO finance <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <details className="partner-directory">
          <summary>Abecední přehled všech finančních partnerů v této oblasti ({selection.length})</summary>
          <ul>
            {selection.map(partner => (
              <li key={`${partner.category}-dir-${partner.name}`}>
                <strong>{partner.name}</strong>
                <span>{partner.category}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
