import type { MetadataRoute } from 'next';

import { getBaseUrl } from '@/lib/seo/base-url.server';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard'],
      },
    ],
    sitemap: new URL('/sitemap.xml', base).toString(),
    host: base.origin,
  };
}
