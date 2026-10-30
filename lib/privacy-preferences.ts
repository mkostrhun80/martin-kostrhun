export const PRIVACY_KEY = 'mk.privacy.v1';
export const PRIVACY_VERSION = 1;
export const PRIVACY_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export type Preferences = { calendar: boolean; captcha: boolean };
export const deniedPreferences: Preferences = { calendar: false, captcha: false };
export function readPreferences(value: string | null, now = Date.now()): Preferences {
  try {
    const record = JSON.parse(value || 'null');
    const age = now - Date.parse(record?.savedAt);
    return record?.version === PRIVACY_VERSION && Number.isFinite(age) && age >= 0 && age <= PRIVACY_MAX_AGE
      ? { calendar: record.calendar === true, captcha: record.captcha === true }
      : { ...deniedPreferences };
  } catch { return { ...deniedPreferences }; }
}
export function preferenceRecord(preferences: Preferences) {
  return JSON.stringify({ version: PRIVACY_VERSION, ...preferences, savedAt: new Date().toISOString() });
}
