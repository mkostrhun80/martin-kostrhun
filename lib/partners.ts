// Partners listed in the five current eDO finance partner registers, checked 2026-10-06.
// The list describes eDO finance's institutional network, not personal endorsements.
export type PartnerCategory = 'Pojištění' | 'Investice' | 'Penzijní spoření' | 'Banky a úvěry' | 'Další služby';
export interface Partner {
  name: string;
  shortName: string;
  category: PartnerCategory;
  logo: string;
  logoLight: boolean;
  source: string;
}
export const partnersSource = 'https://edofinance.cz/cz/ke-stazeni';
export const partnersCheckedAt = '2026-10-06';
export const partnerCategories: PartnerCategory[] = ['Pojištění', 'Investice', 'Penzijní spoření', 'Banky a úvěry', 'Další služby'];
export const partners: Partner[] = [
  {
    "name": "Allianz pojišťovna, a.s.",
    "shortName": "Allianz pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/allianz-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Colonnade Insurance S.A., organizační složka",
    "shortName": "Colonnade Insurance S.A.",
    "category": "Pojištění",
    "logo": "/images/partners/colonnade-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Česká podnikatelská pojišťovna, a.s., Vienna Insurance Group",
    "shortName": "ČPP",
    "category": "Pojištění",
    "logo": "/images/partners/cpp-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "ČSOB Pojišťovna, a.s., člen holdingu ČSOB",
    "shortName": "ČSOB Pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/csobpoj-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Direct pojišťovna, a.s.",
    "shortName": "Direct pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/direct-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "ERGO Cestovní Pojišťovna, a.s.",
    "shortName": "ERGO Cestovní Pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/ervpojistovna-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Generali Česká pojišťovna a.s.",
    "shortName": "Generali Česká pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/generaliceska-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "HALALI, všeobecná pojišťovna, a.s.",
    "shortName": "HALALI, všeobecná pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/halali-pojistovna-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Hasičská vzájemná pojišťovna, a.s.",
    "shortName": "Hasičská vzájemná pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/hvp-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "INTER PARTNER ASSISTANCE, organizační složka",
    "shortName": "AXA Assistance",
    "category": "Pojištění",
    "logo": "/images/partners/axa-assistance-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Komerční pojišťovna, a.s.",
    "shortName": "KB Pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/komercpoj-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Kooperativa pojišťovna, a.s., Vienna Insurance Group",
    "shortName": "Kooperativa pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/koop-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "LEXIA Legal Protection a.s.",
    "shortName": "LEXIA Legal Protection",
    "category": "Pojištění",
    "logo": "/images/partners/lexia-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "MAXIMA pojišťovna, a.s.",
    "shortName": "MAXIMA pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/maxima-as-cz.png",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "MetLife Europe d.a.c., pobočka pro Českou republiku",
    "shortName": "MetLife Europe d.a.c.",
    "category": "Pojištění",
    "logo": "/images/partners/metlife-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "NN Životní pojišťovna N. V., pobočka pro Českou republiku",
    "shortName": "NN Životní pojišťovna N. V.",
    "category": "Pojištění",
    "logo": "/images/partners/nn-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "PetExpert Europe s.r.o.",
    "shortName": "PetExpert Europe",
    "category": "Pojištění",
    "logo": "/images/partners/petexpert-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Pillow pojišťovna, a.s.",
    "shortName": "Pillow pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/pillow-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Pojišťovna VZP, a.s.",
    "shortName": "Pojišťovna VZP",
    "category": "Pojištění",
    "logo": "/images/partners/pvzp-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "PREMIUM Pojišťovna, pobočka Česká republika",
    "shortName": "PREMIUM Pojišťovna, pobočka Česká republika",
    "category": "Pojištění",
    "logo": "/images/partners/premium-ic-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "Slavia pojišťovna a.s.",
    "shortName": "Slavia pojišťovna",
    "category": "Pojištění",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "STARR EUROPE INSURANCE LIMITED, pobočka pro Českou republiku",
    "shortName": "STARR EUROPE INSURANCE LIMITED",
    "category": "Pojištění",
    "logo": "/images/partners/starrcompanies-com.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "UNIQA pojišťovna, a.s.",
    "shortName": "UNIQA pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/uniqa-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "YOUPLUS Životní pojišťovna, pobočka pro Českou republiku",
    "shortName": "YOUPLUS Životní pojišťovna",
    "category": "Pojištění",
    "logo": "/images/partners/youplus-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "YOUPLUS Assurance AG",
    "shortName": "YOUPLUS Assurance AG",
    "category": "Pojištění",
    "logo": "/images/partners/youplus-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/74b48adb0a.pdf"
  },
  {
    "name": "AMISTA investiční společnost, a.s.",
    "shortName": "AMISTA investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/amista-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "Amundi Czech Republic Asset Management, a.s.",
    "shortName": "Amundi Czech Republic Asset Management",
    "category": "Investice",
    "logo": "/images/partners/amundi-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "ATLANTIK finanční trhy, a.s.",
    "shortName": "ATLANTIK finanční trhy",
    "category": "Investice",
    "logo": "/images/partners/atlantik-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "ATRIS investiční společnost, a.s.",
    "shortName": "ATRIS investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/atrisinvest-cz.png",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "AVANT investiční společnost, a.s.",
    "shortName": "AVANT investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/avantfunds-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "CODYA investiční společnost, a.s. ",
    "shortName": "CODYA investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/codyainvest-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "CONSEQ Investment Management, a.s.",
    "shortName": "CONSEQ Investment Management",
    "category": "Investice",
    "logo": "/images/partners/conseq-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "CYRRUS, a.s.",
    "shortName": "CYRRUS",
    "category": "Investice",
    "logo": "/images/partners/cyrrus-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "European Investment Centre, o.c.p., a.s. - organizační složka",
    "shortName": "European Investment Centre",
    "category": "Investice",
    "logo": "/images/partners/eic-eu.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "EFEKTA obchodník s cennými papíry a.s.",
    "shortName": "EFEKTA obchodník s cennými papíry",
    "category": "Investice",
    "logo": "/images/partners/efekta-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "Generali Investments CEE, investiční společnost, a.s.",
    "shortName": "Generali Investments CEE, investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/generali-investments-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "INVESTIKA, investiční společnost, a.s.",
    "shortName": "INVESTIKA, investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/investika-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "J&T BANKA, a.s.",
    "shortName": "J&T BANKA",
    "category": "Investice",
    "logo": "/images/partners/jtbank-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "UNIQA investiční společnost, a.s.",
    "shortName": "UNIQA investiční společnost",
    "category": "Investice",
    "logo": "/images/partners/uniqa-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "WOOD Retail Investments a.s.",
    "shortName": "WOOD Retail Investments",
    "category": "Investice",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "WOOD & Company Financial Services, a.s.",
    "shortName": "WOOD & Company Financial Services",
    "category": "Investice",
    "logo": "/images/partners/wood-com.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/5ef2712066.pdf"
  },
  {
    "name": "Allianz penzijní společnost, a.s.",
    "shortName": "Allianz penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/allianz-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "Conseq penzijní společnost, a.s.",
    "shortName": "Conseq penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/conseq-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "Česká spořitelna - penzijní společnost, a.s.",
    "shortName": "Česká spořitelna – penze",
    "category": "Penzijní spoření",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "ČSOB Penzijní společnost, a.s., člen skupiny ČSOB",
    "shortName": "ČSOB Penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/csob-penze-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "Generali penzijní společnost, a.s.",
    "shortName": "Generali penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/generalipenze-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "KB Penzijní společnost, a.s.",
    "shortName": "KB Penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/kbps-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "NN Penzijní společnost, a.s.",
    "shortName": "NN Penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/nn-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "UNIQA penzijní společnost a.s.",
    "shortName": "UNIQA penzijní společnost",
    "category": "Penzijní spoření",
    "logo": "/images/partners/uniqa-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/7712f76a62.pdf"
  },
  {
    "name": "AS Inbank, odštěpný závod",
    "shortName": "AS Inbank, odštěpný závod",
    "category": "Banky a úvěry",
    "logo": "/images/partners/inbank-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Česká spořitelna, a.s.",
    "shortName": "Česká spořitelna",
    "category": "Banky a úvěry",
    "logo": "/images/partners/csas-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Československá obchodní banka, a.s.",
    "shortName": "ČSOB",
    "category": "Banky a úvěry",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "ČSOB Hypoteční banka, a.s.",
    "shortName": "ČSOB Hypoteční banka",
    "category": "Banky a úvěry",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "ČSOB Leasing, a.s.",
    "shortName": "ČSOB Leasing",
    "category": "Banky a úvěry",
    "logo": "/images/partners/csobleasing-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Komerční banka, a.s.",
    "shortName": "Komerční banka",
    "category": "Banky a úvěry",
    "logo": "/images/partners/kb-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "mBank S.A., organizační složka",
    "shortName": "mBank S.A.",
    "category": "Banky a úvěry",
    "logo": "/images/partners/mbank-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Modrá pyramida stavební spořitelna, a.s.",
    "shortName": "Modrá pyramida stavební spořitelna",
    "category": "Banky a úvěry",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Oberbank AG pobočka Česká republika",
    "shortName": "Oberbank AG pobočka Česká republika",
    "category": "Banky a úvěry",
    "logo": "/images/partners/oberbank-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Raiffeisen stavební spořitelna a.s.",
    "shortName": "Raiffeisen stavební spořitelna",
    "category": "Banky a úvěry",
    "logo": "/images/partners/rsts-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Raiffeisenbank a.s.",
    "shortName": "Raiffeisenbank",
    "category": "Banky a úvěry",
    "logo": "/images/partners/rb-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "Stavební spořitelna České spořitelny, a.s.",
    "shortName": "Buřinka",
    "category": "Banky a úvěry",
    "logo": "/images/partners/burinka-cz.svg",
    "logoLight": true,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "TRINITY BANK a.s.",
    "shortName": "TRINITY BANK",
    "category": "Banky a úvěry",
    "logo": "/images/partners/trinitybank-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "UniCredit Bank Czech Republic and Slovakia, a.s.",
    "shortName": "UniCredit Bank Czech Republic and Slovakia",
    "category": "Banky a úvěry",
    "logo": "/images/partners/unicreditbank-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "UniCredit Leasing CZ, a.s.",
    "shortName": "UniCredit Leasing CZ",
    "category": "Banky a úvěry",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/60ccdfe204.pdf"
  },
  {
    "name": "CYRRUS FX, a.s.",
    "shortName": "CYRRUS FX",
    "category": "Další služby",
    "logo": "/images/partners/cyrrus-fx-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  },
  {
    "name": "EKKA-Gold s.r.o.",
    "shortName": "EKKA-Gold",
    "category": "Další služby",
    "logo": "/images/partners/ekka-gold-cz.svg",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  },
  {
    "name": "EUCS Osobní likvidátor s.r.o.",
    "shortName": "EUCS Osobní likvidátor",
    "category": "Další služby",
    "logo": "/images/partners/eucs-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  },
  {
    "name": "EVO Czech Republic s.r.o.",
    "shortName": "MMB Platební služby",
    "category": "Další služby",
    "logo": "/images/partners/evo-cz.png",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  },
  {
    "name": "IBIS InGold, a.s.",
    "shortName": "IBIS InGold",
    "category": "Další služby",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  },
  {
    "name": "Loan Connect s.r.o.",
    "shortName": "Loan Connect",
    "category": "Další služby",
    "logo": "",
    "logoLight": false,
    "source": "https://edofinance.cz/dt/591572996f.pdf"
  }
];
