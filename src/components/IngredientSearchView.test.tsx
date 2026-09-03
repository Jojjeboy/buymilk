import { render, screen, fireEvent } from '@testing-library/react';
import { IngredientSearchView } from './IngredientSearchView';
import { AppProvider } from '../context/AppContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

describe('IngredientSearchView', () => {
    const mockMeals = [
        {
            id: '1',
            name: 'Pasta Carbonara',
            ingredients: [
                { text: 'pasta', amount: '400g' },
                { text: 'eggs', amount: '2' },
                { text: 'bacon', amount: '150g' },
                { text: 'cream', amount: '200ml' }
            ],
            tags: ['italian', 'quick']
        },
        {
            id: '2',
            name: 'Chicken Curry',
            ingredients: [
                { text: 'chicken', amount: '500g' },
                { text: 'curry powder', amount: '2 tbsp' },
                { text: 'coconut milk', amount: '400ml' },
                { text: 'rice', amount: '300g' }
            ],
            tags: ['asian', 'spicy']
        }
    ];

    const renderWithProviders = (meals = []) => {
        return render(
            <MemoryRouter>
                <AppProvider>
                    <IngredientSearchView />
                </AppProvider>
            </MemoryRouter>
        );
    };

    it('renders the search input', () => {
        renderWithProviders();
        
        const searchInput = screen.getByPlaceholderText(/Search by ingredient/);
        expect(searchInput).toBeInTheDocument();
    });

    it('renders the title', () => {
        renderWithProviders();
        
        const title = screen.getByText(/Search by Ingredient/);
        expect(title).toBeInTheDocument();
    });

    it('shows empty state when no search query and no meals', () => {
        renderWithProviders();
        
        const emptyMessage = screen.getByText(/No recipes yet/);
        expect(emptyMessage).toBeInTheDocument();
    });

    it('shows start searching message when no search query but has meals', () => {
        // Mock the useApp hook to return meals
        vi.mock('../context/AppContext', () => ({
            useApp: () => ({
                meals: mockMeals,
                // other required properties
                lists: [],
                currentListId: null,
                defaultListId: null,
                addItem: vi.fn(),
                updateItem: vi.fn(),
                deleteItem: vi.fn(),
                toggleItem: vi.fn(),
                clearCompleted: vi.fn(),
                reorderItems: vi.fn(),
                addMeal: vi.fn(),
                updateMeal: vi.fn(),
                deleteMeal: vi.fn(),
                addItemsToList: vi.fn(),
                setCurrentList: vi.fn(),
                createList: vi.fn(),
                deleteList: vi.fn(),
                updateList: vi.fn(),
                setDefaultList: vi.fn()
            })
        }));

        renderWithProviders(mockMeals);
        
        const startMessage = screen.getByText(/Start searching by ingredient/);
        expect(startMessage).toBeInTheDocument();
    });
});