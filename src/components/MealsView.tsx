import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Utensils, Plus, Trash2, Edit2, ShoppingCart } from 'lucide-react';
import { MealIngredientsModal } from './MealIngredientsModal';
import { MealEditModal } from './MealEditModal';
import { v4 as uuidv4 } from 'uuid';
import { Item, Meal } from '../types';

export const MealsView: React.FC = () => {
    const { meals, addMeal, updateMeal, deleteMeal, addItemsToList, defaultListId } = useApp();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [newMealName, setNewMealName] = useState('');
    const [editingMeal, setEditingMeal] = useState<typeof meals[0] | null>(null);
    const [ingredientsMeal, setIngredientsMeal] = useState<typeof meals[0] | null>(null);

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

    const handleStartEdit = (meal: typeof meals[0]) => {
        setEditingMeal(meal);
    };

    const handleSaveMeal = async (id: string, updates: Partial<Meal>) => {
        try {
            await updateMeal(id, updates);
            setEditingMeal(null);
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

    const handleAddToShoppingList = async (meal: typeof meals[0]) => {
        if (!meal.ingredients || meal.ingredients.length === 0) return;
        if (!defaultListId) {
            showToast(t('errors.noList', 'Kunde inte hitta inköpslistan'), 'error');
            return;
        }

        const itemsToAdd: Item[] = meal.ingredients
            .filter(ing => !ing.checkIfExistAtHome)
            .map(ing => ({
                id: uuidv4(),
                text: `${ing.amount ? ing.amount + ' ' : ''}${ing.text}`,
                completed: false,
            }));

        if (itemsToAdd.length === 0) {
            showToast(t('toasts.allAtHome', 'Alla ingredienser finns redan hemma'), 'info');
            return;
        }

        try {
            await addItemsToList(defaultListId, itemsToAdd);
            showToast(`${itemsToAdd.length} ${t('common.items', 'artiklar')} tillagda i inköpslistan`, 'success');
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('views.noMeals', 'Inga sparade måltider än')}</p>
                    </div>
                ) : (
                    meals.map((meal) => (
                        <div 
                            key={meal.id} 
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900"
                        >
                            {/* Image Section */}
                            <div className="relative h-48 w-full overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                {meal.imageUrl ? (
                                    <img 
                                        src={meal.imageUrl} 
                                        alt={meal.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                                        <Utensils className="w-16 h-16 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleStartEdit(meal)}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-blue-500 rounded-full shadow-sm transition-colors"
                                        title={t('common.edit', 'Redigera')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-red-500 rounded-full shadow-sm transition-colors"
                                        title={t('common.delete', 'Ta bort')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-4 flex flex-col flex-1">
                                <>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">
                                        {meal.name}
                                    </h3>
                                        {meal.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                {meal.description}
                                            </p>
                                        )}
                                        
                                         <div className="mt-auto">
                                             <div className="flex flex-wrap gap-2 mb-3">
                                                 {meal.tags && meal.tags.length > 0 ? (
                                                     meal.tags.map(tag => (
                                                         <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                                             #{tag}
                                                         </span>
                                                     ))
                                                 ) : (
                                                     <span className="text-xs text-gray-400 italic">Inga taggar</span>
                                                 )}
                                             </div>
                                             {meal.ingredients && meal.ingredients.length > 0 && (
                                                 <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                     <Utensils className="w-3 h-3" />
                                                     <span>{meal.ingredients.length} ingredienser</span>
                                                 </div>
                                             )}

                                            <div className="flex items-center justify-between gap-2">
                                                <button 
                                                    onClick={() => setIngredientsMeal(meal)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <Utensils className="w-4 h-4" />
                                                    {t('common.editIngredients', 'Ingredienser')}
                                                </button>
                                                {meal.ingredients && meal.ingredients.length > 0 && (
                                                    <button 
                                                        onClick={() => handleAddToShoppingList(meal)}
                                                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title={t('common.addToShoppingList', 'Lägg till i inköpslista')}
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <MealIngredientsModal 
                isOpen={!!ingredientsMeal} 
                onClose={() => setIngredientsMeal(null)} 
                meal={ingredientsMeal || { id: '', name: '', createdAt: '' }} 
            />
            <MealEditModal 
                isOpen={!!editingMeal}
                onClose={() => setEditingMeal(null)}
                onSave={handleSaveMeal}
                meal={editingMeal}
            />
        </div>
    );
};