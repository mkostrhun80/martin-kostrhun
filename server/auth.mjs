// Production accepts only a cryptographically verified Cloudflare Access token.
const keysCache = new Map();
const decode = (part) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
export async function verifyAccess(request, env, fetcher = fetch) {
    const team = env.ACCESS_TEAM_DOMAIN, audience = env.ACCESS_AUD, email = env.ADMIN_EMAIL;
    if (!team || !team.endsWith('.cloudflareaccess.com') || !audience || !email)
        return false;
    const token = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!token)
        return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return false;
        const header = decode(parts[0]), claims = decode(parts[1]);
        const now = Date.now() / 1000;
        if (header.alg !== 'RS256' || typeof header.kid !== 'string' || claims.iss !== `https://${team}` || typeof claims.exp !== 'number' || claims.exp <= now || typeof claims.iat !== 'number' || claims.iat > now + 60 || (claims.nbf !== undefined && claims.nbf > now + 60) || claims.email?.toLowerCase() !== email.toLowerCase() || !(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(audience))
            return false;
        let cached = keysCache.get(team);
        if (!cached || cached.until < Date.now()) {
            const response = await fetcher(`https://${team}/cdn-cgi/access/certs`);
            if (!response.ok)
                return false;
            const doc = await response.json();
            if (!Array.isArray(doc.keys))
                return false;
            cached = { keys: doc.keys, until: Date.now() + 300000 };
            keysCache.set(team, cached);
        }
        const jwk = cached.keys.find(k => k.kid === header.kid && k.kty === 'RSA');
        if (!jwk)
            return false;
        const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
        const signature = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    }
    catch {
        return false;
    }
}
