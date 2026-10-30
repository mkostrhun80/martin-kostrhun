/** Owner release gate: identity, iCloud, verified email and provider-side limit tested. */
const verified = process.env.NEXT_PUBLIC_BOOKING_VERIFIED === 'true';
const configuredUrl = process.env.NEXT_PUBLIC_BOOKING_URL || '';
export function safeBookingUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'cal.com' || url.username || url.password || url.port || !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname)) return null;
    url.hash = ''; url.search = '';
    return url.href;
  } catch { return null; }
}
const url = verified ? safeBookingUrl(configuredUrl) : null;
export const liveBookingEvents = url ? [{ id: 'consultation-90', duration: 90, url }] : [];
