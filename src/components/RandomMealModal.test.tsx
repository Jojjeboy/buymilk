import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RandomMealModal } from './RandomMealModal';
import { Meal } from '../types';

const mockMeals: Meal[] = [
    { id: '1', name: 'Pasta Carbonara', description: 'Klassisk italiensk pasta', tags: ['pasta', 'italienskt'], ingredients: [{ text: 'Bacon' }], imageUrl: '', createdAt: '' },
    { id: '2', name: 'Chicken Curry', description: 'Kryddig kycklingcurry', tags: ['curry', 'indiskt'], ingredients: [{ text: 'Kyckling' }], imageUrl: '', createdAt: '' }
];

const mockSuggestions: Meal[] = [
    { id: '3', name: 'Beef Stew', description: 'Hjärtlig köttgryta', tags: ['gryta', 'comfort'], ingredients: [{ text: 'Högrev' }], imageUrl: '', createdAt: '' }
];

const mockOnClose = vi.fn();
const mockOnSelect = vi.fn();
const mockOnPreview = vi.fn();

describe('RandomMealModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render when isOpen is true', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        expect(screen.getByText(/Slumpa måltid/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <RandomMealModal
                isOpen={false}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should allow switching between sources (Alla, Mina favoriter, Inspiration)', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        // Click Inspiration tab
        const inspirationBtn = screen.getByRole('button', { name: /Inspiration/i });
        fireEvent.click(inspirationBtn);

        expect(screen.getByText('Beef Stew')).toBeInTheDocument();

        // Click Mina favoriter tab
        const myMealsBtn = screen.getByRole('button', { name: /Mina favoriter/i });
        fireEvent.click(myMealsBtn);

        // Should show one of the saved meals
        const hasCarbonara = screen.queryByText('Pasta Carbonara') !== null;
        const hasCurry = screen.queryByText('Chicken Curry') !== null;
        expect(hasCarbonara || hasCurry).toBe(true);
    });

    it('should filter by tag', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        // Click Mina favoriter
        fireEvent.click(screen.getByRole('button', { name: /Mina favoriter/i }));

        // Click tag 'pasta'
        const pastaTag = screen.getByRole('button', { name: /pasta/i });
        fireEvent.click(pastaTag);

        expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
        expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument();
    });

    it('should call onPreviewRecipe when preview button is clicked', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
                onPreviewRecipe={mockOnPreview}
            />
        );

        const previewButton = screen.getByText(/Granska ingredienser & recept/i);
        fireEvent.click(previewButton);

        expect(mockOnPreview).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect and onClose when select button is clicked', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        const selectButton = screen.getByRole('button', { name: /Välj/i });
        fireEvent.click(selectButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display message when no meals match filters', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={[]}
                mealSuggestions={[]}
                filters={{ tags: ['nonexistent'] }}
            />
        );

        expect(screen.getByText(/Inga måltider matchar filtren/i)).toBeInTheDocument();
    });
});

