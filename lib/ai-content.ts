import { services, steps } from './content';
import { absoluteSiteURL } from './metadata';
import { defaultFAQ } from './public-data';
import { siteConfig } from './site-config';
import { sitePath } from './site-path';

function publicLink(path = '') {
  return absoluteSiteURL(path) ?? sitePath(`/${path}`);
}

/** Optional text views of the public page, generated from its existing content. */
export function aiContent(full = false): string {
  const links = [
    ['O Martinovi', '#o-mne', 'Představení finančního specialisty a jeho přístupu.'],
    ['Služby', '#sluzby', 'Hypotéky, investice, finanční plán, pojištění a dlouhodobé zajištění.'],
    ['Postup spolupráce', '#spoluprace', 'Od úvodní schůzky po dlouhodobou péči.'],
    ['Časté otázky', '#otazky', 'Spolupráce osobně, online i telefonicky a ověření oprávnění.'],
    ['Kontakt', '#kontakt', 'Pracovní e-mail, telefon a adresa v Hradci Králové.'],
    ['Právní informace', 'dokumenty/pravni-informace/', 'Identifikace a postavení vázaného zástupce eDO finance.'],
  ].map(([label, path, description]) => `- [${label}](${publicLink(path)}): ${description}`).join('\n');

  const overview = `# ${siteConfig.name} — ${siteConfig.role} v Hradci Králové

> ${siteConfig.description}

${siteConfig.introduction}

## Stránky a sekce

${links}

## Kontakt a identifikace

- E-mail: ${siteConfig.email}
- Telefon: ${siteConfig.phone}
- Adresa: ${siteConfig.address}, ${siteConfig.city}, Česko
- IČO: ${siteConfig.ico}
- [LinkedIn](${siteConfig.linkedinUrl})
- [Registr České národní banky](${siteConfig.registryUrl})

${siteConfig.originalRegulatoryFooter}
`;

  if (!full) return `${overview}
## Úplný text

- [Textový přehled služeb, spolupráce a častých otázek](${publicLink('llms-full.txt')}): Stejný obsah jako na veřejné stránce.
`;

  const serviceText = services.map(service => `### ${service.title}

${service.description}

[${service.title}](${publicLink(`#sluzba-${service.id}`)})`).join('\n\n');
  const processText = steps.map(([title, description], index) => `${index + 1}. ${title}: ${description}`).join('\n');
  const faqText = defaultFAQ.map(faq => `### ${faq.question}

${faq.answer}${faq.source ? `\n\n[${faq.source.label}](${faq.source.href})` : ''}`).join('\n\n');

  return `${overview}
## S čím pomáhám

${serviceText}

## Jak spolupráce probíhá

${processText}

## Časté otázky

${faqText}
`;
}
