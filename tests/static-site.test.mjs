import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { siteSections, contentSections } from '../lib/site-sections.ts';
import { safeBookingUrl, liveBookingEvents } from '../lib/booking-config.ts';
import { readPreferences, preferenceRecord, PRIVACY_MAX_AGE } from '../lib/privacy-preferences.ts';
import { reportOnlyPolicy } from '../scripts/static-headers.mjs';

test('one ordered section list places about third and FAQ directly before contact', () => {
  assert.deepEqual(siteSections.map(s => s.id), ['domu', 'obsah', 'o-mne', 'sluzby', 'spoluprace', 'otazky', 'kontakt', 'zkusenosti', 'zazemi']);
  assert.equal(new Set(siteSections.map(s => s.id)).size, siteSections.length);
  assert.deepEqual(contentSections.map(s => s.id), siteSections.slice(2).map(s => s.id));
});
test('booking only accepts an exact HTTPS Cal.com event and defaults to unpublished', () => {
  assert.equal(safeBookingUrl('https://cal.com/example/consultation?utm=tracking#x'), 'https://cal.com/example/consultation');
  for (const value of ['javascript:alert(1)', 'http://cal.com/a/b', 'https://cal.com.evil.test/a/b', 'https://cal.com@evil.test/a/b', 'https://user:pass@cal.com/a/b', 'https://cal.com:8443/a/b', 'https://cal.com/a', '//cal.com/a/b']) assert.equal(safeBookingUrl(value), null, value);
  if (process.env.NEXT_PUBLIC_BOOKING_VERIFIED !== 'true') assert.deepEqual(liveBookingEvents, []);
});
test('privacy choices default to denied, are versioned and expire after 180 days', () => {
  for (const value of [null, '{}', '<html>', '{"version":1,"calendar":true}', '{"version":1,"captcha":"true"}']) assert.deepEqual(readPreferences(value), { calendar: false, captcha: false });
  const record = preferenceRecord({ calendar: true, captcha: false }), saved = JSON.parse(record);
  const now = Date.parse(saved.savedAt);
  assert.deepEqual(readPreferences(record, now + 1000), { calendar: true, captcha: false });
  assert.deepEqual(readPreferences(record, now + PRIVACY_MAX_AGE + 1), { calendar: false, captcha: false });
  assert.deepEqual(readPreferences(JSON.stringify({ ...saved, version: 0 }), now), { calendar: false, captcha: false });
});
test('CSP hashes exact Next inline scripts and permits only named providers', () => {
  const a = reportOnlyPolicy('<script>self.__next_f.push([1,"hello"])</script><script src="/_next/main.js"></script>');
  const b = reportOnlyPolicy('<script>self.__next_f.push([1,"changed"])</script>');
  assert.notEqual(a, b);
  assert.match(a, /script-src 'self' 'sha256-/);
  assert.doesNotMatch(a, /unsafe-eval|script-src[^;]*unsafe-inline/);
  assert.match(a, /frame-src https:\/\/cal.com https:\/\/hcaptcha.com https:\/\/\*.hcaptcha.com/);
  assert.match(a, /connect-src 'self' https:\/\/api.web3forms.com/);
});
test('no public API fetch or database/admin infrastructure remains in the application', async () => {
  const source = await Promise.all(['app/page.tsx','app/layout.tsx','components/site/Contents.tsx','components/site/TrustAndFAQ.tsx','components/site/FeedbackExperience.tsx'].map(p => readFile(p, 'utf8')));
  assert.doesNotMatch(source.join('\n'), /\/api\/public|useSiteData|SiteData|postJSON/);
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.ok(!pkg.dependencies['drizzle-orm']);
  assert.ok(!pkg.devDependencies.wrangler);
});
