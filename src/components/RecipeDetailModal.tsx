import React from 'react';
import { Modal } from './Modal';
import { Utensils, Clock, Users, Tag } from 'lucide-react';
import { Meal } from '../types';
import { useTranslation } from 'react-i18next';

interface RecipeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: Meal | null;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ isOpen, onClose, meal }) => {
    const { t } = useTranslation();

    if (!isOpen || !meal) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={meal.name}
            message=""
            confirmText="Stäng"
            onConfirm={onClose}
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {meal.imageUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
                        <img 
                            src={meal.imageUrl} 
                            alt={meal.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {meal.servings && (
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{t('common.servings', 'Portioner')}: {meal.servings}</span>
                        </div>
                    )}
                    {meal.tags && meal.tags.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Tag className="w-4 h-4" />
                            <div className="flex gap-1">
                                {meal.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {meal.description && (
                    <p className="text-gray-700 dark:text-gray-300 italic">
                        {meal.description}
                    </p>
                )}

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
                        <Utensils className="w-5 h-5 text-blue-500" />
                        {t('views.ingredients', 'Ingredienser')}
                    </div>
                    
                    {meal.ingredients && meal.ingredients.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {meal.ingredients.map((ing, index) => (
                                <li key={index} className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-sm">
                                    <span className="font-medium">{ing.text}</span>
                                    <span className="text-gray-500">{ing.amount}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">{t('views.noIngredients', 'Inga ingredienser angivna')}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
                        <Clock className="w-5 h-5 text-blue-500" />
                        {t('views.instructions', 'Instruktioner')}
                    </div>
                    
                    {meal.instructions && meal.instructions.length > 0 ? (
                        <ol className="space-y-3">
                            {meal.instructions.map((step, index) => (
                                <li key={index} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-gray-500">{t('views.noInstructions', 'Inga instruktioner angivna')}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};