import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DayPlan, PlannedMeal, MealType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';

export const MealPlanView: React.FC = () => {
    const { mealPlans, addMealPlan, updateMealPlan } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate the Monday of the current week
    const weekStart = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    }, [currentDate]);

    const weekNumber = useMemo(() => {
        const date = new Date(weekStart);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }, [weekStart]);

    const year = weekStart.getFullYear();

    // Find the meal plan for the current week
    const currentPlan = useMemo(() => {
        return mealPlans.find(p => p.weekNumber === weekNumber && p.year === year);
    }, [mealPlans, weekNumber, year]);

    const daysOfWeek = [
        { name: 'Måndag', offset: 0 },
        { name: 'Tisdag', offset: 1 },
        { name: 'Onsdag', offset: 2 },
        { name: 'Torsdag', offset: 3 },
        { name: 'Fredag', offset: 4 },
        { name: 'Lördag', offset: 5 },
        { name: 'Söndag', offset: 6 },
    ];

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
        setCurrentDate(newDate);
    };

    const handleMealChange = async (dayIndex: number, type: MealType, text: string) => {
        let plan = currentPlan;

        // If no plan exists for this week, create one
        if (!plan) {
            const newPlanId = uuidv4();
            const days: DayPlan[] = daysOfWeek.map((_day, idx) => {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + idx);
                return {
                    date: date.toISOString().split('T')[0],
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

        await updateMealPlan(plan.id, { days: updatedDays });
    };

    const getMealText = (dayIndex: number, type: MealType) => {
        if (!currentPlan) return '';
        const day = currentPlan.days[dayIndex];
        if (!day) return '';
        const meal = day.meals.find(m => m.type === type);
        return meal?.plannedMeal.customTitle || '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Måltidsschema</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Vecka {weekNumber} • {year}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigateWeek('prev')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Föregående vecka"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Idag
                    </button>
                    <button 
                        onClick={() => navigateWeek('next')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Nästa vecka"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 gap-4">
                {daysOfWeek.map((day, idx) => {
                    const date = new Date(weekStart);
                    date.setDate(weekStart.getDate() + idx);
                    const dateString = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
                    const hasLunch = getMealText(idx, 'lunch').length > 0;

                    return (
                        <div 
                            key={day.name} 
                            className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{day.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{dateString}</span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                {hasLunch ? (
                                    <>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Utensils className="w-3 h-3" /> Lunch
                                        </label>
                                        <input 
                                            type="text"
                                            value={getMealText(idx, 'lunch')}
                                            onChange={(e) => handleMealChange(idx, 'lunch', e.target.value)}
                                            placeholder="Vad ska ätas?"
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleMealChange(idx, 'lunch', '')}
                                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-left flex items-center gap-1 transition-colors"
                                    >
                                        + Lägg till lunch
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Utensils className="w-3 h-3" /> Middag
                                </label>
                                <input 
                                    type="text"
                                    value={getMealText(idx, 'dinner')}
                                    onChange={(e) => handleMealChange(idx, 'dinner', e.target.value)}
                                    placeholder="Vad ska ätas?"
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};