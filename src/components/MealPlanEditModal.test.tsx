import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MealPlanEditModal } from './MealPlanEditModal';
import { Meal, MealPlan } from '../types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMeals: Meal[] = [
    { id: '1', name: 'Pasta Bolognese', description: 'God pasta med köttfärssås', tags: ['Pasta', 'Kött'], ingredients: [{ text: 'Pasta' }, { text: 'Köttfärs' }], imageUrl: '', createdAt: '' },
    { id: '2', name: 'Vegetarisk Curry', description: 'Mild curry med kikärtor', tags: ['Vegetariskt', 'Snabbt'], ingredients: [{ text: 'Kikärtor' }], imageUrl: '', createdAt: '' }
];

const mockSuggestions: Meal[] = [
    { id: 's1', name: 'Lax i ugn', description: 'Ugnsbakad laxfilé', tags: ['Fisk', 'Snabbt'], ingredients: [{ text: 'Lax' }, { text: 'Citron' }], imageUrl: '', createdAt: '' }
];

const mockMealPlans: MealPlan[] = [
    {
        id: 'p1',
        weekNumber: 35,
        year: 2026,
        days: [
            {
                date: '2026-08-25',
                meals: [
                    { type: 'dinner', plannedMeal: { id: 'pm1', customTitle: 'Tacos' } }
                ]
            }
        ]
    }
];

describe('MealPlanEditModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnPreviewRecipe = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders tabs and favorite meals when open', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
                onPreviewRecipe={mockOnPreviewRecipe}
            />
        );

        expect(screen.getByText('Mina Recept')).toBeInTheDocument();
        expect(screen.getByText('Inspiration')).toBeInTheDocument();
        expect(screen.getByText('Snabbval')).toBeInTheDocument();

        expect(screen.getByText('Pasta Bolognese')).toBeInTheDocument();
        expect(screen.getByText('Vegetarisk Curry')).toBeInTheDocument();
    });

    it('filters favorite meals based on search text and tag click', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
            />
        );

        // Click tag 'Vegetariskt'
        const tagBtn = screen.getByRole('button', { name: /Vegetariskt/i });
        fireEvent.click(tagBtn);

        expect(screen.getByText('Vegetarisk Curry')).toBeInTheDocument();
        expect(screen.queryByText('Pasta Bolognese')).not.toBeInTheDocument();
    });

    it('switches to Inspiration tab and shows suggestions', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
                onPreviewRecipe={mockOnPreviewRecipe}
            />
        );

        const inspirationTab = screen.getByRole('button', { name: /Inspiration/i });
        fireEvent.click(inspirationTab);

        expect(screen.getByText('Lax i ugn')).toBeInTheDocument();
        expect(screen.queryByText('Pasta Bolognese')).not.toBeInTheDocument();
    });

    it('switches to Snabbval tab and selects quick note or recent meal', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
            />
        );

        const quickTab = screen.getByRole('button', { name: /Snabbval/i });
        fireEvent.click(quickTab);

        expect(screen.getByText('Äta ute')).toBeInTheDocument();
        expect(screen.getByText('Rester')).toBeInTheDocument();
        expect(screen.getByText('Tacos')).toBeInTheDocument();

        // Click 'Äta ute'
        fireEvent.click(screen.getByText('Äta ute'));

        // Input should now have 'Äta ute'
        const input = screen.getByPlaceholderText('Vad ska ätas?') as HTMLInputElement;
        expect(input.value).toBe('Äta ute');
    });

    it('triggers onPreviewRecipe when eye icon is clicked', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
                onPreviewRecipe={mockOnPreviewRecipe}
            />
        );

        const previewBtns = screen.getAllByTitle(/Granska recept/i);
        expect(previewBtns.length).toBeGreaterThan(0);
        fireEvent.click(previewBtns[0]);

        expect(mockOnPreviewRecipe).toHaveBeenCalledWith(mockMeals[0]);
    });

    it('calls onSave with custom typed value when save button is clicked', () => {
        render(
            <MealPlanEditModal
                isOpen={true}
                onClose={mockOnClose}
                initialValue=""
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                mealPlans={mockMealPlans}
                onSave={mockOnSave}
            />
        );

        const input = screen.getByPlaceholderText('Vad ska ätas?');
        fireEvent.change(input, { target: { value: 'Grillad kyckling' } });

        const saveBtn = screen.getByRole('button', { name: /Spara/i });
        fireEvent.click(saveBtn);

        expect(mockOnSave).toHaveBeenCalledWith('Grillad kyckling');
        expect(mockOnClose).toHaveBeenCalled();
    });
});
