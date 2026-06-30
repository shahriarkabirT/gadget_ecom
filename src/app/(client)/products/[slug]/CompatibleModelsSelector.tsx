'use client';

interface CompatibleModelsSelectorProps {
    models: any[];
    selectedModel: string;
    onSelect: (model: string) => void;
}

export default function CompatibleModelsSelector({ models, selectedModel, onSelect }: CompatibleModelsSelectorProps) {
    if (!models || models.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {models.map((model, index) => {
                const modelName = typeof model === 'string' ? model : model?.name || '';
                if (!modelName) return null;
                
                const isSelected = selectedModel === modelName;
                
                return (
                    <button
                        key={`${modelName}-${index}`}
                        onClick={() => onSelect(modelName)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                            isSelected 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        type="button"
                    >
                        {modelName}
                    </button>
                );
            })}
        </div>
    );
}
