'use client';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, Mail, MessageCircle, Phone, Send, Video } from 'lucide-react';
import { validateContact, type ContactErrors } from '@/lib/contact-form';
import { apiPath, useSiteData } from './SiteData';
import { siteConfig } from '@/lib/site-config';
import { services } from '@/lib/content';
export function newSubmission() { return { requestId: crypto.randomUUID(), startedAt: Date.now(), website: '' }; }
export async function postJSON(path: string, body: unknown) { const response = await fetch(apiPath(path), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); let result: Record<string, unknown>; try {
    result = await response.json() as Record<string, unknown>;
}
catch {
    throw new Error('Služba není právě dostupná. Zkuste to později nebo mě kontaktujte přímo.');
} if (!result || typeof result !== 'object' || !response.ok || !result.ok)
    throw new Error(String(result?.error || 'Údaje se nepodařilo uložit. Zkuste to znovu.')); return result; }
export function ContactForm({ topic }: { topic: string }) {
    const { contactEnabled } = useSiteData();
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<ContactErrors>({});
    const submission = useRef<ReturnType<typeof newSubmission> | null>(null);
    const inFlight = useRef(false);
    const lastPayload = useRef('');
    async function submit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (inFlight.current || !contactEnabled) return;
      const form = e.currentTarget;
      const values = Object.fromEntries(new FormData(form));
      const issues = validateContact({ name: String(values.name || ''), contact: String(values.contact || ''), message: String(values.message || '') });
      setErrors(issues); setError(''); setStatus('');
      const first = Object.keys(issues)[0];
      if (first) { form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
      inFlight.current = true; setBusy(true);
      const fingerprint = JSON.stringify({ ...values, topic });
      if (lastPayload.current && lastPayload.current !== fingerprint) {
        submission.current = { ...newSubmission(), startedAt: submission.current?.startedAt || Date.now() };
      }
      lastPayload.current = fingerprint;
      submission.current ??= newSubmission();
      try {
        await postJSON('/contact', { ...submission.current, ...values, topic });
        setStatus('Děkuji, zpráva byla přijata.');
        form.reset(); submission.current = null; lastPayload.current = '';
      } catch (e) { setError(e instanceof Error ? e.message : 'Zprávu se nepodařilo přijmout.'); }
      finally { inFlight.current = false; setBusy(false); }
    }
    if (!contactEnabled) return <div className="contact-unavailable"><span className="contact-state-icon"><Mail size={26}/></span><h3>Napište mi přímo</h3><p>Zprávy přes formulář teď nejsou dostupné. E-mailem nebo po telefonu se se mnou spojíte rovnou.</p><a className="site-button" href={`mailto:${siteConfig.email}`}><Mail size={17} aria-hidden="true"/>Napsat e-mail<ArrowUpRight size={17} aria-hidden="true"/></a><a className="contact-fallback-phone" href={siteConfig.phoneHref}><Phone size={16} aria-hidden="true"/>{siteConfig.phone}</a></div>;
    return <form className="plain-form contact-form" noValidate aria-busy={busy} onSubmit={submit} onChange={e => {
      if (!inFlight.current) {
        submission.current = { ...newSubmission(), startedAt: submission.current?.startedAt || Date.now() };
        setStatus(''); setError('');
        const field = e.target;
        const name = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.name : '';
        setErrors(current => ({ ...current, [name]: undefined }));
      }
    }} onFocus={() => { submission.current ??= newSubmission(); }}>
      <div className="contact-form-heading"><h3>Napište mi zprávu</h3><p>Stačí jméno, kontakt a to, co chcete probrat.</p></div>
      <fieldset disabled={busy}><div className="form-pair"><label htmlFor="contact-name">Jméno<input id="contact-name" aria-label="Jméno" name="name" autoComplete="name" placeholder="Vaše jméno" required minLength={2} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined}/>{errors.name && <span id="contact-name-error" className="field-error">{errors.name}</span>}</label><label htmlFor="contact-address">Telefon nebo e-mail<input id="contact-address" aria-label="Telefon nebo e-mail" name="contact" autoComplete="email" placeholder="E-mail nebo telefon" required maxLength={150} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'contact-address-error' : undefined}/>{errors.contact && <span id="contact-address-error" className="field-error">{errors.contact}</span>}</label></div>
      <label htmlFor="contact-message">Zpráva<textarea id="contact-message" aria-label="Zpráva" name="message" placeholder="S čím vám mohu pomoci?" required minLength={2} maxLength={3000} rows={4} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'contact-message-error' : undefined}/>{errors.message && <span id="contact-message-error" className="field-error">{errors.message}</span>}</label>
      <label className="form-honeypot" aria-hidden="true">Webová stránka<input name="website" tabIndex={-1} autoComplete="off"/></label></fieldset>
      <p className="form-note">Vaše údaje použiji k odpovědi. Neposílejte sem čísla smluv ani citlivé finanční údaje. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>
      {error && <p className="form-error" role="alert">{error} Vyplněné údaje zůstaly zachované.</p>}
      {status && <div className="contact-success" role="status"><Check size={20} aria-hidden="true"/><p>{status}</p></div>}
      <button className="site-button contact-submit" type="submit" disabled={busy}>{busy ? <><span className="submit-spinner" aria-hidden="true"/>Odesílám…</> : <><Send size={17} aria-hidden="true"/>Odeslat zprávu<ArrowUpRight size={18} aria-hidden="true"/></>}</button>
    </form>;
}
function UserMethod() { return <CalendarDays size={16} aria-hidden="true"/>; }
type CalCommand = (...args: unknown[]) => void;
function Booking({ topic }: {
    topic: string;
}) {
    const { booking } = useSiteData();
    const [method, setMethod] = useState<'osobne' | 'online' | 'telefon'>('osobne');
    const [load, setLoad] = useState(false);
    const [failed, setFailed] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const link = booking.links[method];
    useEffect(() => {
        if (!load || !link || !ref.current)
            return;
        let active = true;
        const node = ref.current;
        node.replaceChildren();
        const timer = setTimeout(() => { if (active && !node.querySelector('iframe'))
            setFailed(true); }, 15000);
        const win = window as unknown as {
            Cal?: CalCommand & {
                q?: unknown[][];
            };
        };
        if (!win.Cal) {
            const queue = Object.assign((...args: unknown[]) => { queue.q.push(args); }, { q: [] as unknown[][] });
            win.Cal = queue;
            const script = document.createElement('script');
            script.src = 'https://app.cal.com/embed/embed.js';
            script.async = true;
            script.onerror = () => { if (active)
                setFailed(true); };
            document.head.appendChild(script);
        }
        const cal = win.Cal;
        cal('init', { origin: 'https://app.cal.com' });
        cal('inline', { elementOrSelector: node, calLink: link, config: { layout: 'month_view', theme: 'light', notes: topic } });
        cal('ui', { theme: 'light', hideEventTypeDetails: false, styles: { branding: { brandColor: '#7821d9' } }, layout: 'month_view' });
        return () => { active = false; clearTimeout(timer); node.replaceChildren(); };
    }, [link, load, topic]);
    return <div className="booking-box"><div className="booking-method" role="group" aria-label="Způsob schůzky">{(['osobne', 'online', 'telefon'] as const).map((m) => <button key={m} type="button" aria-pressed={method === m} onClick={() => { setMethod(m); setLoad(false); setFailed(false); }}>{m === 'osobne' ? <><UserMethod/>Osobně</> : m === 'online' ? <><Video size={16} aria-hidden="true"/>Online</> : <><Phone size={16} aria-hidden="true"/>Telefonicky</>}</button>)}</div><p className="booking-info">{method === 'osobne' ? `${siteConfig.address}, ${siteConfig.city}` : method === 'online' ? 'Setkáme se na dálku.' : 'Spojíme se telefonicky.'} · Časové pásmo: Praha</p>{topic && <p className="topic-note">Téma: {topic}</p>}{link ? <><p>Kalendář zobrazuje pouze volné termíny. Soukromé události nezveřejňuji.</p>{!load && <button className="site-button" onClick={() => setLoad(true)}>Zobrazit volné termíny</button>}<div ref={ref} className="cal-embed" hidden={!load} aria-label="Rezervační kalendář"/>{failed && <p role="alert">Kalendář se nepodařilo načíst. Můžete otevřít <a href={`https://cal.com/${link}`} target="_blank" rel="noreferrer">rezervační stránku</a> nebo mě kontaktovat přímo.</p>}<p className="form-note">Rezervaci zajišťuje Cal.com. <Link href="/dokumenty/osobni-udaje">Informace o zpracování údajů</Link>.</p></> : <div className="booking-empty"><span className="contact-state-icon"><CalendarDays size={26} aria-hidden="true"/></span><h3>Termín domluvíme přímo</h3><p>Online rezervace pro tento způsob schůzky zatím není připojená. Napište mi nebo zavolejte a společně najdeme vhodný čas.</p><a className="site-button" href={siteConfig.phoneHref}>Zavolat Martinovi</a><a className="text-inline" href={`mailto:${siteConfig.email}`}>Domluvit termín e-mailem ↗</a></div>}</div>;
}
export function ContactExperience() {
    const [tab, setTab] = useState<'booking' | 'message'>('booking');
    const [topic, setTopic] = useState('');
    const tabs = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const saved = sessionStorage.getItem('appointment-topic');
      if (saved) { queueMicrotask(() => setTopic(saved)); sessionStorage.removeItem('appointment-topic'); }
      const choose = (e: Event) => { const detail = (e as CustomEvent).detail; setTab(detail.tab || 'booking'); setTopic(detail.topic || ''); };
      window.addEventListener('appointment', choose); return () => window.removeEventListener('appointment', choose);
    }, []);
    function switchTab(e: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 'booking' : e.key === 'End' ? 'message' : tab === 'booking' ? 'message' : 'booking';
      setTab(next); tabs.current?.querySelector<HTMLElement>(`[id="contact-tab-${next}"]`)?.focus();
    }
    return <div className="contact-experience"><div ref={tabs} className="contact-tabs" data-active={tab} role="tablist" aria-label="Způsob kontaktu" onKeyDown={switchTab}>
      <button type="button" id="contact-tab-booking" role="tab" aria-selected={tab === 'booking'} aria-controls="contact-panel-booking" tabIndex={tab === 'booking' ? 0 : -1} onClick={() => setTab('booking')}><CalendarDays size={17} aria-hidden="true"/>Vybrat termín</button>
      <button type="button" id="contact-tab-message" role="tab" aria-selected={tab === 'message'} aria-controls="contact-panel-message" tabIndex={tab === 'message' ? 0 : -1} onClick={() => setTab('message')}><MessageCircle size={17} aria-hidden="true"/>Napsat zprávu</button>
    </div><div className="contact-topic"><label htmlFor="contact-topic">Co chcete probrat? <span>nepovinné</span></label><select id="contact-topic" value={topic} onChange={e => setTopic(e.target.value)}><option value="">Vyberte téma</option>{services.map(s => <option key={s.id}>{s.title}</option>)}<option>Něco jiného</option></select></div>
    <div id="contact-panel-booking" role="tabpanel" aria-labelledby="contact-tab-booking" hidden={tab !== 'booking'} tabIndex={0}><Booking topic={topic}/></div>
    <div id="contact-panel-message" role="tabpanel" aria-labelledby="contact-tab-message" hidden={tab !== 'message'} tabIndex={0}><ContactForm topic={topic}/></div>
    <noscript><p>Schůzku nebo zprávu domluvíte e-mailem či telefonicky pomocí kontaktů výše.</p></noscript></div>;
}
