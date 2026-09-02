import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Meal, MealPlan } from '../types';
import { 
    CheckCircle2, 
    Utensils, 
    Sparkles, 
    Clock, 
    Tag, 
    Eye, 
    History, 
    Bookmark, 
    Flame,
    X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MealPlanEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
    meals: Meal[];
    mealSuggestions?: Meal[];
    mealPlans?: MealPlan[];
    onSave: (value: string) => void;
    onPreviewRecipe?: (meal: Meal) => void;
}

export const MealPlanEditModal: React.FC<MealPlanEditModalProps> = ({ 
    isOpen, 
    onClose, 
    initialValue, 
    meals = [], 
    mealSuggestions = [],
    mealPlans = [],
    onSave,
    onPreviewRecipe
}) => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const [activeTab, setActiveTab] = useState<'myMeals' | 'inspiration' | 'quickNotes'>('myMeals');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue || '');
            setSelectedTag(null);
            // Default to 'myMeals', or 'inspiration' if user has no saved meals yet
            if (meals.length === 0 && mealSuggestions.length > 0) {
                setActiveTab('inspiration');
            } else {
                setActiveTab('myMeals');
            }
        }
    }, [isOpen, initialValue, meals.length, mealSuggestions.length]);

    // Extract recently planned meals from mealPlans
    const recentMeals = useMemo(() => {
        const mealMap = new Map<string, number>();
        mealPlans.forEach(plan => {
            plan.days?.forEach(day => {
                day.meals?.forEach(m => {
                    const title = m.plannedMeal?.customTitle?.trim();
                    if (title) {
                        mealMap.set(title, (mealMap.get(title) || 0) + 1);
                    }
                });
            });
        });
        return Array.from(mealMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);
    }, [mealPlans]);

    // Standard quick notes
    const quickNotes = useMemo(() => [
        t('mealplan.quickNoteEatingOut', 'Äta ute'),
        t('mealplan.quickNoteLeftovers', 'Rester'),
        t('mealplan.quickNoteTakeaway', 'Takeaway / Pizza'),
        t('mealplan.quickNoteDinnerParty', 'Middag med vänner')
    ], [t]);

    // Available tags for active tab
    const availableTags = useMemo(() => {
        const sourceMeals = activeTab === 'myMeals' ? meals : activeTab === 'inspiration' ? mealSuggestions : [];
        const tagSet = new Set<string>();
        sourceMeals.forEach(m => {
            m.tags?.forEach(tag => {
                if (tag.trim()) tagSet.add(tag.trim());
            });
        });
        return Array.from(tagSet);
    }, [activeTab, meals, mealSuggestions]);

    // Filtered meals for My Recipes
    const filteredMyMeals = useMemo(() => {
        const query = value.trim().toLowerCase();
        return meals.filter(meal => {
            const matchesQuery = !query || meal.name.toLowerCase().includes(query) || (meal.description && meal.description.toLowerCase().includes(query));
            const matchesTag = !selectedTag || (meal.tags && meal.tags.some(tg => tg.toLowerCase() === selectedTag.toLowerCase()));
            return matchesQuery && matchesTag;
        });
    }, [meals, value, selectedTag]);

    // Filtered suggestions for Inspiration
    const filteredSuggestions = useMemo(() => {
        const query = value.trim().toLowerCase();
        return mealSuggestions.filter(meal => {
            const matchesQuery = !query || meal.name.toLowerCase().includes(query) || (meal.description && meal.description.toLowerCase().includes(query));
            const matchesTag = !selectedTag || (meal.tags && meal.tags.some(tg => tg.toLowerCase() === selectedTag.toLowerCase()));
            return matchesQuery && matchesTag;
        });
    }, [mealSuggestions, value, selectedTag]);

    if (!isOpen) return null;

    const handleSelectMeal = (mealName: string) => {
        setValue(mealName);
    };

    const renderMealCard = (meal: Meal) => {
        const isSelected = value.trim().toLowerCase() === meal.name.trim().toLowerCase();
        const ingredientCount = meal.ingredients?.length || 0;

        return (
            <div
                key={meal.id}
                onClick={() => handleSelectMeal(meal.name)}
                className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 shadow-sm' 
                        : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {meal.imageUrl ? (
                        <img 
                            src={meal.imageUrl} 
                            alt={meal.name} 
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}>
                            <Utensils className="w-5 h-5" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm truncate ${
                                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                                {meal.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {ingredientCount > 0 && (
                                <span className="inline-flex items-center text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                                    {t('mealplan.ingredientsCount', { count: ingredientCount })}
                                </span>
                            )}
                            {meal.tags?.slice(0, 2).map(tag => (
                                <span 
                                    key={tag} 
                                    className="inline-flex items-center text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {onPreviewRecipe && (meal.ingredients?.length || meal.instructions?.length || meal.description) && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreviewRecipe(meal);
                        }}
                        title={t('mealplan.previewRecipe', 'Granska recept')}
                        className="p-2 ml-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            onConfirm={() => {
                onSave(value);
                onClose();
            }} 
            title={t('common.editMeal', 'Redigera måltid')} 
            message={t('mealPlan.editMessage', 'Skriv in vad som ska ätas eller välj från dina favoriter.')}
            confirmText={t('common.save', 'Spara')}
        >
            <div className="space-y-4">
                {/* Search & Custom input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-blue-500" /> {t('common.name', 'Måltid / Anteckning')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm shadow-sm pr-9"
                            placeholder={t('mealPlan.placeholder', 'Vad ska ätas?')}
                            autoFocus
                        />
                        {value && (
                            <button
                                type="button"
                                onClick={() => setValue('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 gap-1 pt-1 overflow-x-auto custom-scrollbar flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('myMeals');
                            setSelectedTag(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                            activeTab === 'myMeals'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        {t('mealplan.tabs.myMeals', 'Mina Recept')}
                        {meals.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-600 dark:text-gray-400">
                                {meals.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('inspiration');
                            setSelectedTag(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                            activeTab === 'inspiration'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {t('mealplan.tabs.inspiration', 'Inspiration')}
                        {mealSuggestions.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-amber-50 dark:bg-amber-900/30 rounded-full text-[10px] text-amber-600 dark:text-amber-400">
                                {mealSuggestions.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('quickNotes');
                            setSelectedTag(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                            activeTab === 'quickNotes'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <History className="w-3.5 h-3.5" />
                        {t('mealplan.tabs.quickNotes', 'Snabbval')}
                    </button>
                </div>

                {/* Tag Filters (for My Meals & Inspiration) */}
                {activeTab !== 'quickNotes' && availableTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedTag(null)}
                            className={`px-2.5 py-1 rounded-full font-medium transition-all flex-shrink-0 ${
                                selectedTag === null
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {t('mealplan.allTags', 'Alla')}
                        </button>
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`px-2.5 py-1 rounded-full font-medium transition-all flex-shrink-0 flex items-center gap-1 ${
                                    selectedTag === tag
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Tag className="w-2.5 h-2.5" />
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tab Contents */}
                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {/* 1. My Recipes */}
                    {activeTab === 'myMeals' && (
                        <>
                            {filteredMyMeals.length === 0 ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                                    <Utensils className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                    <p>
                                        {meals.length === 0 
                                            ? t('common.noMeals', 'Inga sparade måltider hittades.')
                                            : t('mealplan.noMealsMatch', 'Inga måltider matchar filtren.')}
                                    </p>
                                </div>
                            ) : (
                                filteredMyMeals.map(renderMealCard)
                            )}
                        </>
                    )}

                    {/* 2. Inspiration */}
                    {activeTab === 'inspiration' && (
                        <>
                            {filteredSuggestions.length === 0 ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-300 dark:text-amber-700" />
                                    <p>{t('mealplan.noMealsMatch', 'Inga måltider matchar filtren.')}</p>
                                </div>
                            ) : (
                                filteredSuggestions.map(renderMealCard)
                            )}
                        </>
                    )}

                    {/* 3. Quick Options */}
                    {activeTab === 'quickNotes' && (
                        <div className="space-y-4 py-1">
                            {/* Standard notes */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-500" /> {t('mealplan.quickNotesTitle', 'Vanliga snabbval')}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickNotes.map((note) => {
                                        const isSelected = value.trim().toLowerCase() === note.toLowerCase();
                                        return (
                                            <button
                                                key={note}
                                                type="button"
                                                onClick={() => handleSelectMeal(note)}
                                                className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition-all ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <span>{note}</span>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent meals */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {t('mealplan.recentMeals', 'Senast planerade')}
                                </label>
                                {recentMeals.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                                        {t('mealplan.noRecentMeals', 'Inga tidigare måltider hittades.')}
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {recentMeals.slice(0, 6).map((mealName) => {
                                            const isSelected = value.trim().toLowerCase() === mealName.toLowerCase();
                                            return (
                                                <button
                                                    key={mealName}
                                                    type="button"
                                                    onClick={() => handleSelectMeal(mealName)}
                                                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <span className="truncate">{mealName}</span>
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};