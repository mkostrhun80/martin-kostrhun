'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, ChevronUp } from 'lucide-react';
import { liveBookingEvents } from '@/lib/booking-config';

export function AppointmentBooking() {
  return liveBookingEvents.length ? <LiveBooking/> : null;
}
function LiveBooking() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const event = liveBookingEvents[selected];
  useEffect(() => {
    const open = () => setExpanded(true);
    window.addEventListener('appointment', open);
    return () => window.removeEventListener('appointment', open);
  }, []);
  return <section id="rezervace" className="appointment-booking" aria-labelledby="appointment-booking-title">
    <header className="appointment-booking-heading"><div><span className="eyebrow">DOMLUVME SI SCHŮZKU</span><h2 id="appointment-booking-title">Vyberte si svůj termín.</h2><p>Volné časy se průběžně řídí mým kalendářem.</p></div><CalendarDays size={32} strokeWidth={1.5} aria-hidden="true"/></header>
    <div className="appointment-options" role="group" aria-label="Délka konzultace">{liveBookingEvents.map((option, index) => <button type="button" key={option.id} aria-expanded={expanded && selected === index} aria-controls="appointment-booking-panel" onClick={() => { setSelected(index); setExpanded(true); }}><span><strong>Konzultace · {option.duration} minut</strong><small>{option.days}</small></span><ArrowUpRight size={20} aria-hidden="true"/></button>)}</div>
    {expanded && <div id="appointment-booking-panel" className="appointment-booking-panel">
      <div className="appointment-booking-toolbar"><a href={event.url} target="_blank" rel="noreferrer">Otevřít rezervaci samostatně <ArrowUpRight size={16} aria-hidden="true"/></a><button type="button" aria-controls="appointment-booking-panel" aria-expanded="true" onClick={() => setExpanded(false)}>Sbalit <ChevronUp size={16} aria-hidden="true"/></button></div>
      <iframe key={event.id} src={event.url} title={`Výběr termínu konzultace – ${event.duration} minut`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
      <p className="appointment-provider-note">Rezervaci a potvrzení schůzky zajišťuje Cal.com. Formu schůzky domluvíme podle vašich potřeb. <a href="https://cal.com/privacy" target="_blank" rel="noreferrer">Soukromí při rezervaci</a>.</p>
    </div>}
  </section>;
}
