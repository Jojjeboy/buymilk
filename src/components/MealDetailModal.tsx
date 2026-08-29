import React, { useState } from 'react';
import { X, Utensils, Tag, BookOpen, Edit2, Calendar, Dices } from 'lucide-react';
import { Meal } from '../types';
import { useTranslation } from 'react-i18next';

interface MealDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (meal: Meal) => void;
    onPlanMeal: (meal: Meal) => void;
    onRandomMeal: () => void;
    meal: Meal | null;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({ isOpen, onClose, onEdit, onPlanMeal, onRandomMeal, meal }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

    if (!isOpen || !meal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                role="dialog" 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            >
                <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {meal.imageUrl ? (
                        <img 
                            src={meal.imageUrl} 
                            alt={meal.name} 
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                            <Utensils className="w-20 h-20 opacity-50" />
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                        title={t('common.close', 'Close')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {meal.name}
                        </h2>
                    </div>

                    {meal.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {meal.description}
                        </p>
                    )}

                     {meal.tags && meal.tags.length > 0 && (
                         <div className="flex flex-wrap gap-2 mb-6">
                             {meal.tags.map(tag => (
                                 <span 
                                     key={tag} 
                                     className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                                 >
                                     <Tag size={12} />
                                     {tag}
                                 </span>
                             ))}
                         </div>
                     )}

                     <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl mb-6">
                          <button 
                              onClick={() => setActiveTab('ingredients')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                                  activeTab === 'ingredients' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                          >
                              <Utensils size={16} />
                              {t('meals.ingredients', 'Ingredients')}
                          </button>
                          <button 
                              onClick={() => setActiveTab('instructions')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                                  activeTab === 'instructions' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                          >
                              <BookOpen size={16} />
                              {t('meals.preparation', 'Preparation')}
                          </button>
                     </div>

                     {activeTab === 'ingredients' ? (
                         meal.ingredients && meal.ingredients.length > 0 ? (
                             <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                                 <ul className="grid grid-cols-1 gap-2">
                                     {meal.ingredients.map((ing, idx) => (
                                         <li 
                                             key={idx} 
                                             className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                                         >
                                             <span className="text-blue-500 mt-1">•</span>
                                             <span>
                                                 {ing.amount && <span className="font-medium">{ing.amount} </span>}
                                                 {ing.text}
                                             </span>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                          ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">{t('meals.noIngredients', 'No ingredients listed.')}</p>
                          )
                     ) : (
                         meal.instructions && meal.instructions.length > 0 ? (
                             <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                                 <ol className="grid grid-cols-1 gap-3">
                                     {meal.instructions.map((step, idx) => (
                                         <li 
                                             key={idx} 
                                             className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                                         >
                                             <span className="font-bold text-blue-500 mt-1">{idx + 1}.</span>
                                             <span>{step}</span>
                                         </li>
                                     ))}
                                 </ol>
                             </div>
                          ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">{t('meals.noInstructions', 'No preparation instructions listed.')}</p>
                          )
                     )}

                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t('common.close', 'Close')}
                        </button>
                        <button
                            onClick={onRandomMeal}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                            <Dices size={16} />
                            {t('mealDetail.randomMeal', 'Slumpa ny måltid')}
                        </button>
                        <button
                            onClick={() => meal && onPlanMeal(meal)}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Calendar size={16} />
                            {t('mealDetail.planMeal', 'Planera in måltid')}
                        </button>
                        <button 
                            onClick={() => meal && onEdit(meal)}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Edit2 size={16} />
                            {t('common.edit', 'Edit')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};