import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { MealSelectionModal } from './MealSelectionModal';
import { MealType, Item, Meal } from '../types';
import { InlineAutocompleteInput } from './InlineAutocompleteInput';
import { ChevronLeft, ChevronRight, Utensils, CalendarDays, Download, Heart, Plus, ShoppingCart, BookOpen } from 'lucide-react';
import { useMealPlan } from '../hooks/useMealPlan';
import { RecipeDetailModal } from './RecipeDetailModal';
import { v4 as uuidv4 } from 'uuid';
import { getISOWeek, formatDate, getDayName } from '../utils/dateUtils';

const MealInput: React.FC<{
    initialValue: string;
    placeholder: string;
    onSave: (value: string) => void;
    suggestions: Array<{ id: string; text: string }>;
    isSaved: boolean;
    onSaveToLibrary: (value: string) => void;
    onOpenModal?: () => void;
    autoFocus?: boolean;
    onViewRecipe?: () => void;
    hasRecipe?: boolean;
}> = ({ initialValue, placeholder, onSave, suggestions, isSaved, onSaveToLibrary, onOpenModal, autoFocus, onViewRecipe, hasRecipe }) => {
    const [value, setValue] = useState(initialValue);

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = () => {
        if (value !== initialValue) {
            onSave(value);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!value.trim() && onOpenModal && (
                <button
                    onClick={onOpenModal}
                    className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Välj från favoriter"
                >
                    <Plus className="w-5 h-5" />
                </button>
            )}
            <InlineAutocompleteInput
                value={value}
                onChange={setValue}
                onSubmit={handleSave}
                onBlur={handleSave}
                suggestions={suggestions}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
                onClick={() => onSaveToLibrary(value)}
                disabled={!value.trim() || isSaved}
                className={`p-2 rounded-md transition-all ${
                    isSaved 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent'
                }`}
                title={isSaved ? 'Redan sparad' : 'Spara som favorit'}
            >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            {hasRecipe && onViewRecipe && (
                <button
                    onClick={onViewRecipe}
                    className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Visa recept"
                >
                    <BookOpen className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export const MealPlanView: React.FC = () => {
    const { 
        mealPlans, 
        meals, 
        getMealText, 
        handleMealChange, 
        handleSaveToLibrary 
    } = useMealPlan();
    
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { addItemsToList, defaultListId } = useApp();
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [recipeViewMeal, setRecipeViewMeal] = useState<Meal | null>(null);
    const [modalSlot, setModalSlot] = useState<{ date: Date; type: MealType } | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const navigateDays = (direction: 'prev' | 'next') => {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + (direction === 'prev' ? -7 : 7));
        setStartDate(newDate);
    };

    const resetToToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setStartDate(d);
    };

    const displayDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    const onSaveToLibraryWrapper = async (text: string) => {
        const success = await handleSaveToLibrary(text);
        if (success) {
            showToast('Måltid sparad till favoriter', 'success');
        }
    };

    const handleViewRecipe = (mealText: string) => {
        const meal = meals.find(m => m.name.toLowerCase() === mealText.toLowerCase());
        if (meal) {
            setRecipeViewMeal(meal);
        }
    };

    const handleAddDayIngredientsToList = async (date: Date) => {
        if (!defaultListId) {
            showToast(t('errors.noList', 'Kunde inte hitta inköpslistan'), 'error');
            return;
        }

        const dayMeals = ['lunch', 'dinner'] as const;
        const itemsToAdd: Item[] = [];

        dayMeals.forEach(type => {
            const mealText = getMealText(date, type);
            const meal = meals.find(m => m.name.toLowerCase() === mealText.toLowerCase());
            if (meal && meal.ingredients) {
                meal.ingredients
                    .filter(ing => !ing.checkIfExistAtHome)
                    .forEach(ing => {
                        itemsToAdd.push({
                            id: uuidv4(),
                            text: `${ing.amount ? ing.amount + ' ' : ''}${ing.text}`,
                            completed: false,
                        });
                    });
            }
        });

        if (itemsToAdd.length === 0) {
            showToast(t('toasts.allAtHome', 'Inga ingredienser att lägga till'), 'info');
            return;
        }

        try {
            await addItemsToList(defaultListId, itemsToAdd);
            showToast(`${itemsToAdd.length} ${t('common.items', 'artiklar')} tillagda i inköpslistan`, 'success');
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    let lastRenderedWeekNumber = -1;

    const exportJSON = useMemo(() => {
        if (!isExportOpen) return '';
        const exportData = displayDays.map(date => {
            return {
                date: formatDate(date),
                day: getDayName(date),
                lunch: getMealText(date, 'lunch'),
                dinner: getMealText(date, 'dinner')
            };
        });
        return JSON.stringify({
            exportDate: new Date().toISOString().split('T')[0],
            mealPlan: exportData
        }, null, 2);
    }, [isExportOpen, displayDays, mealPlans]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Måltidsschema</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Rullande 7-dagarsvy
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsExportOpen(true)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors mr-2"
                        title="Exportera till JSON"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => navigateDays('prev')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Backa 7 dagar"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={resetToToday}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Börja från idag"
                    >
                        Idag
                    </button>
                    <button 
                        onClick={() => navigateDays('next')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Framåt 7 dagar"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {displayDays.map((date) => {
                    const { weekNumber } = getISOWeek(date);
                    const showWeekHeader = weekNumber !== lastRenderedWeekNumber;
                    lastRenderedWeekNumber = weekNumber;
                    
                    const dateString = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });

                    return (
                        <React.Fragment key={date.toISOString()}>
                            {showWeekHeader && (
                                <div className="mt-4 mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <CalendarDays className="w-5 h-5" />
                                    <h3 className="text-lg font-bold">
                                        Vecka {weekNumber}
                                    </h3>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                                <div className="flex flex-col justify-center">
                                    <span className="font-bold text-lg">{getDayName(date)}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{dateString}</span>
                                    
                                    {/* Add ingredients button for the day */}
                                    <button 
                                        onClick={() => handleAddDayIngredientsToList(date)}
                                        className="mt-2 p-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                        title="Lägg till dagens ingredienser i listan"
                                    >
                                        <ShoppingCart className="w-3 h-3" />
                                        Lista
                                    </button>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Utensils className="w-3 h-3" /> Lunch
                                    </label>
                                    <MealInput 
                                        initialValue={getMealText(date, 'lunch')}
                                        onSave={(val) => handleMealChange(date, 'lunch', val)}
                                        suggestions={meals.map(m => ({ id: m.id, text: m.name }))}
                                        isSaved={meals.some(m => m.name.toLowerCase() === getMealText(date, 'lunch').toLowerCase())}
                                        onSaveToLibrary={onSaveToLibraryWrapper}
                                        onOpenModal={() => setModalSlot({ date, type: 'lunch' })}
                                        placeholder="Vad ska ätas?"
                                        hasRecipe={meals.some(m => m.name.toLowerCase() === getMealText(date, 'lunch').toLowerCase())}
                                        onViewRecipe={() => handleViewRecipe(getMealText(date, 'lunch'))}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Utensils className="w-3 h-3" /> Middag
                                    </label>
                                    <MealInput 
                                        initialValue={getMealText(date, 'dinner')}
                                        onSave={(val) => handleMealChange(date, 'dinner', val)}
                                        suggestions={meals.map(m => ({ id: m.id, text: m.name }))}
                                        isSaved={meals.some(m => m.name.toLowerCase() === getMealText(date, 'dinner').toLowerCase())}
                                        onSaveToLibrary={onSaveToLibraryWrapper}
                                        onOpenModal={() => setModalSlot({ date, type: 'dinner' })}
                                        placeholder="Vad ska ätas?"
                                        hasRecipe={meals.some(m => m.name.toLowerCase() === getMealText(date, 'dinner').toLowerCase())}
                                        onViewRecipe={() => handleViewRecipe(getMealText(date, 'dinner'))}
                                    />
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            <Modal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                title="Exportera Måltidsplan"
                message="Här är din måltidsplan för de valda dagarna i JSON-format. Du kan enkelt kopiera detta och använda i andra appar."
                confirmText="Kopiera till urklipp"
                onConfirm={() => {
                    navigator.clipboard.writeText(exportJSON);
                    showToast('JSON kopierad till urklipp', 'success');
                }}
            >
                <div className="relative">
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto custom-scrollbar">
                        {exportJSON}
                    </pre>
                </div>
            </Modal>

            <MealSelectionModal
                isOpen={!!modalSlot}
                onClose={() => setModalSlot(null)}
                meals={meals}
                mealPlans={mealPlans}
                onSelect={(mealName) => {
                    if (modalSlot) {
                        handleMealChange(modalSlot.date, modalSlot.type, mealName);
                    }
                }}
            />

            <RecipeDetailModal 
                isOpen={!!recipeViewMeal} 
                onClose={() => setRecipeViewMeal(null)} 
                meal={recipeViewMeal} 
            />
        </div>
    );
};