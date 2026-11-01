import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { safeBookingUrl } from '../lib/booking-config.ts';
const preview = process.argv.includes('--preview'), emailOnly = process.argv.includes('--email-only'), bookingOnly = process.argv.includes('--booking-only'), errors = [];
let historicalBookingEvidenceUsed = false;
if ([preview, emailOnly, bookingOnly].filter(Boolean).length > 1) errors.push('Choose exactly one release mode.');
if (Number(process.versions.node.split('.')[0]) !== 24) errors.push('Use Node 24 for the release build.');
try {
  const html = await readFile('out/index.html', 'utf8');
  if (!html.includes('id="zkusenosti"') || !html.includes('id="zazemi"')) errors.push('Static export is missing required sections.');
  const headers = await readFile('out/_headers', 'utf8');
  if (!headers.includes('Content-Security-Policy-Report-Only:') || !headers.includes('X-Content-Type-Options: nosniff')) errors.push('Security headers missing.');
  async function visit(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, item.name);
      if (bookingOnly && item.isDirectory() && item.name.startsWith('__qa')) errors.push('Local diagnostic artifact in booking release: ' + file);
      if (item.isDirectory()) await visit(file);
      else if (/^\.env|\.sqlite$|\.sql$|\.pem$|\.key$|^admin-key$|^_worker\.js$/.test(item.name)) errors.push('Private/runtime file in export: ' + file);
    }
  }
  await visit('out');
  for (const path of ['out/sprava', 'out/api', 'out/functions', 'out/_worker.js']) { try { await stat(path); errors.push('Server infrastructure in static output: ' + path); } catch {} }
} catch (error) { errors.push('Build the site first: ' + error.message); }
if (!preview && emailOnly) {
  try {
    const built = JSON.parse(await readFile('out/deployment.json', 'utf8'));
    if (built.formsEnabled !== false || built.bookingEnabled !== false) errors.push('Email-only release must have both provider integrations disabled in the actual build.');
    if (built.siteURL !== process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) errors.push('Site URL differs from the validated build.');
    const url = new URL(built.siteURL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) errors.push('Set the actual HTTPS website URL.');
  } catch (error) { errors.push('Build provenance missing or invalid: ' + error.message); }
  if (process.env.NEXT_PUBLIC_FORMS_VERIFIED !== 'false' || process.env.NEXT_PUBLIC_BOOKING_VERIFIED !== 'false') errors.push('Email-only publishing requires explicitly disabled provider flags.');
}
if (!preview && bookingOnly) {
  const configuredURL = safeBookingUrl(process.env.NEXT_PUBLIC_BOOKING_URL || '');
  if (process.env.NEXT_PUBLIC_FORMS_VERIFIED !== 'false') errors.push('Booking-only publishing requires forms explicitly disabled.');
  if (process.env.NEXT_PUBLIC_BOOKING_VERIFIED !== 'true') errors.push('Booking-only publishing requires a verified booking integration.');
  if (!configuredURL) errors.push('Set a valid HTTPS Cal.com production event URL.');
  try {
    const built = JSON.parse(await readFile('out/deployment.json', 'utf8'));
    if (built.formsEnabled !== false || built.bookingEnabled !== true) errors.push('Booking-only release must have booking enabled and forms disabled in the actual build.');
    if (built.bookingURL !== configuredURL || !configuredURL) errors.push('Booking URL differs from the validated build.');
    if (built.basePath !== (process.env.NEXT_PUBLIC_BASE_PATH || '')) errors.push('Base path differs from the validated build.');
    if (built.siteURL !== process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) errors.push('Site URL differs from the validated build.');
    const site = new URL(built.siteURL);
    if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) errors.push('Set the actual HTTPS website URL.');
  } catch (error) { errors.push('Build provenance missing or invalid: ' + error.message); }
  const required = ['previewApproved','securityAuditApproved','privacyReviewed','calBusinessIdentityVerified','calNoPrivateAddressInInvite','bookerEmailVerification','twoFutureBookingsEnforced','icloudLifecycleVerified','duration90Minutes','weekStartsMonday','timeZoneEuropePrague','availabilityVerified','conflictCalendarsVerified','productionCalendarVerified','legacyLinksPolicyConfirmed'];
  try {
    const checklist = JSON.parse(await readFile('booking-release-readiness.json', 'utf8'));
    const historicalEvidence = checklist.priorEquivalentProviderChecksPassed === true
      && checklist.newReservationTestsDeclinedByOwner === true
      && checklist.icloudFinalCheckByOwner === true
      && typeof checklist.verificationNotes === 'string'
      && checklist.verificationNotes.trim().length >= 120;
    const liveResultChecks = new Set(['calNoPrivateAddressInInvite', 'icloudLifecycleVerified']);
    for (const key of required) {
      if (checklist[key] === true) continue;
      if (liveResultChecks.has(key) && checklist[key] === false && historicalEvidence) {
        historicalBookingEvidenceUsed = true;
        continue;
      }
      errors.push('Booking verification pending: ' + key);
    }
    if (!checklist.testedAt || !/^\d{4}-\d{2}-\d{2}T/.test(checklist.testedAt) || !Number.isFinite(Date.parse(checklist.testedAt))) errors.push('Record the booking verification timestamp.');
    if (!configuredURL || checklist.bookingURL !== configuredURL) errors.push('Booking evidence belongs to a different event URL.');
  } catch { errors.push('Complete the tracked booking-release-readiness.json with observed production-event verification.'); }
}
if (!preview && !emailOnly && !bookingOnly) {
  const required = ['previewApproved','securityAuditApproved','privacyReviewed','web3formsRecipientVerified','hcaptchaEnforcedAtProvider','invalidCaptchaRejected','contactReceived','feedbackReceivedPrivately','calBusinessIdentityVerified','calNoPrivateAddressInInvite','bookerEmailVerification','twoFutureBookingsEnforced','icloudLifecycleVerified'];
  try {
    const checklist = JSON.parse(await readFile(process.env.RELEASE_CHECKLIST || 'release-readiness.local.json', 'utf8'));
    for (const key of required) if (checklist[key] !== true) errors.push('Owner verification pending: ' + key);
    if (!checklist.testedAt || !Number.isFinite(Date.parse(checklist.testedAt))) errors.push('Record the owner verification date.');
  } catch { errors.push('Copy release-readiness.example.json to release-readiness.local.json and complete Martin’s verification checklist.'); }
  if (process.env.NEXT_PUBLIC_FORMS_VERIFIED !== 'true') errors.push('NEXT_PUBLIC_FORMS_VERIFIED must be true only after the provider tests pass.');
  if (process.env.NEXT_PUBLIC_BOOKING_VERIFIED !== 'true') errors.push('NEXT_PUBLIC_BOOKING_VERIFIED must be true only after Cal.com / iCloud tests pass.');
  try { const url = new URL(process.env.NEXT_PUBLIC_SITE_URL); if (url.protocol !== 'https:') throw Error(); } catch { errors.push('Set the actual HTTPS NEXT_PUBLIC_SITE_URL.'); }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else {
  console.log(preview ? 'Static preview checks passed. External account settings remain an owner verification step.' : emailOnly ? 'Email-only release checks passed: provider integrations are disabled in the built site.' : bookingOnly ? 'Booking-only release checks passed: booking is configured and forms remain disabled.' : 'Static release checks passed with the owner’s recorded verification.');
  if (historicalBookingEvidenceUsed) console.log('Recorded equivalent provider evidence accepted because the owner declined new reservation tests. Fresh production invite privacy and iCloud lifecycle remain unverified; final iCloud inspection is assigned to the owner.');
}
