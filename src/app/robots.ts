import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://sundus.bd';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/(admin)/',
                '/(auth)/',
                '/profile/',
                '/cart/',
                '/checkout/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
