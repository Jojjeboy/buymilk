import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MealEditModal } from './MealEditModal';
import { Meal } from '../types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMeal: Meal = {
    id: 'm-123',
    name: 'Krämig Kycklingpasta',
    description: 'Enkel pasta med kyckling och parmesan',
    imageUrl: 'https://example.com/pasta.jpg',
    servings: 4,
    tags: ['Pasta', 'Kyckling', 'Snabbt'],
    ingredients: [
        { text: 'Pasta penne', amount: '400g' },
        { text: 'Kycklingfilé', amount: '500g' },
        { text: 'Vispgrädde', amount: '2.5 dl' }
    ],
    instructions: [
        'Koka pastan i saltat vatten',
        'Stek kycklingen gyllenbrun',
        'Blanda ihop med grädde och parmesan'
    ],
    createdAt: ''
};

describe('MealEditModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders in create mode when meal is null', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={null}
            />
        );

        expect(screen.getByText(/Skapa nytt recept/i)).toBeInTheDocument();
        const nameInput = screen.getByPlaceholderText(/Krämig Kycklingpasta/i) as HTMLInputElement;
        expect(nameInput.value).toBe('');
    });

    it('populates fields when editing an existing meal', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={mockMeal}
            />
        );

        expect(screen.getByText(/Redigera recept/i)).toBeInTheDocument();
        const nameInput = screen.getByDisplayValue('Krämig Kycklingpasta');
        expect(nameInput).toBeInTheDocument();
        expect(screen.getByDisplayValue('Enkel pasta med kyckling och parmesan')).toBeInTheDocument();
    });

    it('allows toggling tags', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={null}
            />
        );

        const vegTagBtn = screen.getByRole('button', { name: /Vegetariskt/i });
        fireEvent.click(vegTagBtn);

        // Click save with a name
        const nameInput = screen.getByPlaceholderText(/Krämig Kycklingpasta/i);
        fireEvent.change(nameInput, { target: { value: 'Grönsaksgryta' } });

        const saveBtn = screen.getByRole('button', { name: /^Spara$/i });
        fireEvent.click(saveBtn);

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Grönsaksgryta',
                tags: ['Vegetariskt']
            }),
            undefined
        );
    });

    it('supports adding and editing ingredient rows', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={mockMeal}
            />
        );

        // Switch to Ingredients tab
        const ingTab = screen.getByRole('button', { name: /Ingredienser/i });
        fireEvent.click(ingTab);

        expect(screen.getByDisplayValue('Pasta penne')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Kycklingfilé')).toBeInTheDocument();

        // Add a new row
        const addRowBtn = screen.getByRole('button', { name: /Lägg till ingrediensrad/i });
        fireEvent.click(addRowBtn);

        const textInputs = screen.getAllByPlaceholderText('Ingrediensnamn');
        const lastTextInput = textInputs[textInputs.length - 1];
        fireEvent.change(lastTextInput, { target: { value: 'Parmesanost' } });

        // Save
        const saveBtn = screen.getByRole('button', { name: /^Spara$/i });
        fireEvent.click(saveBtn);

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Krämig Kycklingpasta',
                ingredients: expect.arrayContaining([
                    expect.objectContaining({ text: 'Parmesanost' })
                ])
            }),
            'm-123'
        );
    });

    it('supports fast text import of ingredients', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={null}
            />
        );

        // Switch to Ingredients tab
        const ingTab = screen.getByRole('button', { name: /Ingredienser/i });
        fireEvent.click(ingTab);

        // Open raw paste
        const pasteToggleBtn = screen.getByRole('button', { name: /Klistra in ingredienser/i });
        fireEvent.click(pasteToggleBtn);

        const textarea = screen.getByPlaceholderText(/500g nötfärs/i);
        fireEvent.change(textarea, { target: { value: '500g nötfärs\n2 st gula lökar\n1 tsk salt' } });

        const importBtn = screen.getByRole('button', { name: /Importera ingredienser/i });
        fireEvent.click(importBtn);

        expect(screen.getByDisplayValue('nötfärs')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500g')).toBeInTheDocument();
        expect(screen.getByDisplayValue('gula lökar')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2 st')).toBeInTheDocument();
    });

    it('supports adding and editing instructions', () => {
        render(
            <MealEditModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                meal={null}
            />
        );

        // Switch to Instructions tab
        const instTab = screen.getByRole('button', { name: /Instruktioner/i });
        fireEvent.click(instTab);

        const addStepBtn = screen.getByRole('button', { name: /Lägg till steg/i });
        fireEvent.click(addStepBtn);

        const stepInput = screen.getByPlaceholderText(/Beskriv steget/i);
        fireEvent.change(stepInput, { target: { value: 'Hacka löken och bryn den i smör' } });

        // Fill name in basic tab
        const basicTab = screen.getByRole('button', { name: /Grundinfo/i });
        fireEvent.click(basicTab);
        const nameInput = screen.getByPlaceholderText(/Krämig Kycklingpasta/i);
        fireEvent.change(nameInput, { target: { value: 'Löksoppa' } });

        // Save
        const saveBtn = screen.getByRole('button', { name: /^Spara$/i });
        fireEvent.click(saveBtn);

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Löksoppa',
                instructions: ['Hacka löken och bryn den i smör']
            }),
            undefined
        );
    });
});
