import type { MetadataRoute } from 'next';
import { configuredSiteURL } from '@/lib/metadata';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/sprava/', '/zpetna-vazba/'] }, ...(configuredSiteURL ? { sitemap: `${configuredSiteURL}/sitemap.xml` } : {}) }; }
