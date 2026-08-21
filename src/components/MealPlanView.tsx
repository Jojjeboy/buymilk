import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { DayPlan, PlannedMeal, MealType } from '../types';
import { InlineAutocompleteInput } from './InlineAutocompleteInput';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Utensils, CalendarDays, Download, Heart } from 'lucide-react';

// Helpers
const getISOWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { weekNumber: weekNo, year: d.getFullYear() };
};

const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
const getDayName = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    
    let name = dayNames[date.getDay()];
    if (diff === 0) name += ' (Idag)';
    else if (diff === 1) name += ' (Imorgon)';
    return name;
};

const MealInput: React.FC<{
    initialValue: string;
    placeholder: string;
    onSave: (value: string) => void;
    suggestions: Array<{ id: string; text: string }>;
    isSaved: boolean;
    onSaveToLibrary: (value: string) => void;
    autoFocus?: boolean;
}> = ({ initialValue, placeholder, onSave, suggestions, isSaved, onSaveToLibrary, autoFocus }) => {
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
        </div>
    );
};

export const MealPlanView: React.FC = () => {
    const { mealPlans, addMealPlan, updateMealPlan, meals, addMeal } = useApp();
    const { showToast } = useToast();
    const [isExportOpen, setIsExportOpen] = useState(false);
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

    // Generate the next 7 days
    const displayDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    const getPlanForDate = (date: Date) => {
        const { weekNumber, year } = getISOWeek(date);
        return mealPlans.find(p => p.weekNumber === weekNumber && p.year === year);
    };

    const handleMealChange = async (date: Date, type: MealType, text: string) => {
        const { weekNumber, year } = getISOWeek(date);
        let plan = mealPlans.find(p => p.weekNumber === weekNumber && p.year === year);
        const dateStr = formatDate(date);

        // If no plan exists for this week, create one
        if (!plan) {
            const newPlanId = uuidv4();
            
            // Generate all 7 days for that ISO week to maintain consistency
            const monday = new Date(date);
            const day = monday.getDay();
            const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
            monday.setDate(diff);
            
            const days: DayPlan[] = Array.from({ length: 7 }).map((_, idx) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + idx);
                return {
                    date: formatDate(d),
                    meals: []
                };
            });

            plan = {
                id: newPlanId,
                weekNumber,
                year,
                days
            };
            await addMealPlan(plan);
        }

        const updatedDays = [...plan.days];
        const dayIndex = updatedDays.findIndex(d => d.date === dateStr);
        
        if (dayIndex >= 0) {
            const day = updatedDays[dayIndex];
            const mealIndex = day.meals.findIndex(m => m.type === type);
            const mealData: PlannedMeal = {
                id: mealIndex >= 0 ? day.meals[mealIndex].plannedMeal.id : uuidv4(),
                customTitle: text
            };

            if (mealIndex >= 0) {
                day.meals[mealIndex] = { type, plannedMeal: mealData };
            } else {
                day.meals.push({ type, plannedMeal: mealData });
            }
        } else {
            const mealData: PlannedMeal = {
                id: uuidv4(),
                customTitle: text
            };
            updatedDays.push({
                date: dateStr,
                meals: [{ type, plannedMeal: mealData }]
            });
            updatedDays.sort((a, b) => a.date.localeCompare(b.date));
        }

        await updateMealPlan(plan.id, { days: updatedDays });
    };

    const handleSaveToLibrary = async (text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        const exists = meals.some(m => m.name.toLowerCase() === trimmedText.toLowerCase());
        if (!exists) {
            await addMeal(trimmedText);
            showToast('Måltid sparad till favoriter', 'success');
        }
    };

    const getMealText = (date: Date, type: MealType) => {
        const plan = getPlanForDate(date);
        if (!plan) return '';
        const dateStr = formatDate(date);
        const day = plan.days.find(d => d.date === dateStr);
        if (!day) return '';
        const meal = day.meals.find(m => m.type === type);
        return meal?.plannedMeal.customTitle || '';
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
            {/* Header */}
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

            {/* Daily Grid */}
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
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg">{getDayName(date)}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{dateString}</span>
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
                                          onSaveToLibrary={handleSaveToLibrary}
                                          placeholder="Vad ska ätas?"
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
                                          onSaveToLibrary={handleSaveToLibrary}
                                          placeholder="Vad ska ätas?"
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
        </div>
    );
};