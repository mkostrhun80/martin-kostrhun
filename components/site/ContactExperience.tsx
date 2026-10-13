'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
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
export function ContactForm({ topic }: {
    topic: string;
}) {
    const { contactEnabled } = useSiteData();
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const submission = useRef<ReturnType<typeof newSubmission> | null>(null);
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy)
        return; setBusy(true); setError(''); const form = e.currentTarget; const values = Object.fromEntries(new FormData(form)); submission.current ??= newSubmission(); try {
        await postJSON('/contact', { ...submission.current, ...values, topic });
        setStatus('Děkuji, zpráva byla přijata.');
        form.reset();
        submission.current = null;
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Zprávu se nepodařilo přijmout.');
    }
    finally {
        setBusy(false);
    } }
    return <form className="plain-form" onSubmit={submit} onChange={() => { if (!busy) {
        submission.current = { ...newSubmission(), startedAt: submission.current?.startedAt || Date.now() };
        setStatus('');
    } }} onFocus={() => { submission.current ??= newSubmission(); }}><h3>Napište mi zprávu</h3><div className="form-pair"><label>Jméno<input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label><label>Telefon nebo e-mail<input name="contact" autoComplete="email" required maxLength={150}/></label></div>{topic && <p className="topic-note">Téma: {topic}</p>}<label>Zpráva<textarea name="message" required minLength={2} maxLength={3000} rows={3}/></label><label className="form-honeypot" aria-hidden="true">Webová stránka<input name="website" tabIndex={-1} autoComplete="off"/></label><p className="form-note">Vaše údaje použiji k odpovědi. Neposílejte sem čísla smluv ani citlivé finanční údaje. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>{!contactEnabled && <p className="form-note">Odesílání zpráv zde zatím není dostupné. Napište mi <a href={`mailto:${siteConfig.email}`}>přímo e-mailem</a> nebo zavolejte.</p>}{error && <p className="form-error" role="alert">{error}</p>}{status && <p className="form-success" role="status">{status}</p>}<button className="site-button" type="submit" disabled={busy || !contactEnabled}>{busy ? 'Odesílám…' : 'Odeslat zprávu'}</button></form>;
}
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
    return <div className="booking-box"><div className="booking-method" role="group" aria-label="Způsob schůzky">{(['osobne', 'online', 'telefon'] as const).map((m) => <button key={m} type="button" aria-pressed={method === m} onClick={() => { setMethod(m); setLoad(false); setFailed(false); }}>{m === 'osobne' ? 'Osobně' : m === 'online' ? 'Online' : 'Telefonicky'}</button>)}</div><p className="booking-info">{method === 'osobne' ? `${siteConfig.address}, ${siteConfig.city}` : method === 'online' ? 'Setkáme se na dálku.' : 'Spojíme se telefonicky.'} · Časové pásmo: Praha</p>{topic && <p className="topic-note">Téma: {topic}</p>}{link ? <><p>Kalendář zobrazuje pouze volné termíny. Soukromé události nezveřejňuji.</p>{!load && <button className="site-button" onClick={() => setLoad(true)}>Zobrazit volné termíny</button>}<div ref={ref} className="cal-embed" hidden={!load} aria-label="Rezervační kalendář"/>{failed && <p role="alert">Kalendář se nepodařilo načíst. Můžete otevřít <a href={`https://cal.com/${link}`} target="_blank" rel="noreferrer">rezervační stránku</a> nebo mě kontaktovat přímo.</p>}<p className="form-note">Rezervaci zajišťuje Cal.com. <Link href="/dokumenty/osobni-udaje">Informace o zpracování údajů</Link>.</p></> : <div className="booking-empty"><span className="calendar-symbol" aria-hidden="true">↗</span><h3>Termín domluvíme přímo</h3><p>Online rezervace pro tento způsob schůzky zatím není připojená. Napište mi nebo zavolejte a společně najdeme vhodný čas.</p><a className="site-button" href={siteConfig.phoneHref}>Zavolat Martinovi</a><a className="text-inline" href={`mailto:${siteConfig.email}`}>Domluvit termín e-mailem ↗</a></div>}</div>;
}
export function ContactExperience() {
    const [tab, setTab] = useState<'booking' | 'message'>('booking');
    const [topic, setTopic] = useState('');
    useEffect(() => { const saved = sessionStorage.getItem('appointment-topic'); if (saved) {
        queueMicrotask(() => setTopic(saved));
        sessionStorage.removeItem('appointment-topic');
    } const choose = (e: Event) => { const detail = (e as CustomEvent).detail; setTab(detail.tab || 'booking'); setTopic(detail.topic || ''); }; window.addEventListener('appointment', choose); return () => window.removeEventListener('appointment', choose); }, []);
    return <div className="contact-experience"><div className="contact-tabs" role="group" aria-label="Způsob kontaktu"><button aria-pressed={tab === 'booking'} onClick={() => setTab('booking')}>Vybrat termín</button><button aria-pressed={tab === 'message'} onClick={() => setTab('message')}>Napsat zprávu</button></div><div className="contact-topic"><label htmlFor="contact-topic">Co chcete probrat? <span>(nepovinné)</span></label><select id="contact-topic" value={topic} onChange={e => setTopic(e.target.value)}><option value="">Vyberte téma</option>{services.map(s => <option key={s.id}>{s.title}</option>)}<option>Něco jiného</option></select></div>{tab === 'booking' ? <Booking topic={topic}/> : <ContactForm topic={topic}/>}<noscript><p>Rezervaci nebo zprávu domluvíte e-mailem či telefonicky pomocí kontaktů výše.</p></noscript></div>;
}
