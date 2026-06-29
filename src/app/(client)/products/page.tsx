import ProductFilters from '@/components/client/ProductFilters';
import ProductGrid from '@/components/client/ProductGrid';
import Link from 'next/link';
import ProductToolbar from '@/components/client/ProductToolbar';

export const metadata = {
    title: 'Explore Our Collection',
    description: 'Discover luxury products at unbeatable prices. Shop our latest arrivals and exclusive deals.',
};

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
    const params = await searchParams;

    return (
        <div className="bg-[#FDFDFD]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto py-2.5 sm:py-3.5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <nav className="flex text-xs font-semibold text-gray-400">
                                <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                                <span className="mx-2 text-gray-300">/</span>
                                <span className="text-primary font-bold">Shop</span>
                                {params?.category && (
                                    <>
                                        <span className="mx-2 text-gray-300">/</span>
                                        <span className="text-gray-900 capitalize">{params.category.replace(/-/g, ' ')}</span>
                                    </>
                                )}
                            </nav>
                        </div>
                        <div className="flex-grow md:flex md:justify-end">
                            <ProductToolbar />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto pt-6 pb-6 sm:pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block lg:w-72 flex-shrink-0 relative border-r border-gray-100/80 pr-6 mr-2">
                        {/* Custom right-only shadow line */}
                        <div className="absolute top-0 right-0 bottom-0 w-[1px] shadow-[4px_0_12px_rgba(0,0,0,0.03)] pointer-events-none" />
                        <div className="sticky top-28">
                            <ProductFilters />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <ProductGrid />
                    </div>
                </div>
            </div>
        </div>
    );
}
