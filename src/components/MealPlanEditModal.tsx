import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Meal } from '../types';
import { CheckCircle2, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MealPlanEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
    meals: Meal[];
    onSave: (value: string) => void;
}

export const MealPlanEditModal: React.FC<MealPlanEditModalProps> = ({ 
    isOpen, 
    onClose, 
    initialValue, 
    meals, 
    onSave 
}) => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    const filteredMeals = useMemo(() => {
        const query = value.trim().toLowerCase();
        if (!query) return meals;
        return meals.filter(meal => meal.name.toLowerCase().includes(query));
    }, [meals, value]);

    if (!isOpen) return null;

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
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3 h-3" /> {t('common.name', 'Måltid')}
                    </label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder={t('mealPlan.placeholder', 'Vad ska ätas?')}
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('common.favorites', 'Favoriter')}
                    </label>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {filteredMeals.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 text-sm">
                                {meals.length === 0 
                                    ? t('common.noMeals', 'Inga sparade måltider hittades.')
                                    : t('mealplan.noMealsMatch', 'Inga måltider matchar filtren.')}
                            </p>
                        ) : (
                            filteredMeals.map(meal => (
                                <button
                                    key={meal.id}
                                    type="button"
                                    onClick={() => setValue(meal.name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group ${
                                        value.toLowerCase() === meal.name.toLowerCase() 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className={`font-medium ${
                                        value.toLowerCase() === meal.name.toLowerCase() 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                        {meal.name}
                                    </span>
                                    {value.toLowerCase() === meal.name.toLowerCase() && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};