'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiPath } from './SiteData';
import { postJSON } from './ContactExperience';
import { defaultFAQ, type FAQ } from '@/lib/public-data';
import { sitePath } from '@/lib/site-path';
type FeedbackRow = {
    id: string;
    name: string;
    email: string;
    display_name: string;
    text: string;
    rating: number;
    status: string;
    verified: number;
    verification_note: string;
    featured: number;
    consent_website: number;
    consent_marketing: number;
    revoked_at: string | null;
    created_at: string;
    consent_version: string;
    consent_at: string;
    moderation_reason: string;
};
type State = {
    contacts: {
        id: string;
        name: string;
        contact: string;
        message: string;
        topic: string;
        status: string;
        created_at: string;
    }[];
    feedback: FeedbackRow[];
    invitations: {
        id: string;
        email: string;
        expires_at: string;
        used_by: string | null;
    }[];
    statistics: {
        count: number;
        asOf: string;
    } | null;
    retention: {
        contactDays: number | null;
        feedbackDays: number | null;
    };
    booking: Record<string, string>;
    faq: (Omit<FAQ, 'published'> & {
        published: number;
        position: number;
    })[];
};
const drafts: FAQ[] = [...defaultFAQ, { id: 'priprava', question: 'Co si na schůzku připravit?', answer: '' }, { id: 'cena', question: 'Kolik spolupráce stojí a jak funguje moje odměna?', answer: '' }];
export function Admin() {
    const [data, setData] = useState<State | null>(null);
    const [local, setLocal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('messages');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [invite, setInvite] = useState('');
    const [busy, setBusy] = useState(false);
    const refresh = useCallback(async () => { try {
        const r = await fetch(apiPath('/admin/state'), { cache: 'no-store' });
        if (r.ok) {
            setData(await r.json() as State);
            setError('');
        }
        else
            setData(null);
    }
    catch {
        setData(null);
    }
    finally {
        setLoading(false);
    } }, []);
    useEffect(() => { void Promise.resolve().then(refresh); fetch(apiPath('/local/status')).then(r => r.ok ? r.json() : null).then(v => setLocal((v as {
        local?: boolean;
    } | null)?.local === true)).catch(() => { }); }, [refresh]);
    async function action(path: string, body: unknown) { setBusy(true); setError(''); setNotice(''); try {
        const r = await postJSON('/admin/' + path, body);
        await refresh();
        setNotice('Změna byla uložena.');
        return r;
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Změnu se nepodařilo uložit.');
        return null;
    }
    finally {
        setBusy(false);
    } }
    async function formAction(e: FormEvent<HTMLFormElement>, path: string, make: (d: FormData) => unknown) { e.preventDefault(); await action(path, make(new FormData(e.currentTarget))); }
    const remove = (table: string, id: string) => { if (confirm('Opravdu odstranit tento konkrétní záznam? Tuto akci nelze vrátit.'))
        void action('delete', { table, id }); };
    if (loading)
        return <p role="status">Načítám správu…</p>;
    if (!data)
        return <div className="admin-login"><h1>Soukromá správa<span>.</span></h1>{local ? <><p>Přístup je chráněný klíčem lokálního náhledu. Najdete ho v souboru work/local-preview/admin-key v projektu.</p><form className="plain-form" onSubmit={async (e) => { e.preventDefault(); setError(''); try {
            await postJSON('/local/login', { key: new FormData(e.currentTarget).get('key') });
            await refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Přihlášení se nepodařilo.');
        } }}><label>Přístupový klíč<input name="key" type="password" autoComplete="current-password" required/></label><button className="site-button">Přihlásit se</button></form></> : <p>Pro tuto stránku je nutné přihlášení přes Cloudflare Access. Pokud ještě není služba připojená, administrace zůstává uzavřená.</p>}{error && <p role="alert" className="form-error">{error}</p>}</div>;
    const faq = drafts.map(f => data.faq.find(row => row.id === f.id) || { ...f, published: !!f.answer, position: drafts.findIndex(row => row.id === f.id) }).concat(data.faq.filter(f => !drafts.some(d => d.id === f.id)));
    return <><h1>Správa webu<span>.</span></h1>{local && <p className="admin-warning">Lokální náhled · tato databáze je oddělená od produkce. Rezervace a stav jejich nastavení najdete v části Nastavení.</p>}<div className="admin-bar" role="group" aria-label="Část administrace">{[['messages', 'Zprávy'], ['feedback', 'Zpětná vazba'], ['settings', 'Nastavení'], ['faq', 'Časté otázky']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setNotice(''); setError(''); }}>{label}</button>)}<button onClick={async () => { const r = await fetch(apiPath('/admin/export')); if (!r.ok) {
        setError('Export se nepodařil.');
        return;
    } const blob = await r.blob(); const href = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = href; a.download = 'soukromy-export-webu.json'; a.click(); URL.revokeObjectURL(href); }}>Export údajů</button>{local && <button onClick={async () => { await postJSON('/local/logout', {}); setData(null); }}>Odhlásit</button>}</div>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="admin-status" role="status">{notice}</p>}
 {tab === 'messages' && <section className="admin-section"><h2>Přijaté zprávy</h2>{!data.contacts.length && <p>Zatím nebyly přijaty žádné zprávy.</p>}{data.contacts.map(c => <article className="admin-item" key={c.id}><strong>{c.name}</strong><small>{c.contact} · {new Date(c.created_at).toLocaleString('cs-CZ')} · {c.status === 'new' ? 'Nová' : c.status === 'read' ? 'Přečtená' : 'Vyřízená'}</small>{c.topic && <p>Téma: {c.topic}</p>}<p>{c.message}</p><div className="admin-actions"><button disabled={busy} onClick={() => action('contact', { id: c.id, status: 'read' })}>Označit přečtenou</button><button disabled={busy} onClick={() => action('contact', { id: c.id, status: 'done' })}>Vyřízená</button><button disabled={busy} className="danger" onClick={() => remove('contacts', c.id)}>Odstranit</button></div></article>)}</section>}
 {tab === 'feedback' && <><section className="admin-section"><h2>Pozvánka skutečnému klientovi</h2><form className="plain-form" onSubmit={async (e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const r = await action('invitation', { email: d.get('email'), confirmedClient: d.get('confirmed') === 'on' }); if (r)
        setInvite(location.origin + sitePath(String(r.path))); }}><label>E-mail klienta<input name="email" type="email" required/></label><label className="consent-row"><input name="confirmed" type="checkbox" required/><span>Potvrzuji, že jsem tomuto člověku skutečně poskytl službu.</span></label><button className="site-button" disabled={busy}>Vytvořit jednorázový odkaz</button></form>{invite && <div className="admin-item"><p>Odkaz se automaticky neodesílá. Platí 90 dní a lze jej použít jednou.</p><button className="site-button site-button-quiet" onClick={() => navigator.clipboard.writeText(invite)}>Zkopírovat pozvánku</button></div>}{data.invitations.map(i => <div className="admin-item" key={i.id}><small>{i.email} · {i.used_by ? 'Použitá' : `Platná do ${new Date(i.expires_at).toLocaleDateString('cs-CZ')}`}</small><button className="text-inline" onClick={() => remove('invitations', i.id)}>Zrušit pozvánku</button></div>)}</section><section className="admin-section"><h2>Zpětná vazba</h2>{!data.feedback.length && <p>Zatím nebyla přijata žádná zpětná vazba.</p>}{data.feedback.map(f => <FeedbackEditor key={`${f.id}-${f.status}-${f.featured}-${f.revoked_at}`} row={f} busy={busy} save={body => action('feedback', body)} revoke={() => action('revoke', { id: f.id })} remove={() => remove('feedback', f.id)}/>)}</section></>}
 {tab === 'settings' && <><div className="admin-setting-grid"><section className="admin-section"><h2>Počet klientů</h2><p>Každý člověk se počítá jednou. Údaj není živý.</p><form className="plain-form" key={JSON.stringify(data.statistics)} onSubmit={e => formAction(e, 'statistics', d => ({ count: d.get('count') === '' ? null : Number(d.get('count')), asOf: d.get('asOf') }))}><label>Počet klientů<input name="count" type="number" min="0" step="1" defaultValue={data.statistics?.count ?? ''}/></label><label>Údaj platí k datu<input name="asOf" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={data.statistics?.asOf || ''}/></label><p className="form-note">Prázdný počet údaj na webu skryje.</p><button disabled={busy} className="site-button">Uložit počet klientů</button></form></section><section className="admin-section"><h2>Rezervace Cal.com</h2><p>Nastavte typy schůzek a propojení iCloud v Cal.com. Zde vložte jejich odkazy. Prázdný odkaz ponechá přímý kontakt.</p><form className="plain-form" onSubmit={e => formAction(e, 'booking', d => Object.fromEntries(d))}>{[['osobne', 'Osobně'], ['online', 'Online'], ['telefon', 'Telefonicky']].map(([id, label]) => <label key={id}>{label}<input name={id} defaultValue={data.booking[id] || ''} placeholder="https://cal.com/jmeno/typ-schuzky"/></label>)}<button disabled={busy} className="site-button">Uložit rezervace</button></form><a className="text-inline" href="https://app.cal.com/event-types" target="_blank" rel="noreferrer">Otevřít správu v Cal.com ↗</a></section></div><section className="admin-section"><h2>Uchování a mazání údajů</h2><p>Dobu uchování je nutné určit před ostrým spuštěním. Prázdné nastavení automatické mazání neaktivuje. Zveřejněné reference se při úklidu nemažou.</p><form className="plain-form" onSubmit={e => formAction(e, 'retention', d => ({ contactDays: d.get('contactDays') === '' ? null : Number(d.get('contactDays')), feedbackDays: d.get('feedbackDays') === '' ? null : Number(d.get('feedbackDays')) }))}><div className="form-pair"><label>Zprávy – počet dnů<input name="contactDays" type="number" min="1" max="3650" defaultValue={data.retention.contactDays ?? ''}/></label><label>Nezveřejněná zpětná vazba – počet dnů<input name="feedbackDays" type="number" min="1" max="3650" defaultValue={data.retention.feedbackDays ?? ''}/></label></div><button disabled={busy} className="site-button">Uložit dobu uchování</button></form><div className="admin-actions"><button className="danger" onClick={() => { if (confirm('Odstranit záznamy po nastavené době uchování? Nejprve si případně vytvořte export.'))
        void action('cleanup', {}); }}>Odstranit údaje po době uchování</button></div></section></>}
 {tab === 'faq' && <section className="admin-section"><h2>Časté otázky</h2><p>Publikujte pouze potvrzené odpovědi. Cena a příprava na schůzku jsou zatím nevyplněné.</p>{faq.map((f, i) => <form className="admin-item" key={f.id} onSubmit={e => formAction(e, 'faq', d => ({ id: f.id, question: d.get('question'), answer: d.get('answer'), published: d.get('published') === 'on', position: i }))}><label>Otázka<input name="question" defaultValue={f.question} required maxLength={200}/></label><label>Odpověď<textarea name="answer" defaultValue={f.answer} rows={3} maxLength={3000}/></label><label><input name="published" type="checkbox" defaultChecked={!!f.published} style={{ display: 'inline', width: 20 }}/> Zveřejnit ověřenou odpověď</label><button className="site-button" disabled={busy}>Uložit otázku</button></form>)}</section>}
 </>;
}
function FeedbackEditor({ row, busy, save, revoke, remove }: {
    row: FeedbackRow;
    busy: boolean;
    save: (body: unknown) => Promise<unknown>;
    revoke: () => Promise<unknown>;
    remove: () => void;
}) { const [verified, setVerified] = useState(!!row.verified); const [note, setNote] = useState(row.verification_note); const [reason, setReason] = useState('spam'); const update = (status: string, featured = false) => save({ id: row.id, status, featured, verified, verificationNote: note, reason }); return <article className="admin-item"><strong>{row.name} · {row.rating}/5</strong><small>{row.email} · {new Date(row.created_at).toLocaleString('cs-CZ')} · {row.status}</small><p>{row.text}</p><small>Zveřejněné jméno: {row.display_name}</small><small>Web: {row.consent_website ? 'souhlas' : 'bez souhlasu'} · Propagace: {row.consent_marketing ? 'souhlas' : 'bez souhlasu'}{row.revoked_at ? ' · Souhlasy odvolány' : ''}</small><small>Verze souhlasu: {row.consent_version} · {row.consent_at}</small><label><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} style={{ display: 'inline', width: 20 }}/> Spolupráce skutečně ověřena</label>{verified && <label>Doložení spolupráce – soukromá poznámka<input value={note} onChange={e => setNote(e.target.value)} minLength={5} placeholder="Jak byla skutečná spolupráce ověřena"/></label>}<div className="admin-actions"><button disabled={busy} onClick={() => update('private')}>Ponechat soukromou</button><button disabled={busy || !row.consent_website || !!row.revoked_at} onClick={() => update('published', !!row.featured)}>Zveřejnit</button><button disabled={busy || !verified || row.status !== 'published' || !!row.revoked_at} onClick={() => update('published', !row.featured)}>{row.featured ? 'Odebrat z výběru' : 'Zařadit do výběru'}</button><button disabled={busy || !!row.revoked_at} onClick={revoke}>Odvolat souhlasy na žádost autora</button>{!!row.consent_marketing && !row.revoked_at && <button onClick={() => navigator.clipboard.writeText(`„${row.text}“ — ${row.display_name}\nPovoleno: sociální sítě a prezentační materiály Martina Kostrhuna. Souhlas ${row.consent_version}, ${row.consent_at}.`)}>Zkopírovat pro propagaci</button>}<button className="danger" disabled={busy} onClick={remove}>Odstranit</button></div><label>Důvod vyřazení<select value={reason} onChange={e => setReason(e.target.value)}><option value="spam">Spam</option><option value="fake">Nepravý příspěvek</option><option value="personal_data">Obsahuje osobní údaje</option><option value="duplicate">Duplicitní příspěvek</option></select></label><div className="admin-actions"><button disabled={busy} onClick={() => update('rejected')}>Vyřadit z uvedeného důvodu</button></div></article>; }
