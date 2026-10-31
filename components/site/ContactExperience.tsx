'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, LoaderCircle, Mail, MapPin, Phone, Send, X } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import { CONTACT_ACTION, CONTACT_PUBLIC_KEY, deliverContactEmail, emptyEmailDraft, validateEmailContact, type EmailDraft, type EmailErrors } from '@/lib/email-contact';
import { liveBookingEvents } from '@/lib/booking-config';
import { AppointmentBooking } from './AppointmentBooking';
import { CaptchaGate } from './CaptchaGate';
import { formsReady } from '@/lib/form-config';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const topics = ['Bydlení', 'Investice', 'Pojištění', 'Finanční plán', 'Něco jiného'];
type Notice = { kind: 'sent' | 'activation' | 'error'; text: string } | null;
type Model = {
  draft: EmailDraft; errors: EmailErrors; busy: boolean; notice: Notice;
  focusName: () => void;
  update: (field: keyof EmailDraft, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  captchaToken: string; setCaptchaToken: (token: string) => void; captchaReset: number;
};

function Field({ model, field, label, compactLabel, placeholder, className = '', rows = 4, select = false }: {
  model: Model; field: 'name' | 'email' | 'message' | 'topic'; label: string;
  compactLabel?: string; placeholder?: string; className?: string; rows?: number; select?: boolean;
}) {
  const id = 'contact-email-' + field;
  const error = field === 'topic' ? undefined : model.errors[field];
  const common = {
    id, name: field === 'topic' ? 'topic' : field, value: model.draft[field],
    disabled: model.busy, required: field !== 'topic',
    'aria-label': label, 'aria-invalid': !!error, 'aria-describedby': error ? id + '-error' : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => model.update(field, event.target.value),
  };
  return <label className={className} htmlFor={id}><span className={compactLabel ? 'field-label-full' : undefined}>{label}</span>{compactLabel && <span className="field-label-compact" aria-hidden="true">{compactLabel}</span>}
    {field === 'message'
      ? <textarea {...common} placeholder={placeholder} minLength={10} maxLength={3000} rows={rows}/>
      : select
        ? <select {...common}><option value="">Obecný dotaz</option>{model.draft.topic && !topics.includes(model.draft.topic) && <option>{model.draft.topic}</option>}{topics.map(topic => <option key={topic}>{topic}</option>)}</select>
        : <input {...common} type={field === 'email' ? 'email' : 'text'} autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : undefined} placeholder={placeholder} minLength={field === 'name' ? 2 : undefined} maxLength={field === 'name' ? 100 : field === 'email' ? 150 : 120}/>}
    {error && <span className="email-field-error" id={id + '-error'}>{error}</span>}
  </label>;
}
function Privacy() {
  return <p className="privacy-note">Údaje použiji k odpovědi. Zprávu doručuje Web3Forms. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>;
}
function SendButton({ model, children = 'Odeslat zprávu', className = '' }: { model: Model; children?: ReactNode; className?: string }) {
  return <button className={'send-button ' + className} type="submit" disabled={model.busy || !formsReady || !model.captchaToken}>
    {model.busy ? <><LoaderCircle className="icon email-spinner" aria-hidden="true"/>Odesílám…</> : <>{children}<Send className="icon" aria-hidden="true"/></>}
  </button>;
}
function Form({ model, formRef, className, children }: { model: Model; formRef: RefObject<HTMLFormElement | null>; className: string; children: ReactNode }) {
  return <form ref={formRef} className={className} action={CONTACT_ACTION} method="POST" noValidate onSubmit={model.submit} aria-busy={model.busy} aria-labelledby="contact-title">
    {children}
    <input type="hidden" name="access_key" value={CONTACT_PUBLIC_KEY}/>
    <input type="hidden" name="subject" value={'Web Martina Kostrhuna — ' + (model.draft.topic || 'Nová zpráva')}/>
    <input type="hidden" name="from_name" value="Web Martina Kostrhuna"/>
    <label className="email-trap" aria-hidden="true">Webová stránka<input type="text" name="botcheck" value={model.draft.website} onChange={event => model.update('website', event.target.value)} tabIndex={-1} autoComplete="off"/></label>
    {model.notice && <div className={'email-notice email-notice-' + model.notice.kind} role={model.notice.kind === 'sent' ? 'status' : 'alert'}>
      {model.notice.kind === 'sent' && <Check className="icon" aria-hidden="true"/>}<p>{model.notice.text}{model.notice.kind !== 'sent' && <> <a href={'mailto:' + siteConfig.email}>Napsat přímo na {siteConfig.email}</a>.</>}</p>
    </div>}
  </form>;
}
function Fields({ model, personal = false }: { model: Model; personal?: boolean }) {
  return <div className="field-pair">
    <Field model={model} field="name" label={personal ? 'Jak se jmenujete?' : 'Vaše jméno'} compactLabel="Vaše jméno" placeholder="Jméno a příjmení"/>
    <Field model={model} field="email" label={personal ? 'Kam vám mohu napsat?' : 'E-mail'} compactLabel="E-mail" placeholder="vas@email.cz"/>
  </div>;
}
function ContactCard({ model, formRef }: { model: Model; formRef: RefObject<HTMLFormElement | null> }) {
  const { draft } = model;
  const [bookingOpen, setBookingOpen] = useState(false);
  const focusMessage = useRef(false);
  return <div className="combined-layout">
    <div className="combined-workspace">
      <Form model={model} formRef={formRef} className="nocturne-card combined-form">
        <header className="combined-intro">
          <span className="eyebrow">POJĎME SE POZNAT</span>
          <h2 id="contact-title">Na dobrý plán<br/><span>nejste sami.</span></h2>
          <p>Napište mi, s čím vám mohu pomoci, nebo si domluvte osobní schůzku.</p>
        </header>
      <div id="rezervace" className="contact-booking-callout">
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger className="contact-booking-trigger"><CalendarDays size={19} aria-hidden="true"/><span>Rezervovat konkrétní termín</span><ArrowUpRight size={19} aria-hidden="true"/></DialogTrigger>
          <DialogContent className="contact-booking-dialog" showCloseButton={false} onCloseAutoFocus={event => {
            if (!focusMessage.current) return;
            event.preventDefault();
            focusMessage.current = false;
            model.focusName();
          }}>
            <DialogTitle className="sr-only">Rezervace schůzky</DialogTitle>
            <DialogDescription className="sr-only">{liveBookingEvents.length ? 'Vyberte si volný termín 90minutové konzultace.' : 'Domluvte si termín konzultace zprávou nebo e-mailem.'}</DialogDescription>
            <DialogClose className="contact-booking-close" aria-label="Zavřít rezervaci"><X size={20} aria-hidden="true"/></DialogClose>
            <AppointmentBooking onContact={() => {
              focusMessage.current = true;
              setBookingOpen(false);
            }}/>
          </DialogContent>
        </Dialog>
        <p>{liveBookingEvents.length ? 'Nevyhovuje vám žádný z nabízených termínů? Napište mi a domluvíme se individuálně.' : 'Online výběr termínu se připravuje. Schůzku si zatím domluvíme zprávou.'}</p>
      </div>
        <Fields model={model}/>
        <Field model={model} field="topic" label="O čem si napíšeme?" select/>
        <Field model={model} field="message" label="Vaše zpráva" placeholder="Dobrý den, Martine, rád/a bych s vámi probral/a…" rows={4}/>
        {formsReady ? <CaptchaGate onToken={model.setCaptchaToken} resetKey={model.captchaReset}/> : <p className="form-note">Zprávu mi zatím pošlete přímo na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p>}
        <div className="nocturne-form-footer"><span className="character-count">{draft.message.length.toLocaleString('cs-CZ')} / 3 000</span><SendButton model={model} className="sand-button">Odeslat zprávu</SendButton></div>
        <Privacy/>
      </Form>
    </div>
    <aside className="combined-aside" aria-label="Martin Kostrhun a kontaktní údaje">
      <figure className="combined-portrait">
        <img src={assets.heroPortrait} alt={assets.portraitAlt} width={1280} height={1920} loading="lazy"/>
      </figure>
      <div className="combined-contact-details">
        <a href={`mailto:${siteConfig.email}`} className="combined-contact-row"><span className="contact-detail-icon"><Mail size={20} aria-hidden="true"/></span><span><strong>E-mail</strong><span>{siteConfig.email}</span></span><ArrowUpRight size={17} aria-hidden="true"/></a>
        <a href={siteConfig.phoneHref} className="combined-contact-row"><span className="contact-detail-icon"><Phone size={20} aria-hidden="true"/></span><span><strong>Telefon</strong><span>{siteConfig.phone}</span></span><ArrowUpRight size={17} aria-hidden="true"/></a>
        <div className="combined-contact-row"><span className="contact-detail-icon"><MapPin size={20} aria-hidden="true"/></span><span><strong>Kde se potkáme</strong><span>{siteConfig.address}<br/>{siteConfig.city}</span></span></div>
      </div>
    </aside>
  </div>;
}

export function ContactExperience() {
  const [draft, setDraft] = useState<EmailDraft>({ ...emptyEmailDraft });
  const [errors, setErrors] = useState<EmailErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('appointment-topic');
      if (saved) { queueMicrotask(() => setDraft(current => ({ ...current, topic: saved.slice(0, 120) }))); sessionStorage.removeItem('appointment-topic'); }
    } catch { /* The form also works when storage is blocked. */ }
    const choose = (event: Event) => {
      const topic: unknown = (event as CustomEvent).detail?.topic;
      if (typeof topic === 'string') setDraft(current => ({ ...current, topic: topic.slice(0, 120) }));
    };
    window.addEventListener('appointment', choose);
    return () => window.removeEventListener('appointment', choose);
  }, []);

  const focusField = (field: string) => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[name="' + field + '"]')?.focus());
  const update = (field: keyof EmailDraft, value: string) => {
    setDraft(current => ({ ...current, [field]: value }));
    if (field === 'name' || field === 'email' || field === 'message') setErrors(current => ({ ...current, [field]: undefined }));
    setNotice(null);
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (!formsReady) { setNotice({ kind: 'error', text: 'Napište mi prosím přímo e-mailem.' }); return; }
    const issues = validateEmailContact(draft);
    setErrors(issues); setNotice(null);
    const first = Object.keys(issues)[0];
    if (first) {
      focusField(first); return;
    }
    if (draft.website) { setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' }); return; }
    if (!captchaToken) { setNotice({ kind: 'error', text: 'Nejprve prosím dokončete ověření hCaptcha pod zprávou.' }); return; }
    inFlight.current = true; setBusy(true);
    try {
      const result = await deliverContactEmail(draft, location.origin + location.pathname + '#kontakt', captchaToken);
      if (result === 'sent') {
        setNotice({ kind: 'sent', text: 'Děkuji, zpráva byla odeslána. Ozvu se vám na uvedený e-mail.' });
        setDraft({ ...emptyEmailDraft });
      } else if (result === 'activation') {
        setNotice({ kind: 'activation', text: 'Odesílání ještě čeká na aktivaci příjemce. Přijetí zprávy zatím nemohu potvrdit. Vyplněný text zůstal zachovaný.' });
      } else setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Vyplněný text zůstal zachovaný. Zkuste to znovu nebo mi napište přímo.' });
    } catch {
      setNotice({ kind: 'error', text: 'Odeslání se nepodařilo potvrdit. Vyplněný text zůstal zachovaný. Zkuste to později nebo mi napište přímo.' });
    } finally { inFlight.current = false; setBusy(false); setCaptchaToken(''); setCaptchaReset(value => value + 1); }
  }
  const model: Model = { draft, errors, busy, notice, focusName: () => focusField('name'), update, submit, captchaToken, setCaptchaToken, captchaReset };
  return <div className="contact-variants contact-combined">
    <div className="scene combined-scene">
      <ContactCard model={model} formRef={formRef}/>
    </div>
  </div>;
}
