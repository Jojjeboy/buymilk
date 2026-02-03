import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Folder, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Item, Category } from '../types';

interface ImportListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (name: string, items: Item[], categoryId: string) => Promise<void>;
    categories: Category[];
}

interface ValidationResult {
    isValid: boolean;
    error?: string;
    listData?: {
        name: string;
        items: Item[];
    };
}

export const ImportListModal: React.FC<ImportListModalProps> = ({ isOpen, onClose, onImport, categories }) => {
    const { t } = useTranslation();
    const [jsonInput, setJsonInput] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [copiedSimple, setCopiedSimple] = useState(false);
    const [copiedDetailed, setCopiedDetailed] = useState(false);

    // Validation function with helpful error messages
    const validateAndParseJSON = (jsonString: string): ValidationResult => {
        // Check if empty
        if (!jsonString.trim()) {
            return {
                isValid: false,
                error: t('import.errorPaste', 'Please paste JSON data to import.'),
            };
        }

        // Try to parse JSON
        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonString);
        } catch {
            return {
                isValid: false,
                error: t('import.errorInvalid', 'Invalid JSON format. Please check for syntax errors.'),
            };
        }

        // Check if it's an object
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return {
                isValid: false,
                error: t('import.errorObject', 'JSON must be an object with "name" and "items" fields.'),
            };
        }

        const data = parsed as Record<string, unknown>;

        // Check for name field
        if (!('name' in data)) {
            return {
                isValid: false,
                error: t('import.errorName', 'Missing required field "name". Your list must have a name.'),
            };
        }

        if (typeof data.name !== 'string' || data.name.trim() === '') {
            return {
                isValid: false,
                error: t('import.errorNameString', 'The "name" field must be a non-empty string.'),
            };
        }

        // Check for items field
        if (!('items' in data)) {
            return {
                isValid: false,
                error: t('import.errorItems', 'Missing required field "items". Your list must have at least one item.'),
            };
        }

        if (!Array.isArray(data.items)) {
            return {
                isValid: false,
                error: t('import.errorItemsArray', 'The "items" field must be an array.'),
            };
        }

        if (data.items.length === 0) {
            return {
                isValid: false,
                error: t('import.errorItemsEmpty', 'Items array is empty. Please add at least one item.'),
            };
        }

        // Validate and transform items
        const items: Item[] = [];
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];

            // Support simple string format
            if (typeof item === 'string') {
                items.push({
                    id: crypto.randomUUID(),
                    text: item,
                    completed: false,
                });
            }
            // Support detailed object format
            else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                const itemObj = item as Record<string, unknown>;

                if (!('text' in itemObj) || typeof itemObj.text !== 'string') {
                    return {
                        isValid: false,
                        error: t('import.errorItemFormat', { index: i + 1 }),
                    };
                }

                items.push({
                    id: crypto.randomUUID(),
                    text: itemObj.text,
                    completed: typeof itemObj.completed === 'boolean' ? itemObj.completed : false,
                });
            }
            else {
                return {
                    isValid: false,
                    error: t('import.errorItemFormat', { index: i + 1 }),
                };
            }
        }

        return {
            isValid: true,
            listData: {
                name: data.name,
                items,
            },
        };
    };

    const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        if (isOpen && categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [isOpen, categories]);

    const handleImport = async () => {
        setError('');

        const result = validateAndParseJSON(jsonInput);

        if (!result.isValid) {
            setError(result.error!);
            return;
        }

        if (!selectedCategoryId) {
            setError(t('import.errorSelectCategory', 'Please select a category.'));
            return;
        }

        try {
            setIsImporting(true);
            await onImport(result.listData!.name, result.listData!.items, selectedCategoryId);

            // Reset and close on success
            setJsonInput('');
            setError('');
            onClose();
        } catch {
            setError(t('import.errorFailed', 'Failed to import list. Please try again.'));
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setJsonInput('');
        setError('');
        setShowExample(false);
        onClose();
    };

    const exampleSimple = `{
  "name": "Shopping List",
  "items": ["Milk", "Bread", "Eggs", "Butter"]
}`;

    const exampleDetailed = `{
  "name": "Morning Routine",
  "items": [
    { "text": "Wake up", "completed": true },
    { "text": "Exercise", "completed": false },
    { "text": "Shower", "completed": false }
  ]
}`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden transform transition-all">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {t('import.title', 'Import List from JSON')}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('import.description', 'Paste JSON data below to import a list. The JSON should contain a "name" and "items" field.')}
                        </p>

                        {/* Category Selector */}
                        <div className="space-y-1">
                            <label htmlFor="category-select" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {t('import.toCategory', 'Import to Category')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <Folder size={16} />
                                </div>
                                <select
                                    id="category-select"
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    {categories.length === 0 && <option value="">{t('import.noCategories', 'No categories available')}</option>}
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Example toggle */}
                        <button
                            onClick={() => setShowExample(!showExample)}
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {showExample ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showExample ? t('import.hideExample', 'Hide examples') : t('import.showExample', 'Show example formats')}
                        </button>

                        {/* Examples */}
                        {showExample && (
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {t('import.simpleFormat', 'Simple format (recommended):')}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(exampleSimple, setCopiedSimple)}
                                            className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            {copiedSimple ? <Check size={10} /> : <Copy size={10} />}
                                            {copiedSimple ? t('import.copied', 'Copied!') : t('import.copy', 'Copy')}
                                        </button>
                                    </div>
                                    <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                        {exampleSimple}
                                    </pre>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {t('import.detailedFormat', 'Detailed format (with completion status):')}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(exampleDetailed, setCopiedDetailed)}
                                            className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            {copiedDetailed ? <Check size={10} /> : <Copy size={10} />}
                                            {copiedDetailed ? t('import.copied', 'Copied!') : t('import.copy', 'Copy')}
                                        </button>
                                    </div>
                                    <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                        {exampleDetailed}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* JSON Input */}
                        <div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => {
                                    setJsonInput(e.target.value);
                                    setError(''); // Clear error when user types
                                }}
                                placeholder='Paste JSON here, e.g. {"name": "My List", "items": ["Item 1", "Item 2"]}'
                                className="w-full h-40 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                                <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting ? t('import.importing', 'Importing...') : t('import.import', 'Import')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

