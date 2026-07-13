import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import LandingPage from '@/models/LandingPage';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        await dbConnect();
    } catch (error) {
        console.error('Sitemap DB connection error:', error);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    let productUrls: MetadataRoute.Sitemap = [];
    let blogUrls: MetadataRoute.Sitemap = [];
    let landingPageUrls: MetadataRoute.Sitemap = [];

    try {
        const products = await Product.find({ isActive: true }).select('slug updatedAt').lean() as any[];
        productUrls = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error fetching products for sitemap', error);
    }

    try {
        const blogs = await Blog.find({ isActive: true }).select('slug updatedAt').lean() as any[];
        blogUrls = blogs.map((blog) => ({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching blogs for sitemap', error);
    }

    try {
        const landingPages = await LandingPage.find({ isActive: true }).select('slug updatedAt').lean() as any[];
        landingPageUrls = landingPages.map((lp) => ({
            url: `${baseUrl}/p/${lp.slug}`,
            lastModified: lp.updatedAt ? new Date(lp.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error fetching landing pages for sitemap', error);
    }

    const staticRoutes: MetadataRoute.Sitemap = [
        '',
        '/products',
        '/blogs',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    return [...staticRoutes, ...productUrls, ...blogUrls, ...landingPageUrls];
}
