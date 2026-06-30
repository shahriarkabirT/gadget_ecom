'use client';

import { IVariant } from '@/types';
import Image from 'next/image';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGetVariantOptionsQuery } from '@/redux/features/variantOption/variantOptionApi';
import type { IVariantOption } from '@/redux/features/variantOption/variantOptionApi';

interface VariantManagerProps {
    variants: IVariant[];
    onChange: (variants: IVariant[]) => void;
    errors?: Record<string, string>;
    baseSku?: string;
    // Pricing Defaults
    defaultMrp?: number;
    defaultPrice?: number;
    defaultDiscountType?: 'flat' | 'percentage';
    defaultDiscountValue?: number;
    defaultTaxType?: 'flat' | 'percentage';
    defaultTax?: number;
    onApplyToGlobal?: (variant: IVariant) => void;
}

/**
 * Generate a slug for SKU from a label string.
 */
function skuSlug(str: string): string {
    return str
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6);
}

/**
 * Auto-generate a SKU from variant attributes.
 */
function generateSku(
    baseSku: string,
    size?: string,
    colorName?: string,
    material?: string,
    ram?: string,
    storage?: string
): string {
    const parts = [baseSku || 'VAR'];
    if (size) parts.push(skuSlug(size));
    if (colorName) parts.push(skuSlug(colorName));
    if (material) parts.push(skuSlug(material));
    if (ram) parts.push(skuSlug(ram));
    if (storage) parts.push(skuSlug(storage));
    return parts.join('-');
}

/**
 * Compute cartesian product of selected options and return variant combo keys.
 * Each key is `size|colorName|colorCode|material`.
 */
function cartesianProduct(
    sizes: IVariantOption[],
    colors: IVariantOption[],
    materials: IVariantOption[],
    rams: IVariantOption[],
    storages: IVariantOption[]
): { size?: string; colorName?: string; colorCode?: string; material?: string; ram?: string; storage?: string }[] {
    // Handle cases where some dimensions are empty
    const sArr = sizes.length > 0 ? sizes : [null];
    const cArr = colors.length > 0 ? colors : [null];
    const mArr = materials.length > 0 ? materials : [null];
    const rArr = rams.length > 0 ? rams : [null];
    const stArr = storages.length > 0 ? storages : [null];

    const combos: { size?: string; colorName?: string; colorCode?: string; material?: string; ram?: string; storage?: string }[] = [];

    for (const s of sArr) {
        for (const c of cArr) {
            for (const m of mArr) {
                for (const r of rArr) {
                    for (const st of stArr) {
                        combos.push({
                            size: s?.label,
                            colorName: c?.label,
                            colorCode: c?.colorCode,
                            material: m?.label,
                            ram: r?.label,
                            storage: st?.label,
                        });
                    }
                }
            }
        }
    }

    return combos;
}

function comboKey(v: { size?: string; colorName?: string; material?: string; ram?: string; storage?: string }): string {
    return `${v.size || ''}|${v.colorName || ''}|${v.material || ''}|${v.ram || ''}|${v.storage || ''}`;
}

export default function VariantManager({
    variants,
    onChange,
    errors = {},
    baseSku = '',
    defaultMrp = 0,
    defaultPrice = 0,
    defaultDiscountType = 'percentage',
    defaultDiscountValue = 0,
    defaultTaxType = 'percentage',
    defaultTax = 0,
    onApplyToGlobal,
}: VariantManagerProps) {
    const { data: optionsData, isLoading: isLoadingOptions } = useGetVariantOptionsQuery();

    const allSizes = useMemo(() => [...(optionsData?.sizes || [])].sort((a, b) => a.order - b.order), [optionsData?.sizes]);
    const allColors = useMemo(() => [...(optionsData?.colors || [])].sort((a, b) => a.order - b.order), [optionsData?.colors]);
    const allMaterials = useMemo(() => [...(optionsData?.materials || [])].sort((a, b) => a.order - b.order), [optionsData?.materials]);
    const allRams = useMemo(() => [...(optionsData?.rams || [])].sort((a, b) => a.order - b.order), [optionsData?.rams]);
    const allStorages = useMemo(() => [...(optionsData?.storages || [])].sort((a, b) => a.order - b.order), [optionsData?.storages]);

    // Track selected option IDs
    const [selectedSizeIds, setSelectedSizeIds] = useState<Set<string>>(new Set());
    const [selectedColorIds, setSelectedColorIds] = useState<Set<string>>(new Set());
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
    const [selectedRamIds, setSelectedRamIds] = useState<Set<string>>(new Set());
    const [selectedStorageIds, setSelectedStorageIds] = useState<Set<string>>(new Set());

    // Track manually removed combo keys (so they don't reappear)
    const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());

    // Track uploading state per variant index and slot
    const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

    // Initialize selections from existing variants on mount
    useEffect(() => {
        if (variants.length > 0 && allSizes.length + allColors.length + allMaterials.length + allRams.length + allStorages.length > 0) {
            const sIds = new Set<string>();
            const cIds = new Set<string>();
            const mIds = new Set<string>();
            const rIds = new Set<string>();
            const stIds = new Set<string>();

            for (const v of variants) {
                if (v.size) {
                    const match = allSizes.find((s) => s.label === v.size);
                    if (match) sIds.add(match._id);
                }
                if (v.colorName) {
                    const match = allColors.find((c) => c.label === v.colorName);
                    if (match) cIds.add(match._id);
                }
                if (v.material) {
                    const match = allMaterials.find((m) => m.label === v.material);
                    if (match) mIds.add(match._id);
                }
                if (v.ram) {
                    const match = allRams.find((r) => r.label === v.ram);
                    if (match) rIds.add(match._id);
                }
                if (v.storage) {
                    const match = allStorages.find((st) => st.label === v.storage);
                    if (match) stIds.add(match._id);
                }
            }

            if (sIds.size > 0) setSelectedSizeIds(sIds);
            if (cIds.size > 0) setSelectedColorIds(cIds);
            if (mIds.size > 0) setSelectedMaterialIds(mIds);
            if (rIds.size > 0) setSelectedRamIds(rIds);
            if (stIds.size > 0) setSelectedStorageIds(stIds);
        }
        // Only run once when options load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSizes.length, allColors.length, allMaterials.length, allRams.length, allStorages.length]);

    // Get selected options objects
    const selectedSizes = useMemo(
        () => allSizes.filter((s) => selectedSizeIds.has(s._id)),
        [allSizes, selectedSizeIds]
    );
    const selectedColors = useMemo(
        () => allColors.filter((c) => selectedColorIds.has(c._id)),
        [allColors, selectedColorIds]
    );
    const selectedMaterials = useMemo(
        () => allMaterials.filter((m) => selectedMaterialIds.has(m._id)),
        [allMaterials, selectedMaterialIds]
    );
    const selectedRams = useMemo(
        () => allRams.filter((r) => selectedRamIds.has(r._id)),
        [allRams, selectedRamIds]
    );
    const selectedStorages = useMemo(
        () => allStorages.filter((st) => selectedStorageIds.has(st._id)),
        [allStorages, selectedStorageIds]
    );

    // When selections change, generate cartesian product and merge with existing variants
    useEffect(() => {
        if (selectedSizes.length === 0 && selectedColors.length === 0 && selectedMaterials.length === 0 && selectedRams.length === 0 && selectedStorages.length === 0) {
            // No selections — clear all variants that came from matrix
            // But keep any manually-added variants that don't match our pattern
            return;
        }

        const combos = cartesianProduct(selectedSizes, selectedColors, selectedMaterials, selectedRams, selectedStorages);

        // Build a map of existing variants by combo key for preservation
        const existingMap = new Map<string, IVariant>();
        for (const v of variants) {
            existingMap.set(comboKey(v), v);
        }

        // Build new variant list from combos
        const newVariants: IVariant[] = [];
        for (const combo of combos) {
            const key = comboKey(combo);

            // Skip manually removed combos
            if (removedKeys.has(key)) continue;

            const existing = existingMap.get(key);
            if (existing) {
                newVariants.push({ ...existing, order: newVariants.length });
            } else {
                newVariants.push({
                    size: combo.size,
                    colorName: combo.colorName,
                    colorCode: combo.colorCode,
                    material: combo.material,
                    ram: combo.ram,
                    storage: combo.storage,
                    sku: generateSku(baseSku, combo.size, combo.colorName, combo.material, combo.ram, combo.storage),
                    stock: 0,
                    weight: null,
                    mrp: defaultMrp,
                    price: defaultPrice,
                    discountType: defaultDiscountType,
                    discountValue: defaultDiscountValue,
                    taxType: defaultTaxType,
                    tax: defaultTax,
                    images: [],
                    inventoryRef: '',
                    order: newVariants.length,
                } as IVariant);
            }
        }

        // Only update if actually different
        const currentKeys = variants.map(comboKey).join(',');
        const newKeys = newVariants.map(comboKey).join(',');
        if (currentKeys !== newKeys || variants.length !== newVariants.length) {
            onChange(newVariants);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSizes, selectedColors, selectedMaterials, selectedRams, selectedStorages, removedKeys]);

    const toggleSelection = useCallback(
        (type: 'size' | 'color' | 'material' | 'ram' | 'storage', id: string) => {
            const setFn =
                type === 'size'
                    ? setSelectedSizeIds
                    : type === 'color'
                        ? setSelectedColorIds
                        : type === 'material'
                            ? setSelectedMaterialIds
                            : type === 'ram'
                                ? setSelectedRamIds
                                : setSelectedStorageIds;

            setFn((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                    // When deselecting, clean removed keys for this option
                    // so if re-selected later the combos reappear
                } else {
                    next.add(id);
                }
                return next;
            });

            // Clear manually removed keys when selection changes
            setRemovedKeys(new Set());
        },
        []
    );

    const moveVariant = useCallback(
        (index: number, direction: 'up' | 'down') => {
            const newVariants = [...variants];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= newVariants.length) return;

            // Swap the items
            [newVariants[index], newVariants[targetIndex]] = [newVariants[targetIndex], newVariants[index]];

            // Update the order property for all variants to match their new index
            const orderedVariants = newVariants.map((v, i) => ({ ...v, order: i }));
            onChange(orderedVariants);
        },
        [variants, onChange]
    );

    const removeVariant = useCallback(
        (index: number) => {
            const variant = variants[index];
            const key = comboKey(variant);
            setRemovedKeys((prev) => new Set(prev).add(key));
            const remaining = variants.filter((_, i) => i !== index);
            // Re-order remaining variants
            const ordered = remaining.map((v, i) => ({ ...v, order: i }));
            onChange(ordered);
        },
        [variants, onChange]
    );

    const updateVariant = useCallback(
        (index: number, field: string, value: any) => {
            const updated = [...variants];
            const variant = { ...updated[index], [field]: value };

            // Pricing sync logic
            if (field === 'mrp') {
                const mrp = Number(value) || 0;
                const discountValue = Number(variant.discountValue) || 0;
                if (variant.discountType === 'percentage') {
                    variant.price = Number((mrp - (mrp * discountValue) / 100).toFixed(2));
                } else {
                    variant.price = Math.max(0, mrp - discountValue);
                }
            } else if (field === 'price') {
                const price = Number(value) || 0;
                const mrp = Number(variant.mrp) || 0;
                if (mrp > 0) {
                    if (variant.discountType === 'percentage') {
                        variant.discountValue = Number((((mrp - price) / mrp) * 100).toFixed(2));
                    } else {
                        variant.discountValue = Number((mrp - price).toFixed(2));
                    }
                }
            } else if (field === 'discountValue' || field === 'discountType') {
                const mrp = Number(variant.mrp) || 0;
                const discountValue = Number(field === 'discountValue' ? value : variant.discountValue) || 0;
                const discountType = field === 'discountType' ? value : variant.discountType;

                if (discountType === 'percentage') {
                    variant.price = Number((mrp - (mrp * discountValue) / 100).toFixed(2));
                } else {
                    variant.price = Math.max(0, mrp - discountValue);
                }
            }

            updated[index] = variant;
            onChange(updated);
        },
        [variants, onChange]
    );

    const handleMultiFileUpload = async (variantIndex: number, files: FileList) => {
        const variant = variants[variantIndex];
        const currentImages = [...(variant.images || [])];
        const slotsRemaining = 5 - currentImages.length;
        const filesToUpload = Array.from(files).slice(0, slotsRemaining);

        if (filesToUpload.length === 0) return;

        // Mark this variant as uploading
        setUploadingState((prev) => ({ ...prev, [String(variantIndex)]: true }));

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                return data.success ? data.imageUrl : null;
            });

            const results = await Promise.all(uploadPromises);
            const newUrls = results.filter(Boolean) as string[];

            if (newUrls.length > 0) {
                const merged = [...currentImages, ...newUrls].slice(0, 5);
                updateVariant(variantIndex, 'images', merged);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploadingState((prev) => ({ ...prev, [String(variantIndex)]: false }));
        }
    };

    const removeImage = useCallback(
        (variantIndex: number, imageSlot: number) => {
            const variant = variants[variantIndex];
            const images = [...(variant.images || [])];
            images.splice(imageSlot, 1);
            updateVariant(variantIndex, 'images', images);
        },
        [variants, updateVariant]
    );

    const handleApplyToGlobal = useCallback(
        (field: keyof IVariant, value: any) => {
            if (onApplyToGlobal && variants.length > 0) {
                // Create a temporary variant with the field updated to pass to onApplyToGlobal
                const tempVariant = { ...variants[0], [field]: value };
                onApplyToGlobal(tempVariant);
            }
        },
        [onApplyToGlobal, variants]
    );

    if (isLoadingOptions) {
        return (
            <div className="flex items-center gap-3 py-8 justify-center text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                Loading variant options…
            </div>
        );
    }

    const hasNoOptions = allSizes.length === 0 && allColors.length === 0 && allMaterials.length === 0 && allRams.length === 0 && allStorages.length === 0;

    return (
        <div className="space-y-6">
            {hasNoOptions ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xs font-bold text-gray-500 mb-2">No variant options configured yet.</p>
                    <a
                        href="/admin/variant-management"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                    >
                        Go to Variant Management →
                    </a>
                </div>
            ) : (
                <>
                    {/* Selection Chips */}
                    <div className="space-y-4">
                        {/* Sizes Row */}
                        {allSizes.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Sizes
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allSizes.map((s) => {
                                        const isSelected = selectedSizeIds.has(s._id);
                                        return (
                                            <button
                                                key={s._id}
                                                type="button"
                                                onClick={() => toggleSelection('size', s._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Colors Row */}
                        {allColors.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Colors
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allColors.map((c) => {
                                        const isSelected = selectedColorIds.has(c._id);
                                        return (
                                            <button
                                                key={c._id}
                                                type="button"
                                                onClick={() => toggleSelection('color', c._id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                <span
                                                    className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                                                    style={{ backgroundColor: c.colorCode || '#000' }}
                                                />
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Materials Row */}
                        {allMaterials.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Materials
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allMaterials.map((m) => {
                                        const isSelected = selectedMaterialIds.has(m._id);
                                        return (
                                            <button
                                                key={m._id}
                                                type="button"
                                                onClick={() => toggleSelection('material', m._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rams Row */}
                        {allRams.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    RAM
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allRams.map((r) => {
                                        const isSelected = selectedRamIds.has(r._id);
                                        return (
                                            <button
                                                key={r._id}
                                                type="button"
                                                onClick={() => toggleSelection('ram', r._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                {r.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Storages Row */}
                        {allStorages.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Storage
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allStorages.map((st) => {
                                        const isSelected = selectedStorageIds.has(st._id);
                                        return (
                                            <button
                                                key={st._id}
                                                type="button"
                                                onClick={() => toggleSelection('storage', st._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                {st.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generated Variant Count */}
                    {variants.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black">
                                {variants.length}
                            </span>
                            variant{variants.length === 1 ? '' : 's'} generated
                        </div>
                    )}

                    {/* Variant Rows with Max Height */}
                    {variants.length > 0 && (
                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {variants.map((variant, index) => (
                                <div
                                    key={comboKey(variant) || index}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:border-gray-300"
                                >
                                    {/* Control Buttons */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveVariant(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                            title="Move Up"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveVariant(index, 'down')}
                                            disabled={index === variants.length - 1}
                                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                            title="Move Down"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="ml-1 p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                                            title="Remove this variant"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Variant Label */}
                                    <div className="flex items-center gap-1 -mt-1 mb-3 pr-8">
                                        {variant.colorCode && (
                                            <span
                                                className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                                                style={{ backgroundColor: variant.colorCode }}
                                            />
                                        )}
                                        <span className="text-xs font-bold text-gray-900">
                                            {[variant.size, variant.colorName, variant.material, variant.ram, variant.storage]
                                                .filter(Boolean)
                                                .join(' / ')}
                                        </span>

                                        {onApplyToGlobal && (
                                            <button
                                                type="button"
                                                onClick={() => onApplyToGlobal(variant)}
                                                className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-all active:scale-95"
                                                title="Apply this variant's pricing & weight to global product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M16.5 16.5l-1.5-1.5m-7.42-3.472-2.839 1.177 6.13 3.413 8.174-8.174L16.5 16.5Z" />
                                                </svg>
                                                Apply to Global
                                            </button>
                                        )}
                                    </div>

                                    {/* Fields Grid - 2 Rows for better spacing */}
                                    <div className="space-y-3 mb-3">
                                        {/* Row 1: Basic & Inventory */}
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    SKU
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.sku || ''}
                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                    placeholder="Auto"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.stock === 0 ? '' : variant.stock}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let out: string | number = val;
                                                        if (val === '') out = 0;
                                                        else if (val.includes('.')) out = val;
                                                        else out = Number(val);
                                                        updateVariant(index, 'stock', out);
                                                    }}
                                                    className={`w-full bg-white border ${errors[`variant_${index}_stock`] ? 'border-rose-500' : 'border-gray-300'} rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all`}
                                                    placeholder="0"
                                                    min={0}
                                                />
                                                {errors[`variant_${index}_stock`] && (
                                                    <p className="text-[9px] text-rose-600 font-bold mt-1">
                                                        {errors[`variant_${index}_stock`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Weight <span className="text-[8px] text-gray-400">(g)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.weight === null ? '' : variant.weight}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const numVal = Number(val);
                                                        updateVariant(index, 'weight', (val === '' || numVal === 0) ? null : numVal);
                                                    }}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Tax Type
                                                </label>
                                                <select
                                                    value={variant.taxType || 'percentage'}
                                                    onChange={(e) => updateVariant(index, 'taxType', e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="percentage">Percentage</option>
                                                    <option value="flat">Flat</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Tax Rate
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.tax === 0 ? '' : variant.tax}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let out: string | number = val;
                                                        if (val === '') out = 0;
                                                        else if (val.includes('.')) out = val;
                                                        else out = Number(val);
                                                        updateVariant(index, 'tax', out);
                                                    }}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Pricing Logic */}
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                            <div>
                                                <label className="block text-[9px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    MRP
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.mrp === 0 ? '' : variant.mrp}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let out: string | number = val;
                                                        if (val === '') out = 0;
                                                        else if (val.includes('.')) out = val;
                                                        else out = Number(val);
                                                        updateVariant(index, 'mrp', out);
                                                    }}
                                                    className={`w-full bg-white border ${errors[`variant_${index}_mrp`] ? 'border-rose-500' : 'border-gray-300'} rounded-lg px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all`}
                                                    placeholder="0.00"
                                                />
                                                {errors[`variant_${index}_mrp`] && (
                                                    <p className="text-[9px] text-rose-600 font-bold mt-1">
                                                        {errors[`variant_${index}_mrp`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    D. Type
                                                </label>
                                                <select
                                                    value={variant.discountType || 'percentage'}
                                                    onChange={(e) => updateVariant(index, 'discountType', e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="percentage">%</option>
                                                    <option value="flat">৳</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Discount
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.discountValue === 0 ? '' : variant.discountValue}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let out: string | number = val;
                                                        if (val === '') out = 0;
                                                        else if (val.includes('.')) out = val;
                                                        else out = Number(val);
                                                        updateVariant(index, 'discountValue', out);
                                                    }}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
                                                    Sale Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.price === 0 ? '' : variant.price}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let out: string | number = val;
                                                        if (val === '') out = 0;
                                                        else if (val.includes('.')) out = val;
                                                        else out = Number(val);
                                                        updateVariant(index, 'price', out);
                                                    }}
                                                    className={`w-full bg-white border ${errors[`variant_${index}_price`] ? 'border-rose-500' : 'border-indigo-200'} rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-900 focus:border-indigo-500 outline-none transition-all`}
                                                    placeholder="0.00"
                                                />
                                                {errors[`variant_${index}_price`] && (
                                                    <p className="text-[9px] text-rose-600 font-bold mt-1">
                                                        {errors[`variant_${index}_price`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                    Cost <span className="text-[8px] font-normal">(opt.)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={
                                                        variant.productCost === undefined || variant.productCost === null
                                                            ? ''
                                                            : String(variant.productCost)
                                                    }
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '') {
                                                            updateVariant(index, 'productCost', undefined);
                                                            return;
                                                        }
                                                        const num = Number(val);
                                                        updateVariant(
                                                            index,
                                                            'productCost',
                                                            Number.isFinite(num) ? num : undefined,
                                                        );
                                                    }}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3 (Optional): Inventory Ref */}
                                        <div className="grid grid-cols-1">
                                            <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                                Inventory Reference / Internal Note
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.inventoryRef || ''}
                                                onChange={(e) => updateVariant(index, 'inventoryRef', e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                                placeholder="e.g. Rack A-12, Limited Edition..."
                                            />
                                        </div>
                                    </div>

                                    {/* Images Row */}
                                    <div>
                                        <label className="block text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">
                                            Images ({(variant.images || []).length}/5)
                                        </label>
                                        <div className="flex gap-2 flex-wrap items-center">
                                            {/* Existing images */}
                                            {(variant.images || []).map((img, slot) => (
                                                <div
                                                    key={slot}
                                                    className="relative w-16 h-16 rounded-lg border border-gray-200 bg-white overflow-hidden group/img flex items-center justify-center"
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Variant ${index + 1} img ${slot + 1}`}
                                                        className="object-cover w-full h-full"
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index, slot)}
                                                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 cursor-pointer flex items-center justify-center transition-opacity"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add images button (multi-select) */}
                                            {(variant.images || []).length < 5 && (
                                                <div className="relative w-16 h-16 rounded-lg border border-dashed border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                                                    <input
                                                        type="file"
                                                        id={`var-img-${index}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files.length > 0) {
                                                                handleMultiFileUpload(index, e.target.files);
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`var-img-${index}`}
                                                        className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-300 hover:text-gray-500 transition-colors"
                                                    >
                                                        {uploadingState[String(index)] ? (
                                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                        )}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state when selections made but all removed */}
                    {variants.length === 0 &&
                        (selectedSizeIds.size > 0 || selectedColorIds.size > 0 || selectedMaterialIds.size > 0 || selectedRamIds.size > 0 || selectedStorageIds.size > 0) && (
                            <div className="text-center py-6 text-gray-400 text-xs">
                                All generated variants have been removed. Adjust your selections above.
                            </div>
                        )}

                    {/* Empty state when no selections */}
                    {variants.length === 0 &&
                        selectedSizeIds.size === 0 &&
                        selectedColorIds.size === 0 &&
                        selectedMaterialIds.size === 0 &&
                        selectedRamIds.size === 0 &&
                        selectedStorageIds.size === 0 && (
                            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-xs font-bold text-gray-500">
                                    Select sizes, colors, materials, ram, or storage above to generate variant combinations.
                                </p>
                            </div>
                        )}
                </>
            )}
        </div>
    );
}
