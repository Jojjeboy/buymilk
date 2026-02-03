import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Modal } from './Modal';
import { Category } from '../types';

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onReorder: (categories: Category[]) => Promise<void>;
    onAdd: (name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

// Internal sortable item component
const SortableCategoryItem = ({
    category,
    onDelete
}: {
    category: Category;
    onDelete: (id: string, name: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 ${isDragging ? 'z-50 opacity-50' : ''}`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none flex-shrink-0"
                >
                    <GripVertical size={20} />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0" title={category.name}>
                    {category.name}
                </span>
            </div>
            <button
                onClick={() => onDelete(category.id, category.name)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Delete category"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
    isOpen,
    onClose,
    categories,
    onReorder,
    onAdd,
    onDelete,
}) => {
    const { t } = useTranslation();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over?.id);
            const reordered = arrayMove(categories, oldIndex, newIndex);
            await onReorder(reordered);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await onAdd(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteConfirmation({ isOpen: true, id, name });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.id) {
            await onDelete(deleteConfirmation.id);
            setDeleteConfirmation({ isOpen: false, id: null, name: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('categories.manage', 'Hantera kategorier')}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content - Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                                    {categories.map((category) => (
                                        <SortableCategoryItem
                                            key={category.id}
                                            category={category}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="p-4 text-center text-gray-500 text-sm">
                                            {t('categories.empty', 'Inga kategorier')}
                                        </p>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Footer - Add Category */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder={t('categories.newPlaceholder', 'Ny kategori')}
                                className="flex-1 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                            />
                            <button
                                type="submit"
                                className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Nested Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
                onConfirm={confirmDelete}
                title={t('categories.deleteTitle')}
                message={t('categories.deleteMessage', { name: deleteConfirmation.name })}
                confirmText={t('categories.deleteConfirm')}
                isDestructive
            />
        </>
    );
};
