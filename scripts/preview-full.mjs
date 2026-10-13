// Local-only server. This file is never bundled into the production Worker.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { resolve, extname } from 'node:path';
import { sqliteAdapter } from '../server/sqlite.mjs';
import { createApp } from '../server/app.mjs';
const root = resolve(import.meta.dirname, '..'), state = resolve(root, 'work/local-preview');
await mkdir(state, { recursive: true });
const keyFile = resolve(state, 'admin-key');
let secret;
try {
    secret = (await readFile(keyFile, 'utf8')).trim();
}
catch {
    secret = randomBytes(32).toString('hex');
    await writeFile(keyFile, secret, { mode: 0o600 });
}
const db = sqliteAdapter(resolve(state, 'data.sqlite'));
db.connection.exec('CREATE TABLE IF NOT EXISTS _migrations(name TEXT PRIMARY KEY)');
if (!db.connection.prepare('SELECT name FROM _migrations WHERE name=?').get('0001')) {
    db.connection.exec(await readFile(resolve(root, 'server/migrations/0001_presentation.sql'), 'utf8'));
    db.connection.prepare('INSERT INTO _migrations VALUES(?)').run('0001');
}
const equal = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
const sign = s => createHmac('sha256', secret).update(s).digest('hex');
const auth = async (request) => { const value = request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith('mk_preview='))?.slice(11); if (!value)
    return false; const [expiry, signature] = value.split('.'); return Number(expiry) > Date.now() && equal(signature || '', sign(expiry)); };
const app = createApp({ db, authenticateAdmin: auth, rateSalt: secret });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml' };
const port = Number(process.env.PREVIEW_PORT || 4173), origin = `http://localhost:${port}`;
createServer(async (req, res) => {
    try {
        const incoming = new URL(req.url, origin);
        const chunks = [];
        for await (const chunk of req)
            chunks.push(chunk);
        const bytes = Buffer.concat(chunks);
        if (bytes.length > 16000) {
            res.writeHead(413);
            res.end();
            return;
        }
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers))
            if (typeof v === 'string')
                headers.set(k, v);
        headers.set('CF-Connecting-IP', req.socket.remoteAddress || 'local');
        headers.delete('Cf-Access-Jwt-Assertion');
        const request = new Request(incoming, { method: req.method, headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: bytes } : {}) });
        let response;
        if (incoming.pathname === '/api/local/status')
            response = Response.json({ local: true });
        else if (incoming.pathname === '/api/local/login' && req.method === 'POST') {
            if (headers.get('Origin') !== origin && headers.get('Origin') !== `http://127.0.0.1:${port}`) {
                response = new Response('', { status: 403 });
            }
            else {
                let data;
                try {
                    data = JSON.parse(bytes.toString());
                }
                catch {
                    data = {};
                }
                if (!equal(String(data.key || ''), secret))
                    response = Response.json({ ok: false, error: 'Neplatný přístupový klíč.' }, { status: 401 });
                else {
                    const exp = String(Date.now() + 4 * 3600000);
                    response = Response.json({ ok: true }, { headers: { 'Set-Cookie': `mk_preview=${exp}.${sign(exp)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=14400` } });
                }
            }
        }
        else if (incoming.pathname === '/api/local/logout')
            response = Response.json({ ok: true }, { headers: { 'Set-Cookie': 'mk_preview=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' } });
        else if (incoming.pathname.startsWith('/api/'))
            response = await app(request);
        else {
            const relative = decodeURIComponent(incoming.pathname);
            let file = resolve(root, 'out', '.' + relative);
            if (!file.startsWith(resolve(root, 'out') + '/') && file !== resolve(root, 'out'))
                throw new Error('path');
            try {
                if ((await stat(file)).isDirectory())
                    file = resolve(file, 'index.html');
            }
            catch {
                if (!extname(file))
                    file = resolve(file, 'index.html');
            }
            try {
                const data = await readFile(file);
                response = new Response(data, { headers: { 'Content-Type': types[extname(file)] || 'application/octet-stream' } });
            }
            catch {
                response = new Response(await readFile(resolve(root, 'out/404.html')), { status: 404, headers: { 'Content-Type': 'text/html' } });
            }
        }
        res.writeHead(response.status, { 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...Object.fromEntries(response.headers) });
        res.end(Buffer.from(await response.arrayBuffer()));
    }
    catch {
        res.writeHead(500);
        res.end('Local preview error');
    }
}).listen(port, '127.0.0.1', () => console.log(`Local: ${origin}\nAdministrace: ${origin}/sprava/\nPřístupový klíč lokálního náhledu je v work/local-preview/admin-key.\nLokální databáze je oddělená od produkce.`));
