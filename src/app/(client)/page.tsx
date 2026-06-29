import HeroBanner from '@/components/client/HeroBanner';
import { Suspense } from 'react';
import CategoriesPreview from '@/components/client/CategoriesPreview';
import BrandsPreview from '@/components/client/BrandsPreview';
import LandingProductSliders from '@/components/client/LandingProductSliders';
import TopSellingProducts from '@/components/client/TopSellingProducts';
import FeaturedProducts from '@/components/client/FeaturedProducts';
import Skeleton from '@/components/shared/Skeleton';
import { CategoryCardSkeleton, ProductCardSkeleton } from '@/components/shared/Skeletons';
import Testimonials from '@/components/client/Testimonials';
import PromotionalBanners from '@/components/client/PromotionalBanners';
import MidProductShowcase from '@/components/client/MidProductShowcase';
import TrustBar from '@/components/client/TrustBar';

export default async function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Hero Section */}
            <HeroBanner />

            {/* Categories Preview - Compact Cards */}
            <Suspense fallback={
                <section className="py-20 bg-white">
                    <div className="container mx-auto">
                        <div className="flex items-end justify-between mb-12">
                            <div className="space-y-2">
                                <Skeleton width="80px" height="12px" />
                                <Skeleton width="240px" height="32px" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <CategoryCardSkeleton key={i} />)}
                        </div>
                    </div>
                </section>
            }>
                <CategoriesPreview />
            </Suspense>

            {/* Top Selling Products */}
            <Suspense fallback={
                <section className="py-8 md:py-12 bg-gray-50/50">
                    <div className="container mx-auto px-4 xl:px-0">
                        <div className="flex items-end justify-between mb-8 md:mb-10">
                            <div className="space-y-2">
                                <Skeleton width="100px" height="12px" />
                                <Skeleton width="200px" height="32px" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-xl h-[160px] animate-pulse shadow-sm"></div>
                            ))}
                        </div>
                    </div>
                </section>
            }>
                <TopSellingProducts />
            </Suspense>

            {/* Brands Preview - Minimalistic Grid */}
            <Suspense fallback={
                <section className="py-6 md:py-10 bg-white">
                    <div className="container mx-auto px-4 xl:px-0">
                        <div className="flex items-end justify-between mb-6 md:mb-8">
                            <div className="space-y-2">
                                <Skeleton width="100px" height="12px" />
                                <Skeleton width="200px" height="32px" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-lg border border-gray-100" />
                            ))}
                        </div>
                    </div>
                </section>
            }>
                <BrandsPreview />
            </Suspense>

            {/* Dynamic Landing Page Product Sliders */}
            <Suspense fallback={
                <section className="py-10 bg-white">
                    <div className="container mx-auto">
                        <div className="flex items-end justify-between mb-8">
                            <div className="space-y-2">
                                <Skeleton width="200px" height="32px" />
                                <Skeleton width="80px" height="12px" />
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-[280px] flex-none">
                                    <ProductCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            }>
                <LandingProductSliders />
            </Suspense>

            {/* Promotional Banners — Mid Section (Left + Right, landscape 16:9) */}
            <Suspense fallback={
                <section className="container mx-auto px-4 xl:px-0 py-6 md:py-8">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                        <div className="w-full aspect-video bg-gray-100 animate-pulse" />
                        <div className="w-full aspect-video bg-gray-100 animate-pulse" />
                    </div>
                </section>
            }>
                <PromotionalBanners />
            </Suspense>

            {/* Mid-Section Product Showcase — subcategories with showOnMid enabled */}
            <Suspense fallback={<div className="py-10" />}>
                <MidProductShowcase />
            </Suspense>

            {/* Featured Products - High Density Grid */}
            <Suspense fallback={
                <section className="py-20 bg-gray-50/50">
                    <div className="container mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <Skeleton className="mx-auto" width="80px" height="12px" />
                            <Skeleton className="mx-auto" width="300px" height="40px" />
                            <Skeleton className="mx-auto" width="48px" height="4px" />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductCardSkeleton key={i} />)}
                        </div>
                    </div>
                </section>
            }>
                <FeaturedProducts />
            </Suspense>

            {/* Brand Promise / Trust Bar — reassurance before Testimonials */}
            <TrustBar />

            {/* Testimonials */}
            <Testimonials />
        </div>
    );
}
