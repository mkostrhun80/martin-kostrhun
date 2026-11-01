import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const releaseScript = fileURLToPath(new URL('../scripts/check-release.mjs', import.meta.url));
const buildScript = fileURLToPath(new URL('../scripts/build-static.mjs', import.meta.url));
const bookingModuleURL = new URL('../lib/booking-config.ts', import.meta.url).href;
const bookingURL = 'https://cal.com/booking-test/consultation';
const requiredChecks = ['previewApproved','securityAuditApproved','privacyReviewed','calBusinessIdentityVerified','calNoPrivateAddressInInvite','bookerEmailVerification','twoFutureBookingsEnforced','icloudLifecycleVerified','duration90Minutes','weekStartsMonday','timeZoneEuropePrague','availabilityVerified','conflictCalendarsVerified','productionCalendarVerified','legacyLinksPolicyConfirmed'];
const oldFullChecks = ['previewApproved','securityAuditApproved','privacyReviewed','web3formsRecipientVerified','hcaptchaEnforcedAtProvider','invalidCaptchaRejected','contactReceived','feedbackReceivedPrivately','calBusinessIdentityVerified','calNoPrivateAddressInInvite','bookerEmailVerification','twoFutureBookingsEnforced','icloudLifecycleVerified'];
const historicalEvidence = {
  calNoPrivateAddressInInvite: false,
  icloudLifecycleVerified: false,
  priorEquivalentProviderChecksPassed: true,
  newReservationTestsDeclinedByOwner: true,
  icloudFinalCheckByOwner: true,
  verificationNotes: 'Synthetic fixture: equivalent provider evidence was reviewed previously. The owner declined additional live reservations and retained the final iCloud inspection. Current invite privacy and lifecycle results remain unverified.',
};

function fixture(run) {
  const cwd = mkdtempSync(join(tmpdir(), 'martin-booking-release-'));
  const env = { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://owner.github.io/site', NEXT_PUBLIC_BASE_PATH: '/site', NEXT_PUBLIC_FORMS_VERIFIED: 'false', NEXT_PUBLIC_BOOKING_VERIFIED: 'true', NEXT_PUBLIC_BOOKING_URL: bookingURL };
  const built = { siteURL: env.NEXT_PUBLIC_SITE_URL, basePath: '/site', formsEnabled: false, bookingEnabled: true, bookingURL };
  const evidence = { testedAt: '2026-11-01T09:00:00.000Z', bookingURL, ...Object.fromEntries(requiredChecks.map(key => [key, true])) };
  const write = (path, value) => writeFileSync(join(cwd, path), typeof value === 'string' ? value : JSON.stringify(value));
  const check = (args = ['--booking-only'], extraEnv = {}) => spawnSync(process.execPath, [releaseScript, ...args], { cwd, env: { ...env, ...extraEnv }, encoding: 'utf8' });
  mkdirSync(join(cwd, 'out'));
  write('out/index.html', '<main><section id="zkusenosti"></section><section id="zazemi"></section></main>');
  write('out/_headers', 'Content-Security-Policy-Report-Only: default-src self\nX-Content-Type-Options: nosniff');
  write('out/deployment.json', built);
  write('booking-release-readiness.json', evidence);
  try { run({ cwd, env, built, evidence, write, check }); }
  finally { rmSync(cwd, { recursive: true, force: true }); }
}
function rejected(result, message) {
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, message);
}

test('booking can release with forms off and without unrelated form verification', () => fixture(({ check }) => {
  const result = check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Booking-only release checks passed/);
}));

test('the enabled website receives the verified event URL with tracking removed', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', 'const { liveBookingEvents } = await import(process.argv[1]); process.stdout.write(JSON.stringify(liveBookingEvents));', bookingModuleURL], {
    env: { ...process.env, NEXT_PUBLIC_BOOKING_VERIFIED: 'true', NEXT_PUBLIC_BOOKING_URL: bookingURL + '?utm_source=discarded#discarded', NEXT_PUBLIC_FORMS_VERIFIED: 'false' }, encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [{ id: 'consultation-90', duration: 90, url: bookingURL }]);
});

test('booking release rejects a disabled booking flag or enabled forms', () => fixture(({ check }) => {
  rejected(check(undefined, { NEXT_PUBLIC_BOOKING_VERIFIED: 'false' }), /verified booking integration/);
  rejected(check(undefined, { NEXT_PUBLIC_FORMS_VERIFIED: 'true' }), /forms explicitly disabled/);
}));

test('booking release rejects unsafe, missing and mismatched configured event URLs', () => fixture(({ check }) => {
  for (const value of ['', 'https://cal.com.evil.test/name/event', 'javascript:alert(1)', 'https://cal.com/name/different']) {
    rejected(check(undefined, { NEXT_PUBLIC_BOOKING_URL: value }), /event URL|Booking URL differs/);
  }
}));

test('booking release checks the actual export flags and build provenance', () => fixture(({ built, write, check }) => {
  for (const change of [
    { bookingEnabled: false }, { formsEnabled: true }, { bookingURL: null },
    { bookingURL: 'https://cal.com/name/different' }, { siteURL: 'https://another.example/site' },
    { basePath: '' }, { siteURL: 'http://owner.github.io/site' },
  ]) {
    write('out/deployment.json', { ...built, ...change });
    rejected(check(), /actual build|differs|HTTPS/);
  }
}));

test('every reservation verification is required and must be a real boolean', () => fixture(({ evidence, write, check }) => {
  for (const key of requiredChecks) {
    write('booking-release-readiness.json', { ...evidence, [key]: false });
    rejected(check(), new RegExp('Booking verification pending: ' + key));
  }
  write('booking-release-readiness.json', { ...evidence, icloudLifecycleVerified: 'true' });
  rejected(check(), /Booking verification pending: icloudLifecycleVerified/);
}));

test('owner-declined live tests can use explicit historical provider evidence for only the two live results', () => fixture(({ evidence, write, check }) => {
  write('booking-release-readiness.json', { ...evidence, ...historicalEvidence });
  const result = check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /owner declined new reservation tests/);
  assert.match(result.stdout, /Fresh production invite privacy and iCloud lifecycle remain unverified/);
  assert.match(result.stdout, /final iCloud inspection is assigned to the owner/);
}));

test('historical evidence requires explicit prior evidence, owner decisions and substantial notes', () => fixture(({ evidence, write, check }) => {
  for (const key of ['priorEquivalentProviderChecksPassed', 'newReservationTestsDeclinedByOwner', 'icloudFinalCheckByOwner']) {
    for (const value of [false, undefined, 'true']) {
      write('booking-release-readiness.json', { ...evidence, ...historicalEvidence, [key]: value });
      rejected(check(), /Booking verification pending: calNoPrivateAddressInInvite/);
    }
  }
  for (const verificationNotes of [undefined, '', 'Short.', ' '.repeat(150), true]) {
    write('booking-release-readiness.json', { ...evidence, ...historicalEvidence, verificationNotes });
    rejected(check(), /Booking verification pending: icloudLifecycleVerified/);
  }
  for (const key of ['calNoPrivateAddressInInvite', 'icloudLifecycleVerified']) {
    write('booking-release-readiness.json', { ...evidence, ...historicalEvidence, [key]: 'true' });
    rejected(check(), new RegExp('Booking verification pending: ' + key));
  }
}));

test('historical provider evidence cannot waive current configuration, security or build provenance', () => fixture(({ built, evidence, write, check }) => {
  const historical = { ...evidence, ...historicalEvidence };
  for (const key of requiredChecks.filter(key => !['calNoPrivateAddressInInvite', 'icloudLifecycleVerified'].includes(key))) {
    write('booking-release-readiness.json', { ...historical, [key]: false });
    rejected(check(), new RegExp('Booking verification pending: ' + key));
  }
  write('booking-release-readiness.json', { ...historical, testedAt: '' });
  rejected(check(), /verification timestamp/);
  write('booking-release-readiness.json', { ...historical, bookingURL: 'https://cal.com/other/event' });
  rejected(check(), /evidence belongs to a different event URL/);
  write('booking-release-readiness.json', historical);
  write('out/deployment.json', { ...built, bookingURL: 'https://cal.com/other/event' });
  rejected(check(), /Booking URL differs from the validated build/);
  write('out/deployment.json', built);
  rejected(check(undefined, { NEXT_PUBLIC_FORMS_VERIFIED: 'true' }), /forms explicitly disabled/);
  rejected(check(undefined, { NEXT_PUBLIC_BOOKING_VERIFIED: 'false' }), /verified booking integration/);
}));

test('reservation evidence needs a valid timestamp and the same production URL', () => fixture(({ evidence, write, check }) => {
  for (const testedAt of ['', 'not a date', '2026']) {
    write('booking-release-readiness.json', { ...evidence, testedAt });
    rejected(check(), /verification timestamp/);
  }
  write('booking-release-readiness.json', { ...evidence, bookingURL: 'https://cal.com/name/old-event' });
  rejected(check(), /evidence belongs to a different event URL/);
  write('booking-release-readiness.json', '{');
  rejected(check(), /Complete the tracked booking-release-readiness/);
}));

test('local diagnostic pages cannot enter a booking release', () => fixture(({ cwd, check }) => {
  mkdirSync(join(cwd, 'out', '__qa-booking'));
  rejected(check(), /Local diagnostic artifact in booking release/);
}));

test('release modes cannot be combined to skip reservation verification', () => fixture(({ check }) => {
  rejected(check(['--booking-only', '--preview']), /Choose exactly one release mode/);
  rejected(check(['--booking-only', '--email-only']), /Choose exactly one release mode/);
}));

test('email-only releases retain their original both-integrations-disabled contract', () => fixture(({ built, write, check }) => {
  write('out/deployment.json', { ...built, bookingEnabled: false, bookingURL: null });
  write('booking-release-readiness.json', {});
  const result = check(['--email-only'], { NEXT_PUBLIC_BOOKING_VERIFIED: 'false', NEXT_PUBLIC_BOOKING_URL: '' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Email-only release checks passed/);
}));

test('full releases still require both integrations and their original owner checklist', () => fixture(({ built, write, check }) => {
  write('out/deployment.json', { ...built, formsEnabled: true });
  write('release-readiness.local.json', { testedAt: '2026-11-01T09:00:00.000Z', ...Object.fromEntries(oldFullChecks.map(key => [key, true])) });
  const result = check([], { NEXT_PUBLIC_FORMS_VERIFIED: 'true' });
  assert.equal(result.status, 0, result.stderr);
  rejected(check([]), /NEXT_PUBLIC_FORMS_VERIFIED must be true/);
}));

test('an enabled booking with an unsafe URL fails before running a build', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'martin-booking-invalid-build-'));
  try {
    const result = spawnSync(process.execPath, [buildScript], { cwd, env: { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://owner.github.io/site', NEXT_PUBLIC_BOOKING_VERIFIED: 'true', NEXT_PUBLIC_BOOKING_URL: 'https://cal.com.evil.test/name/event' }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /enabled booking integration requires a valid HTTPS Cal.com event URL/);
    assert.equal(existsSync(join(cwd, '.next')), false, 'invalid configuration must fail before Next.js starts');
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
