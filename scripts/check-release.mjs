import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const preview = process.argv.includes('--preview'), emailOnly = process.argv.includes('--email-only'), errors = [];
if (Number(process.versions.node.split('.')[0]) !== 24) errors.push('Use Node 24 for the release build.');
try {
  const html = await readFile('out/index.html', 'utf8');
  if (!html.includes('id="zkusenosti"') || !html.includes('id="zazemi"')) errors.push('Static export is missing required sections.');
  const headers = await readFile('out/_headers', 'utf8');
  if (!headers.includes('Content-Security-Policy-Report-Only:') || !headers.includes('X-Content-Type-Options: nosniff')) errors.push('Security headers missing.');
  async function visit(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, item.name);
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
if (!preview && !emailOnly) {
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
else console.log(preview ? 'Static preview checks passed. External account settings remain an owner verification step.' : emailOnly ? 'Email-only release checks passed: provider integrations are disabled in the built site.' : 'Static release checks passed with the owner’s recorded verification.');
