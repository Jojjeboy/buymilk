import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Item, ListSettings, List } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus, Settings, ChevronDown, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

const DroppableSection = ({ sectionId, children }: { sectionId: string, children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id: sectionId });
    return <div ref={setNodeRef}>{children}</div>;
};

export const GroceryListView: React.FC = React.memo(function GroceryListView() {
    const { t } = useTranslation();
    const { lists, defaultListId, updateListItems, deleteItem, updateListName, updateListSettings, updateListAccess, addSection, updateSection, deleteSection, loading } = useApp();
    const [newItemText, setNewItemText] = useState('');
    const [uncheckModalOpen, setUncheckModalOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [calendarAccordionOpen, setCalendarAccordionOpen] = useState(false);
    const [calendarEventTitle, setCalendarEventTitle] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editedSectionName, setEditedSectionName] = useState('');
    const [deletingSectionId, setDeleteSectionId] = useState<string | null>(null);

    const list: List | undefined = lists.find((l) => l.id === defaultListId);

    React.useEffect(() => {
        if (list) {
            document.title = `BuyMilk - ${list.name}`;
            setEditedTitle(list.name);
            updateListAccess(list.id);
        }
    }, [list?.id, list?.name]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [sortBy, setSortBy] = useState<'manual' | 'alphabetical' | 'completed'>('manual');
    const threeStageMode = list?.settings?.threeStageMode ?? false;

    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const getNextFullHour = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return toLocalISOString(now);
    };

    const [calendarStartTime, setCalendarStartTime] = useState(() =>
        list?.settings?.calendarStartTime || getNextFullHour()
    );
    const [calendarEndTime, setCalendarEndTime] = useState(() => {
        if (list?.settings?.calendarEndTime) return list.settings.calendarEndTime;
        const startStr = list?.settings?.calendarStartTime || getNextFullHour();
        const endDate = new Date(startStr);
        endDate.setHours(endDate.getHours() + 1);
        return toLocalISOString(endDate);
    });

    useEffect(() => {
        if (calendarAccordionOpen) {
            const now = new Date();
            const currentStart = new Date(calendarStartTime);
            if (currentStart < now) {
                const nextHourStr = getNextFullHour();
                setCalendarStartTime(nextHourStr);
                const nextHourDate = new Date(nextHourStr);
                const endDate = new Date(nextHourDate);
                endDate.setHours(endDate.getHours() + 1);
                setCalendarEndTime(toLocalISOString(endDate));
            }
        }
    }, [calendarAccordionOpen]);

    useEffect(() => {
        const start = new Date(calendarStartTime);
        const end = new Date(calendarEndTime);
        if (end <= start) {
            const newEnd = new Date(start);
            newEnd.setHours(newEnd.getHours() + 1);
            setCalendarEndTime(toLocalISOString(newEnd));
        }
    }, [calendarStartTime]);

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
                const getWeight = (item: Item) => {
                    if (item.completed) return 2;
                    if (threeStageMode && item.state === 'ongoing') return 0;
                    return 1;
                };
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                return a.text.localeCompare(b.text);
            });
        }
        return items;
    }, [list, sortBy, threeStageMode]);

    React.useEffect(() => {
        if (list) {
            setCalendarEventTitle(list.name);
        }
    }, [list?.name]);

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

        const overSectionId = list.sections?.find(s => s.id === over.id)?.id;
        const activeItem = list.items.find((item) => item.id === active.id);
        if (!activeItem) return;

        if (overSectionId) {
            const currentSectionId = activeItem.sectionId;
            if (currentSectionId !== overSectionId) {
                const updatedItems = list.items.map(item =>
                    item.id === active.id ? { ...item, sectionId: overSectionId } : item
                );
                await updateListItems(list.id, updatedItems);
            }
            return;
        }

        const overItem = list.items.find((item) => item.id === over.id);
        const activeItemSectionId = activeItem.sectionId;
        const overItemSectionId = overItem?.sectionId;

        if (overItemSectionId !== undefined && activeItemSectionId !== overItemSectionId) {
            const updatedItems = list.items.map(item =>
                item.id === active.id ? { ...item, sectionId: overItemSectionId } : item
            );
            await updateListItems(list.id, updatedItems);
        } else if (overItem) {
            const oldIndex = list.items.findIndex((item) => item.id === active.id);
            const newIndex = list.items.findIndex((item) => item.id === over.id);
            await updateListItems(list.id, arrayMove(list.items, oldIndex, newIndex));
        }
    };

    const handleToggle = async (itemId: string) => {
        const newItems = list.items.map(item => {
            if (item.id !== itemId) return item;

            let newState: 'unresolved' | 'ongoing' | 'completed';
            let newCompleted: boolean;

            if (threeStageMode) {
                if (item.completed) {
                    newState = 'unresolved';
                    newCompleted = false;
                } else if (item.state === 'ongoing') {
                    newState = 'completed';
                    newCompleted = true;
                } else {
                    newState = 'ongoing';
                    newCompleted = false;
                }
            } else {
                newCompleted = !item.completed;
                newState = newCompleted ? 'completed' : 'unresolved';
            }

            return { ...item, completed: newCompleted, state: newState };
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
        const newItems = list.items.map(item => ({ ...item, completed: false, state: 'unresolved' as const }));
        await updateListItems(list.id, newItems);
        setUncheckModalOpen(false);
    };

    const handleSaveTitle = async () => {
        if (editedTitle.trim()) {
            await updateListName(list.id, editedTitle.trim());
            setIsEditingTitle(false);
        }
    };

    const updateSettings = async (newSettings: Partial<typeof list.settings>) => {
        if (!list) return;
        const currentSettings = list.settings || { threeStageMode: false, defaultSort: 'manual' };
        const updated: ListSettings = { ...currentSettings, ...newSettings } as ListSettings;
        await updateListSettings(list.id, updated);
    };

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newSectionName.trim() && list) {
            await addSection(list.id, newSectionName.trim());
            setNewSectionName('');
        }
    };

    const handleUpdateSection = async (sectionId: string) => {
        if (editedSectionName.trim() && list) {
            await updateSection(list.id, sectionId, editedSectionName.trim());
            setEditingSectionId(null);
            setEditedSectionName('');
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (list) {
            await deleteSection(list.id, sectionId);
            setDeleteSectionId(null);
        }
    };

    const groupItemsBySection = (items: Item[]): Map<string | undefined, Item[]> => {
        const grouped = new Map<string | undefined, Item[]>();
        grouped.set(undefined, items.filter(item => !item.sectionId));
        const sections = list?.sections || [];
        sections.forEach(section => {
            grouped.set(section.id, items.filter(item => item.sectionId === section.id));
        });
        return grouped;
    };

    const validateAndGetTimes = () => {
        if (!list) return;
        const now = new Date();
        const start = new Date(calendarStartTime);
        if (start < now) {
            const nextHourStr = getNextFullHour();
            setCalendarStartTime(nextHourStr);
            const nextHourDate = new Date(nextHourStr);
            const endDate = new Date(nextHourDate);
            endDate.setHours(endDate.getHours() + 1);
            const actualEnd = toLocalISOString(endDate);
            setCalendarEndTime(actualEnd);
            return { actualStart: nextHourStr, actualEnd: actualEnd };
        }
        return { actualStart: calendarStartTime, actualEnd: calendarEndTime };
    };

    const generateGoogleCalendarLink = () => {
        if (!list) return;

        const times = validateAndGetTimes();
        if (!times) return;
        const { actualStart, actualEnd } = times;

        updateSettings({ calendarStartTime: actualStart, calendarEndTime: actualEnd });

        const title = encodeURIComponent(calendarEventTitle || list.name);
        const itemsText = list.items.map(item => `• ${item.text}`).join('\n');
        const linkText = t('lists.settings.calendar.linkText');
        const deepLink = window.location.href; // Simplified link
        const htmlLink = `<a href="${deepLink}">${linkText}</a>`;
        const description = encodeURIComponent(`${itemsText}\n\n${htmlLink}`);

        const formatGoogleTime = (isoString: string) => {
            const date = new Date(isoString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startTime = formatGoogleTime(actualStart);
        const endTime = formatGoogleTime(actualEnd);
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startTime}/${endTime}`;
        window.open(calendarUrl, '_blank');
    };

    const now = new Date();
    const currentNowTime = now.getTime();
    const startDate = new Date(calendarStartTime);
    const endDate = new Date(calendarEndTime);
    const isPast = startDate.getTime() < (currentNowTime - 60000);
    const isRangeInvalid = startDate >= endDate;
    const isCalendarButtonDisabled = isPast || isRangeInvalid;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Title Area - No Back Button */}
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {/* Static Icon or Logo could go here */}
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1 mr-4 min-w-0">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none w-full min-w-0"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') {
                                        setEditedTitle(list.name);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                onBlur={handleSaveTitle}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group min-w-0 flex-1">
                            {(() => {
                                const truncatedName = list.name.length > 30 ? list.name.substring(0, 30) + "... " : list.name;
                                return <h2 className="text-xl font-semibold truncate" title={list.name}>{truncatedName}</h2>;
                            })()}
                            <button
                                onClick={() => setIsEditingTitle(true)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all flex-shrink-0"
                                title={t('lists.editTitle')}
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleAddItem} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder={t('lists.addItemPlaceholder')}
                        className="w-full p-3 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    type="submit"
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-colors"
                >
                    <Plus />
                </button>
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                >
                    <Settings size={20} />
                </button>
            </form>

            {sortBy === 'manual' ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {(() => {
                                const groupedItems = groupItemsBySection(sortedItems);
                                const sections = list?.sections || [];
                                const hasAnySections = sections.length > 0;

                                return (
                                    <>
                                        {/* Unsectioned items */}
                                        {groupedItems.get(undefined) && groupedItems.get(undefined)!.length > 0 && (
                                            <div>
                                                {hasAnySections && (
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                        {t('lists.sections.unsectioned')}
                                                    </h3>
                                                )}
                                                <div className="space-y-2">
                                                    {groupedItems.get(undefined)!.map((item) => (
                                                        <SortableItem
                                                            key={item.id}
                                                            item={item}
                                                            onToggle={handleToggle}
                                                            onDelete={handleDelete}
                                                            onEdit={handleEdit}
                                                            threeStageMode={threeStageMode}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sectioned items */}
                                        {sections.map((section) => {
                                            const sectionItems = groupedItems.get(section.id) || [];
                                            return (
                                                <DroppableSection sectionId={section.id} key={section.id}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                                            {section.name}
                                                        </h3>
                                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingSectionId(section.id);
                                                                    setEditedSectionName(section.name);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-blue-500"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteSectionId(section.id)}
                                                                className="p-1 text-gray-400 hover:text-red-500"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {editingSectionId === section.id ? (
                                                        <div className="flex gap-2 mb-2">
                                                            <input 
                                                                autoFocus
                                                                type="text" 
                                                                value={editedSectionName}
                                                                onChange={(e) => setEditedSectionName(e.target.value)}
                                                                onBlur={() => handleUpdateSection(section.id)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateSection(section.id)}
                                                                className="flex-1 text-sm p-1 border rounded"
                                                            />
                                                        </div>
                                                    ) : null}
                                                    <div className="space-y-2 min-h-[2rem]">
                                                        {sectionItems.map((item) => (
                                                            <SortableItem
                                                                key={item.id}
                                                                item={item}
                                                                onToggle={handleToggle}
                                                                onDelete={handleDelete}
                                                                onEdit={handleEdit}
                                                                threeStageMode={threeStageMode}
                                                            />
                                                        ))}
                                                        {sectionItems.length === 0 && (
                                                            <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-4 italic">
                                                                {t('lists.emptyList')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </DroppableSection>
                                            );
                                        })}

                                        {sortedItems.length === 0 && (
                                            <p className="text-center text-gray-500 mt-8">{t('lists.emptyList')}</p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="space-y-6">
                    {/* Non-sortable view mostly same as sortable but disabled dnd */}
                    {(() => {
                        const groupedItems = groupItemsBySection(sortedItems);
                        const sections = list?.sections || [];
                        const hasAnySections = sections.length > 0;

                        return (
                            <>
                                {groupedItems.get(undefined) && groupedItems.get(undefined)!.length > 0 && (
                                    <div>
                                        {hasAnySections && (
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                {t('lists.sections.unsectioned')}
                                            </h3>
                                        )}
                                        <div className="space-y-2">
                                            {groupedItems.get(undefined)!.map((item) => (
                                                <SortableItem
                                                    key={item.id}
                                                    item={item}
                                                    onToggle={handleToggle}
                                                    onDelete={handleDelete}
                                                    onEdit={handleEdit}
                                                    disabled={true}
                                                    threeStageMode={threeStageMode}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sections.map((section) => {
                                    const sectionItems = groupedItems.get(section.id) || [];
                                    return (
                                        <div key={section.id}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                                    {section.name}
                                                </h3>
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                            </div>
                                            <div className="space-y-2">
                                                {sectionItems.map((item) => (
                                                    <SortableItem
                                                        key={item.id}
                                                        item={item}
                                                        onToggle={handleToggle}
                                                        onDelete={handleDelete}
                                                        onEdit={handleEdit}
                                                        disabled={true}
                                                        threeStageMode={threeStageMode}
                                                    />
                                                ))}
                                                {sectionItems.length === 0 && (
                                                    <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-4 italic">
                                                        {t('lists.emptyList')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {sortedItems.length === 0 && (
                                    <p className="text-center text-gray-500 mt-8">{t('lists.emptyList')}</p>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

            <Modal
                isOpen={uncheckModalOpen}
                onClose={() => setUncheckModalOpen(false)}
                onConfirm={confirmUncheckAll}
                title={t('lists.resetTitle')}
                message={t('lists.resetMessage')}
                confirmText={t('lists.reset')}
            />
             <Modal
                isOpen={!!deletingSectionId}
                onClose={() => setDeleteSectionId(null)}
                onConfirm={() => deletingSectionId && handleDeleteSection(deletingSectionId)}
                title={t('lists.sections.deleteTitle')}
                message={t('lists.sections.deleteMessage')}
                confirmText={t('common.delete')}
                isDestructive
            />
            <Modal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                title={t('lists.settings.title')}
                message="" 
                confirmText={t('common.done')} 
                onConfirm={() => setSettingsOpen(false)}
            >
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.threeStage.title')}</span>
                            <span className="text-sm text-gray-500">{t('lists.settings.threeStage.description')}</span>
                        </div>
                        <button
                            onClick={() => updateSettings({ threeStageMode: !threeStageMode })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${threeStageMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${threeStageMode ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('lists.settings.sort')}
                        </label>
                        <div className="space-y-2">
                            {(['manual', 'alphabetical', 'completed'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setSortBy(mode);
                                        updateSettings({ defaultSort: mode });
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border ${sortBy === mode
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="capitalize">{t(`lists.sort.${mode}`)}</span>
                                    {sortBy === mode && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                     {/* Section Management */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('lists.sections.title')}
                        </label>

                        <form onSubmit={handleAddSection} className="flex gap-2">
                            <input
                                type="text"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                placeholder={t('lists.sections.addPlaceholder')}
                                className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                {t('lists.sections.add')}
                            </button>
                        </form>
                    </div>


                    {/* Calendar Export */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                         <div className="flex flex-col gap-4">
                             <button
                                 onClick={() => setCalendarAccordionOpen(!calendarAccordionOpen)}
                                 className="flex items-center justify-between w-full text-left"
                             >
                                 <div className="flex flex-col">
                                     <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.calendar.title')}</span>
                                     <span className="text-sm text-gray-500">{t('lists.settings.calendar.description')}</span>
                                 </div>
                                 <ChevronDown className={`transition-transform duration-200 ${calendarAccordionOpen ? 'rotate-180' : ''}`} />
                             </button>
                             
                             {calendarAccordionOpen && (
                                 <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                     <div className="space-y-2">
                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                             {t('lists.settings.calendar.eventName')}
                                         </label>
                                         <input
                                             type="text"
                                             value={calendarEventTitle}
                                             onChange={(e) => setCalendarEventTitle(e.target.value)}
                                             placeholder={t('lists.settings.calendar.eventNamePlaceholder')}
                                             className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                         />
                                     </div>

                                     <div className="grid grid-cols-2 gap-3">
                                         <div className="space-y-2">
                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                 {t('lists.settings.calendar.startTime')}
                                             </label>
                                             <input 
                                                 type="datetime-local" 
                                                 value={calendarStartTime}
                                                 onChange={(e) => setCalendarStartTime(e.target.value)}
                                                 className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                 {t('lists.settings.calendar.endTime')}
                                             </label>
                                             <input 
                                                 type="datetime-local" 
                                                 value={calendarEndTime}
                                                 onChange={(e) => setCalendarEndTime(e.target.value)}
                                                 className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                             />
                                         </div>
                                     </div>

                                     {isCalendarButtonDisabled && (
                                         <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                             {isPast ? t('lists.settings.calendar.pastWarning') : t('lists.settings.calendar.rangeWarning')}
                                         </div>
                                     )}

                                     <button
                                         onClick={generateGoogleCalendarLink}
                                         disabled={isCalendarButtonDisabled}
                                         className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                                             isCalendarButtonDisabled 
                                                 ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                         }`}
                                     >
                                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                         {t('lists.settings.calendar.addToCalendar')}
                                     </button>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>
            </Modal>
        </div>
    );
});
