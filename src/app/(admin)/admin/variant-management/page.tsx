'use client';

import { useState } from 'react';
import {
    useGetVariantOptionsQuery,
    useCreateVariantOptionMutation,
    useUpdateVariantOptionMutation,
    useDeleteVariantOptionMutation,
} from '@/redux/features/variantOption/variantOptionApi';
import type { IVariantOption } from '@/redux/features/variantOption/variantOptionApi';
import { showError, showSuccess } from '@/lib/toast';

type OptionType = 'size' | 'color' | 'material' | 'ram' | 'storage';

interface EditingState {
    id: string;
    label: string;
    order: number;
    colorCode?: string;
}

const TABS: { key: OptionType; label: string; accent: string }[] = [
    { key: 'size', label: 'Sizes', accent: 'bg-indigo-600' },
    { key: 'color', label: 'Colors', accent: 'bg-rose-500' },
    { key: 'material', label: 'Materials', accent: 'bg-amber-500' },
    { key: 'ram', label: 'RAM', accent: 'bg-teal-500' },
    { key: 'storage', label: 'Storage', accent: 'bg-cyan-500' },
];

export default function VariantManagementPage() {
    const { data, isLoading } = useGetVariantOptionsQuery();
    const [createOption, { isLoading: isCreating }] = useCreateVariantOptionMutation();
    const [updateOption, { isLoading: isUpdating }] = useUpdateVariantOptionMutation();
    const [deleteOption] = useDeleteVariantOptionMutation();

    const [activeTab, setActiveTab] = useState<OptionType>('size');
    const [newLabel, setNewLabel] = useState('');
    const [newOrder, setNewOrder] = useState('0');
    const [newColorCode, setNewColorCode] = useState('#000000');
    const [editing, setEditing] = useState<EditingState | null>(null);
    const [isMoving, setIsMoving] = useState(false);

    const options: IVariantOption[] =
        activeTab === 'size'
            ? data?.sizes || []
            : activeTab === 'color'
                ? data?.colors || []
                : activeTab === 'material'
                    ? data?.materials || []
                    : activeTab === 'ram'
                        ? data?.rams || []
                        : data?.storages || [];

    const handleCreate = async () => {
        if (!newLabel.trim()) {
            showError('Label is required');
            return;
        }

        try {
            await createOption({
                type: activeTab,
                label: newLabel.trim(),
                order: Number(newOrder),
                ...(activeTab === 'color' ? { colorCode: newColorCode } : {}),
            }).unwrap();
            showSuccess('Created', `${newLabel.trim()} added`);
            setNewLabel('');
            setNewOrder('0');
            setNewColorCode('#000000');
        } catch (err: any) {
            showError(err.data?.message || 'Failed to create');
        }
    };

    const handleUpdate = async () => {
        if (!editing) return;
        if (!editing.label.trim()) {
            showError('Label is required');
            return;
        }

        try {
            await updateOption({
                id: editing.id,
                body: {
                    label: editing.label.trim(),
                    order: editing.order,
                    ...(activeTab === 'color' ? { colorCode: editing.colorCode } : {}),
                },
            }).unwrap();
            showSuccess('Updated', 'Option saved');
            setEditing(null);
        } catch (err: any) {
            showError(err.data?.message || 'Failed to update');
        }
    };

    const handleDelete = async (id: string, label: string) => {
        if (!confirm(`Delete "${label}"? This won't affect existing products.`)) return;
        try {
            await deleteOption(id).unwrap();
            showSuccess('Deleted', `${label} removed`);
        } catch (err: any) {
            showError(err.data?.message || 'Failed to delete');
        }
    };

    const handleMove = async (option: IVariantOption, direction: 'up' | 'down') => {
        const index = options.findIndex((o) => o._id === option._id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === options.length - 1) return;

        const otherOption = options[direction === 'up' ? index - 1 : index + 1];
        setIsMoving(true);

        try {
            const newArray = [...options];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            // Swap in array
            [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];

            setIsMoving(true);

            // Update orders for ALL items to their new index
            // This ensures unique, sequential orders (0, 1, 2...)
            const updates = newArray.map((opt, i) => {
                // Only send update if the order actually changed
                if (opt.order !== i) {
                    return updateOption({
                        id: opt._id,
                        body: { label: opt.label, order: i, colorCode: opt.colorCode }
                    }).unwrap();
                }
                return null;
            }).filter(Boolean);

            if (updates.length > 0) {
                await Promise.all(updates);
                showSuccess('Reordered', 'Variant order updated');
            }
        } catch (err: any) {
            showError('Failed to reorder');
        } finally {
            setIsMoving(false);
        }
    };

    const currentTab = TABS.find((t) => t.key === activeTab)!;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Variant Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage global sizes, colors, materials, ram and storage that can be applied to any product.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setEditing(null);
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${activeTab === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tab.accent}`} />
                            {tab.label}
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                {tab.key === 'size'
                                    ? (data?.sizes?.length || 0)
                                    : tab.key === 'color'
                                        ? (data?.colors?.length || 0)
                                        : tab.key === 'material'
                                            ? (data?.materials?.length || 0)
                                            : tab.key === 'ram'
                                                ? (data?.rams?.length || 0)
                                                : (data?.storages?.length || 0)
                                }
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Add New */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-1.5 h-6 rounded-full ${currentTab.accent}`} />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                        Add New {activeTab === 'size' ? 'Size' : activeTab === 'color' ? 'Color' : activeTab === 'material' ? 'Material' : activeTab === 'ram' ? 'RAM' : 'Storage'}
                    </h3>
                </div>

                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-900 mb-2">
                            Name / Label
                        </label>
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                            placeholder={activeTab === 'size' ? 'e.g. XL, 42, Free Size' : activeTab === 'color' ? 'e.g. Midnight Blue' : 'e.g. Cotton, Polyester'}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>

                    {activeTab === 'color' && (
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-900 mb-2">
                                Color Code
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={newColorCode}
                                    onChange={(e) => setNewColorCode(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                                />
                                <input
                                    type="text"
                                    value={newColorCode}
                                    onChange={(e) => setNewColorCode(e.target.value)}
                                    className="w-28 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono font-medium text-gray-900 focus:border-gray-900 outline-none transition-all"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )}

                    <div className="w-24">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-900 mb-2">
                            Order
                        </label>
                        <input
                            type="number"
                            value={newOrder}
                            onChange={(e) => setNewOrder(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                            placeholder="0"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={isCreating || !newLabel.trim()}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 min-w-[80px]"
                    >
                        {isCreating ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            'Add'
                        )}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Existing {currentTab.label} ({options.length})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    </div>
                ) : options.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        No {currentTab.label.toLowerCase()} added yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {options.map((option) => (
                            <div
                                key={option._id}
                                className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                            >
                                {editing?.id === option._id ? (
                                    /* Editing Row */
                                    <>
                                        <div className="flex-1 flex items-center gap-3">
                                            {activeTab === 'color' && (
                                                <input
                                                    type="color"
                                                    value={editing.colorCode || '#000000'}
                                                    onChange={(e) =>
                                                        setEditing((prev) => prev ? { ...prev, colorCode: e.target.value } : null)
                                                    }
                                                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5 shrink-0"
                                                />
                                            )}
                                            <input
                                                type="text"
                                                value={editing.label}
                                                onChange={(e) =>
                                                    setEditing((prev) => prev ? { ...prev, label: e.target.value } : null)
                                                }
                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900 focus:border-gray-900 outline-none"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                            />
                                            <input
                                                type="number"
                                                value={editing.order}
                                                onChange={(e) =>
                                                    setEditing((prev) => prev ? { ...prev, order: Number(e.target.value) } : null)
                                                }
                                                className="w-16 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900 focus:border-gray-900 outline-none"
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                            />
                                            {activeTab === 'color' && (
                                                <input
                                                    type="text"
                                                    value={editing.colorCode || ''}
                                                    onChange={(e) =>
                                                        setEditing((prev) => prev ? { ...prev, colorCode: e.target.value } : null)
                                                    }
                                                    className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-900 focus:border-gray-900 outline-none"
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleUpdate}
                                                disabled={isUpdating}
                                                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[60px]"
                                            >
                                                {isUpdating ? (
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    'Save'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setEditing(null)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 cursor-pointer transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Display Row */
                                    <>
                                        <div className="flex-1 flex items-center gap-3">
                                            {activeTab === 'color' && option.colorCode && (
                                                <div
                                                    className="w-8 h-8 rounded-lg border border-gray-200 shrink-0 shadow-inner"
                                                    style={{ backgroundColor: option.colorCode }}
                                                />
                                            )}
                                            <span className="text-sm font-semibold text-gray-900">
                                                {option.label}
                                            </span>
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                                                Order: {option.order}
                                            </span>
                                            {activeTab === 'color' && option.colorCode && (
                                                <span className="text-xs font-mono text-gray-400">
                                                    {option.colorCode}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleMove(option, 'up')}
                                                disabled={isMoving || options.indexOf(option) === 0}
                                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move Up"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleMove(option, 'down')}
                                                disabled={isMoving || options.indexOf(option) === options.length - 1}
                                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move Down"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditing({
                                                        id: option._id,
                                                        label: option.label,
                                                        order: option.order,
                                                        colorCode: option.colorCode,
                                                    })
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(option._id, option.label)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
