import { defaultFAQ } from '../lib/public-data.ts';
export const consentVersion = '2026-10-12-v1';
export const consentText = { website: 'Souhlasím se zveřejněním této zkušenosti a uvedeného jména na webu Martina Kostrhuna.', marketing: 'Souhlasím také s použitím této zkušenosti a uvedeného jména v příspěvcích Martina Kostrhuna na sociálních sítích a v jeho prezentačních materiálech.' };
export const digest = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), n => n.toString(16).padStart(2, '0')).join('');
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } });
class InputError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
}
function text(v, min, max, label) { if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max)
    throw new InputError(`Zkontrolujte pole ${label}.`); return v.trim(); }
const email = (v) => { const s = text(v, 3, 150, 'e-mail').toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    throw new InputError('Zadejte platný e-mail.'); return s; };
const key = (v) => { if (typeof v !== 'string' || !/^[0-9a-f-]{36}$/.test(v))
    throw new InputError('Obnovte formulář a zkuste to znovu.'); return v; };
const bool = (v) => v === true;
const calLink = (value) => { if (!value)
    return ''; if (typeof value !== 'string')
    throw new InputError('Neplatný odkaz Cal.com.'); const s = value.replace(/^https:\/\/(?:app\.)?cal\.com\//, '').replace(/\/$/, ''); if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(s))
    throw new InputError('Použijte odkaz Cal.com na konkrétní typ schůzky.'); return s; };
export function createApp({ db, authenticateAdmin, rateSalt = 'local-preview', bookingLinks = {} }) {
    const first = (sql, ...params) => db.prepare(sql).bind(...params).first();
    const all = async (sql, ...params) => (await db.prepare(sql).bind(...params).all()).results;
    const run = (sql, ...params) => db.prepare(sql).bind(...params).run();
    const setting = async (k, fallback) => { const row = await first('SELECT value FROM settings WHERE key=?', k); return row ? JSON.parse(row.value) : fallback; };
    const save = (k, value) => run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', k, JSON.stringify(value));
    const audit = (action, id = '') => run('INSERT INTO audit_log VALUES(?,?,?,?)', crypto.randomUUID(), action, id, new Date().toISOString());
    async function limit(request, path) { await run('DELETE FROM rate_limits WHERE expires_at<?', Date.now()); const bucket = Math.floor(Date.now() / 600000); const ip = request.headers.get('CF-Connecting-IP') || 'local'; const hash = await digest(`${rateSalt}|${ip}|${bucket}|${path}`); await run('INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1', hash, (bucket + 1) * 600000); const row = await first('SELECT count FROM rate_limits WHERE key=?', hash); if (row.count > 10)
        throw new InputError('Příliš mnoho pokusů. Zkuste to za chvíli.', 429); }
    function formGuard(body) { key(body.requestId); if (body.website)
        throw new InputError('Formulář se nepodařilo přijmout.'); if (typeof body.startedAt !== 'number' || Date.now() - body.startedAt < 1000 || Date.now() - body.startedAt > 86400000)
        throw new InputError('Zkontrolujte formulář a odešlete jej znovu.'); }
    async function publicData() { const rows = await all('SELECT id,display_name,rating,text,created_at,verified,featured FROM feedback WHERE status=\'published\' AND consent_website=1 AND revoked_at IS NULL ORDER BY created_at DESC'); const faq = await all('SELECT id,question,answer,published FROM faq ORDER BY position,id'); const merged = new Map(defaultFAQ.map(f => [f.id, f])); for (const f of faq) {
        if (f.published)
            merged.set(f.id, { id: f.id, question: f.question, answer: f.answer });
        else
            merged.delete(f.id);
    } return { contactEnabled: true, statistics: await setting('statistics', null), reviews: rows.map(r => ({ id: r.id, displayName: r.display_name, rating: r.rating, text: r.text, createdAt: r.created_at, verified: !!r.verified, featured: !!r.featured })), faq: [...merged.values()], booking: { links: await setting('booking', bookingLinks), timezone: 'Europe/Prague' } }; }
    return async function handle(request) {
        const url = new URL(request.url), path = url.pathname.replace(/\/$/, '');
        let body;
        try {
            if (request.method === 'OPTIONS')
                return new Response(null, { status: 204 });
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                if (request.headers.get('Origin') !== url.origin)
                    throw new InputError('Neplatný původ požadavku.', 403);
                if (!request.headers.get('Content-Type')?.startsWith('application/json'))
                    throw new InputError('Neplatný formát požadavku.');
                const reader = request.body?.getReader();
                const chunks = [];
                let size = 0;
                if (reader) {
                    while (true) {
                        const chunk = await reader.read();
                        if (chunk.done)
                            break;
                        size += chunk.value.byteLength;
                        if (size > 16000) {
                            await reader.cancel();
                            throw new InputError('Požadavek je příliš dlouhý.', 413);
                        }
                        chunks.push(chunk.value);
                    }
                }
                const bytes = new Uint8Array(size);
                let offset = 0;
                for (const chunk of chunks) {
                    bytes.set(chunk, offset);
                    offset += chunk.byteLength;
                }
                const raw = new TextDecoder().decode(bytes);
                try {
                    body = JSON.parse(raw);
                }
                catch {
                    throw new InputError('Neplatný obsah formuláře.');
                }
                if (!body || typeof body !== 'object' || Array.isArray(body))
                    throw new InputError('Neplatný obsah formuláře.');
            }
            if (path === '/api/public' && request.method === 'GET')
                return json(await publicData());
            if (path.startsWith('/api/admin')) {
                if (!await authenticateAdmin(request))
                    return json({ ok: false, error: 'Pro tuto operaci se přihlaste do administrace.' }, 401);
                if (path === '/api/admin/state' && request.method === 'GET') {
                    const data = { contacts: await all('SELECT * FROM contacts ORDER BY created_at DESC'), feedback: await all('SELECT * FROM feedback ORDER BY created_at DESC'), invitations: await all('SELECT id,email,created_at,expires_at,used_by FROM invitations ORDER BY created_at DESC'), statistics: await setting('statistics', null), retention: await setting('retention', { contactDays: null, feedbackDays: null }), booking: await setting('booking', bookingLinks), faq: await all('SELECT * FROM faq ORDER BY position,id'), audit: await all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50') };
                    return json({ ok: true, ...data });
                }
                if (path === '/api/admin/export' && request.method === 'GET')
                    return json({ ok: true, exportedAt: new Date().toISOString(), contacts: await all('SELECT * FROM contacts'), feedback: await all('SELECT * FROM feedback'), invitations: await all('SELECT id,email,created_at,expires_at,used_by FROM invitations'), settings: await all('SELECT * FROM settings'), faq: await all('SELECT * FROM faq') });
                if (request.method !== 'POST')
                    throw new InputError('Operace není dostupná.', 405);
                if (path === '/api/admin/statistics') {
                    if (body.count === null) {
                        await save('statistics', null);
                    }
                    else {
                        if (!Number.isSafeInteger(body.count) || body.count < 0)
                            throw new InputError('Počet klientů musí být nezáporné celé číslo.');
                        if (typeof body.asOf !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.asOf) || Number.isNaN(Date.parse(body.asOf)) || new Date(body.asOf).toISOString().slice(0, 10) !== body.asOf || body.asOf > new Date().toISOString().slice(0, 10))
                            throw new InputError('Zadejte platné datum, které není v budoucnosti.');
                        await save('statistics', { count: body.count, asOf: body.asOf });
                    }
                    await audit('statistics');
                    return json({ ok: true });
                }
                if (path === '/api/admin/booking') {
                    const links = {};
                    for (const m of ['osobne', 'online', 'telefon']) {
                        const link = calLink(body[m]);
                        if (link)
                            links[m] = link;
                    }
                    await save('booking', links);
                    await audit('booking');
                    return json({ ok: true });
                }
                if (path === '/api/admin/faq') {
                    const id = text(body.id, 1, 60, 'identifikátor');
                    if (!/^[a-z0-9-]+$/.test(id))
                        throw new InputError('Neplatný identifikátor otázky.');
                    await run('INSERT INTO faq VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET question=excluded.question,answer=excluded.answer,published=excluded.published,position=excluded.position', id, text(body.question, 3, 200, 'otázka'), text(body.answer, 0, 3000, 'odpověď'), bool(body.published) && !!body.answer?.trim() ? 1 : 0, Number.isSafeInteger(body.position) ? body.position : 0);
                    await audit('faq', id);
                    return json({ ok: true });
                }
                if (path === '/api/admin/contact') {
                    if (!['new', 'read', 'done'].includes(body.status))
                        throw new InputError('Neplatný stav zprávy.');
                    await run('UPDATE contacts SET status=? WHERE id=?', body.status, key(body.id));
                    await audit('contact', body.id);
                    return json({ ok: true });
                }
                if (path === '/api/admin/invitation') {
                    const address = email(body.email);
                    if (body.confirmedClient !== true)
                        throw new InputError('Potvrďte, že jde o skutečného klienta.');
                    const secret = token(), id = crypto.randomUUID(), created = new Date(), expires = new Date(created.getTime() + 90 * 86400000);
                    await run('INSERT INTO invitations VALUES(?,?,?,?,?,NULL)', id, await digest(secret), address, created.toISOString(), expires.toISOString());
                    await audit('invitation', id);
                    return json({ ok: true, path: `/zpetna-vazba/?invite=${secret}` });
                }
                if (path === '/api/admin/feedback') {
                    const row = await first('SELECT * FROM feedback WHERE id=?', key(body.id));
                    if (!row)
                        throw new InputError('Příspěvek nebyl nalezen.', 404);
                    const verified = bool(body.verified), featured = bool(body.featured), status = body.status;
                    if (!['new', 'private', 'published', 'rejected'].includes(status))
                        throw new InputError('Neplatný stav hodnocení.');
                    const note = verified ? text(body.verificationNote, 5, 1000, 'doložení spolupráce') : '';
                    if (status === 'published' && (!row.consent_website || row.revoked_at))
                        throw new InputError('Autor nedal platný souhlas se zveřejněním.');
                    if (featured && (!verified || status !== 'published' || row.revoked_at))
                        throw new InputError('Vybranou referencí může být pouze ověřený, zveřejněný příspěvek s platným souhlasem.');
                    if (status === 'rejected' && !['spam', 'fake', 'personal_data', 'duplicate'].includes(body.reason))
                        throw new InputError('Uveďte důvod moderace nezávislý na hodnocení.');
                    await run('UPDATE feedback SET status=?,verified=?,verification_note=?,featured=?,moderation_reason=? WHERE id=?', status, verified ? 1 : 0, note, featured ? 1 : 0, status === 'rejected' ? body.reason : '', row.id);
                    await audit('feedback:' + status, row.id);
                    return json({ ok: true });
                }
                if (path === '/api/admin/revoke') {
                    await run('UPDATE feedback SET consent_website=0,consent_marketing=0,revoked_at=COALESCE(revoked_at,?),status=\'private\',featured=0 WHERE id=?', new Date().toISOString(), key(body.id));
                    await audit('consent-revoked-by-owner', body.id);
                    return json({ ok: true });
                }
                if (path === '/api/admin/delete') {
                    if (!['contacts', 'feedback', 'invitations'].includes(body.table))
                        throw new InputError('Neplatný typ záznamu.');
                    await run(`DELETE FROM ${body.table} WHERE id=?`, key(body.id));
                    await audit('delete:' + body.table, body.id);
                    return json({ ok: true });
                }
                if (path === '/api/admin/retention') {
                    for (const k of ['contactDays', 'feedbackDays'])
                        if (body[k] !== null && (!Number.isSafeInteger(body[k]) || body[k] < 1 || body[k] > 3650))
                            throw new InputError('Doba uchování musí být 1–3650 dnů nebo nevyplněná.');
                    await save('retention', { contactDays: body.contactDays, feedbackDays: body.feedbackDays });
                    await audit('retention');
                    return json({ ok: true });
                }
                if (path === '/api/admin/cleanup') {
                    const policy = await setting('retention', { contactDays: null, feedbackDays: null });
                    let deleted = 0;
                    if (policy.contactDays) {
                        const result = await run('DELETE FROM contacts WHERE created_at<?', new Date(Date.now() - policy.contactDays * 86400000).toISOString());
                        deleted += result.meta.changes;
                    }
                    if (policy.feedbackDays) {
                        const result = await run('DELETE FROM feedback WHERE created_at<? AND status!=\'published\'', new Date(Date.now() - policy.feedbackDays * 86400000).toISOString());
                        deleted += result.meta.changes;
                    }
                    await run('DELETE FROM invitations WHERE expires_at<?', new Date().toISOString());
                    await run('DELETE FROM rate_limits WHERE expires_at<?', Date.now());
                    await audit('cleanup');
                    return json({ ok: true, deleted });
                }
                throw new InputError('Operace nebyla nalezena.', 404);
            }
            if (request.method !== 'POST')
                throw new InputError('Rozhraní nebylo nalezeno.', 404);
            if (path === '/api/contact') {
                formGuard(body);
                const data = { name: text(body.name, 2, 100, 'jméno'), contact: text(body.contact, 3, 150, 'kontakt'), topic: text(body.topic || '', 0, 100, 'téma'), message: text(body.message, 2, 3000, 'zpráva') };
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact) && !/^\+?\d{9,15}$/.test(data.contact.replace(/[\s()-]/g, '')))
                    throw new InputError('Zadejte platný telefon nebo e-mail.');
                const hash = await digest(JSON.stringify(data)), old = await first('SELECT payload_hash FROM contacts WHERE id=?', body.requestId);
                if (old) {
                    if (old.payload_hash !== hash)
                        throw new InputError('Formulář se změnil. Odešlete jej znovu.', 409);
                    return json({ ok: true });
                }
                await limit(request, path);
                await run('INSERT OR IGNORE INTO contacts VALUES(?,?,?,?,?,?,?,\'new\')', body.requestId, hash, data.name, data.contact, data.topic, data.message, new Date().toISOString());
                const saved = await first('SELECT payload_hash FROM contacts WHERE id=?', body.requestId);
                if (saved.payload_hash !== hash)
                    throw new InputError('Formulář se změnil. Odešlete jej znovu.', 409);
                return json({ ok: true }, 201);
            }
            if (path === '/api/feedback') {
                formGuard(body);
                if (typeof body.withdrawalToken !== 'string' || !/^([a-f0-9]{64})$/.test(body.withdrawalToken))
                    throw new InputError('Obnovte formulář.');
                const data = { name: text(body.name, 2, 100, 'jméno'), email: email(body.email), displayName: text(body.displayName, 1, 100, 'zveřejněné jméno'), rating: body.rating, text: text(body.text, 10, 3000, 'zkušenost'), consentWebsite: bool(body.consentWebsite), consentMarketing: bool(body.consentMarketing) };
                if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5)
                    throw new InputError('Vyberte hodnocení 1 až 5.');
                const hash = await digest(JSON.stringify({ ...data, inviteToken: body.inviteToken || '', withdrawalToken: body.withdrawalToken })), old = await first('SELECT payload_hash FROM feedback WHERE id=?', body.requestId);
                if (old) {
                    if (old.payload_hash !== hash)
                        throw new InputError('Formulář se změnil. Odešlete jej znovu.', 409);
                    return json({ ok: true });
                }
                await limit(request, path);
                const now = new Date().toISOString(), revokeHash = await digest(body.withdrawalToken);
                const values = [body.requestId, hash, data.name, data.email, data.displayName, data.rating, data.text, now, data.consentWebsite ? 1 : 0, data.consentMarketing ? 1 : 0, consentVersion, JSON.stringify(consentText), now, revokeHash];
                if (body.inviteToken) {
                    if (!/^[a-f0-9]{64}$/.test(body.inviteToken))
                        throw new InputError('Pozvánka je neplatná.');
                    const inviteHash = await digest(body.inviteToken);
                    const found = await first('SELECT * FROM invitations WHERE token_hash=?', inviteHash);
                    if (!found || found.expires_at <= now || found.email !== data.email || found.used_by)
                        throw new InputError('Pozvánka je neplatná, již použitá nebo je určena pro jiný e-mail.');
                    const result = await db.batch([db.prepare('UPDATE invitations SET used_by=? WHERE token_hash=? AND used_by IS NULL AND expires_at>? AND email=?').bind(body.requestId, inviteHash, now, data.email), db.prepare('INSERT OR IGNORE INTO feedback(id,payload_hash,name,email,display_name,rating,text,created_at,consent_website,consent_marketing,consent_version,consent_text,consent_at,revoke_hash,verified,verification_note) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,\'Jednorázová pozvánka vystavená pro skutečného klienta.\' WHERE EXISTS(SELECT 1 FROM invitations WHERE token_hash=? AND used_by=?)').bind(...values, inviteHash, body.requestId)]);
                    if (result[1].meta.changes !== 1 && !await first('SELECT id FROM feedback WHERE id=?', body.requestId))
                        throw new InputError('Pozvánka byla mezitím použita.', 409);
                }
                else
                    await run('INSERT OR IGNORE INTO feedback(id,payload_hash,name,email,display_name,rating,text,created_at,consent_website,consent_marketing,consent_version,consent_text,consent_at,revoke_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', ...values);
                const stored = await first('SELECT payload_hash FROM feedback WHERE id=?', body.requestId);
                if (!stored || stored.payload_hash !== hash)
                    throw new InputError('Formulář se změnil. Odešlete jej znovu.', 409);
                return json({ ok: true }, 201);
            }
            if (path === '/api/feedback/revoke') {
                await limit(request, path);
                if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token))
                    throw new InputError('Neplatný odkaz.', 404);
                const hash = await digest(body.token);
                const row = await first('SELECT id FROM feedback WHERE revoke_hash=?', hash);
                if (!row)
                    throw new InputError('Neplatný odkaz.', 404);
                await run('UPDATE feedback SET consent_website=0,consent_marketing=0,revoked_at=COALESCE(revoked_at,?),status=\'private\',featured=0 WHERE revoke_hash=?', new Date().toISOString(), hash);
                await audit('consent-revoked', row.id);
                return json({ ok: true });
            }
            throw new InputError('Rozhraní nebylo nalezeno.', 404);
        }
        catch (error) {
            if (error instanceof InputError)
                return json({ ok: false, error: error.message }, error.status);
            return json({ ok: false, error: 'Služba právě není dostupná. Zkuste to později nebo kontaktujte Martina přímo.' }, 503);
        }
    };
}
