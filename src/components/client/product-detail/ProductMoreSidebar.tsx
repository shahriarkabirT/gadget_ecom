'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useGetRelatedProductsQuery } from '@/redux/features/product/productApi';

interface ProductMoreSidebarProps {
    currentProductId: string;
    categoryId: string;
    subCategoryId?: string;
    childCategoryId?: string;
    subChildCategoryId?: string;
}

const PAGE_SIZE = 6;

export default function ProductMoreSidebar({
    currentProductId,
    categoryId,
    subCategoryId,
    childCategoryId,
    subChildCategoryId,
}: ProductMoreSidebarProps) {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetRelatedProductsQuery({
        productId: currentProductId,
        category: categoryId,
        subCategory: subCategoryId,
        childCategory: childCategoryId,
        subChildCategory: subChildCategoryId,
        direction: 'bottom-up',
        page,
        limit: PAGE_SIZE,
    }, { skip: !categoryId });

    const products = data?.products || [];
    const totalPages = data?.pagination?.pages || 1;
    const canPrev = page > 1;
    const canNext = page < totalPages;

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">More Products</h3>
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div>
            {/* Header with pagination arrows */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">
                    More Products
                    {totalPages > 1 && (
                        <span className="ml-1.5 text-[10px] font-normal text-gray-400 normal-case">
                            {page}/{totalPages}
                        </span>
                    )}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!canPrev}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Previous"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={!canNext}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Next"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Product list */}
            <div className="space-y-3 divide-y divide-gray-50">
                {products.map((product: any) => {
                    const currentMrp = product.mrp || product.price;
                    const discountVal = product.discountValue || product.discount || 0;
                    const price = discountVal > 0
                        ? (product.discountType === 'flat' ? currentMrp - discountVal : currentMrp - (currentMrp * discountVal / 100))
                        : currentMrp;

                    return (
                        <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            className="flex gap-3 pt-3 first:pt-0 group"
                        >
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded border border-gray-100 overflow-hidden">
                                {product.images?.[0] && (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="64px"
                                    />
                                )}
                                {discountVal > 0 && (
                                    <span className="absolute top-0 left-0 bg-orange-500 text-white text-[8px] font-black px-1 py-0.5 leading-none">
                                        {product.discountType === 'flat' ? `৳${discountVal} off` : `${discountVal}%`}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                                    {product.title}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-black text-orange-600">{formatCurrency(price)}</span>
                                    {discountVal > 0 && (
                                        <span className="text-[10px] text-gray-400 line-through">{formatCurrency(currentMrp)}</span>
                                    )}
                                </div>
                                {product.stock === 0 && (
                                    <span className="text-[9px] font-bold text-red-500 uppercase">Out of Stock</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}