'use client';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { liveBookingEvents } from '@/lib/booking-config';

export function AppointmentBooking({ onContact }: { onContact: () => void }) {
  const event = liveBookingEvents[0];
  if (!event) return null;
  return <section className="appointment-booking" aria-labelledby="appointment-booking-title">
    <header className="appointment-booking-heading"><div><span className="eyebrow">DOMLUVME SI SCHŮZKU</span><h3 id="appointment-booking-title">Vyberte si svůj termín.</h3><p>Na schůzku si rezervujte přibližně 90 minut. Délka schůzky je orientační a může se podle potřeby změnit.</p></div><CalendarDays size={32} strokeWidth={1.5} aria-hidden="true"/></header>
    <div className="appointment-booking-panel">
      <div className="appointment-booking-toolbar"><a href={event.url} target="_blank" rel="noreferrer">Otevřít rezervaci samostatně <ArrowUpRight size={16} aria-hidden="true"/></a></div>
      <iframe src={event.url} title="Výběr termínu konzultace – 90 minut" loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
      <p className="appointment-provider-note">Rezervaci a potvrzení schůzky zajišťuje Cal.com. Formu schůzky domluvíme podle vašich potřeb. <a href="https://cal.com/privacy" target="_blank" rel="noreferrer">Soukromí při rezervaci</a>.</p>
    </div>
    <p className="appointment-individual-note">Nevyhovuje vám žádný z nabízených termínů? <button type="button" onClick={onContact}>Napište mi</button> a domluvíme se individuálně.</p>
  </section>;
}
