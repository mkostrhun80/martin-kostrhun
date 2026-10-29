'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { deniedPreferences, preferenceRecord, PRIVACY_KEY, readPreferences, type Preferences } from '@/lib/privacy-preferences';

const Context = createContext<{ preferences: Preferences; allow: (service: keyof Preferences) => void; settings: () => void }>({ preferences: deniedPreferences, allow: () => {}, settings: () => {} });
export function PrivacyPreferences({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(deniedPreferences);
  const [draft, setDraft] = useState<Preferences>(deniedPreferences);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { const saved = readPreferences(localStorage.getItem(PRIVACY_KEY)); queueMicrotask(() => setPreferences(saved)); } catch { /* Consent remains in memory if storage is blocked. */ }
    const changed = (event: StorageEvent) => { if (event.key === PRIVACY_KEY) location.reload(); };
    addEventListener('storage', changed);
    return () => removeEventListener('storage', changed);
  }, []);
  const save = (next: Preferences) => {
    try { localStorage.setItem(PRIVACY_KEY, preferenceRecord(next)); } catch { /* This visit still respects the choice. */ }
    setPreferences(next); setOpen(false);
    // A downloaded third-party script cannot be un-executed. Reload without it on withdrawal.
    if (preferences.captcha && !next.captcha) location.reload();
  };
  const settings = () => { setDraft({ ...preferences }); setOpen(true); };
  return <Context.Provider value={{ preferences, allow: service => save({ ...preferences, [service]: true }), settings }}>
    {children}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="privacy-dialog">
      <DialogTitle>Nastavení soukromí</DialogTitle>
      <DialogDescription>Web funguje i bez externích služeb. Můžete mi napsat přímo e-mailem. Analytické ani reklamní měření nepoužívám.</DialogDescription>
      <label className="privacy-choice"><input type="checkbox" checked={draft.calendar} onChange={event => setDraft(value => ({ ...value, calendar: event.target.checked }))}/><span><strong>Rezervace Cal.com</strong><small>Načte externí kalendář po otevření rezervace; poskytovatel může ukládat údaje v prohlížeči.</small></span></label>
      <label className="privacy-choice"><input type="checkbox" checked={draft.captcha} onChange={event => setDraft(value => ({ ...value, captcha: event.target.checked }))}/><span><strong>Ochrana formulářů hCaptcha</strong><small>Ověří, že zprávu neposílá automat. Připojí prohlížeč ke službě hCaptcha a může používat její úložiště.</small></span></label>
      <p className="form-note">Volbu si pamatuji v tomto prohlížeči. Vypnutí již povolené hCaptcha obnoví stránku; rozepsanou zprávu si předem zkopírujte. <Link href="/dokumenty/cookies">Cookies a úložiště</Link>.</p>
      <div className="privacy-actions"><button type="button" onClick={() => save({ calendar: true, captcha: true })}>Přijmout vše</button><button type="button" onClick={() => save({ ...deniedPreferences })}>Odmítnout vše</button><button type="button" onClick={() => save(draft)}>Uložit nastavení</button></div>
    </DialogContent></Dialog>
  </Context.Provider>;
}
export const usePrivacyPreferences = () => useContext(Context);
export function PrivacySettingsButton() { const { settings } = usePrivacyPreferences(); return <button type="button" className="privacy-settings-link" onClick={settings}>Nastavení soukromí</button>; }
