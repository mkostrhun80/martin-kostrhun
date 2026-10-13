import { createApp } from './app.mjs';
import { verifyAccess } from './auth.mjs';
const worker = { async fetch(request, env) {
        const url = new URL(request.url);
        const privatePage = url.pathname === '/sprava' || url.pathname.startsWith('/sprava/');
        if (privatePage && !await verifyAccess(request, env))
            return new Response('Administrace vyžaduje přihlášení přes Cloudflare Access.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
        if (url.pathname.startsWith('/api/')) {
            if (!env.DB || !env.RATE_SALT)
                return Response.json({ ok: false, error: 'Služba zatím není nakonfigurovaná.' }, { status: 503 });
            return createApp({ db: env.DB, authenticateAdmin: r => verifyAccess(r, env), rateSalt: env.RATE_SALT })(request);
        }
        const response = await env.ASSETS.fetch(request);
        const headers = new Headers(response.headers);
        headers.set('Referrer-Policy', 'no-referrer');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('X-Frame-Options', 'DENY');
        if (privatePage)
            headers.set('Cache-Control', 'no-store');
        return new Response(response.body, { status: response.status, headers });
    } };
export default worker;
