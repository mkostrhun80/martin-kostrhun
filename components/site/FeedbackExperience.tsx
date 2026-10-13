'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { postJSON, newSubmission } from './ContactExperience';
import { useSiteData } from './SiteData';
import { sitePath } from '@/lib/site-path';
import { siteConfig } from '@/lib/site-config';
import { ReviewCard } from './TrustAndFAQ';
export function FeedbackExperience() {
    const { contactEnabled } = useSiteData();
    const [invite, setInvite] = useState('');
    const [revoke, setRevoke] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [withdrawn, setWithdrawn] = useState(false);
    const [revokeLink, setRevokeLink] = useState('');
    const submission = useRef<(ReturnType<typeof newSubmission> & {
        withdrawalToken: string;
    }) | null>(null);
    useEffect(() => { const p = new URLSearchParams(location.search); queueMicrotask(() => { setInvite(p.get('invite') || ''); setRevoke(p.get('revoke') || ''); }); }, []);
    const make = () => ({ ...newSubmission(), withdrawalToken: Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('') });
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy)
        return; setBusy(true); setError(''); const form = e.currentTarget; const d = new FormData(form); submission.current ??= make(); try {
        await postJSON('/feedback', { ...submission.current, name: d.get('name'), email: d.get('email'), displayName: d.get('displayName'), rating: Number(d.get('rating')), text: d.get('text'), website: d.get('website'), consentWebsite: d.get('consentWebsite') === 'on', consentMarketing: d.get('consentMarketing') === 'on', inviteToken: invite });
        setRevokeLink(`${location.origin}${sitePath('/zpetna-vazba/')}?revoke=${submission.current.withdrawalToken}`);
        setSuccess(true);
        form.reset();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Zpětnou vazbu se nepodařilo uložit.');
    }
    finally {
        setBusy(false);
    } }
    if (revoke)
        return <div className="feedback-withdraw"><h2>Odvolání souhlasu</h2><p>Stažením souhlasu se reference ihned přestane zobrazovat na webu a nebude určena k dalšímu propagačnímu použití.</p><button className="site-button" disabled={busy || withdrawn} onClick={async () => { setBusy(true); setError(''); try {
            await postJSON('/feedback/revoke', { token: revoke });
            setWithdrawn(true);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Souhlas se nepodařilo změnit.');
        }
        finally {
            setBusy(false);
        } }}>{withdrawn ? 'Souhlas byl odvolán' : 'Odvolat souhlasy se zveřejněním'}</button>{error && <p role="alert">{error}</p>}{withdrawn && <p role="status">Reference byla stažena. Pro další žádosti o údaje kontaktujte Martina přímo.</p>}</div>;
    if (success)
        return <div className="feedback-success" role="status"><h2>Děkuji za zpětnou vazbu.</h2><p>Odpověď byla uložena. Zveřejnění proběhne pouze podle vašich souhlasů a po kontrole.</p><p>Uložte si soukromý odkaz pro případné odvolání souhlasu:</p><a href={revokeLink}>Odkaz pro odvolání souhlasu</a><button className="site-button site-button-quiet" onClick={() => navigator.clipboard.writeText(revokeLink)}>Zkopírovat odkaz</button></div>;
    return <form className="plain-form" onSubmit={submit} onFocus={() => { submission.current ??= make(); }} onChange={() => { submission.current = { ...make(), startedAt: submission.current?.startedAt || Date.now() }; }}><div className="form-pair"><label>Vaše jméno<input name="name" required autoComplete="name" minLength={2} maxLength={100}/></label><label>E-mail pro soukromý kontakt<input name="email" type="email" required autoComplete="email" maxLength={150}/></label></div><label>Jak hodnotíte spolupráci?<select name="rating" defaultValue="" required><option value="" disabled>Vyberte hodnocení</option>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} z 5</option>)}</select></label><label>Vaše zkušenost<textarea name="text" required minLength={10} maxLength={3000} rows={5}/></label><label>Jméno pro případné zveřejnění<input name="displayName" required maxLength={100} placeholder="Například Jana K. nebo anonymně"/></label><label className="form-honeypot" aria-hidden="true">Webová stránka<input name="website" tabIndex={-1} autoComplete="off"/></label><label className="consent-row"><input type="checkbox" name="consentWebsite"/><span>Souhlasím se zveřejněním této zkušenosti a uvedeného jména na webu Martina Kostrhuna.</span></label><label className="consent-row"><input type="checkbox" name="consentMarketing"/><span>Souhlasím také s použitím této zkušenosti a uvedeného jména v příspěvcích Martina Kostrhuna na sociálních sítích a v jeho prezentačních materiálech.</span></label><p className="form-note">Oba souhlasy jsou dobrovolné. Zpětnou vazbu můžete poslat i bez nich. E-mail nezveřejňuji. Souhlas lze kdykoli odvolat pomocí soukromého odkazu po odeslání nebo <a href={`mailto:${siteConfig.email}`}>e-mailem</a>. Nepište čísla smluv ani citlivé osobní údaje. <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p>{invite && <p className="form-note">Odpovídáte prostřednictvím pozvánky ke zpětné vazbě. Použijte e-mail, pro který byla vystavena.</p>}{!contactEnabled && <p>Formulář právě není dostupný. Zpětnou vazbu mi můžete poslat přímo e-mailem.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="site-button" disabled={!contactEnabled || busy}>{busy ? 'Ukládám…' : 'Odeslat zpětnou vazbu'}</button></form>;
}
export function AllReviews() { const { reviews } = useSiteData(); return <><p>Zde jsou všechna zveřejněná hodnocení, od nejnovějšího. Nízké hodnocení není důvodem k vyřazení.</p><p className="review-method">Označení „Ověřená spolupráce“ znamená, že původ hodnocení byl doložen podle evidence klientů nebo jednorázové pozvánky vystavené po skutečné spolupráci. Neověřené příspěvky jsou označeny. Zveřejnění vždy vyžaduje souhlas autora. Spam, nepravé příspěvky a příspěvky s osobními údaji nezveřejňuji.</p>{reviews.length ? <div className="review-grid">{reviews.map(r => <ReviewCard review={r} key={r.id}/>)}</div> : <p className="empty-note">Zatím zde nejsou zveřejněná hodnocení. Zkušenosti doplním po ověření a se souhlasem autorů.</p>}<Link className="site-button" href="/zpetna-vazba">Zanechat zpětnou vazbu</Link></>; }
