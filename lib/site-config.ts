import { sitePath } from './site-path';

// User-supplied gallery previews. Keep the embedded photographer watermark intact.
export const assets = {
  heroPortrait: sitePath('/images/DSC01608.jpg'),
  heroLensPortrait: sitePath('/images/DSC01608.jpg'),
  aboutPortrait: sitePath('/images/DSC01657.jpg'),
  editorialPortrait01: sitePath('/images/DSC01638.jpg'),
  editorialPortrait02: sitePath('/images/DSC01624.jpg'),
  contactPortrait: sitePath('/images/DSC01638.jpg'),
  isPlaceholder: false,
  portraitAlt: 'Martin Kostrhun, finanční specialista',
  aboutAlt: 'Martin Kostrhun při chůzi po terase',
  editorialAlt: 'Martin Kostrhun na terase vedle svého odrazu ve skle',
  contactAlt: 'Martin Kostrhun pracuje na notebooku u venkovního stolu',
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
