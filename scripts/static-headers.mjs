import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};
export function reportOnlyPolicy(html) {
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => !/\bsrc\s*=/i.test(match[1]) && match[2].trim()).map(match => "'sha256-" + createHash('sha256').update(match[2]).digest('base64') + "'");
  return ["default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "script-src 'self' " + [...new Set(hashes)].join(' ') + ' https://hcaptcha.com https://*.hcaptcha.com', "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com", "img-src 'self' data: https://hcaptcha.com https://*.hcaptcha.com", "font-src 'self' data:", "connect-src 'self' https://api.web3forms.com https://hcaptcha.com https://*.hcaptcha.com", 'frame-src https://cal.com https://hcaptcha.com https://*.hcaptcha.com', "form-action 'self' https://api.web3forms.com"].join('; ');
}
export async function generateStaticHeaders(directory, base = '') {
  const root = resolve(directory), lines = ['/*', ...Object.entries(securityHeaders).map(([key, value]) => `  ${key}: ${value}`), '', `${base}/_next/static/*`, '  Cache-Control: public, max-age=31536000, immutable', ''];
  async function visit(dir) {
    for (const file of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, file.name);
      if (file.isDirectory()) await visit(path);
      else if (file.name.endsWith('.html')) {
        const route = '/' + relative(root, path).replaceAll('\\', '/').replace(/index\.html$/, '');
        const policy = reportOnlyPolicy(await readFile(path, 'utf8'));
        const header = '  Content-Security-Policy-Report-Only: ' + policy;
        if (header.length > 2000) throw Error(`CSP header exceeds Cloudflare's 2000-character line limit: ${route} (${header.length}).`);
        lines.push(base + route, header, '');
      }
    }
  }
  await visit(root); await writeFile(join(root, '_headers'), lines.join('\n') + '\n');
}
