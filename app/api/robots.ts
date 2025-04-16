import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/server-sitemap.xml',
      ],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
} 