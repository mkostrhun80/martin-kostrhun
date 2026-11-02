import type { Metadata } from 'next';
import { siteConfig } from './site-config';

const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
export const configuredSiteURL = value && /^https:\/\//.test(value) ? value : null;

/** The configured URL already includes the deployment's base path. */
export function absoluteSiteURL(path = ''): string | undefined {
    return configuredSiteURL ? `${configuredSiteURL}/${path.replace(/^\/+/, '')}` : undefined;
}

export function pageMetadata(title: string, path = '', description = siteConfig.description): Metadata {
    const url = absoluteSiteURL(path);
    const image = absoluteSiteURL('images/DSC01608-original.jpg');
    return {
        title, description,
        authors: [{ name: siteConfig.name, ...(url ? { url: absoluteSiteURL('#o-mne') } : {}) }],
        creator: siteConfig.name,
        ...(url ? { alternates: { canonical: url } } : {}),
        openGraph: {
            title, description, siteName: siteConfig.name, type: 'website', locale: 'cs_CZ',
            ...(url ? { url } : {}),
            ...(image ? { images: [{ url: image, width: 1600, height: 2400, alt: 'Martin Kostrhun, finanční specialista' }] } : {}),
        },
        twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
    };
}
