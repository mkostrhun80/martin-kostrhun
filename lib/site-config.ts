import { sitePath } from './site-path';

// Web-optimized copies of the owner-supplied original photographs.
export const assets = {
  heroPortrait: sitePath('/images/martin-hero-foto3.webp'),
  heroLensPortrait: sitePath('/images/martin-hero-foto3.webp'),
  contentsPortrait: sitePath('/images/martin-contents-foto6.webp'),
  aboutPortrait: sitePath('/images/martin-strom.jpg'),
  servicePortrait: sitePath('/images/martin-services-foto4.webp'),
  serviceAlt: 'Martin Kostrhun na terase u prosklené stěny',
  editorialPortrait01: sitePath('/images/DSC01638-original.jpg'),
  editorialPortrait02: sitePath('/images/DSC01624-original.jpg'),
  contactPortrait: sitePath('/images/DSC01657-original.jpg'),
  isPlaceholder: false,
  portraitAlt: 'Martin Kostrhun, finanční specialista',
  contentsAlt: 'Martin Kostrhun na terase',
  aboutAlt: 'Martin Kostrhun objímá kmen palmy za slunečného dne',
  editorialAlt: 'Martin Kostrhun na terase vedle svého odrazu ve skle',
  contactAlt: 'Martin Kostrhun pracuje na notebooku u venkovního stolu',
};
export const siteConfig = {
  name: 'Martin Kostrhun', email: 'martin.kostrhun@edofinance.cz',
  role: 'finanční specialista',
  title: 'Finanční specialista v Hradci Králové | Martin Kostrhun',
  description: 'Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Hypotéky, investice, pojištění a finanční plán. Osobně i online.',
  introduction: 'Jsem Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Pomáhám s hypotékami, investicemi, pojištěním a finančním plánem. Spolupráci řešíme osobně, online nebo telefonicky.',
  phone: '+420 733 428 135', phoneHref: 'tel:+420733428135',
  address: 'Gočárova třída 1620/30', city: '500 02 Hradec Králové',
  locality: 'Hradec Králové', postalCode: '500 02', countryCode: 'CZ',
  ico: '23315598', dataBox: 'q2xdru4',
  registryUrl: 'https://www.cnb.cz/cnb/jerrs',
  instagramUrl: null as string | null,
  linkedinUrl: 'https://www.linkedin.com/in/martin-kostrhun-61059936b/',
  facebookUrl: null as string | null,
  appointmentUrl: null as string | null,
  contactEndpoint: null as string | null,
  // Scope of tied representation confirmed by the owner on 2026-10-09.
  originalRegulatoryFooter: 'Martin Kostrhun, IČO 23315598, působí jako vázaný zástupce eDO finance, a.s., IČO 24783421, V parku 2335/20, 148 00 Praha 4, pro investice, spotřebitelské úvěry, pojištění a doplňkové penzijní spoření. Aktuální rozsah oprávnění lze ověřit v registru České národní banky. Podrobnosti a odkazy na dokumenty eDO jsou v sekci Právní informace.',
};
