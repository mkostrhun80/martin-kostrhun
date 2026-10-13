import type { MetadataRoute } from 'next';
import { configuredSiteURL } from '@/lib/metadata';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return configuredSiteURL ? ['', 'zkusenosti/'].map(path => ({ url: `${configuredSiteURL}/${path}` })) : []; }
