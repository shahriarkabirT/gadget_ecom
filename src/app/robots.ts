import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/api/products',
                    '/api/categories',
                    '/api/settings/general',
                    '/api/brands',
                    '/api/policies',
                ],
                disallow: [
                    '/api/admin/',
                    '/api/auth/',
                    '/api/orders/',
                    '/api/couriers/',
                    '/admin/',
                    '/login/',
                    '/register/',
                    '/profile/',
                    '/cart/',
                    '/checkout/',
                ],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/login/',
                    '/register/',
                    '/profile/',
                    '/cart/',
                    '/checkout/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
