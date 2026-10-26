'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Mail, Send } from 'lucide-react';
import { assets, siteConfig } from '@/lib/site-config';
import { CONTACT_ACTION, deliverContactEmail, emptyEmailDraft, validateEmailContact, type EmailDraft, type EmailErrors } from '@/lib/email-contact';

const variants = [
  { name: 'Čisté sklo', scene: 'pearl-scene' },
  { name: 'Osobní dialog', scene: 'personal-scene' },
  { name: 'Dopis Martinovi', scene: 'mail-scene' },
  { name: 'Krok za krokem', scene: 'step-scene' },
  { name: 'Noční sklo', scene: 'nocturne-scene' },
];
const topics = ['Bydlení', 'Investice', 'Pojištění', 'Finanční plán', 'Něco jiného'];
type Notice = { kind: 'sent' | 'activation' | 'error'; text: string } | null;
type Model = {
  draft: EmailDraft; errors: EmailErrors; busy: boolean; notice: Notice; step: number;
  formRef: RefObject<HTMLFormElement | null>;
  update: (field: keyof EmailDraft, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  next: () => void; back: () => void;
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
  return <form ref={model.formRef} className={className} action={CONTACT_ACTION} method="POST" noValidate onSubmit={model.submit} aria-busy={model.busy}>
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
function Pearl({ model }: { model: Model }) {
  return <div className="pearl-layout">
    <div className="pearl-intro"><span className="eyebrow">PROSTOR PRO VAŠE PLÁNY</span><h2 id="contact-title">Napište mi.<br/><span>V klidu.</span></h2><p>Nemusíte mít všechno promyšlené.<br/>Stačí napsat, co právě řešíte.</p><div className="recipient-person"><img src={assets.heroPortrait} alt="" className="avatar" width={42} height={42} loading="lazy"/><div><strong>Martin Kostrhun</strong><span>Finanční specialista · eDO finance</span></div></div><span className="email-line">{siteConfig.email}</span></div>
    <Form model={model} className="glass form-card pearl-card"><div className="card-heading"><span className="small-icon"><Mail className="icon" aria-hidden="true"/></span><div><h3>Začněme zprávou.</h3><p>Ozvu se vám na uvedený e-mail.</p></div></div><Fields model={model}/><Field model={model} field="message" label="S čím vám mohu pomoci?" placeholder="Pár slov o tom, co máte na mysli…"/><div className="form-end"><Privacy/><SendButton model={model}/></div></Form>
  </div>;
}
function Personal({ model }: { model: Model }) {
  return <div className="personal-layout">
    <div className="personal-photo"><img src={assets.heroPortrait} alt="Martin Kostrhun na terase" width={800} height={1200} loading="lazy"/><div className="portrait-label glass"><span className="person-dot"/><div><strong>Martin Kostrhun</strong><span>Finanční specialista · eDO finance</span></div><ArrowRight className="icon" aria-hidden="true"/></div></div>
    <div className="personal-copy"><span className="eyebrow">POJĎME SE POZNAT</span><h2 id="contact-title">Na dobrý plán<br/><span>nejste sami.</span></h2><p>Na druhé straně zprávy jsem já.<br/>Napište mi, s čím vám mohu pomoci.</p>
      <Form model={model} className="glass form-card personal-card"><Fields model={model} personal/><Field model={model} field="message" label="Co právě řešíte?" placeholder="Bydlení, investice, nebo úplně něco jiného…" rows={3}/><SendButton model={model} className="light-button">Poslat Martinovi</SendButton><Privacy/></Form>
    </div>
  </div>;
}
function Letter({ model }: { model: Model }) {
  return <><div className="mail-intro"><span className="eyebrow">OD VAŠICH MYŠLENEK KE SPOLEČNÉMU PLÁNU</span><h2 id="contact-title">Jedna zpráva.<br/><span>První krok.</span></h2></div>
    <Form model={model} className="glass mail-window">
      <div className="mail-window-bar"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>Nová zpráva</span><Mail className="icon" aria-hidden="true"/></div>
      <div className="mail-address-row"><span>Komu</span><span className="recipient-chip"><span>MK</span>{siteConfig.email}</span></div>
      <div className="mail-sender-row"><Field model={model} field="name" label="Vaše jméno" placeholder="Jméno a příjmení"/><Field model={model} field="email" label="Váš e-mail" placeholder="vas@email.cz"/></div>
      <Field model={model} field="topic" label="Předmět" placeholder="O čem si napíšeme? (nepovinné)" className="mail-subject"/>
      <Field model={model} field="message" label="Vaše zpráva" placeholder={'Dobrý den, Martine,\n\nrád/a bych s vámi probral/a…'} className="mail-body" rows={6}/>
      <div className="mail-window-footer"><Privacy/><SendButton model={model}/></div>
    </Form>
  </>;
}
function Steps({ model }: { model: Model }) {
  return <div className="step-layout">
    <div className="step-intro"><span className="eyebrow">MALÝ KROK PRO VELKÉ PLÁNY</span><h2 id="contact-title">Začněme<br/><span>jednoduše.</span></h2><p>Tři krátké kroky.<br/>Jedna zpráva přímo mně.</p><div className="step-contact"><span className="small-icon glass"><Mail className="icon" aria-hidden="true"/></span><span>Martin Kostrhun<strong>{siteConfig.email}</strong></span></div></div>
    <Form model={model} className="glass step-card">
      <div className="step-progress" aria-label="Postup formulářem">{['Téma', 'Zpráva', 'Kontakt'].map((label, i) => <span key={label} className={i <= model.step ? 'active' : ''} aria-current={i === model.step ? 'step' : undefined}><i/>{label}</span>)}</div>
      <div className="step-content" data-step="0" hidden={model.step !== 0}><span className="step-count">01 / 03</span><h3>Co máte na mysli?</h3><p>Vyberte oblast, kterou chcete probrat.</p><fieldset className="topic-options"><legend className="sr-only">Téma zprávy</legend>{topics.map((topic, i) => <label key={topic} className={i === topics.length - 1 ? 'wide-option' : ''}><input type="radio" name="topic" value={topic} checked={model.draft.topic === topic} onChange={() => model.update('topic', topic)} disabled={model.busy}/><span>{topic}<Check className="icon" aria-hidden="true"/></span></label>)}</fieldset></div>
      <div className="step-content" data-step="1" hidden={model.step !== 1}><span className="step-count">02 / 03</span><h3>Co spolu probereme?</h3><p>Napište pár vět. Zbytek si vysvětlíme spolu.</p><Field model={model} field="message" label="Vaše zpráva" placeholder="Rád/a bych…" rows={7}/></div>
      <div className="step-content" data-step="2" hidden={model.step !== 2}><span className="step-count">03 / 03</span><h3>A kam vám napíšu?</h3><p>Už jen kontakt, na kterém vás zastihnu.</p><Fields model={model}/><div className="step-summary"><span>Vaše zpráva · <strong>{model.draft.topic || 'Obecný dotaz'}</strong></span><p>{model.draft.message}</p></div></div>
      <div className="step-actions"><button className="back-button" type="button" disabled={model.step === 0 || model.busy} onClick={model.back}><ArrowLeft className="icon" aria-hidden="true"/>Zpět</button>{model.step < 2 ? <button className="send-button" type="button" onClick={model.next} disabled={model.busy}>Pokračovat<ArrowRight className="icon" aria-hidden="true"/></button> : <SendButton model={model}/>}</div><Privacy/>
    </Form>
  </div>;
}
function Nocturne({ model }: { model: Model }) {
  const { draft } = model;
  return <><div className="nocturne-heading"><span className="eyebrow">FINANCE ZAČÍNAJÍ ROZHOVOREM</span><h2 id="contact-title">Váš další krok?<br/><span>Napište mi.</span></h2></div>
    <div className="nocturne-layout">
      <Form model={model} className="glass nocturne-card"><Fields model={model}/><Field model={model} field="topic" label="O čem si napíšeme?" select/><Field model={model} field="message" label="Vaše zpráva" placeholder="Napište mi, co byste chtěli změnit nebo vyřešit…"/><div className="nocturne-form-footer"><span className="character-count">{draft.message.length.toLocaleString('cs-CZ')} / 3 000</span><SendButton model={model} className="sand-button"/></div><Privacy/></Form>
      <aside className="glass live-letter" aria-label="Náhled vaší zprávy"><div className="letter-top"><span className="letter-icon"><Mail className="icon" aria-hidden="true"/></span><span>NÁHLED VAŠÍ ZPRÁVY</span><i/></div><div className="letter-recipient"><span>Komu</span><strong>Martin Kostrhun</strong><small>{siteConfig.email}</small></div><div className="letter-subject">{draft.topic || 'Obecný dotaz'}</div><p className={'letter-message' + (draft.message ? '' : ' is-placeholder')}>{draft.message || 'Tady uvidíte zprávu tak, jak ji Martin obdrží.'}</p><div className="letter-signature"><strong>{draft.name || 'Vaše jméno'}</strong><span>{draft.email || 'vas@email.cz'}</span></div><div className="letter-bottom"><span className="person-dot"/>Přímo do Martinovy schránky</div></aside>
    </div>
  </>;
}

export function ContactExperience() {
  const [variant, setVariant] = useState(1);
  const [draft, setDraft] = useState<EmailDraft>({ ...emptyEmailDraft });
  const [errors, setErrors] = useState<EmailErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
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
  const next = () => {
    if (step === 1) {
      const issue = validateEmailContact(draft).message;
      if (issue) { setErrors({ message: issue }); focusField('message'); return; }
    }
    const destination = Math.min(2, step + 1);
    setStep(destination);
    focusField(destination === 1 ? 'message' : 'name');
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (variant === 4 && step < 2) { next(); return; }
    const issues = validateEmailContact(draft);
    setErrors(issues); setNotice(null);
    const first = Object.keys(issues)[0];
    if (first) {
      if (variant === 4) setStep(first === 'message' ? 1 : 2);
      focusField(first); return;
    }
    if (draft.website) { setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' }); return; }
    inFlight.current = true; setBusy(true);
    try {
      const result = await deliverContactEmail(draft, location.origin + location.pathname + '#kontakt');
      if (result === 'sent') {
        setNotice({ kind: 'sent', text: 'Děkuji, zpráva byla odeslána. Ozvu se vám na uvedený e-mail.' });
        setDraft({ ...emptyEmailDraft }); setStep(0);
      } else if (result === 'activation') {
        setNotice({ kind: 'activation', text: 'Odesílání ještě čeká na aktivaci příjemce. Přijetí zprávy zatím nemohu potvrdit. Vyplněný text zůstal zachovaný.' });
      } else setNotice({ kind: 'error', text: 'Zprávu se nepodařilo odeslat. Vyplněný text zůstal zachovaný. Zkuste to znovu nebo mi napište přímo.' });
    } catch {
      setNotice({ kind: 'error', text: 'Odeslání se nepodařilo potvrdit. Vyplněný text zůstal zachovaný. Zkuste to později nebo mi napište přímo.' });
    } finally { inFlight.current = false; setBusy(false); }
  }
  function pickerKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const selected = event.key === 'Home' ? 1 : event.key === 'End' ? 5 : (variant - 1 + (event.key === 'ArrowRight' ? 1 : 4)) % 5 + 1;
    setVariant(selected); setErrors({});
    requestAnimationFrame(() => pickerRef.current?.querySelector<HTMLElement>('[data-variant-number="' + selected + '"]')?.focus());
  }
  const back = () => {
    const destination = Math.max(0, step - 1);
    setStep(destination);
    focusField(destination === 1 ? 'message' : 'topic');
  };
  const model: Model = { draft, errors, busy, notice, step, formRef, update, submit, next, back };
  return <div className="contact-variants" data-contact-variant={variant}>
    <div className={'scene ' + variants[variant - 1].scene}>
      <div className="ambient" aria-hidden="true"/>
      <div className="contact-picker-bar"><span className="eyebrow">KONTAKT</span><div ref={pickerRef} className="contact-variant-picker" role="tablist" aria-label="Vzhled kontaktního formuláře" onKeyDown={pickerKeys}>{variants.map((item, i) => <button key={item.name} type="button" id={'contact-variant-tab-' + (i + 1)} data-variant-number={i + 1} role="tab" aria-label={'Varianta ' + (i + 1) + ': ' + item.name} title={item.name} aria-selected={variant === i + 1} aria-controls="contact-variant-panel" tabIndex={variant === i + 1 ? 0 : -1} disabled={busy} onClick={() => { setVariant(i + 1); setErrors({}); }}>{i + 1}</button>)}</div></div>
      <div id="contact-variant-panel" role="tabpanel" aria-labelledby={'contact-variant-tab-' + variant}>
        {variant === 1 ? <Pearl model={model}/> : variant === 2 ? <Personal model={model}/> : variant === 3 ? <Letter model={model}/> : variant === 4 ? <Steps model={model}/> : <Nocturne model={model}/>}
      </div>
      <div className="site-mini-footer"><span>HRADEC KRÁLOVÉ · OSOBNĚ I ONLINE</span><span>MARTIN KOSTRHUN · eDO finance</span></div>
    </div>
  </div>;
}
