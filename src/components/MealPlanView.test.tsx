import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MealPlanView } from './MealPlanView';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../context/AppContext');
vi.mock('../context/ToastContext');

describe('MealPlanView', () => {
    const mockShowToast = vi.fn();
    const mockAddMealPlan = vi.fn();
    const mockUpdateMealPlan = vi.fn();
    const mockAddMeal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useToast).mockReturnValue({
            showToast: mockShowToast,
        } as unknown as ReturnType<typeof useToast>);

        // Set date to Sunday, August 16, 2026
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-16T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('saves a meal for Sunday when the day is missing in the plan', async () => {
        // Mock app context with a plan that is missing Sunday
        // 2026-08-16 is Sunday in week 33 of 2026.
        vi.mocked(useApp).mockReturnValue({
            mealPlans: [
                {
                    id: 'plan-123',
                    weekNumber: 33,
                    year: 2026,
                    days: [
                        { date: '2026-08-10', meals: [] }, // Monday
                        { date: '2026-08-11', meals: [] }, // Tuesday
                        { date: '2026-08-12', meals: [] }, // Wednesday
                        { date: '2026-08-13', meals: [] }, // Thursday
                        { date: '2026-08-14', meals: [] }, // Friday
                        { date: '2026-08-15', meals: [] }  // Saturday
                        // Sunday '2026-08-16' is intentionally missing
                    ]
                }
            ],
            meals: [],
            addMeal: mockAddMeal,
            addMealPlan: mockAddMealPlan,
            updateMealPlan: mockUpdateMealPlan,
        } as unknown as ReturnType<typeof useApp>);

        render(<MealPlanView />);

        // Find the Sunday (Idag) heading
        expect(screen.getByText('Söndag (Idag)')).toBeInTheDocument();

        // Find all buttons that say "Vad ska ätas?", the first one is lunch for Sunday
        const buttons = screen.getAllByText('Vad ska ätas?');
        const sundayLunchButton = buttons[0];

        // Click the button to open the edit modal
        fireEvent.click(sundayLunchButton);

        // Find the input in the modal and type the meal name
        const input = screen.getByPlaceholderText('Vad ska ätas?');
        fireEvent.change(input, { target: { value: 'Söndagsstek' } });

        // Click the save button in the modal
        const saveButton = screen.getByText('Spara');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        // Verify updateMealPlan was called with the plan id and new day added
        expect(mockUpdateMealPlan).toHaveBeenCalledTimes(1);
        expect(mockUpdateMealPlan).toHaveBeenCalledWith('plan-123', expect.objectContaining({
            days: expect.arrayContaining([
                expect.objectContaining({
                    date: '2026-08-16',
                    meals: expect.arrayContaining([
                        expect.objectContaining({
                            type: 'lunch',
                            plannedMeal: expect.objectContaining({
                                customTitle: 'Söndagsstek'
                            })
                        })
                    ])
                })
            ])
        }));
    });
});
