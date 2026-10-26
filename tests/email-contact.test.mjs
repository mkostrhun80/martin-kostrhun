import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_AJAX_ACTION, classifyEmailResponse, deliverContactEmail, emailPayload, validateEmailContact } from '../lib/email-contact.ts';

const draft = { name: ' Alex Novák ', email: ' alex@example.com ', topic: 'Bydlení', message: 'Rád bych probral financování prvního bydlení.', website: '' };

test('email contact requires an email rather than the old telephone-only contact', () => {
  assert.deepEqual(validateEmailContact(draft), {});
  for (const email of ['733428135', 'alex@', '', 'a'.repeat(151)]) assert.ok(validateEmailContact({ ...draft, email }).email);
  assert.ok(validateEmailContact({ ...draft, name: ' ' }).name);
  assert.ok(validateEmailContact({ ...draft, message: 'Dotaz' }).message);
  assert.ok(validateEmailContact({ ...draft, message: 'x'.repeat(3001) }).message);
});

test('delivery uses a fixed business recipient and sets the visitor as reply-to', () => {
  assert.equal(CONTACT_AJAX_ACTION, 'https://formsubmit.co/ajax/martin.kostrhun@edofinance.cz');
  const payload = emailPayload({ ...draft, topic: 'Bydlení\r\nBcc: cizi@example.com' }, 'https://mkostrhun80.github.io/martin-kostrhun/#kontakt');
  assert.equal(payload.name, 'Alex Novák');
  assert.equal(payload._replyto, 'alex@example.com');
  assert.equal(payload.email, 'alex@example.com');
  assert.ok(!/[\r\n]/.test(payload._subject));
  assert.equal(payload._template, 'table');
  assert.equal(payload._honey, '');
  assert.ok(!('_captcha' in payload), 'keep the provider spam protection enabled');
  assert.ok(!('_cc' in payload));
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
  assert.equal(await deliverContactEmail({ ...draft, email: 'wrong' }, '', send), 'error');
  assert.equal(await deliverContactEmail({ ...draft, website: 'spam' }, '', send), 'error');
  assert.equal(calls, 0);
});

test('the actual transport sends JSON and checks the service response', async () => {
  let calls = 0;
  const send = async (url, options) => {
    calls++;
    assert.equal(url, CONTACT_AJAX_ACTION);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(JSON.parse(options.body)._replyto, 'alex@example.com');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ success: 'true' });
  };
  const before = structuredClone(draft);
  assert.equal(await deliverContactEmail(draft, 'https://example.com/#kontakt', send), 'sent');
  assert.equal(calls, 1);
  assert.deepEqual(draft, before, 'the transport never mutates a visitor draft');
});

test('activation, provider failure and network failure cannot clear the draft', async () => {
  const before = structuredClone(draft);
  assert.equal(await deliverContactEmail(draft, '', async () => Response.json({ success: 'false', message: 'Needs activation' })), 'activation');
  assert.equal(await deliverContactEmail(draft, '', async () => Response.json({ success: 'false' })), 'error');
  await assert.rejects(deliverContactEmail(draft, '', async () => { throw Error('network'); }), /network/);
  await assert.rejects(deliverContactEmail(draft, '', async () => new Response('<html>Error</html>')), SyntaxError);
  assert.deepEqual(draft, before);
});
