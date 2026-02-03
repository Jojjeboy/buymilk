import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Item, List } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';


export const GroceryListView: React.FC = React.memo(function GroceryListView() {
    const { t } = useTranslation();
    const { lists, defaultListId, updateListItems, deleteItem, updateListAccess, loading } = useApp();
    const [newItemText, setNewItemText] = useState('');
    const [uncheckModalOpen, setUncheckModalOpen] = useState(false);

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

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim()) {
            const newItem = { id: uuidv4(), text: newItemText.trim(), completed: false };
            await updateListItems(list.id, [...list.items, newItem]);
            setNewItemText('');
        }
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    <div className="flex items-center gap-2 group min-w-0 flex-1">
                        <h2 className="text-xl font-semibold truncate">{t('lists.groceryTitle')}</h2>
                    </div>
                </div>
            </div>


            {sortBy === 'manual' ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {sortedItems.map((item) => (
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
            ) : (
                <div className="space-y-2">
                    {sortedItems.map((item) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            disabled={true}
                        />
                    ))}
                </div>
            )}

            {sortedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Plus className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">{t('lists.emptyList')}</p>
                </div>
            )}

            {/* Fullwidth Persistent Bottom Bar */}
            <div className="fixed bottom-16 md:bottom-0 left-0 md:left-72 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-30 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <form onSubmit={handleAddItem} className="flex gap-2 items-center">
                        <div className="relative flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                placeholder={t('lists.addItemPlaceholder')}
                                className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newItemText.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </form>
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
