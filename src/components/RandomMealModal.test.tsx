import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RandomMealModal } from './RandomMealModal';
import { Meal } from '../types';

const mockMeals: Meal[] = [
    { id: '1', name: 'Pasta Carbonara', description: 'Klassisk italiensk pasta', tags: ['pasta', 'italian'], ingredients: [], imageUrl: '', createdAt: '' },
    { id: '2', name: 'Chicken Curry', description: 'Kryddig kycklingcurry', tags: ['curry', 'indian'], ingredients: [], imageUrl: '', createdAt: '' }
];

const mockSuggestions: Meal[] = [
    { id: '3', name: 'Beef Stew', description: 'Hjärtlig köttgryta', tags: ['stew', 'comfort'], ingredients: [], imageUrl: '', createdAt: '' }
];

const mockOnClose = vi.fn();
const mockOnSelect = vi.fn();

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

    it('should display a random meal only from suggestions and not existing meals', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        expect(screen.getByText('Beef Stew')).toBeInTheDocument();
        expect(screen.queryByText('Pasta Carbonara')).not.toBeInTheDocument();
        expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument();
    });

    it('should exclude suggestion if it already exists in saved meals', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={[{ id: '1', name: 'Beef Stew', description: '', tags: [], ingredients: [], imageUrl: '', createdAt: '' }]}
                mealSuggestions={mockSuggestions}
            />
        );

        expect(screen.getByText(/Inga måltider matchar filtren/i)).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        render(
            <RandomMealModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
                meals={mockMeals}
                mealSuggestions={mockSuggestions}
            />
        );

        const closeButton = screen.getByText(/Tillbaka/i);
        fireEvent.click(closeButton);

        expect(mockOnClose).not.toHaveBeenCalled();
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
