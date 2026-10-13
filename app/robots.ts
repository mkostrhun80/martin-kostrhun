import type { MetadataRoute } from 'next';
import { configuredSiteURL } from '@/lib/metadata';
import { sitePath } from '@/lib/site-path';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: sitePath('/'), disallow: ['/api/', '/sprava/', '/zpetna-vazba/'].map(sitePath) }, ...(configuredSiteURL ? { sitemap: `${configuredSiteURL}/sitemap.xml` } : {}) }; }
