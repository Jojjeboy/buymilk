import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { ALL_QUICK_ITEMS, DEFAULT_ENABLED_QUICK_ITEMS } from '../utils/quickItems';
import type { QuickItemsSettings, QuickItem } from '../types';

interface QuickItemsSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings?: QuickItemsSettings;
    onSave: (settings: Omit<QuickItemsSettings, 'id'>) => Promise<void>;
}

export const QuickItemsSettingsModal: React.FC<QuickItemsSettingsModalProps> = ({
    isOpen,
    onClose,
    currentSettings,
    onSave
}) => {
    const { t } = useTranslation();
    const [selectedItems, setSelectedItems] = React.useState<string[]>(currentSettings?.enabledItems || []);
    const [isSaving, setIsSaving] = React.useState(false);

    // Sync with props when modal opens
    React.useEffect(() => {
        if (isOpen && currentSettings) {
            setSelectedItems(currentSettings.enabledItems);
        }
    }, [isOpen, currentSettings?.enabledItems]);

    const toggleItem = (key: string) => {
        setSelectedItems(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            } else {
                return [...prev, key];
            }
        });
    };

    const handleSave = async () => {
        if (selectedItems.length === 0) {
            setSelectedItems(DEFAULT_ENABLED_QUICK_ITEMS);
            await onSave({ enabledItems: DEFAULT_ENABLED_QUICK_ITEMS });
        } else {
            setIsSaving(true);
            try {
                await onSave({ enabledItems: selectedItems });
            } finally {
                setIsSaving(false);
            }
        }
        onClose();
    };

    const handleReset = () => {
        setSelectedItems(DEFAULT_ENABLED_QUICK_ITEMS);
    };

    const selectedQuickItems = ALL_QUICK_ITEMS.filter(item => selectedItems.includes(item.key));

    // Group items by category
    const categorizedItems = {
        dairy: ALL_QUICK_ITEMS.filter(item => 
            ['milk', 'butter', 'eggs', 'filmjolk', 'cheese', 'cream', 'yogurt'].includes(item.key)
        ),
        bread: ALL_QUICK_ITEMS.filter(item => 
            ['bread', 'crisps', 'buns'].includes(item.key)
        ),
        fruitsVegetables: ALL_QUICK_ITEMS.filter(item => 
            ['bananas', 'apples', 'oranges', 'tomatoes', 'cucumber', 'carrots', 'broccoli', 'salad', 'onion', 'potatoes', 'garlic'].includes(item.key)
        ),
        meatFish: ALL_QUICK_ITEMS.filter(item => 
            ['chicken', 'mincedMeat', 'bacon', 'salmon', 'shrimp', 'pork'].includes(item.key)
        ),
        dryGoods: ALL_QUICK_ITEMS.filter(item => 
            ['pasta', 'rice', 'oatmeal', 'flour', 'sugar', 'tomatoPuree', 'chickpeas'].includes(item.key)
        ),
        drinks: ALL_QUICK_ITEMS.filter(item => 
            ['coffee', 'tea', 'soda', 'juice'].includes(item.key)
        ),
        other: ALL_QUICK_ITEMS.filter(item => 
            ['toiletPaper', 'salt', 'pepper', 'honey', 'chocolate', 'cookies', 'pizza', 'sausage', 'leftovers'].includes(item.key)
        )
    };

    const categoryLabels = {
        dairy: t('quickItems.categories.dairy', 'Mejeriprodukter'),
        bread: t('quickItems.categories.bread', 'Bröd & Bakverk'),
        fruitsVegetables: t('quickItems.categories.fruitsVegetables', 'Frukt & Grönt'),
        meatFish: t('quickItems.categories.meatFish', 'Kött & Fisk'),
        dryGoods: t('quickItems.categories.dryGoods', 'Torra varor'),
        drinks: t('quickItems.categories.drinks', 'Drycker'),
        other: t('quickItems.categories.other', 'Övrigt')
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('quickItems.settings.title', 'Anpassa Snabbval')}
            onConfirm={() => {}}
            message=""
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('quickItems.settings.subtitle', 'Välj vilka varor som ska visas som snabbval i inköpslistan')}
                </p>

                <div className="space-y-4">
                    {Object.entries(categorizedItems).map(([category, items]) => (
                        <div key={category} className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {categoryLabels[category as keyof typeof categoryLabels]}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {items.map((item: QuickItem) => {
                                    const isSelected = selectedItems.includes(item.key);
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => toggleItem(item.key)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                    : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                        >
                                            <span className="text-lg">{item.emoji}</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                                                {item.label}
                                            </span>
                                            {isSelected && <Check size={12} className="text-blue-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('quickItems.settings.preview', 'Förhandsgranskning')}
                    </h3>
                    {selectedQuickItems.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {selectedQuickItems.map((item: QuickItem) => (
                                <div
                                    key={item.key}
                                    className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                >
                                    <span className="text-lg">{item.emoji}</span>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {t('quickItems.settings.noSelection', 'Inga varor valda')}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                        {t('common.reset')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? t('common.saving', 'Sparar...') : t('common.save', 'Spara')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};