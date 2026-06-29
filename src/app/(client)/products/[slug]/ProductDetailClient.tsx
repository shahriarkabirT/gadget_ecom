'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import RelatedProducts from '@/components/client/RelatedProducts';
import { notFound, useRouter } from 'next/navigation';
import { formatCurrency, calculateDiscountedPrice, isSameVariant } from '@/lib/utils';
import { useGetProductBySlugQuery } from '@/redux/features/product/productApi';
import { useGetVariantOptionsQuery } from '@/redux/features/variantOption/variantOptionApi';
import { useGetPublicSettingsQuery } from '@/redux/features/settings/settingsApi';
import { ProductDetailSkeleton } from '@/components/shared/Skeletons';
import {
    ProductImageGallery,
    ProductInfo,
    ProductMoreSidebar,
    ProductTabsSection,
} from '@/components/client/product-detail';
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from '@/lib/gtm-datalayer';

interface Props {
    product: any;
    globalOptions?: any;
}

export default function ProductDetailClient({ product: initialProduct, globalOptions: serverOptions }: Props) {
    // Scroll to top on mount
    useEffect(() => { window.scrollTo(0, 0); }, []);


    const { data: fetchedProduct, isLoading: isProductLoading } = useGetProductBySlugQuery(initialProduct.slug, {
        skip: !!initialProduct,
    });
    const { data: clientOptions } = useGetVariantOptionsQuery(undefined, { skip: !!serverOptions });
    const { data: settingsData } = useGetPublicSettingsQuery();

    const globalOptions = serverOptions || clientOptions;
    const product = fetchedProduct || initialProduct;

    const router = useRouter();
    const { addToCart, isInCart, items } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    
    // --- Move Price Calculation Up for Hook Safety ---
    const activeVariant = product?.variants?.find((v: any) => {
        const sizeMatch = !v.size || selectedVariants['Size'] === v.size;
        const colorMatch = !v.colorName || selectedVariants['Color'] === v.colorName;
        const materialMatch = !v.material || selectedVariants['Material'] === v.material;
        const modelMatch = !v.model || selectedVariants['Model'] === v.model;
        return sizeMatch && colorMatch && materialMatch && modelMatch;
    });
    const currentMrp = activeVariant?.mrp || product?.mrp || product?.price || 0;
    const currentDiscountValue = (activeVariant && activeVariant.discountValue !== undefined) ? activeVariant.discountValue : (product?.discountValue || 0);
    const currentDiscountType = activeVariant?.discountType || product?.discountType || 'percentage';
    const discountedPrice = activeVariant?.price || calculateDiscountedPrice(currentMrp, currentDiscountValue, currentDiscountType);

    // Meta Pixel: Track ViewContent (Moved before early returns)
    useEffect(() => {
        if (product && product._id && discountedPrice) {
            trackViewContent({
                content_ids: [String(product._id)],
                content_name: product.title,
                content_type: 'product',
                value: discountedPrice,
                currency: 'BDT',
                contents: [{ 
                    id: String(product._id), 
                    quantity: 1, 
                    item_price: discountedPrice,
                    item_name: product.title,
                    item_category: product.category?.name
                }]
            });
        }
    }, [product, discountedPrice]);

    const [selectionError, setSelectionError] = useState<{ type: string; source: 'cart' | 'buy' } | null>(null);
    const [showAddedToCart, setShowAddedToCart] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    useEffect(() => {
        if (showAddedToCart) {
            const t = setTimeout(() => setShowAddedToCart(false), 2000);
            return () => clearTimeout(t);
        }
    }, [showAddedToCart]);

    if (isProductLoading && !initialProduct) return <ProductDetailSkeleton />;
    if (!product) { notFound(); return null; }

    // --- Variant logic ---
    const requiredOptions = product.variants?.length > 0
        ? [...new Set<string>(product.variants.flatMap((v: any) => {
            const types: string[] = [];
            if (v.size) types.push('Size');
            if (v.colorName) types.push('Color');
            if (v.material) types.push('Material');
            if (v.model) types.push('Model');
            return types;
        }))]
        : [];

    const missingSelection = (requiredOptions as string[]).find(t => !(selectedVariants as any)[t]);
    const isSelectionComplete = !missingSelection;

    const contactPhone = settingsData?.settings?.contactPhone || '';
    const whatsappNumber = settingsData?.settings?.whatsapp || contactPhone;

    const currentStock = activeVariant ? (activeVariant.stock || 0) : (product?.stock || 0);
    const currentCartItem = items.find((item: any) => item.productId === product?._id && isSameVariant(item.variant, selectedVariants));
    const cartItemQuantity = currentCartItem ? currentCartItem.quantity : 0;
    const availableToBuy = (product?.preorder && currentStock <= 0) ? 99 : Math.max(0, currentStock - cartItemQuantity);

    const handleVariantChange = (type: string, value: string) => {
        if (selectionError) setSelectionError(null);

        // Toggle off if clicking the already-selected option
        if (selectedVariants[type] === value) {
            const updated = { ...selectedVariants };
            delete updated[type];
            setSelectedVariants(updated);
            return;
        }
        const fieldMap: Record<string, string> = { 'Size': 'size', 'Color': 'colorName', 'Material': 'material', 'Model': 'model' };
        const field = fieldMap[type] || type.toLowerCase();
        const nextSelections = { ...selectedVariants, [type]: value };

        const exactMatch = product.variants?.find((v: any) =>
            Object.entries(nextSelections).every(([k, val]) => {
                const vf = fieldMap[k] || k.toLowerCase();
                return v[vf] === val;
            })
        );

        if (exactMatch) {
            setSelectedVariants(nextSelections);
            const matchStock = exactMatch.stock || 0;
            if (quantity > matchStock && matchStock > 0) setQuantity(matchStock);
            else if (matchStock === 0) setQuantity(1);
        } else {
            const bestFit = product.variants?.find((v: any) => v[field] === value);
            if (bestFit) {
                const smart: Record<string, string> = { ...selectedVariants };
                ['Size', 'Color', 'Material', 'Model'].forEach(k => {
                    const kf = fieldMap[k] || k.toLowerCase();
                    if (bestFit[kf]) smart[k] = bestFit[kf];
                });
                smart[type] = value;
                setSelectedVariants(smart);
                const fitStock = bestFit.stock || 0;
                if (quantity > fitStock && fitStock > 0) setQuantity(fitStock);
                else if (fitStock === 0) setQuantity(1);
            } else {
                setSelectedVariants(nextSelections);
            }
        }
    };

    const handleAddToCart = () => {
        if (!isSelectionComplete) { setSelectionError({ type: missingSelection!, source: 'cart' }); return; }
        const variantToSync: any = { ...selectedVariants };
        if (activeVariant?.colorCode) variantToSync.colorCode = activeVariant.colorCode;
        if (activeVariant?.tax !== undefined) variantToSync.tax = activeVariant.tax;
        addToCart({
            ...product,
            isPreorder: product.preorder && currentStock <= 0,
            mrp: currentMrp,
            price: currentMrp,
            discountedPrice,
            discountValue: currentDiscountValue,
            discountType: currentDiscountType,
            tax: activeVariant?.tax !== undefined ? activeVariant.tax : (product.tax || 0),
            title: `${product.title}${Object.values(selectedVariants).length ? ` (${Object.values(selectedVariants).join(', ')})` : ''}`,
        }, quantity, variantToSync);

        // Meta Pixel: Track AddToCart
        trackAddToCart({
            content_ids: [String(product._id)],
            contents: [{ 
                id: String(product._id), 
                quantity, 
                item_price: discountedPrice,
                item_name: product.title,
                item_category: product.category?.name
            }],
            value: discountedPrice * quantity,
            currency: 'BDT'
        });

        setShowAddedToCart(true);
    };

    const handleBuyNow = () => {
        if (!isSelectionComplete) { setSelectionError({ type: missingSelection!, source: 'buy' }); return; }
        const variantToSync: any = { ...selectedVariants };
        if (activeVariant?.colorCode) variantToSync.colorCode = activeVariant.colorCode;
        if (activeVariant?.tax !== undefined) variantToSync.tax = activeVariant.tax;
        sessionStorage.setItem('directBuyItem', JSON.stringify([{
            productId: (product as any)._id || (product as any).id || (product as any).productId,
            title: `${product.title}${Object.values(selectedVariants).length ? ` (${Object.values(selectedVariants).join(', ')})` : ''}`,
            price: discountedPrice || currentMrp,
            originalPrice: currentMrp,
            discount: currentDiscountValue,
            discountType: currentDiscountType,
            tax: activeVariant?.tax !== undefined ? activeVariant.tax : (product.tax || 0),
            image: product.images?.[0] || '',
            quantity,
            stock: product.stock || 0,
            variant: variantToSync,
            isPreorder: product.preorder && currentStock <= 0,
        }]));

        // Redirects to checkout page, where trackInitiateCheckout will fire on page load.
        router.push('/checkout?directBuy=true');
    };

    // Variant selector JSX (inline — stays in orchestrator since it needs local state)
    const variantSlot = product.variants?.length > 0 ? (
        <div className="space-y-2 lg:space-y-4 pt-1 lg:pt-2">
            {(['Size', 'Color', 'Material', 'Model'] as const).map(variantType => {
                const fieldMap: Record<string, string> = { 'Size': 'size', 'Color': 'colorName', 'Material': 'material', 'Model': 'model' };
                const field = fieldMap[variantType];
                const rawOptions = [...new Set(product.variants?.map((v: any) => v[field]).filter(Boolean))] as string[];
                const options = [...rawOptions].sort((a, b) => {
                    const list = variantType === 'Size' ? globalOptions?.sizes : variantType === 'Color' ? globalOptions?.colors : variantType === 'Model' ? globalOptions?.models : globalOptions?.materials;
                    const oA = list?.find((o: any) => o.label === a)?.order ?? 999;
                    const oB = list?.find((o: any) => o.label === b)?.order ?? 999;
                    return oA - oB;
                });
                if (options.length === 0) return null;

                return (
                    <div key={variantType}>
                        <div className="flex items-center gap-2 mb-1 lg:mb-2">
                            <span className="text-[10px] lg:text-xs font-black text-gray-700 uppercase tracking-wide">Select {variantType}</span>
                            {selectedVariants[variantType] && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{selectedVariants[variantType]}</span>
                            )}
                            {variantType === 'Size' && (typeof product.sizeGuide === 'object' ? (product.sizeGuide as any).image : product.sizeGuide) && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowSizeGuide(true)}
                                    className="ml-auto flex items-center gap-1.5 text-[10px] lg:text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest border border-gray-200 px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 lg:w-3.5 lg:h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                                    </svg>
                                    Size Guide
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {options.map(opt => {
                                const isColor = variantType === 'Color';
                                const matchingVariant = isColor ? product.variants?.find((v: any) => v.colorName === opt) : null;
                                const colorHex = isColor ? (matchingVariant?.colorCode || opt) : null;
                                const isSelected = selectedVariants[variantType] === opt;

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleVariantChange(variantType, opt)}
                                        style={isColor ? { backgroundColor: colorHex || opt } : {}}
                                        title={opt}
                                        className={`relative transition-all ${isColor
                                            ? `w-6 h-6 lg:w-7 lg:h-7 rounded-full border-2 ${isSelected ? 'border-orange-500 scale-110' : 'border-gray-300 hover:border-orange-400'}`
                                            : `px-2 lg:px-3 py-1 lg:py-1.5 rounded border text-[11px] lg:text-xs font-bold ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 text-gray-700 hover:border-orange-400'}`
                                        }`}
                                    >
                                        {!isColor && opt}
                                        {isColor && isSelected && (
                                            <span className="absolute inset-0 flex items-center justify-center text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    ) : null;

    const categoryId = product.category?._id || product.category;
    const subCategoryId = product.subCategory?._id || product.subCategory;
    const childCategoryId = product.childCategory?._id || product.childCategory;
    const subChildCategoryId = product.subChildCategory?._id || product.subChildCategory;

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-2">
                    <nav>
                        <ol className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                            <li><Link href="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
                            <li className="text-gray-200">/</li>
                            <li><Link href="/products" className="hover:text-orange-500 transition-colors">Shop</Link></li>
                            {product.category && (
                                <>
                                    <li className="text-gray-200">/</li>
                                    <li><Link href={`/products?category=${product.category.slug}`} className="hover:text-orange-500 transition-colors">{product.category.name}</Link></li>
                                </>
                            )}
                            <li className="text-gray-200">/</li>
                            <li className="text-gray-700 font-semibold truncate max-w-[180px]">{product.title}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Main 3-column grid */}
            <div className="container mx-auto px-4 py-4 lg:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

                    {/* Col 1: Images */}
                    <div className="lg:col-span-5">
                        <ProductImageGallery
                            key={activeVariant?._id ?? 'default'}
                            images={product.images || []}
                            title={product.title}
                            discountValue={currentDiscountValue}
                            discountType={currentDiscountType}
                            activeVariantImages={activeVariant?.images}
                        />
                    </div>

                    {/* Col 2: Product Info */}
                    <div className="lg:col-span-4">
                        <ProductInfo
                            product={product}
                            discountedPrice={discountedPrice}
                            currentMrp={currentMrp}
                            currentDiscountValue={currentDiscountValue}
                            currentDiscountType={currentDiscountType}
                            currentStock={currentStock}
                            availableToBuy={availableToBuy}
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            showAddedToCart={showAddedToCart}
                            selectionError={selectionError}
                            inWishlist={isInWishlist(product._id)}
                            onWishlistToggle={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                            whatsappNumber={whatsappNumber}
                            contactPhone={contactPhone}
                            variantSlot={variantSlot}
                        />
                    </div>

                    {/* Col 3: More Products Sidebar — bottom-up (most specific first) */}
                    <div className="lg:col-span-3 hidden lg:block lg:pl-6 xl:pl-10">
                        <div className="border border-gray-100 rounded-xl p-4 sticky top-6 lg:-mt-4 bg-white">
                            <ProductMoreSidebar
                                currentProductId={product._id}
                                categoryId={categoryId}
                                subCategoryId={subCategoryId}
                                childCategoryId={childCategoryId}
                                subChildCategoryId={subChildCategoryId}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <ProductTabsSection product={product} />

                {/* Related Products — top-down (broadest first) */}
                <div className="mt-8">
                    <RelatedProducts
                        currentProductId={product._id}
                        categoryId={categoryId}
                        categoryName={product.category?.name || ''}
                        subCategoryId={subCategoryId}
                        childCategoryId={childCategoryId}
                        subChildCategoryId={subChildCategoryId}
                    />
                </div>
            </div>

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowSizeGuide(false)}
                    />
                    <div className="relative w-full max-w-2xl mx-auto flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 bg-white z-10">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                                </svg>
                                Size Guide
                            </h3>
                            <button 
                                onClick={() => setShowSizeGuide(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {(typeof product.sizeGuide === 'object' ? (product.sizeGuide as any).image : product.sizeGuide) ? (
                            <div className="relative w-full flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={typeof product.sizeGuide === 'object' ? (product.sizeGuide as any).image : product.sizeGuide} 
                                    alt="Size Guide" 
                                    className="w-full h-auto max-h-[75vh] object-contain"
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
