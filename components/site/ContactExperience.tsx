'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, LoaderCircle, Mail, MapPin, Phone, Send, X } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import {
  CONTACT_ACTION,
  CONTACT_PUBLIC_KEY,
  deliverContactEmail,
  emptyEmailDraft,
  validateEmailContact,
  type EmailDraft,
  type EmailErrors,
} from '@/lib/email-contact';
import { liveBookingEvents } from '@/lib/booking-config';
import { AppointmentBooking } from './AppointmentBooking';
import { CaptchaGate } from './CaptchaGate';
import { formsReady } from '@/lib/form-config';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PictureFrame } from './PictureFrame';
import { SafeEmailLink } from './SafeEmailLink';

const noopSubscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

const topics = [
  'Hypotéky & bydlení',
  'Investice',
  'Finanční plán',
  'Životní pojištění',
  'Zajištění na stáří',
  'Podnikatelské finance',
  'Něco jiného',
];

type Notice = { kind: 'sent' | 'activation' | 'error'; text: string } | null;

type Model = {
  hydrated: boolean;
  draft: EmailDraft;
  errors: EmailErrors;
  busy: boolean;
  notice: Notice;
  captchaToken: string;
  captchaAttention: boolean;
  captchaReset: number;
  focusName: () => void;
  update: (field: keyof EmailDraft, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  setCaptchaToken: (token: string) => void;
};

function Field({
  model,
  field,
  label,
  placeholder,
  rows = 4,
  select = false,
}: {
  model: Model;
  field: 'name' | 'email' | 'message' | 'topic';
  label: string;
  placeholder?: string;
  rows?: number;
  select?: boolean;
}) {
  const id = 'contact-email-' + field;
  const error = field === 'topic' ? undefined : model.errors[field];
  const common = {
    id,
    name: field === 'topic' ? 'topic' : field,
    value: model.draft[field],
    disabled: model.busy,
    required: field !== 'topic',
    'aria-invalid': !!error,
    'aria-describedby': error ? id + '-error' : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      model.update(field, event.target.value),
  };

  return (
    <label className="field-label" htmlFor={id}>
      <span>{label}</span>
      {field === 'message' ? (
        <textarea {...common} placeholder={placeholder} minLength={10} maxLength={3000} rows={rows} />
      ) : select ? (
        <select {...common}>
          <option value="">Obecný dotaz</option>
          {model.draft.topic && !topics.includes(model.draft.topic) && <option>{model.draft.topic}</option>}
          {topics.map(topic => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={field === 'email' ? 'email' : 'text'}
          autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : undefined}
          placeholder={placeholder}
          minLength={field === 'name' ? 2 : undefined}
          maxLength={field === 'name' ? 100 : field === 'email' ? 150 : 120}
        />
      )}
      {error && (
        <span className="email-field-error" id={id + '-error'}>
          {error}
        </span>
      )}
    </label>
  );
}

function Form({
  model,
  formRef,
  children,
}: {
  model: Model;
  formRef: RefObject<HTMLFormElement | null>;
  children: ReactNode;
}) {
  return (
    <form
      ref={formRef}
      className="contact-form-card"
      action={CONTACT_ACTION}
      method="POST"
      noValidate
      onSubmit={model.submit}
      aria-busy={model.busy}
      aria-labelledby="contact-title"
    >
      {children}
      <input type="hidden" name="access_key" value={CONTACT_PUBLIC_KEY} />
      <input
        type="hidden"
        name="subject"
        value={'Web Martina Kostrhuna — ' + (model.draft.topic || 'Nová zpráva')}
      />
      <input type="hidden" name="from_name" value="Web Martina Kostrhuna" />
      <label className="email-trap" aria-hidden="true">
        Webová stránka
        <input
          type="text"
          name="botcheck"
          value={model.draft.website}
          onChange={event => model.update('website', event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      {model.notice && (
        <div
          className={'email-notice email-notice-' + model.notice.kind}
          role={model.notice.kind === 'sent' ? 'status' : 'alert'}
        >
          {model.notice.kind === 'sent' && <Check size={18} aria-hidden="true" />}
          <p>
            {model.notice.text}
            {model.notice.kind !== 'sent' && (
              <>
                {' '}
                <SafeEmailLink>Napsat přímo e-mailem</SafeEmailLink>.
              </>
            )}
          </p>
        </div>
      )}
    </form>
  );
}

function ContactCard({ model, formRef }: { model: Model; formRef: RefObject<HTMLFormElement | null> }) {
  const { draft } = model;
  const [bookingOpen, setBookingOpen] = useState(false);
  const focusMessage = useRef(false);

  return (
    <div className="contact-grid">
      <div className="contact-sidebar">
        <header className="section-header" data-reveal="mask" style={{ marginBottom: 0 }}>
          <h2 id="contact-title" className="section-heading-display">
            Domluvme si schůzku.
          </h2>
          <p className="section-lead">
            Napište mi, s čím vám mohu pomoci, nebo si rovnou vyberte termín devadesátiminutové úvodní konzultace.
          </p>
        </header>

        <div className="contact-details-list">
          <SafeEmailLink className="contact-detail-row">
            <span className="contact-detail-main">
              <Mail size={18} aria-hidden="true" />
              <span>
                <strong>E-mail</strong>
                <span>{siteConfig.email.replace('@', '\u200B@\u200B')}</span>
              </span>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </SafeEmailLink>

          <a href={siteConfig.phoneHref} className="contact-detail-row">
            <span className="contact-detail-main">
              <Phone size={18} aria-hidden="true" />
              <span>
                <strong>Telefon</strong>
                <span>{siteConfig.phone}</span>
              </span>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <div className="contact-detail-row">
            <span className="contact-detail-main">
              <MapPin size={18} aria-hidden="true" />
              <span>
                <strong>Kde se potkáme</strong>
                <span>
                  {siteConfig.address}, {siteConfig.city}
                </span>
              </span>
            </span>
          </div>
        </div>

        <figure className="editorial-media" data-reveal="shutter">
          <PictureFrame spec={assets.responsive.contact} className="editorial-plate" />
        </figure>
      </div>

      <Form model={model} formRef={formRef}>
        <div id="rezervace" className="contact-booking-callout">
          <p>
            {liveBookingEvents.length
              ? 'Chcete konkrétní termín v kalendáři (cca 90 min)?'
              : 'Online výběr termínu se připravuje — domluvíme se zprávou.'}
          </p>
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger className="contact-booking-trigger">
              <CalendarDays size={18} aria-hidden="true" />
              <span>Vybrat termín online</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </DialogTrigger>
            <DialogContent
              className="contact-booking-dialog"
              showCloseButton={false}
              onCloseAutoFocus={event => {
                if (!focusMessage.current) return;
                event.preventDefault();
                focusMessage.current = false;
                model.focusName();
              }}
            >
              <DialogTitle className="sr-only">Rezervace schůzky</DialogTitle>
              <DialogDescription className="sr-only">
                {liveBookingEvents.length
                  ? 'Vyberte si volný termín 90minutové konzultace.'
                  : 'Domluvte si termín konzultace zprávou nebo e-mailem.'}
              </DialogDescription>
              <DialogClose className="contact-booking-close" aria-label="Zavřít rezervaci">
                <X size={20} aria-hidden="true" />
              </DialogClose>
              <AppointmentBooking
                onContact={() => {
                  focusMessage.current = true;
                  setBookingOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="field-grid-pair">
          <Field model={model} field="name" label="Vaše jméno" placeholder="Jméno a příjmení" />
          <Field model={model} field="email" label="E-mail" placeholder="vas@email.cz" />
        </div>

        <Field model={model} field="topic" label="O čem si napíšeme?" select />
        <Field
          model={model}
          field="message"
          label="Vaše zpráva"
          placeholder="Dobrý den, Martine, rád/a bych s vámi probral/a…"
          rows={4}
        />

        {formsReady ? (
          <CaptchaGate
            onToken={model.setCaptchaToken}
            resetKey={model.captchaReset}
            attention={model.captchaAttention}
          />
        ) : (
          <p className="form-note">
            Přímé odeslání přes web není v náhledu aktivní — po vyplnění vám tlačítko níže otevře předvyplněný e-mail, nebo napište na <SafeEmailLink />.
          </p>
        )}

        <div className="form-submit-row">
          <button className="site-button" type="submit" disabled={!model.hydrated || model.busy}>
            {model.busy ? (
              <>
                <LoaderCircle className="email-spinner" size={16} aria-hidden="true" />
                Odesílám…
              </>
            ) : (
              <>
                Odeslat zprávu <Send size={15} aria-hidden="true" />
              </>
            )}
          </button>
          <span className="character-count">{draft.message.length.toLocaleString('cs-CZ')} / 3 000</span>
        </div>

        <p className="form-note">
          Údaje použiji k odpovědi. Zprávu doručuje Web3Forms.{' '}
          <Link href="/dokumenty/osobni-udaje" prefetch={false}>Ochrana osobních údajů</Link>.
        </p>

        <noscript>
          <p className="form-note">
            Pro odeslání bez JavaScriptu napište prosím na{' '}
            <a href="mailto:martin.kostrhun@edofinance.cz">martin.kostrhun@edofinance.cz</a>.
          </p>
        </noscript>
      </Form>
    </div>
  );
}

export function ContactExperience() {
  const hydrated = useSyncExternalStore(noopSubscribe, getClient, getServer);
  const [draft, setDraft] = useState<EmailDraft>({ ...emptyEmailDraft });
  const [errors, setErrors] = useState<EmailErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAttention, setCaptchaAttention] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('appointment-topic');
      if (saved) {
        queueMicrotask(() => setDraft(current => ({ ...current, topic: saved.slice(0, 120) })));
        sessionStorage.removeItem('appointment-topic');
      }
    } catch {
      /* The form also works when storage is blocked. */
    }
    const choose = (event: Event) => {
      const detail = (event as CustomEvent).detail as { topic?: unknown; note?: unknown } | undefined;
      const topic = detail?.topic;
      const note = detail?.note;
      setDraft(current => ({
        ...current,
        topic: typeof topic === 'string' ? topic.slice(0, 120) : current.topic,
        message: typeof note === 'string' && !current.message.trim() ? note.slice(0, 3000) : current.message,
      }));
    };
    window.addEventListener('appointment', choose);
    return () => window.removeEventListener('appointment', choose);
  }, []);

  const focusField = (field: string) =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus());

  const update = (field: keyof EmailDraft, value: string) => {
    setDraft(current => ({ ...current, [field]: value }));
    if (field === 'name' || field === 'email' || field === 'message') {
      setErrors(current => ({ ...current, [field]: undefined }));
    }
    setNotice(null);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const issues = validateEmailContact(draft);
    setErrors(issues);
    setNotice(null);
    setCaptchaAttention(false);

    const first = Object.keys(issues)[0];
    if (first) {
      focusField(first);
      return;
    }

    if (!formsReady) {
      const subject = encodeURIComponent('Web Martina Kostrhuna — ' + (draft.topic || 'Nová zpráva'));
      const body = encodeURIComponent(`Jméno: ${draft.name}\n\n${draft.message}`);
      window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
      setNotice({ kind: 'error', text: 'Formulář otevřel předvyplněný e-mail ve vašem klientovi.' });
      return;
    }

    if (draft.website) {
      setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' });
      return;
    }

    if (!captchaToken) {
      setCaptchaAttention(true);
      setNotice({
        kind: 'error',
        text: 'Před odesláním prosím povolte a dokončete ověření proti spamu (hCaptcha) níže.',
      });
      formRef.current?.querySelector<HTMLElement>('[data-captcha-gate]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formRef.current?.querySelector<HTMLElement>('[data-captcha-enable]')?.focus({ preventScroll: true });
      return;
    }

    inFlight.current = true;
    setBusy(true);
    try {
      const result = await deliverContactEmail(draft, location.origin + location.pathname + '#kontakt', captchaToken);
      if (result === 'sent') {
        setNotice({ kind: 'sent', text: 'Děkuji, zpráva byla odeslána. Ozvu se vám na uvedený e-mail.' });
        setDraft({ ...emptyEmailDraft });
      } else if (result === 'activation') {
        setNotice({
          kind: 'activation',
          text: 'Odesílání ještě čeká na aktivaci příjemce. Přijetí zprávy zatím nemohu potvrdit. Vyplněný text zůstal zachovaný.',
        });
      } else {
        setNotice({
          kind: 'error',
          text: 'Zprávu se nepodařilo odeslat. Vyplněný text zůstal zachovaný. Zkuste to znovu nebo mi napište přímo.',
        });
      }
    } catch {
      setNotice({
        kind: 'error',
        text: 'Odeslání se nepodařilo potvrdit. Vyplněný text zůstal zachovaný. Zkuste to později nebo mi napište přímo.',
      });
    } finally {
      inFlight.current = false;
      setBusy(false);
      setCaptchaToken('');
      setCaptchaReset(value => value + 1);
    }
  }

  const model: Model = {
    hydrated,
    draft,
    errors,
    busy,
    notice,
    captchaToken,
    captchaAttention,
    captchaReset,
    focusName: () => focusField('name'),
    update,
    submit,
    setCaptchaToken: t => {
      setCaptchaToken(t);
      if (t) setCaptchaAttention(false);
    },
  };

  return <ContactCard model={model} formRef={formRef} />;
}
