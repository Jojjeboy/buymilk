import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MealDetailModal } from './MealDetailModal';
import { Meal } from '../types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMeal: Meal = {
    id: 'm-123',
    name: 'Ugnsbakad Lax',
    description: 'Enkel och god lax i ugn med citron',
    imageUrl: 'https://example.com/lax.jpg',
    servings: 4,
    tags: ['Fisk', 'Snabbt'],
    ingredients: [
        { text: 'Laxfilé', amount: '600g' },
        { text: 'Citron', amount: '1 st' }
    ],
    instructions: [
        'Sätt ugnen på 200 grader',
        'Lägg laxen i en ugnsform och pressa över citron',
        'Baka i ugnen i 20 minuter'
    ],
    createdAt: ''
};

describe('MealDetailModal', () => {
    const mockOnClose = vi.fn();
    const mockOnEdit = vi.fn();
    const mockOnPlanMeal = vi.fn();
    const mockOnAddToShoppingList = vi.fn();
    const mockOnRandomMeal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders meal title, description, servings and ingredients', () => {
        render(
            <MealDetailModal
                isOpen={true}
                onClose={mockOnClose}
                meal={mockMeal}
                onEdit={mockOnEdit}
                onPlanMeal={mockOnPlanMeal}
                onAddToShoppingList={mockOnAddToShoppingList}
                onRandomMeal={mockOnRandomMeal}
            />
        );

        expect(screen.getByText('Ugnsbakad Lax')).toBeInTheDocument();
        expect(screen.getByText('Enkel och god lax i ugn med citron')).toBeInTheDocument();
        expect(screen.getByText('Laxfilé')).toBeInTheDocument();
        expect(screen.getByText('600g')).toBeInTheDocument();
        expect(screen.getByText(/4 portioner/i)).toBeInTheDocument();
    });

    it('toggles between ingredients and instructions tabs', () => {
        render(
            <MealDetailModal
                isOpen={true}
                onClose={mockOnClose}
                meal={mockMeal}
            />
        );

        // Switch to instructions
        const instructionsTab = screen.getByRole('button', { name: /Tillagning/i });
        fireEvent.click(instructionsTab);

        expect(screen.getByText('Sätt ugnen på 200 grader')).toBeInTheDocument();
        expect(screen.getByText('Baka i ugnen i 20 minuter')).toBeInTheDocument();
    });

    it('triggers action callbacks when action buttons are clicked', () => {
        render(
            <MealDetailModal
                isOpen={true}
                onClose={mockOnClose}
                meal={mockMeal}
                onEdit={mockOnEdit}
                onPlanMeal={mockOnPlanMeal}
                onAddToShoppingList={mockOnAddToShoppingList}
                onRandomMeal={mockOnRandomMeal}
            />
        );

        // Click Edit
        const editBtn = screen.getByRole('button', { name: /Redigera/i });
        fireEvent.click(editBtn);
        expect(mockOnEdit).toHaveBeenCalledWith(mockMeal);

        // Click Plan
        const planBtn = screen.getByRole('button', { name: /Planera/i });
        fireEvent.click(planBtn);
        expect(mockOnPlanMeal).toHaveBeenCalledWith(mockMeal);

        // Click Handla (Shopping list)
        const shopBtn = screen.getByRole('button', { name: /Handla/i });
        fireEvent.click(shopBtn);
        expect(mockOnAddToShoppingList).toHaveBeenCalledWith(mockMeal);

        // Click Random
        const randomBtn = screen.getByRole('button', { name: /Slumpa ny/i });
        fireEvent.click(randomBtn);
        expect(mockOnRandomMeal).toHaveBeenCalledTimes(1);
    });
});
