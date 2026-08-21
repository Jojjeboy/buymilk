import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Utensils, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const MealsView: React.FC = () => {
    const { meals, addMeal, updateMeal, deleteMeal } = useApp();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [newMealName, setNewMealName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleAddMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newMealName.trim();
        if (!name) return;

        try {
            await addMeal(name);
            setNewMealName('');
            showToast(t('toasts.itemAdded', 'Måltid tillagd'), 'success');
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    const handleStartEdit = (meal: { id: string; name: string }) => {
        setEditingId(meal.id);
        setEditValue(meal.name);
    };

    const handleSaveEdit = async (id: string) => {
        const name = editValue.trim();
        if (!name) return;

        try {
            await updateMeal(id, { name });
            setEditingId(null);
            showToast(t('toasts.itemUpdated', 'Måltid uppdaterad'), 'success');
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    const handleDeleteMeal = async (id: string) => {
        try {
            await deleteMeal(id);
            showToast(t('toasts.itemDeleted', 'Måltid borttagen'), 'info');
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-blue-500" />
                        {t('views.meals', 'Måltider')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {t('views.mealsDescription', 'Dina sparade favorit-måltider')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleAddMeal} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    placeholder={t('placeholders.newMeal', 'Lägg till ny måltid...')}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title={t('common.add', 'Lägg till')}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </form>

            <div className="grid gap-3">
                {meals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('views.noMeals', 'Inga sparade måltider än')}</p>
                    </div>
                ) : (
                    meals.map((meal) => (
                        <div 
                            key={meal.id} 
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm group transition-all hover:border-blue-200 dark:hover:border-blue-900"
                        >
                            {editingId === meal.id ? (
                                <div className="flex flex-1 gap-2">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 px-2 py-1 rounded border border-blue-500 outline-none bg-transparent"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={() => handleSaveEdit(meal.id)}
                                        className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{meal.name}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleStartEdit(meal)}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title={t('common.edit', 'Redigera')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteMeal(meal.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title={t('common.delete', 'Ta bort')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};