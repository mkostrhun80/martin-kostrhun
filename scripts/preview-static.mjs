// Loopback-only static preview. No administration, form processing or database.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep, extname } from 'node:path';
import { securityHeaders, reportOnlyPolicy } from './static-headers.mjs';
const root = resolve(import.meta.dirname, '../out'), base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    if (base && !path.startsWith(base + '/') && path !== base) throw Error('path');
    const local = base ? path.slice(base.length) || '/' : path;
    const legacy = { '/zpetna-vazba': 'zpetna-vazba', '/zpetna-vazba/': 'zpetna-vazba', '/zkusenosti': 'zkusenosti', '/zkusenosti/': 'zkusenosti' }[local];
    if (legacy) { res.writeHead(301, { Location: base + '/#' + legacy, ...securityHeaders }); res.end(); return; }
    let file = resolve(root, '.' + local), rel = relative(root, file);
    if (isAbsolute(rel) || rel === '..' || rel.startsWith('..' + sep) || local.includes('\\') || local.includes('\0')) throw Error('path');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    if (['/_headers', '/_redirects'].includes(local)) throw Error('private host config');
    const data = await readFile(file), headers = { ...securityHeaders, 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (extname(file) === '.html') headers['Content-Security-Policy-Report-Only'] = reportOnlyPolicy(data.toString());
    res.writeHead(200, headers); res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Stránka nenalezena'); }
});
const requestedPort = Number(process.env.PORT || 4173);
server.once('error', error => {
  if (!['EADDRINUSE', 'EACCES'].includes(error.code) || !requestedPort) throw error;
  console.log(`Port ${requestedPort} unavailable, choosing a free local port.`); server.listen(0, '127.0.0.1');
});
server.on('listening', () => console.log(`Preview: http://127.0.0.1:${server.address().port}${base}/`));
server.listen(requestedPort, '127.0.0.1');
