import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, X, Utensils } from 'lucide-react';


export const IngredientSearchView: React.FC = () => {
    const { meals } = useApp();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter meals by ingredient search
    const filteredMeals = useMemo(() => {
        const query = debouncedQuery.trim().toLowerCase();
        
        if (!query) return [];
        
        return meals.filter(meal => {
            // Search in ingredients
            const hasIngredient = meal.ingredients?.some(ingredient => 
                ingredient.text.toLowerCase().includes(query)
            );
            
            // Also search in meal name and description as fallback
            const hasInName = meal.name.toLowerCase().includes(query);
            const hasInDescription = meal.description?.toLowerCase().includes(query);
            
            return hasIngredient || hasInName || hasInDescription;
        });
    }, [meals, debouncedQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleViewMealDetails = () => {
        navigate('/meals');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        {t('ingredientSearch.title', 'Search by Ingredient')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('ingredientSearch.subtitle', 'Find recipes containing specific ingredients')}
                    </p>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('ingredientSearch.placeholder', 'Search by ingredient...')}
                    autoFocus
                    className="w-full pl-12 pr-12 py-3.5 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        aria-label={t('common.clear', 'Clear search')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Results Summary */}
            {debouncedQuery && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredMeals.length > 0 
                        ? t('ingredientSearch.foundResults', { count: filteredMeals.length })
                        : t('ingredientSearch.noResults', { query: debouncedQuery })}
                </div>
            )}

            {/* Search Results */}
            <div className="space-y-4">
                {filteredMeals.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMeals.map((meal) => (
                            <div 
                                key={meal.id}
                                onClick={handleViewMealDetails}
                                className="bg-white dark:bg-gray-900/70 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-blue-300/20 dark:hover:border-blue-700/20 transition-all cursor-pointer group"
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
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
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

                                        {/* Ingredients Preview */}
                                        {meal.ingredients && meal.ingredients.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {meal.ingredients.map(i => i.text).join(', ')}
                                                </p>
                                            </div>
                                        )}
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
        </div>
    );
};