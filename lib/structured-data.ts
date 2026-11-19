import { services } from './content';
import { absoluteSiteURL } from './metadata';
import { defaultFAQ } from './public-data';
import { siteConfig } from './site-config';

/** Emit stable entity IDs only when the deployment has a real public URL. */
export function homeStructuredData() {
  const url = absoluteSiteURL();
  if (!url) return null;
  const personId = `${url}#martin-kostrhun`;
  const businessId = `${url}#financni-sluzby`;
  const websiteId = `${url}#website`;
  const pageId = `${url}#webpage`;
  const faqId = `${url}#otazky`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': websiteId,
        url, name: siteConfig.name, inLanguage: 'cs-CZ',
        publisher: { '@id': personId },
      },
      {
        '@type': 'WebPage', '@id': pageId,
        url, name: siteConfig.title, description: siteConfig.description, inLanguage: 'cs-CZ',
        isPartOf: { '@id': websiteId },
        author: { '@id': personId },
        about: { '@id': personId },
        mainEntity: { '@id': businessId },
        hasPart: { '@id': faqId },
      },
      {
        '@type': 'Person', '@id': personId,
        name: siteConfig.name, jobTitle: siteConfig.role,
        url: `${url}#o-mne`, image: absoluteSiteURL('images/DSC01657-original.jpg'),
        affiliation: { '@type': 'Organization', name: 'eDO finance, a.s.' },
        sameAs: [siteConfig.linkedinUrl],
      },
      {
        '@type': 'FinancialService', '@id': businessId,
        name: siteConfig.name, url, description: siteConfig.description,
        image: absoluteSiteURL('images/DSC01657-original.jpg'),
        telephone: siteConfig.phone, email: siteConfig.email,
        identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: siteConfig.ico },
        address: {
          '@type': 'PostalAddress', streetAddress: siteConfig.address,
          addressLocality: siteConfig.locality, postalCode: siteConfig.postalCode,
          addressCountry: siteConfig.countryCode,
        },
        mainEntityOfPage: { '@id': pageId },
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Finanční služby',
          itemListElement: services.map(service => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service', '@id': `${url}#sluzba-${service.id}`,
              name: service.title, description: service.description,
              url: `${url}#sluzba-${service.id}`, provider: { '@id': businessId },
            },
          })),
        },
      },
      {
        '@type': 'FAQPage', '@id': faqId, url: faqId, inLanguage: 'cs-CZ',
        isPartOf: { '@id': pageId },
        mainEntity: defaultFAQ.map(faq => ({
          '@type': 'Question', '@id': `${url}#otazka-${faq.id}`,
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

/** Keep content containing HTML-like text inside the JSON-LD script element. */
export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
