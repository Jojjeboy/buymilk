import React from 'react';
import { X, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Item } from '../types';

interface ShoppingListOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    isWakeLockActive: boolean;
}

export const ShoppingListOverlay: React.FC<ShoppingListOverlayProps> = ({ isOpen, onClose, isWakeLockActive }) => {
    const { t } = useTranslation();
    const { lists, defaultListId, updateListItems } = useApp();

    if (!isOpen) return null;

    // Find the active list
    const activeList = lists.find(l => l.id === defaultListId);
    const items = activeList ? activeList.items : [];

    const handleToggleChecked = async (itemId: string) => {
        if (!activeList) return;
        
        const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        
        await updateListItems(activeList.id, updatedItems);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{t('groceryList.title', 'Inköpslista')}</h2>
                    {isWakeLockActive && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                            <Eye size={14} />
                            <span>{t('settings.wakeLockActive', 'Skärmen hålls vaken')}</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={t('app.close', 'Stäng')}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Simplified List */}
            <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>{t('groceryList.empty', 'Listan är tom')}</p>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto w-full space-y-2">
                        {items.map((item: Item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 transition-colors"
                            >
                                <input 
                                    type="checkbox" 
                                    checked={item.completed} 
                                    onChange={() => handleToggleChecked(item.id)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#2c6de3] focus:ring-[#2c6de3] cursor-pointer"
                                />
                                <span className={`text-lg ${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};