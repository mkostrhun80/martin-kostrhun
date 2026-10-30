import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverFeedback, deliverContactEmail, emptyEmailDraft, feedbackPayload, FEEDBACK_CONSENT_TEXT, validateFeedback } from '../lib/email-contact.ts';
const draft = { name: 'Test User', email: 'test@example.test', rating: 4, message: 'Srozumitelná spolupráce a vysvětlení možností.', displayName: 'Test U.', consent: false, website: '' };
test('private feedback needs no publication consent and cannot leak a public email field', () => {
  assert.deepEqual(validateFeedback({ ...draft, displayName: '' }), {});
  const payload = feedbackPayload(draft, 'https://example.test/#zkusenosti', 'test-token');
  assert.match(payload.publication_consent, /^NE/); assert.equal(payload.display_name, '');
  assert.equal(payload['h-captcha-response'], 'test-token'); assert.equal(payload.replyto, draft.email);
});
test('publication requires a display name and retains exact consent evidence in the email', () => {
  assert.ok(validateFeedback({ ...draft, consent: true, displayName: '' }).displayName);
  const payload = feedbackPayload({ ...draft, consent: true }, '', 'test-token');
  assert.equal(payload.publication_consent, FEEDBACK_CONSENT_TEXT);
  assert.equal(payload.display_name, 'Test U.'); assert.ok(payload.consent_version);
  assert.ok(Number.isFinite(Date.parse(payload.submitted_at)));
  for (const rating of ['', 0, 6, 4.5, NaN]) assert.ok(validateFeedback({ ...draft, rating }).rating);
});
test('both delivery transports fail closed on missing captcha and honeypot without making requests', async () => {
  let calls = 0; const fetcher = async () => { calls++; return Response.json({ success: true }); };
  assert.equal(await deliverFeedback(draft, '', '', fetcher), 'error');
  assert.equal(await deliverFeedback({ ...draft, website: 'bot' }, '', 'token', fetcher), 'error');
  assert.equal(await deliverContactEmail({ ...emptyEmailDraft, name: draft.name, email: draft.email, message: draft.message }, '', '', fetcher), 'error');
  assert.equal(calls, 0);
});
test('provider failure is not success and input stays intact for retries', async () => {
  const before = structuredClone(draft);
  assert.equal(await deliverFeedback(draft, '', 'token', async () => Response.json({ success: false, message: 'Captcha rejected' })), 'error');
  assert.equal(await deliverFeedback(draft, '', 'token', async () => Response.json({ success: true })), 'sent');
  await assert.rejects(deliverFeedback(draft, '', 'token', async () => { throw Error('network'); }), /network/);
  assert.deepEqual(draft, before);
});
