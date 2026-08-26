import React from 'react';
import { X, Utensils, Tag } from 'lucide-react';
import { Meal } from '../types';

interface MealDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: Meal | null;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({ isOpen, onClose, meal }) => {
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
                        title="Close"
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

                    {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                                <Utensils size={16} className="text-blue-500" />
                                Ingredients
                            </h3>
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
                    )}

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};