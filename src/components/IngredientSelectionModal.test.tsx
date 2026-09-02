import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { IngredientSelectionModal, PlannedMealWithIngredients } from './IngredientSelectionModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPlannedMeals: PlannedMealWithIngredients[] = [
    {
        name: 'Köttfärssås & Spaghetti',
        ingredients: [
            { text: 'Köttfärs', amount: '500g' },
            { text: 'Lök', amount: '1 st' },
            { text: 'Salt', amount: '1 tsk', checkIfExistAtHome: true },
            { text: 'Krossade tomater', amount: '400g' }
        ]
    },
    {
        name: 'Köttgryta',
        ingredients: [
            { text: 'Högrev', amount: '600g' },
            { text: 'Lök', amount: '2 st' },
            { text: 'Smör', amount: '25g', checkIfExistAtHome: true }
        ]
    }
];

describe('IngredientSelectionModal', () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and combines duplicate ingredients across meals', () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByText(/Välj ingredienser till inköpslistan/i)).toBeInTheDocument();

        // Check that 'Lök' is rendered and combined
        expect(screen.getByText('Lök')).toBeInTheDocument();
        expect(screen.getByText('1 st + 2 st')).toBeInTheDocument();
        expect(screen.getByText('Köttfärssås & Spaghetti, Köttgryta')).toBeInTheDocument();

        // Non-pantry items are checked by default
        expect(screen.getByText('Köttfärs')).toBeInTheDocument();
        expect(screen.getByText('Högrev')).toBeInTheDocument();
    });

    it('allows toggling between Combined and By Meal view', () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        // Switch to By Meal view
        const byMealBtn = screen.getByRole('button', { name: /Per måltid/i });
        fireEvent.click(byMealBtn);

        expect(screen.getByRole('heading', { name: /Köttfärssås & Spaghetti/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Köttgryta/i })).toBeInTheDocument();
    });

    it('supports selecting and deselecting all items', () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        // Deselect all
        const deselectAllBtn = screen.getByRole('button', { name: /^Avmarkera alla$/i });
        fireEvent.click(deselectAllBtn);

        const transferBtn = screen.getByRole('button', { name: /inköpslistan/i });
        expect(transferBtn).toBeDisabled();

        // Select all
        const selectAllBtn = screen.getByRole('button', { name: /^Markera alla$/i });
        fireEvent.click(selectAllBtn);

        expect(transferBtn).not.toBeDisabled();
    });

    it('unchecks pantry items when "Bocka av basvaror" is clicked', () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        // First select all
        fireEvent.click(screen.getByRole('button', { name: /^Markera alla$/i }));

        // Click uncheck pantry
        const uncheckPantryBtn = screen.getByRole('button', { name: /^Bocka av basvaror$/i });
        fireEvent.click(uncheckPantryBtn);

        // Salt and Smör should have line-through or not count in selected
        // Transfer count should reflect remaining items (Köttfärs, Lök, Krossade tomater, Högrev) = 4
        expect(screen.getByText(/Lägg till 4 varor i inköpslistan/i)).toBeInTheDocument();
    });

    it('allows adding a custom extra ingredient', () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        const customInput = screen.getByPlaceholderText(/Lägg till extra vara/i);
        fireEvent.change(customInput, { target: { value: 'Vispgrädde 3dl' } });

        const addBtn = screen.getByRole('button', { name: /^Lägg till$/i });
        fireEvent.click(addBtn);

        expect(screen.getByText('Vispgrädde 3dl')).toBeInTheDocument();
    });

    it('calls onConfirm with selected items and closes on confirm', async () => {
        render(
            <IngredientSelectionModal
                isOpen={true}
                onClose={mockOnClose}
                plannedMeals={mockPlannedMeals}
                onConfirm={mockOnConfirm}
            />
        );

        const confirmBtn = screen.getByRole('button', { name: /inköpslistan/i });
        await act(async () => {
            fireEvent.click(confirmBtn);
        });

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ text: 'Köttfärs' }),
                expect.objectContaining({ text: 'Lök' }),
                expect.objectContaining({ text: 'Krossade tomater' }),
                expect.objectContaining({ text: 'Högrev' })
            ])
        );
        expect(mockOnClose).toHaveBeenCalled();
    });
});
