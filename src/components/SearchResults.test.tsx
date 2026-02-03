import { render, screen } from '@testing-library/react';
import { SearchResults } from './SearchResults';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as AppContext from '../context/AppContext';

// Mock i18next - although SearchResults doesn't seem to use useTranslation directly based on file view, 
// usually apps do. Inspecting file showed "Search Results for..." text, suggesting hardcoded or English.
// Let's mock it just in case.
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Folder: () => <div data-testid="folder-icon" />,
    FileText: () => <div data-testid="file-icon" />
}));

describe('SearchResults', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockLists = [
        { id: 'l1', name: 'Groceries', categoryId: 'c1', items: [{ text: 'Milk', completed: false }] },
        { id: 'l2', name: 'Gym', categoryId: 'c2', items: [] }
    ];

    const mockCategories = [
        { id: 'c1', name: 'Home' },
        { id: 'c2', name: 'Work' }
    ];

    const setup = (searchQuery: string) => {
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            lists: mockLists,
            categories: mockCategories,
            searchQuery,
            setSearchQuery: vi.fn(),
            // defaults
            loading: false,
            // ...
        } as Partial<ReturnType<typeof AppContext.useApp>> as ReturnType<typeof AppContext.useApp>);

        render(
            <MemoryRouter>
                <SearchResults />
            </MemoryRouter>
        );
    };

    it('renders nothing when query is empty', () => {
        setup('');
        expect(screen.queryByText(/Search Results/)).toBeNull();
    });

    it('filters categories by name', () => {
        setup('Home');
        expect(screen.getByText('Categories')).toBeDefined();
        expect(screen.getByText('Home')).toBeDefined();
        expect(screen.queryByText('Work')).toBeNull();
    });

    it('filters lists by name', () => {
        setup('Groceries');
        expect(screen.getByText('Lists')).toBeDefined();
        expect(screen.getByText('Groceries')).toBeDefined();
        expect(screen.queryByText('Gym')).toBeNull();
    });

    it('filters lists by item text', () => {
        setup('Milk');
        expect(screen.getByText('Lists')).toBeDefined();
        expect(screen.getByText('Groceries')).toBeDefined(); // Contains Milk
    });

    it('shows no results found', () => {
        setup('Astronaut');
        expect(screen.getByText('No results found.')).toBeDefined();
    });
});
