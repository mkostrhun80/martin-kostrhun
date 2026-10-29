export const CONTACT_RECIPIENT = 'martin.kostrhun@edofinance.cz';
export const CONTACT_ACTION = 'https://api.web3forms.com/submit';
// Public submission key; its recipient mapping must be verified in Web3Forms.
// It does not grant access to the account or received messages.
export const CONTACT_PUBLIC_KEY = '41fbc06e-40c1-4e3a-b081-292fde681f24';
export const CONTACT_AJAX_ACTION = CONTACT_ACTION;

export type EmailDraft = { name: string; email: string; topic: string; message: string; website: string };
export type EmailErrors = Partial<Record<'name' | 'email' | 'message', string>>;
export const emptyEmailDraft: EmailDraft = { name: '', email: '', topic: '', message: '', website: '' };

export function validateEmailContact(draft: EmailDraft): EmailErrors {
  const errors: EmailErrors = {};
  if (draft.name.trim().length < 2 || draft.name.trim().length > 100) errors.name = 'Napište své jméno (2–100 znaků).';
  if (draft.email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = 'Zadejte platný e-mail, na který vám mohu odpovědět.';
  if (draft.message.trim().length < 10 || draft.message.length > 3000) errors.message = 'Napište prosím zprávu v rozsahu 10–3 000 znaků.';
  return errors;
}

export function emailPayload(draft: EmailDraft, pageUrl: string, captchaToken: string) {
  const topic = draft.topic.replace(/[\r\n]/g, ' ').trim().slice(0, 120);
  return {
    name: draft.name.trim(), email: draft.email.trim(), topic: topic || 'Obecný dotaz', message: draft.message.trim(),
    access_key: CONTACT_PUBLIC_KEY, replyto: draft.email.trim(),
    subject: 'Web Martina Kostrhuna — ' + (topic || 'Nová zpráva'),
    from_name: 'Web Martina Kostrhuna', page_url: pageUrl, botcheck: !!draft.website,
    'h-captcha-response': captchaToken,
  };
}

export type DeliveryResult = 'sent' | 'activation' | 'error';
export function classifyEmailResponse(ok: boolean, value: unknown): DeliveryResult {
  if (!value || typeof value !== 'object') return 'error';
  const result = value as { success?: unknown; message?: unknown };
  const message = typeof result.message === 'string' ? result.message : '';
  if (/activat|confirm.{0,30}email|verif.{0,30}email/i.test(message)) return 'activation';
  return ok && (result.success === true || result.success === 'true') ? 'sent' : 'error';
}

async function sendPayload(payload: object, fetcher: typeof fetch): Promise<DeliveryResult> {
  const response = await fetcher(CONTACT_AJAX_ACTION, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
  });
  const result: unknown = await response.json();
  return classifyEmailResponse(response.ok, result);
}
export async function deliverContactEmail(draft: EmailDraft, pageUrl: string, captchaToken: string, fetcher: typeof fetch = fetch): Promise<DeliveryResult> {
  if (!captchaToken.trim() || Object.keys(validateEmailContact(draft)).length || draft.website) return 'error';
  return sendPayload(emailPayload(draft, pageUrl, captchaToken), fetcher);
}

export const FEEDBACK_CONSENT_VERSION = 'web-reference-2026-10-29';
export const FEEDBACK_CONSENT_TEXT = 'Souhlasím se zveřejněním této zkušenosti, hodnocení a uvedeného jména na webu Martina Kostrhuna po ověření spolupráce. E-mail zůstává soukromý. Souhlas mohu kdykoli odvolat e-mailem.';
export type FeedbackDraft = { name: string; email: string; rating: number | ''; message: string; displayName: string; consent: boolean; website: string };
export const emptyFeedbackDraft: FeedbackDraft = { name: '', email: '', rating: '', message: '', displayName: '', consent: false, website: '' };
export function validateFeedback(draft: FeedbackDraft) {
  const errors: Partial<Record<keyof FeedbackDraft, string>> = validateEmailContact({ ...draft, topic: 'Zpětná vazba' });
  if (!Number.isInteger(draft.rating) || Number(draft.rating) < 1 || Number(draft.rating) > 5) errors.rating = 'Vyberte hodnocení od 1 do 5.';
  if (draft.displayName.length > 100 || (draft.consent && draft.displayName.trim().length < 2)) errors.displayName = 'Pro zveřejnění uveďte jméno v rozsahu 2–100 znaků (například Jana K.).';
  return errors;
}
export function feedbackPayload(draft: FeedbackDraft, pageUrl: string, captchaToken: string) {
  return {
    ...emailPayload({ ...draft, topic: 'Zpětná vazba' }, pageUrl, captchaToken),
    rating: draft.rating, display_name: draft.consent ? draft.displayName.trim() : '',
    publication_consent: draft.consent ? FEEDBACK_CONSENT_TEXT : 'NE — pouze soukromá zpětná vazba, nezveřejňovat.',
    consent_version: FEEDBACK_CONSENT_VERSION, submitted_at: new Date().toISOString(),
  };
}
export async function deliverFeedback(draft: FeedbackDraft, pageUrl: string, captchaToken: string, fetcher: typeof fetch = fetch): Promise<DeliveryResult> {
  if (!captchaToken.trim() || Object.keys(validateFeedback(draft)).length || draft.website) return 'error';
  return sendPayload(feedbackPayload(draft, pageUrl, captchaToken), fetcher);
}
