import React, { useState, useEffect } from 'react';
import { Utensils, Tag } from 'lucide-react';
import { Meal, MealType } from '../types';
import { useTranslation } from 'react-i18next';

interface RandomMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (meal: Meal) => void;
    meals: Meal[];
    mealSuggestions: Meal[];
    filters?: {
        tags?: string[];
        ingredients?: string[];
        mealType?: MealType;
    };
}

const getFilteredMeals = (
    meals: Meal[],
    mealSuggestions: Meal[],
    filters?: { tags?: string[]; ingredients?: string[]; mealType?: MealType }
): Meal[] => {
    const allMeals = [...meals, ...mealSuggestions];
    
    return allMeals.filter(meal => {
        if (filters?.tags && filters.tags.length > 0) {
            if (!meal.tags || meal.tags.length === 0) return false;
            const hasMatchingTag = meal.tags.some(tag => 
                filters.tags!.some(filterTag => 
                    tag.toLowerCase().includes(filterTag.toLowerCase())
                )
            );
            if (!hasMatchingTag) return false;
        }
        
        if (filters?.ingredients && filters.ingredients.length > 0) {
            if (!meal.ingredients || meal.ingredients.length === 0) return false;
            const hasMatchingIngredient = meal.ingredients.some(ing => 
                filters.ingredients!.some(filterIng => 
                    ing.text.toLowerCase().includes(filterIng.toLowerCase())
                )
            );
            if (!hasMatchingIngredient) return false;
        }
        
        return true;
    });
};

const getRandomMeal = (meals: Meal[]): Meal | null => {
    if (meals.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * meals.length);
    return meals[randomIndex];
};

export const RandomMealModal: React.FC<RandomMealModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    meals,
    mealSuggestions,
    filters
}) => {
    const { t } = useTranslation();
    const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
    const [history, setHistory] = useState<Meal[]>([]);
    const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);

    useEffect(() => {
        if (isOpen) {
            const filteredMeals = getFilteredMeals(meals, mealSuggestions, filters);
            setAvailableMeals(filteredMeals);
            const randomMeal = getRandomMeal(filteredMeals);
            setCurrentMeal(randomMeal);
            setHistory([]);
        }
    }, [isOpen, meals, mealSuggestions, filters]);

    const handleNext = () => {
        if (!currentMeal) return;
        
        const filteredMeals = getFilteredMeals(meals, mealSuggestions, filters);
        if (filteredMeals.length === 0) return;
        
        setHistory([...history, currentMeal]);
        const newMeal = getRandomMeal(filteredMeals);
        setCurrentMeal(newMeal);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        
        const newHistory = [...history];
        const previousMeal = newHistory.pop()!;
        setHistory(newHistory);
        setCurrentMeal(previousMeal);
    };

    const handleSelect = () => {
        if (!currentMeal) return;
        onSelect(currentMeal);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="random-meal-title"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            >
                <div className="p-6">
                    <h2
                        id="random-meal-title"
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                    >
                        {t('mealplan.randomMeal', 'Slumpa måltid')}
                    </h2>

                    {currentMeal ? (
                        <div className="flex items-start gap-4 mb-6">
                            {currentMeal.imageUrl ? (
                                <img
                                    src={currentMeal.imageUrl}
                                    alt={currentMeal.name}
                                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                                    <Utensils className="w-10 h-10 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {currentMeal.name}
                                </h3>
                                {currentMeal.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {currentMeal.description}
                                    </p>
                                )}
                                {currentMeal.tags && currentMeal.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {currentMeal.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                                            >
                                                <Tag size={10} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('mealplan.noMealsMatch', 'Inga måltider matchar filtren.')}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between gap-3 mt-auto">
                        <button
                            onClick={handleBack}
                            disabled={history.length === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.back', 'Tillbaka')}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={availableMeals.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.next', 'Nästa')}
                        </button>
                        <button
                            onClick={handleSelect}
                            disabled={!currentMeal}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.select', 'Välj')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
