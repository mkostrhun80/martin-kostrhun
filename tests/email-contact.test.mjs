import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_AJAX_ACTION, CONTACT_PUBLIC_KEY, classifyEmailResponse, deliverContactEmail, emailPayload, validateEmailContact } from '../lib/email-contact.ts';

const draft = { name: ' Alex Novák ', email: ' alex@example.com ', topic: 'Bydlení', message: 'Rád bych probral financování prvního bydlení.', website: '' };

test('email contact requires an email rather than the old telephone-only contact', () => {
  assert.deepEqual(validateEmailContact(draft), {});
  for (const email of ['733428135', 'alex@', '', 'a'.repeat(151)]) assert.ok(validateEmailContact({ ...draft, email }).email);
  assert.ok(validateEmailContact({ ...draft, name: ' ' }).name);
  assert.ok(validateEmailContact({ ...draft, message: 'Dotaz' }).message);
  assert.ok(validateEmailContact({ ...draft, message: 'x'.repeat(3001) }).message);
});

test('delivery uses a fixed business recipient and sets the visitor as reply-to', () => {
  assert.equal(CONTACT_AJAX_ACTION, 'https://api.web3forms.com/submit');
  const payload = emailPayload({ ...draft, topic: 'Bydlení\r\nBcc: cizi@example.com' }, 'https://mkostrhun80.github.io/martin-kostrhun/#kontakt', 'test-token');
  assert.equal(payload.name, 'Alex Novák');
  assert.equal(payload.replyto, 'alex@example.com');
  assert.equal(payload.email, 'alex@example.com');
  assert.ok(!/[\r\n]/.test(payload.subject));
  assert.equal(payload.access_key, CONTACT_PUBLIC_KEY);
  assert.equal(payload.botcheck, false);
  assert.ok(!('recaptcha_response' in payload), 'do not send an unissued captcha token');
  assert.ok(!('ccemail' in payload));
});

test('HTTP 200 with a false, unknown or non-JSON success field is never a success', () => {
  for (const value of [{ success: false }, { success: 'false' }, { success: 1 }, {}, null, '<html>Error</html>']) assert.equal(classifyEmailResponse(true, value), 'error');
  assert.equal(classifyEmailResponse(false, { success: 'true' }), 'error');
  assert.equal(classifyEmailResponse(true, { success: true }), 'sent');
  assert.equal(classifyEmailResponse(true, { success: 'true' }), 'sent');
});

test('recipient activation stays distinct from a delivered submission', () => {
  assert.equal(classifyEmailResponse(true, { success: 'false', message: 'This form needs Activation.' }), 'activation');
  assert.equal(classifyEmailResponse(true, { success: 'true', message: 'Please confirm your email.' }), 'activation');
});

test('invalid data and a filled honeypot never reach the delivery service', async () => {
  let calls = 0;
  const send = async () => { calls++; throw Error('must not send'); };
  assert.equal(await deliverContactEmail({ ...draft, email: 'wrong' }, '', 'test-token', send), 'error');
  assert.equal(await deliverContactEmail({ ...draft, website: 'spam' }, '', 'test-token', send), 'error');
  assert.equal(calls, 0);
});

test('the actual transport sends JSON and checks the service response', async () => {
  let calls = 0;
  const send = async (url, options) => {
    calls++;
    assert.equal(url, CONTACT_AJAX_ACTION);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(JSON.parse(options.body).replyto, 'alex@example.com');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ success: 'true' });
  };
  const before = structuredClone(draft);
  assert.equal(await deliverContactEmail(draft, 'https://example.com/#kontakt', 'test-token', send), 'sent');
  assert.equal(calls, 1);
  assert.deepEqual(draft, before, 'the transport never mutates a visitor draft');
});

test('activation, provider failure and network failure cannot clear the draft', async () => {
  const before = structuredClone(draft);
  assert.equal(await deliverContactEmail(draft, '', 'test-token', async () => Response.json({ success: 'false', message: 'Needs activation' })), 'activation');
  assert.equal(await deliverContactEmail(draft, '', 'test-token', async () => Response.json({ success: 'false' })), 'error');
  await assert.rejects(deliverContactEmail(draft, '', 'test-token', async () => { throw Error('network'); }), /network/);
  await assert.rejects(deliverContactEmail(draft, '', 'test-token', async () => new Response('<html>Error</html>')), SyntaxError);
  assert.deepEqual(draft, before);
});
