import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

import { Search, X, Utensils, Eye, Calendar, ShoppingCart, Tag, Users } from 'lucide-react';
import { Meal, MealType } from '../types';
import { useMealPlan } from '../hooks/useMealPlan';
import { MealDetailModal } from './MealDetailModal';
import { PlanMealModal } from './PlanMealModal';
import { v4 as uuidv4 } from 'uuid';


export const IngredientSearchView: React.FC = () => {
    const { meals, addItemsToList, defaultListId } = useApp();
    const { t } = useTranslation();

    const { handleMealChange } = useMealPlan();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [planningMeal, setPlanningMeal] = useState<Meal | null>(null);
    
    // Accessibility refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const firstResultRef = useRef<HTMLDivElement>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter meals by ingredient search and calculate match info
    const filteredMealsWithMatches = useMemo(() => {
        const query = debouncedQuery.trim().toLowerCase();

        if (!query) return [];

        return meals.map(meal => {
            // Count matching ingredients
            const matchingIngredients = meal.ingredients?.filter(ingredient =>
                ingredient.text.toLowerCase().includes(query)
            ) || [];

            // Check if meal matches search
            const hasIngredient = matchingIngredients.length > 0;
            const hasInName = meal.name.toLowerCase().includes(query);
            const hasInDescription = meal.description?.toLowerCase().includes(query);
            const matchesSearch = hasIngredient || hasInName || hasInDescription;

            return {
                meal,
                matchesSearch,
                matchingIngredients,
                matchCount: matchingIngredients.length
            };
        }).filter(item => item.matchesSearch);
    }, [meals, debouncedQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Keyboard navigation handlers
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Escape key clears search and refocuses input
        if (e.key === 'Escape' && searchQuery) {
            handleClearSearch();
            e.preventDefault();
        }
        
        // Down arrow moves focus to first result when results exist
        if (e.key === 'ArrowDown' && filteredMealsWithMatches.length > 0 && searchQuery) {
            if (firstResultRef.current) {
                firstResultRef.current.focus();
                e.preventDefault();
            }
        }
    }, [searchQuery, filteredMealsWithMatches.length]);

    // Focus first result when search has results
    useEffect(() => {
        if (filteredMealsWithMatches.length > 0 && searchQuery && firstResultRef.current) {
            // Don't auto-focus on initial render, only when user has typed
            if (searchQuery.length > 0) {
                // firstResultRef will be set by the first result card
            }
        }
    }, [filteredMealsWithMatches.length, searchQuery]);

    const handleViewMealDetails = (meal: Meal) => {
        setSelectedMeal(meal);
        setIsDetailModalOpen(true);
    };

    const handlePlanMeal = (meal: Meal) => {
        setPlanningMeal(meal);
        setIsPlanModalOpen(true);
    };

    const handleSavePlannedMeal = (date: Date, type: MealType) => {
        if (planningMeal) {
            handleMealChange(date, type, planningMeal.name);
            setIsPlanModalOpen(false);
            setPlanningMeal(null);
        }
    };

    const handleAddToShoppingList = async (meal: Meal) => {
        if (!defaultListId) return;

        try {
            const itemsToAdd = meal.ingredients?.map(ingredient => ({
                id: uuidv4(),
                text: `${ingredient.amount ? ingredient.amount + ' ' : ''}${ingredient.text}`.trim(),
                completed: false
            })) || [];

            if (itemsToAdd.length > 0) {
                await addItemsToList(defaultListId, itemsToAdd);
            }
        } catch (error) {
            console.error('Failed to add items to shopping list:', error);
        }
    };

    return (
        <div className="space-y-6" role="main" aria-label={t('ingredientSearch.title', 'Search by Ingredient')}>
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        {t('ingredientSearch.title', 'Search by Ingredient')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('ingredientSearch.subtitle', 'Find recipes containing specific ingredients')}
                    </p>
                </div>
            </header>

            {/* Search Input */}
            <form 
                role="search" 
                aria-label={t('ingredientSearch.title', 'Search by Ingredient')}
                onSubmit={(e) => e.preventDefault()}
                className="relative"
            >
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('ingredientSearch.placeholder', 'Search by ingredient...')}
                    autoFocus
                    aria-label={t('ingredientSearch.placeholder', 'Search by ingredient...')}
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={filteredMealsWithMatches.length > 0}
                    className="w-full pl-12 pr-12 py-3.5 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        aria-label={t('common.clear', 'Clear search')}
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                )}
            </form>

            {/* Results Summary */}
            {debouncedQuery && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredMealsWithMatches.length > 0 
                        ? t('ingredientSearch.foundResults', { count: filteredMealsWithMatches.length })
                        : t('ingredientSearch.noResults', { query: debouncedQuery })}
                </div>
            )}

            {/* Search Results */}
            <div className="space-y-4">
                {filteredMealsWithMatches.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMealsWithMatches.map(({ meal, matchingIngredients, matchCount }) => (
                            <div 
                                key={meal.id}
                                className="bg-white dark:bg-gray-900/70 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-blue-300/20 dark:hover:border-blue-700/20 transition-all "
                            >
                                <div className="flex items-start gap-4">
                                    {/* Recipe Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                        {meal.imageUrl ? (
                                            <img 
                                                src={meal.imageUrl} 
                                                alt={meal.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <Utensils className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    
                                    {/* Recipe Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white  truncate">
                                            {meal.name}
                                        </h3>
                                        
                                        {/* Tags */}
                                        {meal.tags && meal.tags.length > 0 && (
                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                {meal.tags.slice(0, 3).map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {meal.tags.length > 3 && (
                                                    <span className="text-xs text-gray-400">+{meal.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Match Info & Servings */}
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {matchCount > 0 && (
                                                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {matchCount} {t('ingredientSearch.matching')}
                                                </span>
                                            )}

                                            {meal.servings && (
                                                <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {meal.servings}
                                                </span>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {meal.tags && meal.tags.length > 0 && (
                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                {meal.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {meal.tags.length > 3 && (
                                                    <span className="text-xs text-gray-400">+{meal.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Matching Ingredients Preview */}
                                        {matchingIngredients.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                                    {t('ingredientSearch.matching')}:
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {matchingIngredients.map(i => i.text).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 px-4 pb-4">
                                        <button
                                            onClick={() => handleAddToShoppingList(meal)}
                                            className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                            title={t('ingredientSearch.addToShoppingList')}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlePlanMeal(meal)}
                                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                            title={t('ingredientSearch.planMeal')}
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleViewMealDetails(meal)}
                                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                            title={t('ingredientSearch.viewDetails')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    debouncedQuery && (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t('ingredientSearch.noResults', { query: debouncedQuery })}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('ingredientSearch.tryDifferent', 'Try searching for a different ingredient')}
                            </p>
                        </div>
                    )
                )}

                {/* Empty State - No Search */}
                {!debouncedQuery && meals.length === 0 && (
                    <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                            <Utensils className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {t('meals.noMeals', 'No recipes yet')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('meals.addFirstRecipe', 'Add your first recipe to start searching by ingredients')}
                        </p>
                    </div>
                )}

                {/* Empty State - No Search but Has Meals */}
                {!debouncedQuery && meals.length > 0 && (
                    <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {t('ingredientSearch.startSearching', 'Start searching by ingredient')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('ingredientSearch.enterIngredient', 'Enter an ingredient name to find recipes that contain it')}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedMeal && (
                <MealDetailModal
                    meal={selectedMeal}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}

            {planningMeal && (
                <PlanMealModal
                    isOpen={isPlanModalOpen}
                    onClose={() => {
                        setIsPlanModalOpen(false);
                        setPlanningMeal(null);
                    }}
                    onSave={handleSavePlannedMeal}
                    meal={planningMeal}
                />
            )}
        </div>
    );
};