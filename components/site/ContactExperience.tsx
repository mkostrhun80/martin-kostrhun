'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { Check, LoaderCircle, Mail, Send } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import { CONTACT_ACTION, deliverContactEmail, emptyEmailDraft, validateEmailContact, type EmailDraft, type EmailErrors } from '@/lib/email-contact';

const topics = ['Bydlení', 'Investice', 'Pojištění', 'Finanční plán', 'Něco jiného'];
type Notice = { kind: 'sent' | 'activation' | 'error'; text: string } | null;
type Model = {
  draft: EmailDraft; errors: EmailErrors; busy: boolean; notice: Notice;
  formRef: RefObject<HTMLFormElement | null>;
  update: (field: keyof EmailDraft, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
};

function Field({ model, field, label, placeholder, className = '', rows = 4, select = false }: {
  model: Model; field: 'name' | 'email' | 'message' | 'topic'; label: string;
  placeholder?: string; className?: string; rows?: number; select?: boolean;
}) {
  const id = 'contact-email-' + field;
  const error = field === 'topic' ? undefined : model.errors[field];
  const common = {
    id, name: field === 'topic' ? 'topic' : field, value: model.draft[field],
    disabled: model.busy, required: field !== 'topic',
    'aria-label': label, 'aria-invalid': !!error, 'aria-describedby': error ? id + '-error' : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => model.update(field, event.target.value),
  };
  return <label className={className} htmlFor={id}><span>{label}</span>
    {field === 'message'
      ? <textarea {...common} placeholder={placeholder} minLength={10} maxLength={3000} rows={rows}/>
      : select
        ? <select {...common}><option value="">Obecný dotaz</option>{model.draft.topic && !topics.includes(model.draft.topic) && <option>{model.draft.topic}</option>}{topics.map(topic => <option key={topic}>{topic}</option>)}</select>
        : <input {...common} type={field === 'email' ? 'email' : 'text'} autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : undefined} placeholder={placeholder} minLength={field === 'name' ? 2 : undefined} maxLength={field === 'name' ? 100 : field === 'email' ? 150 : 120}/>}
    {error && <span className="email-field-error" id={id + '-error'}>{error}</span>}
  </label>;
}
function Privacy() {
  return <p className="privacy-note">Údaje použiji k odpovědi. Zprávu doručuje FormSubmit. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>;
}
function SendButton({ model, children = 'Odeslat zprávu', className = '' }: { model: Model; children?: ReactNode; className?: string }) {
  return <button className={'send-button ' + className} type="submit" disabled={model.busy}>
    {model.busy ? <><LoaderCircle className="icon email-spinner" aria-hidden="true"/>Odesílám…</> : <>{children}<Send className="icon" aria-hidden="true"/></>}
  </button>;
}
function Form({ model, className, children }: { model: Model; className: string; children: ReactNode }) {
  return <form ref={model.formRef} className={className} action={CONTACT_ACTION} method="POST" noValidate onSubmit={model.submit} aria-busy={model.busy} aria-labelledby="contact-title">
    {children}
    <input type="hidden" name="_subject" value={'Web Martina Kostrhuna — ' + (model.draft.topic || 'Nová zpráva')}/>
    <input type="hidden" name="_template" value="table"/>
    <label className="email-trap" aria-hidden="true">Webová stránka<input type="text" name="_honey" value={model.draft.website} onChange={event => model.update('website', event.target.value)} tabIndex={-1} autoComplete="off"/></label>
    {model.notice && <div className={'email-notice email-notice-' + model.notice.kind} role={model.notice.kind === 'sent' ? 'status' : 'alert'}>
      {model.notice.kind === 'sent' && <Check className="icon" aria-hidden="true"/>}<p>{model.notice.text}{model.notice.kind !== 'sent' && <> <a href={'mailto:' + siteConfig.email}>Napsat přímo na {siteConfig.email}</a>.</>}</p>
    </div>}
  </form>;
}
function Fields({ model, personal = false }: { model: Model; personal?: boolean }) {
  return <div className="field-pair">
    <Field model={model} field="name" label={personal ? 'Jak se jmenujete?' : 'Vaše jméno'} placeholder="Jméno a příjmení"/>
    <Field model={model} field="email" label={personal ? 'Kam vám mohu napsat?' : 'E-mail'} placeholder="vas@email.cz"/>
  </div>;
}
function PersonalLetter({ model }: { model: Model }) {
  const { draft } = model;
  return <div className="combined-layout">
    <header className="combined-intro">
      <span className="eyebrow">POJĎME SE POZNAT</span>
      <h2 id="contact-title">Na dobrý plán<br/><span>nejste sami.</span></h2>
      <p>Na druhé straně zprávy jsem já.<br/>Napište mi, s čím vám mohu pomoci.</p>
    </header>
    <figure className="combined-portrait">
      <img src={assets.heroPortrait} alt={assets.portraitAlt} width={800} height={1200} loading="lazy"/>
      <figcaption className="portrait-label glass"><span className="person-dot"/><div><strong>Martin Kostrhun</strong><span>Finanční specialista · eDO finance</span></div></figcaption>
    </figure>
    <Form model={model} className="glass nocturne-card combined-form">
      <div className="combined-form-heading"><span className="small-icon"><Mail className="icon" aria-hidden="true"/></span><div><h3>Napište mi.</h3><p>Vaši zprávu hned uvidíte v náhledu.</p></div></div>
      <Fields model={model} personal/>
      <Field model={model} field="topic" label="O čem si napíšeme?" select/>
      <Field model={model} field="message" label="Co právě řešíte?" placeholder="Dobrý den, Martine, rád/a bych s vámi probral/a…" rows={7}/>
      <div className="nocturne-form-footer"><span className="character-count">{draft.message.length.toLocaleString('cs-CZ')} / 3 000</span><SendButton model={model} className="sand-button">Poslat Martinovi</SendButton></div>
      <Privacy/>
    </Form>
    <aside className="glass live-letter combined-letter" aria-labelledby="contact-preview-title">
      <div className="letter-top"><span className="letter-icon"><Mail className="icon" aria-hidden="true"/></span><h3 id="contact-preview-title">NÁHLED VAŠÍ ZPRÁVY</h3><i aria-hidden="true"/></div>
      <div className="letter-recipient"><span>Komu</span><strong>Martin Kostrhun</strong><small>{siteConfig.email}</small></div>
      <div className="letter-subject"><span>Předmět</span><strong>{draft.topic || 'Obecný dotaz'}</strong></div>
      <p className={'letter-message' + (draft.message ? '' : ' is-placeholder')}>{draft.message || 'Tady se při psaní zobrazí vaše zpráva Martinovi.'}</p>
      <div className="letter-signature"><strong>{draft.name || 'Vaše jméno'}</strong><span>{draft.email || 'vas@email.cz'}</span></div>
      <div className="letter-bottom"><span className="person-dot"/>Přímo do Martinovy schránky</div>
    </aside>
  </div>;
}

export function ContactExperience() {
  const [draft, setDraft] = useState<EmailDraft>({ ...emptyEmailDraft });
  const [errors, setErrors] = useState<EmailErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
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
    const issues = validateEmailContact(draft);
    setErrors(issues); setNotice(null);
    const first = Object.keys(issues)[0];
    if (first) {
      focusField(first); return;
    }
    if (draft.website) { setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' }); return; }
    inFlight.current = true; setBusy(true);
    try {
      const result = await deliverContactEmail(draft, location.origin + location.pathname + '#kontakt');
      if (result === 'sent') {
        setNotice({ kind: 'sent', text: 'Děkuji, zpráva byla odeslána. Ozvu se vám na uvedený e-mail.' });
        setDraft({ ...emptyEmailDraft });
      } else if (result === 'activation') {
        setNotice({ kind: 'activation', text: 'Odesílání ještě čeká na aktivaci příjemce. Přijetí zprávy zatím nemohu potvrdit. Vyplněný text zůstal zachovaný.' });
      } else setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Vyplněný text zůstal zachovaný. Zkuste to znovu nebo mi napište přímo.' });
    } catch {
      setNotice({ kind: 'error', text: 'Odeslání se nepodařilo potvrdit. Vyplněný text zůstal zachovaný. Zkuste to později nebo mi napište přímo.' });
    } finally { inFlight.current = false; setBusy(false); }
  }
  const model: Model = { draft, errors, busy, notice, formRef, update, submit };
  return <div className="contact-variants contact-combined">
    <div className="scene personal-scene nocturne-scene combined-scene">
      <div className="ambient" aria-hidden="true"/>
      <div className="contact-picker-bar"><span className="eyebrow">KONTAKT</span><span className="combined-reply-note">OSOBNĚ I ONLINE</span></div>
      <PersonalLetter model={model}/>
      <div className="site-mini-footer"><span>HRADEC KRÁLOVÉ · OSOBNĚ I ONLINE</span><span>MARTIN KOSTRHUN · eDO finance</span></div>
    </div>
  </div>;
}
