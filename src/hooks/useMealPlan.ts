import { useApp } from '../context/AppContext';
import { DayPlan, PlannedMeal, MealType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getISOWeek, formatDate } from '../utils/dateUtils';

export const useMealPlan = () => {
    const { mealPlans, addMealPlan, updateMealPlan, meals, addMeal } = useApp();

    const getPlanForDate = (date: Date) => {
        const { weekNumber, year } = getISOWeek(date);
        return mealPlans.find(p => p.weekNumber === weekNumber && p.year === year);
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

    const handleMealChange = async (date: Date, type: MealType, text: string) => {
        const { weekNumber, year } = getISOWeek(date);
        let plan = mealPlans.find(p => p.weekNumber === weekNumber && p.year === year);
        const dateStr = formatDate(date);

        if (!plan) {
            const newPlanId = uuidv4();
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
            return true;
        }
        return false;
    };

    return {
        mealPlans,
        meals,
        getPlanForDate,
        getMealText,
        handleMealChange,
        handleSaveToLibrary
    };
};