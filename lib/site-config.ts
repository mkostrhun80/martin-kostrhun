// Fictional model: NOT Martin Kostrhun. Replace the centrally configured images.
const martinHeroPlaceholder = '/images/martinHeroPlaceholder.webp';
export const assets = {
  heroPortrait: martinHeroPlaceholder,
  // Optional alternate portrait; use the same crop. CSS supplies the purple tint.
  heroLensPortrait: martinHeroPlaceholder,
  aboutPortrait: martinHeroPlaceholder,
  editorialPortrait01: martinHeroPlaceholder, editorialPortrait02: martinHeroPlaceholder,
  contactPortrait: martinHeroPlaceholder, isPlaceholder: true,
  portraitAlt: 'Dočasný ilustrační portrét modela; nejde o Martina Kostrhuna',
  heroPortraitSmall: '/images/martinHeroPlaceholder-small.webp',
};
export const siteConfig = {
  name: 'Martin Kostrhun', email: 'martin.kostrhun@edofinance.cz',
  phone: '+420 733 428 135', phoneHref: 'tel:+420733428135',
  address: 'Gočárova třída 1620/30', city: '500 02 Hradec Králové',
  ico: '23315598', dataBox: 'q2xdru4',
  instagramUrl: null as string | null,
  linkedinUrl: 'https://cz.linkedin.com/in/martin-kostrhun-61059936b',
  facebookUrl: null as string | null,
  appointmentUrl: null as string | null,
  contactEndpoint: null as string | null,
  // Original source was absent. Never invent regulatory statements.
  originalRegulatoryFooter: null as string | null,
  originalPrivacyText: null as string | null,
  originalLegalText: null as string | null,
  originalCookiesText: null as string | null,
};
