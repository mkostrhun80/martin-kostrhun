import { ArrowUpRight, Star } from 'lucide-react';
import { approvedReviews, defaultFAQ, type Review } from '@/lib/public-data';
import { siteConfig } from '@/lib/site-config';
import { FeedbackExperience } from './FeedbackExperience';
import { FeedbackDisclosure } from './FeedbackDisclosure';

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card">
      <p className="review-text">„{review.text}“</p>
      <div>
        <strong>{review.displayName}</strong> ·{' '}
        <span>{review.verified ? 'Ověřená spolupráce' : 'Neověřená recenze'}</span> ·{' '}
        <time dateTime={review.createdAt}>
          {new Date(review.createdAt).toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' })}
        </time>
      </div>
      <span
        style={{ display: 'inline-flex', gap: '3px', color: 'var(--accent-bronze-dark)' }}
        aria-label={`Hodnocení ${review.rating} z 5`}
      >
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            size={15}
            fill={n <= review.rating ? 'currentColor' : 'none'}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        ))}
      </span>
    </article>
  );
}

export function Trust() {
  return (
    <section id="zkusenosti" className="section-band band-alabaster" aria-labelledby="reviews-heading">
      <div className="section-shell">
        <header className="section-header" data-reveal="mask">
          <h2 id="reviews-heading" className="section-heading-display">
            Zkušenosti klientů.
          </h2>
          <p className="section-lead">
            Už jsme spolupracovali? Budu rád za vaši upřímnou zpětnou vazbu — pomůže mi držet úroveň služeb a ostatním dá reálný obrázek.
          </p>
        </header>

        {approvedReviews.length === 0 ? (
          <div className="trust-pillars" aria-label="Ověřitelnost spolupráce">
            <article className="trust-pillar-card" data-reveal="stagger" style={{ '--stagger': 0 } as React.CSSProperties}>
              <h3>Registr ČNB</h3>
              <p>Oprávnění pro investice, úvěry, pojištění i penze si kdykoli ověříte pod IČO 23315598.</p>
            </article>
            <article className="trust-pillar-card" data-reveal="stagger" style={{ '--stagger': 1 } as React.CSSProperties}>
              <h3>Více než 68 partnerů</h3>
              <p>Nabídky srovnávám napříč hlavními českými bankami, pojišťovnami a investičními domy.</p>
            </article>
            <article className="trust-pillar-card" data-reveal="stagger" style={{ '--stagger': 2 } as React.CSSProperties}>
              <h3>Pouze reálné reference</h3>
              <p>Na webu nepublikuji smyšlené citáty. Zkušenost se zveřejní až po vzájemné spolupráci a vašem souhlasu.</p>
            </article>
          </div>
        ) : (
          <>
            <div className="review-grid">
              {approvedReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            <p className="form-note">
              Spolupráci ověřuji podle evidence klientů. Zveřejněné zkušenosti vybírám ručně se souhlasem autora; e-mail zůstává soukromý.
            </p>
          </>
        )}

        <FeedbackDisclosure>
          <FeedbackExperience />
        </FeedbackDisclosure>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section id="otazky" className="section-band band-linen" aria-labelledby="faq-heading">
      <div className="section-shell faq-layout">
        <div className="faq-header-sticky">
          <header className="section-header" data-reveal="mask" style={{ marginBottom: 0 }}>
            <h2 id="faq-heading" className="section-heading-display">
              Časté otázky.
            </h2>
            <p className="section-lead">
              Co klienty nejčastěji zajímá před první nezávaznou schůzkou — včetně odměňování a registrace u ČNB.
            </p>
          </header>

          <a className="site-link-inline faq-registry-link" href={siteConfig.registryUrl} target="_blank" rel="noreferrer">
            Ověřit oprávnění v registru ČNB <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="faq-list">
          {defaultFAQ.map(faq => (
            <details id={`otazka-${faq.id}`} key={faq.id}>
              <summary>
                <span>{faq.question}</span>
                <span className="faq-toggle-mark" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="faq-answer">
                <p>
                  {faq.answer}
                  {faq.source && (
                    <>
                      {' '}
                      <a href={faq.source.href} target="_blank" rel="noreferrer">
                        {faq.source.label} <ArrowUpRight size={14} style={{ display: 'inline' }} aria-hidden="true" />
                      </a>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
