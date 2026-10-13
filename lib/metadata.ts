import type { Metadata } from 'next';
const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
export const configuredSiteURL = value && /^https:\/\//.test(value) ? value : null;
export function pageMetadata(title: string, path = '', description = 'Martin Kostrhun, finanční specialista eDO finance. Bydlení, investice, pojištění a finanční plán.'): Metadata {
    const url = configuredSiteURL ? `${configuredSiteURL}/${path.replace(/^\//, '')}` : undefined;
    return { title, description, ...(url ? { alternates: { canonical: url } } : {}), openGraph: { title, description, type: 'website', locale: 'cs_CZ', ...(url ? { url, images: [{ url: `${configuredSiteURL}/images/DSC01608.jpg`, width: 800, height: 1200, alt: 'Martin Kostrhun, finanční specialista' }] } : {}) } };
}
