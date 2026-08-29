import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { MealPlanEditModal } from './MealPlanEditModal';
import { MealType, Item, Meal } from '../types';
import { ChevronLeft, ChevronRight, Utensils, CalendarDays, Download, Heart, ShoppingCart, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { useMealPlan } from '../hooks/useMealPlan';
import { RecipeDetailModal } from './RecipeDetailModal';
import { exportMealPlanToICS } from '../utils/calendarUtils';
import { v4 as uuidv4 } from 'uuid';
import { getISOWeek, formatDate, getDayName } from '../utils/dateUtils';



export const MealPlanView: React.FC = () => {
    const { 
        mealPlans, 
        meals, 
        getMealText, 
        handleMealChange, 
        handleSaveToLibrary,
        copyPreviousWeek
    } = useMealPlan();
    
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { addItemsToList, defaultListId } = useApp();
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isConfirmAddIngredientsOpen, setIsConfirmAddIngredientsOpen] = useState(false);
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

    const mealCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        displayDays.forEach(date => {
            ['lunch', 'dinner'].forEach(type => {
                const text = getMealText(date, type as MealType).toLowerCase();
                if (text) {
                    counts[text] = (counts[text] || 0) + 1;
                }
            });
        });
        return counts;
    }, [displayDays, getMealText]);

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

    const handleGenerateWeeklyList = async () => {
        if (!defaultListId) {
            showToast(t('errors.noList', 'Kunde inte hitta inköpslistan'), 'error');
            return;
        }

        const itemsToAdd: Item[] = [];
        const dayMeals = ['lunch', 'dinner'] as const;

        displayDays.forEach(date => {
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
        });

        if (itemsToAdd.length === 0) {
            showToast(t('toasts.allAtHome', 'Inga ingredienser att lägga till för veckan'), 'info');
            return;
        }

        try {
            await addItemsToList(defaultListId, itemsToAdd);
            showToast(`${itemsToAdd.length} ${t('common.items', 'artiklar')} tillagda för hela veckan`, 'success');
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    const handleCopyPreviousWeek = async () => {
        const success = await copyPreviousWeek(startDate);
        if (success) {
            showToast(t('toasts.weekCopied', 'Förra veckans plan kopierad'), 'success');
        } else {
            showToast(t('toasts.noPrevWeek', 'Hittade ingen plan för förra veckan'), 'info');
        }
    };

    const handleExportToCalendar = () => {
        const exportData = displayDays.map(date => ({
            date,
            lunch: getMealText(date, 'lunch'),
            dinner: getMealText(date, 'dinner')
        }));

        const icsContent = exportMealPlanToICS(exportData);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mealplan-${formatDate(startDate)}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast(t('toasts.calendarExported', 'Måltidsplan exporterad till kalender'), 'success');
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
                            onClick={handleExportToCalendar}
                            className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors mr-2"
                            title="Exportera till kalender (.ics)"
                        >
                            <Calendar className="w-5 h-5" />
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
                     <button 
                         onClick={handleCopyPreviousWeek}
                         className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                         title="Kopiera förra veckan"
                     >
                         <CalendarDays className="w-5 h-5" />
                     </button>
                      <button 
                          onClick={() => setIsConfirmAddIngredientsOpen(true)}
                          className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                          title="Generera veckans inköpslista"
                      >
                          <ShoppingCart className="w-5 h-5" />
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
                             <div className={`grid grid-cols-1 sm:grid-cols-3 items-center gap-4 p-4 rounded-xl border ${
                                 formatDate(date) === formatDate(new Date()) 
                                 ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-blue-500' 
                                 : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                             } shadow-sm transition-all`}>
                                 <div className="flex flex-col justify-center">
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-lg">{getDayName(date)}</span>
                                         {formatDate(date) === formatDate(new Date()) && (
                                             <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white rounded-full">
                                                 Idag
                                             </span>
                                         )}
                                     </div>
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
                                      {(() => {
                                          const mealText = getMealText(date, 'lunch');
                                          const isDuplicate = mealCounts[mealText.toLowerCase()] > 1;
                                          const meal = meals.find(m => m.name.toLowerCase() === mealText.toLowerCase());
                                          const isSaved = !!meal;

                                          return (
                                              <div className="flex items-center gap-2">
                                                  <button 
                                                      onClick={() => setModalSlot({ date, type: 'lunch' })}
                                                      className={`flex-1 text-left px-3 py-2 rounded-md border transition-all group ${
                                                          mealText 
                                                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500' 
                                                          : 'bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                      }`}
                                                      >
                                                      <div className="flex items-center gap-2">
                                                          {mealText ? (
                                                              <span className={`font-medium ${isDuplicate ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                                  {mealText}
                                                              </span>
                                                          ) : (
                                                              <span className="text-gray-400 dark:text-gray-500 italic text-sm">Vad ska ätas?</span>
                                                          )}
                                                          {isDuplicate && (
                                                              <span title="Måltiden förekommer flera gånger denna vecka">
                                                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                                              </span>
                                                          )}
                                                      </div>
                                                      {meal?.tags && meal.tags.length > 0 && (
                                                          <div className="flex gap-1 mt-1">
                                                              {meal.tags.map(tag => (
                                                                  <span key={tag} className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" title={tag} />
                                                              ))}
                                                          </div>
                                                      )}
                                                      </button>
                                                      <div className="flex items-center gap-1">
                                                          <button
                                                              onClick={() => onSaveToLibraryWrapper(mealText)}
                                                              disabled={!mealText.trim() || isSaved}
                                                              className={`p-2 rounded-md transition-all ${
                                                                  isSaved 
                                                                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                                                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50'
                                                              }`}
                                                              title={isSaved ? 'Redan sparad' : 'Spara som favorit'}
                                                              >
                                                              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                                              </button>
                                                              {isSaved && (
                                                                  <button
                                                                      onClick={() => handleViewRecipe(mealText)}
                                                                      className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                      title="Visa recept"
                                                                  >
                                                                      <BookOpen className="w-4 h-4" />
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })()}
                                  </div>

                                  <div className="flex flex-col gap-1">
                                      <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <Utensils className="w-3 h-3" /> Middag
                                      </label>
                                      {(() => {
                                          const mealText = getMealText(date, 'dinner');
                                          const isDuplicate = mealCounts[mealText.toLowerCase()] > 1;
                                          const meal = meals.find(m => m.name.toLowerCase() === mealText.toLowerCase());
                                          const isSaved = !!meal;

                                          return (
                                              <div className="flex items-center gap-2">
                                                  <button 
                                                      onClick={() => setModalSlot({ date, type: 'dinner' })}
                                                      className={`flex-1 text-left px-3 py-2 rounded-md border transition-all group ${
                                                          mealText 
                                                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500' 
                                                          : 'bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                      }`}
                                                      >
                                                      <div className="flex items-center gap-2">
                                                          {mealText ? (
                                                              <span className={`font-medium ${isDuplicate ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                                  {mealText}
                                                              </span>
                                                          ) : (
                                                              <span className="text-gray-400 dark:text-gray-500 italic text-sm">Vad ska ätas?</span>
                                                          )}
                                                          {isDuplicate && (
                                                              <span title="Måltiden förekommer flera gånger denna vecka">
                                                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                                              </span>
                                                          )}
                                                      </div>
                                                      {meal?.tags && meal.tags.length > 0 && (
                                                          <div className="flex gap-1 mt-1">
                                                              {meal.tags.map(tag => (
                                                                  <span key={tag} className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" title={tag} />
                                                              ))}
                                                          </div>
                                                      )}
                                                      </button>
                                                      <div className="flex items-center gap-1">
                                                          <button
                                                              onClick={() => onSaveToLibraryWrapper(mealText)}
                                                              disabled={!mealText.trim() || isSaved}
                                                              className={`p-2 rounded-md transition-all ${
                                                                  isSaved 
                                                                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                                                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50'
                                                              }`}
                                                              title={isSaved ? 'Redan sparad' : 'Spara som favorit'}
                                                              >
                                                              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                                              </button>
                                                              {isSaved && (
                                                                  <button
                                                                      onClick={() => handleViewRecipe(mealText)}
                                                                      className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                      title="Visa recept"
                                                                  >
                                                                      <BookOpen className="w-4 h-4" />
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })()}
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

             <Modal
                 isOpen={isConfirmAddIngredientsOpen}
                 onClose={() => setIsConfirmAddIngredientsOpen(false)}
                 title={t('mealplan.addIngredientsTitle', 'Lägg till ingredienser')}
                 message={t('mealplan.addIngredientsMessage', 'Vill du lägga till alla ingredienser från de planerade måltiderna i din inköpslista?')}
                 confirmText={t('common.confirm', 'Bekräfta')}
                 onConfirm={async () => {
                     await handleGenerateWeeklyList();
                     setIsConfirmAddIngredientsOpen(false);
                 }}
             />

             <MealPlanEditModal
                 isOpen={!!modalSlot}
                 onClose={() => setModalSlot(null)}
                 initialValue={modalSlot ? getMealText(modalSlot.date, modalSlot.type) : ''}
                 meals={meals}
                 onSave={(mealName) => {
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
