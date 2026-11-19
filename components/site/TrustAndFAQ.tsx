import { ArrowUpRight, Plus } from 'lucide-react';
import { approvedReviews, defaultFAQ, type Review } from '@/lib/public-data';
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
      <span aria-label={`Hodnocení ${review.rating} z 5`}>
        {'★'.repeat(review.rating)}
        {'☆'.repeat(5 - review.rating)}
      </span>
    </article>
  );
}

export function Trust() {
  return (
    <section id="zkusenosti" className="section-band band-stone" aria-labelledby="reviews-heading">
      <div className="section-shell">
        <header className="section-header">
          <h2 id="reviews-heading" className="section-heading-display">
            Zkušenosti klientů.
          </h2>
          <p className="section-lead">
            Už jsme spolupracovali? Budu rád za vaši upřímnou zpětnou vazbu — pomůže mi držet úroveň služeb a ostatním dá reálný obrázek.
          </p>
        </header>

        {approvedReviews.length === 0 ? (
          <div className="trust-pillars" aria-label="Ověřitelnost spolupráce">
            <div className="trust-pillar-card">
              <strong>Registr České národní banky</strong>
              <p>Oprávnění pro investice, úvěry, pojištění i penze si kdykoli ověříte pod IČO 23315598.</p>
            </div>
            <div className="trust-pillar-card">
              <strong>Více než 68 partnerů</strong>
              <p>Nabídky srovnávám napříč hlavními českými bankami, pojišťovnami a investičními domy.</p>
            </div>
            <div className="trust-pillar-card">
              <strong>Pouze reálné reference</strong>
              <p>Na webu nepublikuji smyšlené citáty. Zkušenost se zveřejní až po vzájemné spolupráci a vašem souhlasu.</p>
            </div>
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
    <section id="otazky" className="section-band band-stone" aria-labelledby="faq-heading">
      <div className="section-shell faq-layout">
        <header className="section-header">
          <h2 id="faq-heading" className="section-heading-display">
            Časté otázky.
          </h2>
          <p className="section-lead">
            Co klienty nejčastěji zajímá před první nezávaznou schůzkou.
          </p>
        </header>

        <div className="faq-list">
          {defaultFAQ.map(faq => (
            <details id={`otazka-${faq.id}`} key={faq.id}>
              <summary>
                <span>{faq.question}</span>
                <span className="faq-toggle-icon" aria-hidden="true">
                  <Plus size={20} strokeWidth={1.75} />
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
