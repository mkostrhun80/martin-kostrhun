'use client';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { liveBookingEvents } from '@/lib/booking-config';
import { usePrivacyPreferences } from './PrivacyPreferences';

export function AppointmentBooking({ onContact }: { onContact: () => void }) {
  const { preferences, allow } = usePrivacyPreferences();
  const event = liveBookingEvents[0];
  if (!event) return null;
  return <section className="appointment-booking" aria-labelledby="appointment-booking-title">
    <header className="appointment-booking-heading"><div><span className="eyebrow">DOMLUVME SI SCHŮZKU</span><h3 id="appointment-booking-title">Vyberte si svůj termín.</h3><p>Na schůzku si rezervujte přibližně 90 minut. Délka schůzky je orientační a může se podle potřeby změnit.</p></div><CalendarDays size={32} strokeWidth={1.5} aria-hidden="true"/></header>
    <div className="appointment-booking-panel">
      <div className="appointment-booking-toolbar"><a href={event.url} target="_blank" rel="noreferrer">Otevřít u Cal.com <ArrowUpRight size={16} aria-hidden="true"/></a></div>
      {preferences.calendar ? <iframe src={event.url} title="Výběr termínu konzultace – 90 minut" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"/> : <div className="external-permission calendar-permission"><p>Rezervaci zajišťuje Cal.com. Po povolení se prohlížeč připojí k této službě, která může používat vlastní cookies a úložiště. <a href="https://cal.com/privacy" target="_blank" rel="noreferrer">Soukromí Cal.com</a>.</p><div><button type="button" onClick={() => allow('calendar')}>Povolit a načíst kalendář</button><button type="button" onClick={onContact}>Raději napsat zprávu</button></div></div>}
      <p className="appointment-provider-note">Rezervaci a potvrzení schůzky zajišťuje Cal.com. Formu schůzky domluvíme podle vašich potřeb. <a href="https://cal.com/privacy" target="_blank" rel="noreferrer">Soukromí při rezervaci</a>.</p>
    </div>
    <p className="appointment-individual-note">Nevyhovuje vám žádný z nabízených termínů? <button type="button" onClick={onContact}>Napište mi</button> a domluvíme se individuálně.</p>
  </section>;
}
