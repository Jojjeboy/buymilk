import React from 'react';
import { Utensils, Tag } from 'lucide-react';
import { Meal } from '../types';
import { useTranslation } from 'react-i18next';

interface RandomMealCardProps {
    meal: Meal;
    onClick: () => void;
}

export const RandomMealCard: React.FC<RandomMealCardProps> = ({ meal, onClick }) => {
    const { t } = useTranslation();

    return (
        <button
            onClick={onClick}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden w-full"
            aria-label={t('ingredientSearch.viewDetails', 'Visa detaljer')}
        >
            {/* Image Section */}
            <div className="relative h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                {meal.imageUrl ? (
                    <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-900 dark:to-gray-800">
                        <Utensils className="w-10 h-10 opacity-40 text-blue-500" />
                    </div>
                )}
                
                {/* Overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* Content Section */}
            <div className="p-4 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {meal.name}
                </h3>
                
                {meal.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {meal.description}
                    </p>
                )}

                {/* Tags */}
                {meal.tags && meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {meal.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                        {meal.tags.length > 2 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{meal.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};