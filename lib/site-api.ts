import { sitePath } from './site-path';

export function newSubmission() { return { requestId: crypto.randomUUID(), startedAt: Date.now(), website: '' }; }
export async function postJSON(path: string, body: unknown) {
  const response = await fetch(sitePath('/api' + path), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  let result: Record<string, unknown>;
  try { result = await response.json() as Record<string, unknown>; }
  catch { throw new Error('Služba není právě dostupná. Zkuste to později nebo mě kontaktujte přímo.'); }
  if (!result || typeof result !== 'object' || !response.ok || !result.ok) throw new Error(String(result?.error || 'Údaje se nepodařilo uložit. Zkuste to znovu.'));
  return result;
}
