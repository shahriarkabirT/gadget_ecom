import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Brand';
import VariantOption, { IVariantOptionDocument } from '@/models/VariantOption';
import '@/models/Category'; // Required to register schema for .populate() in Vercel Serverless Functions
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

// Shared data fetcher — avoids duplicate DB queries between generateMetadata and the page
async function getProductData(slug: string) {
    await dbConnect();

    // Run both queries in parallel instead of sequentially
    const [product, allOptions] = await Promise.all([
        Product.findOne({ slug, isActive: true })
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .lean(),
        VariantOption.find({ isActive: true }).lean() as Promise<IVariantOptionDocument[]>,
    ]);

    if (!product) return null;

    const globalOptions = {
        sizes: allOptions.filter(o => o.type === 'size').sort((a, b) => a.order - b.order),
        colors: allOptions.filter(o => o.type === 'color').sort((a, b) => a.order - b.order),
        materials: allOptions.filter(o => o.type === 'material').sort((a, b) => a.order - b.order),
    };

    return {
        product: JSON.parse(JSON.stringify(product)),
        globalOptions: JSON.parse(JSON.stringify(globalOptions)),
    };
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getProductData(slug);

    if (!data) {
        return { title: 'Product Not Found' };
    }

    const title = `${data.product.title} - Store`;
    const description = data.product.shortDescription || data.product.title;
    
    // Ensure absolute URL for OpenGraph images
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bdgirls.xyz';
    const imageUrl = data.product.images?.[0];
    const absoluteImageUrl = imageUrl 
        ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
        : undefined;

    const images = absoluteImageUrl ? [{ url: absoluteImageUrl, width: 1200, height: 630 }] : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: absoluteImageUrl ? [absoluteImageUrl] : [],
        }
    };
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const data = await getProductData(slug);

    if (!data || !data.product) {
        notFound();
    }

    return <ProductDetailClient initialProduct={data.product} serverOptions={data.globalOptions} />;
}
