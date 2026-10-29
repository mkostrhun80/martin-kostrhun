export const CONTACT_RECIPIENT = 'martin.kostrhun@edofinance.cz';
export const CONTACT_ACTION = 'https://api.web3forms.com/submit';
// Public submission key, issued for this website and verified recipient.
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

export function emailPayload(draft: EmailDraft, pageUrl: string) {
  const topic = draft.topic.replace(/[\r\n]/g, ' ').trim().slice(0, 120);
  return {
    name: draft.name.trim(), email: draft.email.trim(), topic: topic || 'Obecný dotaz', message: draft.message.trim(),
    access_key: CONTACT_PUBLIC_KEY, replyto: draft.email.trim(),
    subject: 'Web Martina Kostrhuna — ' + (topic || 'Nová zpráva'),
    from_name: 'Web Martina Kostrhuna', page_url: pageUrl, botcheck: !!draft.website,
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

export async function deliverContactEmail(draft: EmailDraft, pageUrl: string, fetcher: typeof fetch = fetch): Promise<DeliveryResult> {
  if (Object.keys(validateEmailContact(draft)).length || draft.website) return 'error';
  const response = await fetcher(CONTACT_AJAX_ACTION, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify(emailPayload(draft, pageUrl)), signal: AbortSignal.timeout(20000),
  });
  const result: unknown = await response.json();
  return classifyEmailResponse(response.ok, result);
}
