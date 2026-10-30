import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { generateStaticHeaders } from './static-headers.mjs';
import nextEnvironment from '@next/env';

nextEnvironment.loadEnvConfig(fileURLToPath(new URL('..', import.meta.url)));

const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.CF_PAGES_URL || '';
if (site) {
  const url = new URL(site);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw Error('NEXT_PUBLIC_SITE_URL must be the real HTTPS website URL, without credentials, query or fragment.');
}
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '', NEXT_PUBLIC_SITE_URL: site.replace(/\/$/, '') };
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'build', '--webpack'], { stdio: 'inherit', env });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
await generateStaticHeaders('out', env.NEXT_PUBLIC_BASE_PATH);
await writeFile('out/.nojekyll', '');
await writeFile('out/deployment.json', JSON.stringify({
  revision: process.env.GITHUB_SHA || null,
  siteURL: env.NEXT_PUBLIC_SITE_URL,
  basePath: env.NEXT_PUBLIC_BASE_PATH,
  formsEnabled: env.NEXT_PUBLIC_FORMS_VERIFIED === 'true',
  bookingEnabled: env.NEXT_PUBLIC_BOOKING_VERIFIED === 'true',
}, null, 2) + '\n');
const base = env.NEXT_PUBLIC_BASE_PATH;
await writeFile('out/_redirects', ['/zpetna-vazba /#zpetna-vazba 301', '/zpetna-vazba/ /#zpetna-vazba 301', '/zkusenosti /#zkusenosti 301', '/zkusenosti/ /#zkusenosti 301'].map(rule => base ? rule.replace(/^\//, base + '/').replace(' /#', ' ' + base + '/#') : rule).join('\n') + '\n');
console.log('Static export ready in out/. CSP is Report-Only; no Functions, API or database.');
