'use client';
import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CONTACT_ACTION, deliverFeedback, emptyFeedbackDraft, FEEDBACK_CONSENT_TEXT, validateFeedback, type FeedbackDraft } from '@/lib/email-contact';
import { formsReady } from '@/lib/form-config';
import { siteConfig } from '@/lib/site-config';
import { CaptchaGate } from './CaptchaGate';

export function FeedbackExperience() {
  const [draft, setDraft] = useState<FeedbackDraft>({ ...emptyFeedbackDraft });
  const [errors, setErrors] = useState<ReturnType<typeof validateFeedback>>({});
  const [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [notice, setNotice] = useState('');
  const [token, setToken] = useState(''), [reset, setReset] = useState(0);
  const inFlight = useRef(false), form = useRef<HTMLFormElement>(null);
  const update = <K extends keyof FeedbackDraft>(key: K, value: FeedbackDraft[K]) => { setDraft(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); setNotice(''); setSent(false); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current) return;
    if (!formsReady) { setNotice('Zpětnou vazbu mi prosím pošlete přímo e-mailem.'); return; }
    const issues = validateFeedback(draft); setErrors(issues); setNotice(''); setSent(false);
    const first = Object.keys(issues)[0];
    if (first) { form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    if (draft.website || !token) { setNotice('Nejprve prosím dokončete ověření hCaptcha.'); return; }
    inFlight.current = true; setBusy(true);
    try {
      const result = await deliverFeedback(draft, location.origin + location.pathname + '#zkusenosti', token);
      if (result === 'sent') { setDraft({ ...emptyFeedbackDraft }); setSent(true); setNotice('Děkuji. Zpětná vazba byla odeslána Martinovi e-mailem. Na webu se automaticky nezveřejní.'); }
      else setNotice('Přijetí zpětné vazby se nepodařilo potvrdit. Text zůstal vyplněný. Zkuste to později nebo napište přímo e-mailem.');
    } catch { setNotice('Odeslání se nepodařilo potvrdit. Text zůstal vyplněný. Zkuste to později nebo napište přímo e-mailem.'); }
    finally { inFlight.current = false; setBusy(false); setToken(''); setReset(value => value + 1); }
  }
  const error = (key: keyof FeedbackDraft) => errors[key] ? <span className="email-field-error" id={`feedback-${key}-error`}>{errors[key]}</span> : null;
  const field = (key: keyof FeedbackDraft) => ({ id: `feedback-${key}`, name: key, disabled: busy, 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `feedback-${key}-error` : undefined });
  return <form ref={form} id="zpetna-vazba" className="plain-form feedback-form" action={CONTACT_ACTION} method="POST" onSubmit={submit} noValidate aria-labelledby="feedback-heading" aria-busy={busy}>
    <h3 id="feedback-heading">Jak se vám se mnou spolupracovalo?</h3><p>Zajímá mě, co vám spolupráce přinesla a co mohu zlepšit.</p>
    <div className="form-pair"><label htmlFor="feedback-name">Vaše jméno<input {...field('name')} required autoComplete="name" minLength={2} maxLength={100} value={draft.name} onChange={event => update('name', event.target.value)}/>{error('name')}</label><label htmlFor="feedback-email">Soukromý e-mail<input {...field('email')} required type="email" autoComplete="email" maxLength={150} value={draft.email} onChange={event => update('email', event.target.value)}/>{error('email')}</label></div>
    <label htmlFor="feedback-rating">Hodnocení spolupráce<select {...field('rating')} required value={draft.rating} onChange={event => update('rating', event.target.value ? Number(event.target.value) : '')}><option value="" disabled>Vyberte hodnocení</option>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} z 5</option>)}</select>{error('rating')}</label>
    <label htmlFor="feedback-message">Vaše zkušenost<textarea {...field('message')} required minLength={10} maxLength={3000} rows={5} value={draft.message} onChange={event => update('message', event.target.value)}/>{error('message')}</label>
    <label className="email-trap" aria-hidden="true">Webová stránka<input name="website" tabIndex={-1} autoComplete="off" value={draft.website} onChange={event => update('website', event.target.value)}/></label>
    <label className="consent-row"><input type="checkbox" name="consent" disabled={busy} checked={draft.consent} onChange={event => update('consent', event.target.checked)}/><span>{FEEDBACK_CONSENT_TEXT} (Dobrovolné.)</span></label>
    {draft.consent && <label htmlFor="feedback-displayName">Jméno pro zveřejnění<input {...field('displayName')} required minLength={2} maxLength={100} value={draft.displayName} onChange={event => update('displayName', event.target.value)} placeholder="Například Jana K. nebo anonymně"/>{error('displayName')}</label>}
    <p className="form-note">E-mail nezveřejňuji. Zkušenosti zveřejňuji ručně po ověření spolupráce a pouze s vaším souhlasem. Souhlas odvoláte na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Neuvádějte čísla smluv ani citlivé údaje. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>
    {formsReady ? <CaptchaGate onToken={setToken} resetKey={reset}/> : <p className="form-note">Zpětnou vazbu mi zatím pošlete <a href={`mailto:${siteConfig.email}`}>přímo e-mailem</a>.</p>}
    {notice && <p className={sent ? 'feedback-sent' : 'form-error'} role={sent ? 'status' : 'alert'}>{notice}</p>}
    <button className="site-button" type="submit" disabled={busy || !formsReady || !token}>{busy ? 'Odesílám…' : 'Odeslat zpětnou vazbu'}</button>
  </form>;
}
