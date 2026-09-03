import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IngredientSearchView } from './IngredientSearchView';
import { Meal } from '../types';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import mealSuggestions from '../data/mealSuggestions.json';

// Mock the modals to avoid rendering them in tests
vi.mock('./MealDetailModal', () => ({
    MealDetailModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>MealDetailModal</div> : null
}));

vi.mock('./PlanMealModal', () => ({
    PlanMealModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>PlanMealModal</div> : null
}));

// Mock the useApp hook
const mockUseApp = {
    meals: [
        {
            id: 'm-1',
            name: 'Pasta Carbonara',
            description: 'Klassisk italiensk pasta',
            imageUrl: 'https://example.com/pasta.jpg',
            servings: 4,
            tags: ['Pasta', 'Italienskt'],
            ingredients: [
                { text: 'Spaghetti', amount: '400g' },
                { text: 'Ägg', amount: '3st' },
                { text: 'Pecorino', amount: '50g' }
            ],
            createdAt: '2026-01-01T00:00:00Z'
        } as Meal,
        {
            id: 'm-2',
            name: 'Kyckling Curry',
            description: 'Krämig curry med kyckling',
            imageUrl: 'https://example.com/curry.jpg',
            servings: 4,
            tags: ['Asiatiskt', 'Krämigt'],
            ingredients: [
                { text: 'Kycklingfilé', amount: '500g' },
                { text: 'Kokosmjölk', amount: '1 burk' },
                { text: 'Currypulver', amount: '2 msk' }
            ],
            createdAt: '2026-01-01T00:00:00Z'
        } as Meal
    ],
    defaultListId: 'list-1',
    addItemsToList: vi.fn().mockResolvedValue(undefined)
};

// Mock the useMealPlan hook
const mockUseMealPlan = {
    handleMealChange: vi.fn().mockResolvedValue(undefined)
};

// Mock the useApp and useTranslation hooks
vi.mock('../context/AppContext', () => ({
    useApp: () => mockUseApp
}));

vi.mock('../hooks/useMealPlan', () => ({
    useMealPlan: () => mockUseMealPlan
}));

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { query?: string; count?: number }) => {
            const translations: Record<string, string> = {
                'ingredientSearch.title': 'Search by Ingredient',
                'ingredientSearch.placeholder': 'Search by ingredient...',
                'ingredientSearch.noResults': `No recipes found for '${options?.query || ''}'`,
                'ingredientSearch.foundResults': `Found ${options?.count || 0} recipe(s)`,
                'ingredientSearch.startSearching': 'Start searching by ingredient',
                'ingredientSearch.enterIngredient': 'Enter an ingredient name to find recipes that contain it',
                'ingredientSearch.tryDifferent': 'Try searching for a different ingredient',
                'ingredientSearch.matching': 'matching ingredient',
                'ingredientSearch.viewDetails': 'View Details',
                'ingredientSearch.planMeal': 'Plan Meal',
                'ingredientSearch.addToShoppingList': 'Add to Shopping List',
                'meals.noMeals': 'No recipes yet',
                'meals.addFirstRecipe': 'Add your first recipe to start searching by ingredients',
                'clear': 'Clear'
            };
            return translations[key] || key;
        },
        i18n: { language: 'en' }
    })
}));

describe('IngredientSearchView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the search view with title and search input', () => {
        render(<IngredientSearchView />);

        expect(screen.getByText('Search by Ingredient')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search by ingredient...')).toBeInTheDocument();
    });

    it('displays empty state when no search query is provided and there are meals', () => {
        render(<IngredientSearchView />);

        expect(screen.getByText('Start searching by ingredient')).toBeInTheDocument();
        expect(screen.getByText('Enter an ingredient name to find recipes that contain it')).toBeInTheDocument();
    });

    it('filters meals by ingredient search', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });
    });

    it('displays no results message when no meals match the search', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'NonExistentIngredient' } });

        await waitFor(() => {
            expect(screen.getAllByText('No recipes found for \'NonExistentIngredient\'').length).toBeGreaterThan(0);
        });
    });

    it('includes mealSuggestions in the search results', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Lax' } });

        await waitFor(() => {
            // Check if any meal from mealSuggestions is displayed
            const laxMeal = mealSuggestions.find(meal => 
                meal.ingredients?.some(ing => ing.text.toLowerCase().includes('lax'))
            );
            if (laxMeal) {
                expect(screen.getByText(laxMeal.name)).toBeInTheDocument();
            }
        }, { timeout: 5000 });
    });

    it('clears the search when the clear button is clicked', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });

        // The clear button is an SVG icon, so we need to find it by its role and aria-label
        const clearButton = screen.getByRole('button', { name: /clear/i });
        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(screen.getByText('Start searching by ingredient')).toBeInTheDocument();
        });
    });

    it('displays the number of matching ingredients for each meal', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
            // Check for the span containing the match count
            const matchSpans = screen.getAllByText((content, element) => {
                return element?.textContent?.includes('matching ingredient') || false;
            });
            expect(matchSpans.length).toBeGreaterThan(0);
        });
    });

    it('opens the meal detail modal when View Details is clicked', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });

        // The View Details button is an icon with aria-label
        const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
        fireEvent.click(viewDetailsButtons[0]);

        expect(screen.getByText('MealDetailModal')).toBeInTheDocument();
    });

    it('opens the plan meal modal when Plan Meal is clicked', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });

        // The Plan Meal button is an icon with aria-label
        const planMealButtons = screen.getAllByRole('button', { name: /Plan Meal/i });
        fireEvent.click(planMealButtons[0]);

        expect(screen.getByText('PlanMealModal')).toBeInTheDocument();
    });

    it('handles keyboard navigation for search results', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });

        // Focus the search input
        fireEvent.focus(searchInput);

        // Press ArrowDown to focus the first result
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

        // Press ArrowUp to return focus to the input
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
    });

    it('handles Escape key to clear search', async () => {
        render(<IngredientSearchView />);

        const searchInput = screen.getByPlaceholderText('Search by ingredient...');
        fireEvent.change(searchInput, { target: { value: 'Kyckling' } });

        await waitFor(() => {
            expect(screen.getByText('Kyckling Curry')).toBeInTheDocument();
        });

        // Press Escape to clear the search
        fireEvent.keyDown(searchInput, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.getByText('Start searching by ingredient')).toBeInTheDocument();
        });
    });
});
