'use client';

import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import Link from 'next/link';
import { LoaderCircle, Star } from 'lucide-react';
import {
  CONTACT_ACTION,
  deliverFeedback,
  emptyFeedbackDraft,
  FEEDBACK_CONSENT_TEXT,
  validateFeedback,
  type FeedbackDraft,
} from '@/lib/email-contact';
import { formsReady } from '@/lib/form-config';
import { siteConfig } from '@/lib/site-config';
import { CaptchaGate } from './CaptchaGate';
import { SafeEmailLink } from './SafeEmailLink';

const noopSubscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

const ratingLabels: Record<number, string> = {
  1: '1 z 5 (velmi slabé)',
  2: '2 z 5 (slabší)',
  3: '3 z 5 (dobré)',
  4: '4 z 5 (velmi dobré)',
  5: '5 z 5 (výborné)',
};

export function FeedbackExperience() {
  const hydrated = useSyncExternalStore(noopSubscribe, getClient, getServer);
  const [draft, setDraft] = useState<FeedbackDraft>({ ...emptyFeedbackDraft });
  const [errors, setErrors] = useState<ReturnType<typeof validateFeedback>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState('');
  const [token, setToken] = useState('');
  const [reset, setReset] = useState(0);
  const [captchaAttention, setCaptchaAttention] = useState(false);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);

  const update = <K extends keyof FeedbackDraft>(key: K, value: FeedbackDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setNotice('');
    setSent(false);
  };

  function handleDirectMailto() {
    const subject = encodeURIComponent('Zpětná vazba — spolupráce s Martinem Kostrhunem');
    const body = encodeURIComponent(
      `Jméno: ${draft.name}\nHodnocení: ${draft.rating || 'neuvedeno'}/5\nZkušenost:\n${draft.message}\n\nSouhlas se zveřejněním (${draft.displayName}): ${draft.consent ? 'ANO' : 'NE'}`,
    );
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const issues = validateFeedback(draft);
    setErrors(issues);
    setNotice('');
    setSent(false);
    setCaptchaAttention(false);

    const first = Object.keys(issues)[0];
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    if (!formsReady) {
      handleDirectMailto();
      setNotice('Formulář otevře e-mailovou zprávu předvyplněnou vašimi údaji.');
      return;
    }

    if (draft.website) {
      setNotice('Odeslání se nepodařilo potvrdit. Zkuste to prosím znovu.');
      return;
    }

    if (!token) {
      setCaptchaAttention(true);
      setNotice('Před odesláním prosím povolte a dokončete ověření proti spamu (hCaptcha) níže.');
      const gate = form.current?.querySelector<HTMLElement>('[data-captcha-gate]');
      gate?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.current?.querySelector<HTMLElement>('[data-captcha-enable]')?.focus({ preventScroll: true });
      return;
    }

    inFlight.current = true;
    setBusy(true);
    try {
      const result = await deliverFeedback(draft, location.origin + location.pathname + '#zkusenosti', token);
      if (result === 'sent') {
        setDraft({ ...emptyFeedbackDraft });
        setSent(true);
        setNotice('Děkuji. Zpětná vazba byla odeslána Martinovi e-mailem. Na webu se automaticky nezveřejní.');
      } else {
        setNotice('Přijetí zpětné vazby se nepodařilo potvrdit. Text zůstal vyplněný. Zkuste to později nebo napište přímo e-mailem.');
      }
    } catch {
      setNotice('Odeslání se nepodařilo potvrdit. Text zůstal vyplněný. Zkuste to později nebo napište přímo e-mailem.');
    } finally {
      inFlight.current = false;
      setBusy(false);
      setToken('');
      setReset(value => value + 1);
    }
  }

  const error = (key: keyof FeedbackDraft) =>
    errors[key] ? (
      <span className="email-field-error" id={`feedback-${key}-error`}>
        {errors[key]}
      </span>
    ) : null;

  const field = (key: keyof FeedbackDraft) => ({
    id: `feedback-${key}`,
    name: key,
    disabled: busy,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `feedback-${key}-error` : undefined,
  });

  return (
    <form
      ref={form}
      id="zpetna-vazba"
      className="plain-form feedback-form"
      action={CONTACT_ACTION}
      method="POST"
      onSubmit={submit}
      noValidate
      aria-labelledby="feedback-heading"
      aria-busy={busy}
    >
      <h3 id="feedback-heading">Jak se vám se mnou spolupracovalo?</h3>
      <p className="section-lead">Zajímá mě, co vám spolupráce přinesla a co mohu zlepšit.</p>

      <div className="field-grid-pair">
        <label className="field-label" htmlFor="feedback-name">
          Vaše jméno
          <input
            {...field('name')}
            required
            autoComplete="name"
            minLength={2}
            maxLength={100}
            placeholder="Jméno a příjmení"
            value={draft.name}
            onChange={event => update('name', event.target.value)}
          />
          {error('name')}
        </label>

        <label className="field-label" htmlFor="feedback-email">
          Soukromý e-mail
          <input
            {...field('email')}
            required
            type="email"
            autoComplete="email"
            maxLength={150}
            placeholder="vas@email.cz"
            value={draft.email}
            onChange={event => update('email', event.target.value)}
          />
          {error('email')}
        </label>
      </div>

      <fieldset className="rating-fieldset" aria-invalid={!!errors.rating} aria-describedby={errors.rating ? 'feedback-rating-error' : undefined}>
        <legend>Hodnocení spolupráce</legend>
        <div className="rating-stars-row">
          {[1, 2, 3, 4, 5].map(n => {
            const selected = Number(draft.rating) === n;
            const filled = Number(draft.rating) >= n;
            return (
              <label
                key={n}
                className="rating-option"
                data-selected={selected ? 'true' : undefined}
                aria-label={ratingLabels[n]}
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={selected}
                  disabled={busy}
                  onChange={() => update('rating', n)}
                />
                <Star
                  size={16}
                  fill={filled ? 'currentColor' : 'none'}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{n}</span>
              </label>
            );
          })}
        </div>
        {error('rating')}
      </fieldset>

      <label className="field-label" htmlFor="feedback-message">
        Vaše zkušenost
        <textarea
          {...field('message')}
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          placeholder="Co jsme spolu řešili a jak jste byl/a se spoluprací spokojený/á?"
          value={draft.message}
          onChange={event => update('message', event.target.value)}
        />
        {error('message')}
      </label>

      <label className="email-trap" aria-hidden="true">
        Webová stránka
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={draft.website}
          onChange={event => update('website', event.target.value)}
        />
      </label>

      <label className="consent-row">
        <input
          type="checkbox"
          name="consent"
          disabled={busy}
          checked={draft.consent}
          onChange={event => update('consent', event.target.checked)}
        />
        <span>{FEEDBACK_CONSENT_TEXT} (Dobrovolné.)</span>
      </label>

      {draft.consent && (
        <label className="field-label" htmlFor="feedback-displayName">
          Jméno pro zveřejnění
          <input
            {...field('displayName')}
            required
            minLength={2}
            maxLength={100}
            value={draft.displayName}
            onChange={event => update('displayName', event.target.value)}
            placeholder="Například Jana K. nebo anonymně"
          />
          {error('displayName')}
        </label>
      )}

      <p className="form-note">
        E-mail nezveřejňuji. Zkušenosti zveřejňuji ručně po ověření spolupráce a pouze s vaším souhlasem. Souhlas odvoláte na{' '}
        <SafeEmailLink />. Neuvádějte čísla smluv ani citlivé údaje.{' '}
        <Link href="/dokumenty/osobni-udaje" prefetch={false}>Ochrana osobních údajů</Link>.
      </p>

      {formsReady ? (
        <CaptchaGate onToken={t => { setToken(t); if (t) setCaptchaAttention(false); }} resetKey={reset} attention={captchaAttention} />
      ) : (
        <p className="form-note">
          Přímé odeslání přes web není v náhledu aktivní — po vyplnění vám tlačítko níže otevře předvyplněný e-mail, nebo napište na <SafeEmailLink />.
        </p>
      )}

      {notice && (
        <p className={sent ? 'feedback-sent' : 'form-error'} role={sent ? 'status' : 'alert'}>
          {notice}
        </p>
      )}

      <div>
        <button className="site-button" type="submit" disabled={!hydrated || busy}>
          {busy ? (
            <>
              <LoaderCircle className="email-spinner" size={16} aria-hidden="true" /> Odesílám…
            </>
          ) : (
            'Odeslat zpětnou vazbu'
          )}
        </button>
      </div>

      <noscript>
        <p className="form-note">
          Pro odeslání bez JavaScriptu nám prosím napište přímo na{' '}
          <a href="mailto:martin.kostrhun@edofinance.cz">martin.kostrhun@edofinance.cz</a>.
        </p>
      </noscript>
    </form>
  );
}
