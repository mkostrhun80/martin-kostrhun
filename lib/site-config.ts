import { sitePath } from './site-path';

export interface ResponsiveImageSpec {
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly sizes: string;
  readonly avifSrcSet: string;
  readonly webpSrcSet: string;
  readonly src: string;
}

function makeResponsiveImage(
  baseName: string,
  alt: string,
  sizes: string,
): ResponsiveImageSpec {
  const path480Webp = sitePath(`/images/optimized/${baseName}-480.webp`);
  const path800Webp = sitePath(`/images/optimized/${baseName}-800.webp`);
  const path480Avif = sitePath(`/images/optimized/${baseName}-480.avif`);
  const path800Avif = sitePath(`/images/optimized/${baseName}-800.avif`);
  return {
    alt,
    width: 800,
    height: 1000,
    sizes,
    avifSrcSet: `${path480Avif} 480w, ${path800Avif} 800w`,
    webpSrcSet: `${path480Webp} 480w, ${path800Webp} 800w`,
    src: path800Webp,
  };
}

// Web-optimized responsive variants (AVIF + WebP) in public/images/optimized/.
export const assets = {
  heroPortrait: sitePath('/images/optimized/hero-martin-800.webp'),
  contentsPortrait: sitePath('/images/optimized/editorial-planning-800.webp'),
  aboutPortrait: sitePath('/images/optimized/about-martin-800.webp'),
  contactPortrait: sitePath('/images/optimized/editorial-consultation-800.webp'),
  isPlaceholder: false,
  portraitAlt: 'Martin Kostrhun v obleku s notebookem v Hradci Králové',
  contentsAlt: 'Pracovní stůl finančního specialisty s otevřeným diářem a deskami v námořnické modři',
  aboutAlt: 'Martin Kostrhun s úsměvem u notebooku při přípravě finančního plánu',
  contactAlt: 'Klidná konzultační místnost v teplých tónech přírodního dubu a vápna',
  responsive: {
    hero: makeResponsiveImage(
      'hero-martin',
      'Martin Kostrhun v obleku s notebookem v Hradci Králové',
      '(max-width: 900px) 92vw, 440px',
    ),
    contents: makeResponsiveImage(
      'editorial-planning',
      'Pracovní stůl finančního specialisty s otevřeným diářem a deskami v námořnické modři',
      '(max-width: 900px) 92vw, 480px',
    ),
    about: makeResponsiveImage(
      'about-martin',
      'Martin Kostrhun s úsměvem u notebooku při přípravě finančního plánu',
      '(max-width: 900px) 92vw, 460px',
    ),
    contact: makeResponsiveImage(
      'editorial-consultation',
      'Klidná konzultační místnost v teplých tónech přírodního dubu a vápna',
      '(max-width: 900px) 92vw, 460px',
    ),
  },
};

export const siteConfig = {
  name: 'Martin Kostrhun',
  email: 'martin.kostrhun@edofinance.cz',
  role: 'finanční specialista',
  title: 'Finanční specialista v Hradci Králové | Martin Kostrhun',
  description: 'Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Hypotéky, investice, pojištění a finanční plán. Osobně i online.',
  introduction: 'Jsem Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Pomáhám s hypotékami, investicemi, pojištěním a finančním plánem. Spolupráci řešíme osobně, online nebo telefonicky.',
  phone: '+420 733 428 135',
  phoneHref: 'tel:+420733428135',
  address: 'Gočárova třída 1620/30',
  city: '500 02 Hradec Králové',
  locality: 'Hradec Králové',
  postalCode: '500 02',
  countryCode: 'CZ',
  ico: '23315598',
  dataBox: 'q2xdru4',
  registryUrl: 'https://www.cnb.cz/cnb/jerrs',
  instagramUrl: null as string | null,
  linkedinUrl: 'https://www.linkedin.com/in/martin-kostrhun-61059936b/',
  facebookUrl: null as string | null,
  appointmentUrl: null as string | null,
  contactEndpoint: null as string | null,
  // Scope of tied representation confirmed by the owner on 2026-10-09.
  originalRegulatoryFooter: 'Martin Kostrhun, IČO 23315598, působí jako vázaný zástupce eDO finance, a.s., IČO 24783421, V parku 2335/20, 148 00 Praha 4, pro investice, spotřebitelské úvěry, pojištění a doplňkové penzijní spoření. Aktuální rozsah oprávnění lze ověřit v registru České národní banky. Podrobnosti a odkazy na dokumenty eDO jsou v sekci Právní informace.',
};
