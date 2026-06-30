import React from 'react';

interface CompatibleModelsSelectorProps {
    models: string[];
    selectedModel: string;
    onSelect: (model: string) => void;
}

export default function CompatibleModelsSelector({
    models,
    selectedModel,
    onSelect
}: CompatibleModelsSelectorProps) {
    if (!models || models.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {models.map((model) => (
                <button
                    key={model}
                    onClick={() => onSelect(model)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedModel === model
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 text-gray-700 hover:border-black'
                    }`}
                >
                    {model}
                </button>
            ))}
        </div>
    );
}
