'use client';

import { useGetRelatedProductsQuery } from '@/redux/features/product/productApi';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
    currentProductId: string;
    categoryId: string;
    categoryName: string;
    subCategoryId?: string;
    childCategoryId?: string;
    subChildCategoryId?: string;
}

export default function RelatedProducts({
    currentProductId,
    categoryId,
    categoryName,
    subCategoryId,
    childCategoryId,
    subChildCategoryId,
}: RelatedProductsProps) {
    const { data, isLoading } = useGetRelatedProductsQuery({
        productId: currentProductId,
        category: categoryId,
        subCategory: subCategoryId,
        childCategory: childCategoryId,
        subChildCategory: subChildCategoryId,
        direction: 'top-down',
        limit: 5,
    }, { skip: !categoryId });

    if (isLoading) {
        return (
            <div className="mt-16 pt-12 border-t border-gray-100 space-y-8 container mx-auto w-full px-2 sm:px-4 lg:px-6">
                <div className="h-8 w-64 bg-gray-100 animate-pulse rounded-lg mx-auto" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-5 lg:gap-6">
                    {[1, 2, 3, 4, 5].map((i, index) => (
                        <div key={i} className={`aspect-square bg-gray-50 animate-pulse rounded-xl ${index === 4 ? 'hidden lg:block' : ''}`} />
                    ))}
                </div>
            </div>
        );
    }

    const relatedProducts = data?.products || [];

    if (relatedProducts.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-gray-100 space-y-8 container mx-auto w-full px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase mb-2">Recommendations</span>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    More from <span className="text-primary">{categoryName}</span>
                </h2>
                <p className="mt-2 text-xs md:text-sm text-gray-500">Discover similar styles curated just for you based on this item.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                {relatedProducts.slice(0, 5).map((product: any, index: number) => (
                    <div key={product._id} className={index === 4 ? 'hidden lg:block' : ''}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
