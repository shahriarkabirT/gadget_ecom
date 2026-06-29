'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Variant {
    _id?: string;
    size?: string;
    colorName?: string;
    colorCode?: string;
    material?: string;
    model?: string;
    price?: number;
    mrp?: number;
    stock?: number;
    images?: string[];
}

interface Product {
    _id: string;
    title: string;
    price: number;
    mrp?: number;
    images?: string[];
    variants?: Variant[];
    productType?: 'single' | 'variant';
    shortDescription?: string;
}

interface ComboProductCardProps {
    product: Product;
    quantity: number;
    selectedVariants: Record<string, string>;
    onQtyChange: (delta: number) => void;
    onVariantChange: (type: string, value: string) => void;
    /** Single-product landing: no checkbox, qty min 1, variants always visible */
    singleMode?: boolean;
}

export default function ComboProductCard({
    product,
    quantity,
    selectedVariants,
    onQtyChange,
    onVariantChange,
    singleMode = false,
}: ComboProductCardProps) {
    const hasVariants = product.productType === 'variant' && (product.variants?.length ?? 0) > 0;

    // Determine active variant
    const activeVariant = hasVariants
        ? product.variants?.find((v) => {
              const sizeMatch = !v.size || selectedVariants['Size'] === v.size;
              const colorMatch = !v.colorName || selectedVariants['Color'] === v.colorName;
              const materialMatch = !v.material || selectedVariants['Material'] === v.material;
              const modelMatch = !v.model || selectedVariants['Model'] === v.model;
              return sizeMatch && colorMatch && materialMatch && modelMatch;
          })
        : undefined;

    const displayPrice = activeVariant?.price ?? product.price;
    const displayImage =
        (activeVariant?.images?.[0] ?? product.images?.[0]) || '/placeholder.png';
    const isSelected = singleMode || quantity > 0;

    // Build unique option sets from variants
    const getSizes = () =>
        hasVariants
            ? [...new Set(product.variants?.map((v) => v.size).filter(Boolean) as string[])]
            : [];
    const getColors = () =>
        hasVariants
            ? [...new Set(product.variants?.map((v) => v.colorName).filter(Boolean) as string[])]
            : [];
    const getMaterials = () =>
        hasVariants
            ? [...new Set(product.variants?.map((v) => v.material).filter(Boolean) as string[])]
            : [];
    const getModels = () =>
        hasVariants
            ? [...new Set(product.variants?.map((v) => v.model).filter(Boolean) as string[])]
            : [];

    const sizes = getSizes();
    const colors = getColors();
    const materials = getMaterials();
    const models = getModels();

    const getColorCode = (colorName: string) =>
        product.variants?.find((v) => v.colorName === colorName)?.colorCode;

    return (
        <div
            className={`border-b border-gray-100 transition-all duration-200 ${
                isSelected ? 'bg-red-50/10' : 'bg-white'
            }`}
        >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4">
                {/* Clickable Toggle Area */}
                <div 
                    className={`flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0 ${!singleMode ? 'cursor-pointer select-none' : ''}`}
                    onClick={() => !singleMode && onQtyChange(isSelected ? -quantity : 1)}
                >
                    {!singleMode && (
                        <div
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                                isSelected ? 'bg-red-600 border-red-600' : 'border-gray-200 bg-white'
                            }`}
                        >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                    )}

                    {/* Product Image */}
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                        <Image src={displayImage} alt={product.title} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">{product.title}</h4>
                        {!singleMode && (
                            <p className="text-gray-400 text-[10px] md:text-xs">
                                {isSelected ? 'Selected' : 'Click to select'}
                            </p>
                        )}
                    </div>

                    {/* Price (Hidden on small mobile if it gets too crowded) */}
                    <div className="hidden sm:block text-right px-4 shrink-0">
                        <span className="font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                    </div>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8 md:h-10 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={() => onQtyChange(-1)}
                        disabled={singleMode && quantity <= 1}
                        className="w-8 h-full flex items-center justify-center hover:bg-gray-50 font-bold text-lg text-gray-400 disabled:opacity-30"
                    >
                        −
                    </button>
                    <span className="w-8 md:w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                        type="button"
                        onClick={() => onQtyChange(1)}
                        className="w-8 h-full flex items-center justify-center hover:bg-gray-50 font-bold text-lg text-gray-400"
                    >
                        +
                    </button>
                </div>
            </div>

            {hasVariants && isSelected && (
                <div className="px-12 md:px-16 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Color Swatches */}
                    {colors.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 min-w-[50px]">Color:</span>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color) => {
                                    const hex = getColorCode(color);
                                    const active = selectedVariants['Color'] === color;
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => onVariantChange('Color', color)}
                                            style={{ backgroundColor: hex || color }}
                                            className={`w-6 h-6 rounded-full border-2 relative ${
                                                active ? 'border-red-600 scale-110 shadow-sm' : 'border-white shadow-inner'
                                            }`}
                                            title={color}
                                        >
                                            {active && <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {sizes.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 min-w-[50px]">Size:</span>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => onVariantChange('Size', size)}
                                        className={`px-3 py-1 rounded-full border text-[10px] font-black transition-all ${
                                            selectedVariants['Size'] === size
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {materials.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 min-w-[50px]">Material:</span>
                            <div className="flex flex-wrap gap-2">
                                {materials.map((material) => (
                                    <button
                                        key={material}
                                        type="button"
                                        onClick={() => onVariantChange('Material', material)}
                                        className={`px-3 py-1 rounded-full border text-[10px] font-black transition-all ${
                                            selectedVariants['Material'] === material
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        {material}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {models.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 min-w-[50px]">Model:</span>
                            <div className="flex flex-wrap gap-2">
                                {models.map((model) => (
                                    <button
                                        key={model}
                                        type="button"
                                        onClick={() => onVariantChange('Model', model)}
                                        className={`px-3 py-1 rounded-full border text-[10px] font-black transition-all ${
                                            selectedVariants['Model'] === model
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        {model}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
