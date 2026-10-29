/** Only publish event URLs after the provider's calendars and schedules are connected. */
export const bookingEvents = [
  { id: 'consultation-90', duration: 90, days: 'Pondělí, úterý, čtvrtek a neděle', url: 'https://cal.com/martin-kostrhun-4iprbj/konzultace-90' },
  { id: 'consultation-60', duration: 60, days: 'Středa · 14:30–15:30', url: 'https://cal.com/martin-kostrhun-4iprbj/konzultace-60' },
] as const;
export const liveBookingEvents = bookingEvents.filter(event => event.url.startsWith('https://cal.com/'));
