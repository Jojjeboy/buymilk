import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionPicker } from './SessionPicker';
import { describe, it, expect, vi } from 'vitest';
import { List, Category } from '../types';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockLists: List[] = [
    { id: '1', name: 'List A', categoryId: 'cat1', items: [] },
    { id: '2', name: 'List B', categoryId: 'cat1', items: [] },
    { id: '3', name: 'List C', categoryId: 'cat2', items: [] },
];

const mockCategories: Category[] = [
    { id: 'cat1', name: 'Category 1', order: 0 },
    { id: 'cat2', name: 'Category 2', order: 1 },
];

describe('SessionPicker', () => {
    it('renders correctly', () => {
        render(
            <SessionPicker
                isOpen={true}
                onClose={() => {}}
                onCreateSession={() => {}}
                lists={mockLists}
                categories={mockCategories}
            />
        );
        expect(screen.getByText('sessions.createTitle')).toBeDefined();
    });

    it('validates minimum 2 lists required', () => {
        render(
            <SessionPicker
                isOpen={true}
                onClose={() => {}}
                onCreateSession={() => {}}
                lists={mockLists}
                categories={mockCategories}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('sessions.namePlaceholder'), { target: { value: 'My Session' } });
        
        // Select 1 list logic check - button should be disabled? 
        // Note: The actual SessionPicker implementation checks disabled state or just does nothing on click if validation fails?
        // Let's check implementation behavior. The disabled attribute logic was added.
        
        fireEvent.click(screen.getByText('List A'));
        const startButton = screen.getByText('sessions.create');
        expect(startButton).toBeDisabled();

        fireEvent.click(screen.getByText('List B'));
        expect(startButton).not.toBeDisabled();
    });

    it('calls onCreateSession with selected lists', () => {
        const mockCreate = vi.fn();
        render(
            <SessionPicker
                isOpen={true}
                onClose={() => {}}
                onCreateSession={mockCreate}
                lists={mockLists}
                categories={mockCategories}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('sessions.namePlaceholder'), { target: { value: 'My Session' } });
        fireEvent.click(screen.getByText('List A'));
        fireEvent.click(screen.getByText('List C'));
        
        fireEvent.click(screen.getByText('sessions.create'));

        expect(mockCreate).toHaveBeenCalledWith('My Session', expect.arrayContaining(['1', '3']));
    });

    it('calls onSaveCombination if checkbox is checked', async () => {
        const mockCreate = vi.fn();
        const mockSave = vi.fn().mockResolvedValue(undefined);
        
        render(
            <SessionPicker
                isOpen={true}
                onClose={() => {}}
                onCreateSession={mockCreate}
                lists={mockLists}
                categories={mockCategories}
                onSaveCombination={mockSave}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('sessions.namePlaceholder'), { target: { value: 'My Template' } });
        fireEvent.click(screen.getByText('List A'));
        fireEvent.click(screen.getByText('List B'));
        
        // Check "Save as template"
        fireEvent.click(screen.getByText('combinations.saveAsTemplate'));
        
        fireEvent.click(screen.getByText('sessions.create'));

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledWith('My Template', expect.arrayContaining(['1', '2']));
            expect(mockCreate).toHaveBeenCalled();
        });
    });
});
