import { approvedReviews, defaultFAQ, type Review } from '@/lib/public-data';
import { FeedbackExperience } from './FeedbackExperience';
import { FeedbackDisclosure } from './FeedbackDisclosure';
export function ReviewCard({ review }: { review: Review }) {
  return <article className="review-card"><p className="review-text">„{review.text}“</p><div><strong>{review.displayName}</strong><span>{review.verified ? 'Ověřená spolupráce' : 'Neověřená recenze'}</span><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' })}</time></div><span className="review-rating" aria-label={`Hodnocení ${review.rating} z 5`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></article>;
}
export function Trust() {
  return <section id="zkusenosti" className="page-section trust-new feedback-section" aria-labelledby="reviews-heading">
    <div className="feedback-panel"><div className="feedback-intro"><p className="feedback-audience">PRO STÁVAJÍCÍ KLIENTY</p><h2 id="reviews-heading"><span>Zkušenosti</span><span>ze spolupráce.</span></h2><p>Už jsme spolupracovali? Budu rád za vaše hodnocení — co vám spolupráce přinesla a co mohu zlepšit.</p><a href="#kontakt" className="feedback-contact-link">Chcete se teprve na něco zeptat? Napište mi ↗</a></div>
    <FeedbackDisclosure><FeedbackExperience/></FeedbackDisclosure></div>
    {approvedReviews.length > 0 && <><h3>Vybrané zkušenosti klientů</h3><div className="review-grid">{approvedReviews.map(review => <ReviewCard key={review.id} review={review}/>)}</div><p className="review-method">Spolupráci ověřuji podle evidence klientů. Zveřejněné zkušenosti vybírám ručně se souhlasem autora; e-mail zůstává soukromý. Výběr nepředstavuje všechna obdržená hodnocení.</p></>}
  </section>;
}
export function FAQ() {
  return <section id="otazky" className="page-section faq-new" aria-labelledby="faq-heading"><div className="section-heading"><h2 id="faq-heading">Časté otázky<span>.</span></h2><p>Praktické odpovědi před první schůzkou.</p></div><div className="faq-list">{defaultFAQ.map(f => <details key={f.id}><summary>{f.question}<span aria-hidden="true">＋</span></summary><p>{f.answer}</p></details>)}</div></section>;
}
