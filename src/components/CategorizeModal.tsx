import React, { useState } from 'react';
import { X, Plus, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';

interface CategorizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemText: string;
    categories: Category[];
    onAssignToCategory: (categoryId: string | undefined, itemText: string) => void;
    onCreateCategory: (name: string, itemText: string) => void;
}

export const CategorizeModal: React.FC<CategorizeModalProps> = ({
    isOpen,
    onClose,
    itemText,
    categories,
    onAssignToCategory,
    onCreateCategory,
}) => {
    const { t } = useTranslation();
    const [showNewForm, setShowNewForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setShowNewForm(false);
            setNewCategoryName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAssign = (categoryId: string | undefined) => {
        onAssignToCategory(categoryId, itemText);
        onClose();
    };

    const handleCreate = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        onCreateCategory(name, itemText);
        onClose();
    };

    const getCategoryDisplayName = (cat: Category) => {
        if (cat.name.startsWith('aisles.') || cat.name.startsWith('categories.')) {
            return t(cat.name);
        }
        return cat.name;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-labelledby="categorize-title"
                className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
                    <div className="min-w-0 flex-1">
                        <h3 id="categorize-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {t('categorize.title', 'Categorize Item')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            &ldquo;{itemText}&rdquo;
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 -mr-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Category list */}
                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        {t('categorize.addToExisting', 'Add to existing category')}
                    </p>
                    <div className="space-y-1">
                        <button
                            onClick={() => handleAssign(undefined)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        >
                            <FolderOpen size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                                {t('categorize.other', 'Övrigt')}
                            </span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleAssign(cat.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                                <FolderOpen size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                                    {getCategoryDisplayName(cat)}
                                </span>
                                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {t('categorize.addKeyword', '+ keyword')}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs text-gray-400 dark:text-gray-500">{t('common.or', 'or')}</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Create new category */}
                    {!showNewForm ? (
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                        >
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-blue-500 flex items-center justify-center transition-colors flex-shrink-0">
                                <Plus size={10} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {t('categorize.createNew', 'Create new category')}
                            </span>
                        </button>
                    ) : (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-150">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate();
                                }}
                                placeholder={t('categorize.newNamePlaceholder', 'Category name...')}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowNewForm(false)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newCategoryName.trim()}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {t('categorize.create', 'Create')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom safe area for mobile */}
                <div className="h-2 sm:h-0 flex-shrink-0" />
            </div>
        </div>
    );
};
