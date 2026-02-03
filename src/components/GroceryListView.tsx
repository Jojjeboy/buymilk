import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Item, List } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus, RotateCcw, ChevronDown, ShoppingCart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';


export const GroceryListView: React.FC = React.memo(function GroceryListView() {
    const { t } = useTranslation();
    const { lists, defaultListId, updateListItems, deleteItem, updateListAccess, loading, itemHistory, addToHistory } = useApp();
    const [newItemText, setNewItemText] = useState('');
    const [uncheckModalOpen, setUncheckModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<(typeof itemHistory)>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [completedAccordionOpen, setCompletedAccordionOpen] = useState(false);

    const list: List | undefined = lists.find((l) => l.id === defaultListId);

    React.useEffect(() => {
        if (list) {
            document.title = `BuyMilk - ${t('lists.groceryTitle')}`;
            updateListAccess(list.id);
        }
    }, [list?.id, t, updateListAccess]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [sortBy, setSortBy] = useState<'manual' | 'alphabetical' | 'completed'>('manual');

    useEffect(() => {
        if (list?.settings?.defaultSort) {
            setSortBy(list.settings.defaultSort);
        }
    }, [list?.settings?.defaultSort]);

    const sortedItems = React.useMemo(() => {
        if (!list) return [];
        const items = [...list.items];
        if (sortBy === 'alphabetical') {
            items.sort((a, b) => a.text.localeCompare(b.text));
        } else if (sortBy === 'completed') {
            items.sort((a, b) => {
                const getWeight = (item: Item) => (item.completed ? 2 : 1);
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                return a.text.localeCompare(b.text);
            });
        }
        return items;
    }, [list, sortBy]);

    if (loading && !list) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    }

    if (!list) return <div className="text-center py-10">{t('lists.notFound')}</div>;

    // Autocomplete Logic
    useEffect(() => {
        if (!newItemText.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const searchText = newItemText.toLowerCase();
        
        // Filter history
        const historyMatches = itemHistory.filter(h => 
            h.text.toLowerCase().includes(searchText) &&
            !list?.items.some(i => i.text.toLowerCase() === h.text.toLowerCase() && !i.completed) // Don't suggest if already active
        );

        // Sort by usage count
        historyMatches.sort((a, b) => b.usageCount - a.usageCount);

        setSuggestions(historyMatches.slice(0, 5));
        setShowSuggestions(true);
    }, [newItemText, itemHistory, list?.items]);

    const handleAddItem = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();
        const textToAdd = textOverride || newItemText.trim();
        
        if (list && textToAdd) {
             // Check if item exists (completed) -> Restore it
             const existingItem = list.items.find(i => i.text.toLowerCase() === textToAdd.toLowerCase());
            
             if (existingItem) {
                 if (existingItem.completed) {
                     await handleToggle(existingItem.id);
                 }
             } else {
                 const newItem = { id: uuidv4(), text: textToAdd, completed: false };
                 await updateListItems(list.id, [...list.items, newItem]);
                 await addToHistory(textToAdd);
             }
             setNewItemText('');
             setSuggestions([]);
             setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        handleAddItem(undefined, text);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = list.items.findIndex((item) => item.id === active.id);
        const newIndex = list.items.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            await updateListItems(list.id, arrayMove(list.items, oldIndex, newIndex));
        }
    };

    const handleToggle = async (itemId: string) => {
        const newItems = list.items.map(item => {
            if (item.id !== itemId) return item;
            const newCompleted = !item.completed;
            return { ...item, completed: newCompleted };
        });
        await updateListItems(list.id, newItems);

        const allCompleted = newItems.every(item => item.completed);
        if (allCompleted && newItems.length > 0) {
            setUncheckModalOpen(true);
        }
    };

    const handleDelete = async (itemId: string) => {
        await deleteItem(list.id, itemId);
    };

    const handleEdit = async (itemId: string, text: string) => {
        const newItems = list.items.map(item =>
            item.id === itemId ? { ...item, text } : item
        );
        await updateListItems(list.id, newItems);
    };

    const confirmUncheckAll = async () => {
        const newItems = list.items.map(item => ({ ...item, completed: false }));
        await updateListItems(list.id, newItems);
        setUncheckModalOpen(false);
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] relative pb-40 md:pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm">
                        <ShoppingCart size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-2 group min-w-0 flex-1">
                        <h2 className="text-xl font-semibold truncate">{t('lists.groceryTitle')}</h2>
                    </div>
                </div>
            </div>


            {/* Active Items */}
            {(() => {
                const activeItems = sortedItems.filter(i => !i.completed);
                const completedItems = sortedItems.filter(i => i.completed);

                return (
                    <>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={activeItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {activeItems.map((item) => (
                                        <SortableItem
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {activeItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                    <Plus className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">{t('lists.emptyList')}</p>
                            </div>
                        )}

                        {/* Completed Items Accordion */}
                        {completedItems.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setCompletedAccordionOpen(!completedAccordionOpen)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
                                >
                                    <ChevronDown size={16} className={`transition-transform ${completedAccordionOpen ? 'rotate-180' : ''}`} />
                                    {t('lists.completedItems', 'Completed Items')} ({completedItems.length})
                                </button>

                                {completedAccordionOpen && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        {completedItems.map(item => (
                                            <div key={item.id} className="opacity-60 hover:opacity-100 transition-opacity">
                                                 <SortableItem
                                                    item={item}
                                                    onToggle={handleToggle}
                                                    onDelete={handleDelete}
                                                    onEdit={handleEdit}
                                                    disabled={true} // Disable drag for completed items
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                );
            })()}

            {/* Fullwidth Persistent Bottom Bar */}
            <div className="fixed bottom-16 md:bottom-0 left-0 md:left-72 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-30 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="relative">
                        <form onSubmit={handleAddItem} className="flex gap-2 items-center">
                            <div className="relative flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    placeholder={t('lists.addItemPlaceholder')}
                                    className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => newItemText && setShowSuggestions(true)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion) => {
                                            const existingCompleted = list?.items.find(i => i.text.toLowerCase() === suggestion.text.toLowerCase() && i.completed);
                                            
                                            return (
                                                <button
                                                    key={suggestion.id}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion.text)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between group transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RotateCcw size={14} className="text-gray-400 group-hover:text-blue-500" />
                                                        <span className="text-gray-700 dark:text-gray-200">{suggestion.text}</span>
                                                    </div>
                                                    {existingCompleted && (
                                                        <span className="text-xs text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                                            {t('lists.restore', 'Restore')}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={uncheckModalOpen}
                onClose={() => setUncheckModalOpen(false)}
                onConfirm={confirmUncheckAll}
                title={t('lists.resetTitle')}
                message={t('lists.resetMessage')}
                confirmText={t('lists.reset')}
            />
        </div>
    );
});
