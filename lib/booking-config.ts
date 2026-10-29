/** Only publish event URLs after the provider's calendars and schedules are connected. */
export const bookingEvents = [
  { id: 'consultation-90', duration: 90, days: 'Pondělí až čtvrtek a neděle', url: 'https://cal.com/martin-kostrhun-4iprbj/konzultace-90' },
] as const;
export const liveBookingEvents = bookingEvents.filter(event => event.url.startsWith('https://cal.com/'));
