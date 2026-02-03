import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionDetail } from './SessionDetail';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as AppContext from '../context/AppContext';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Lucide icons to avoid render issues
vi.mock('lucide-react', () => ({
    ChevronLeft: () => <div data-testid="chevron-left" />,
    Check: () => <div data-testid="check" />,
    X: () => <div data-testid="x" />,
}));

vi.mock('./Modal', () => ({
    Modal: ({ isOpen, onConfirm, title }: { isOpen: boolean; onConfirm: () => void; title: string }) => isOpen ? (
        <div data-testid="modal">
            {title}
            <button onClick={onConfirm}>Confirm Complete</button>
        </div>
    ) : null
}));

const mockUpdateListItems = vi.fn();
const mockCompleteSession = vi.fn();
const mockDeleteSession = vi.fn();

const mockSessions = [
    { id: 'session1', name: 'My Session', listIds: ['list1'], categoryId: 'cat1', createdAt: '2023-01-01' }
];

const mockLists = [
    {
        id: 'list1',
        name: 'List 1',
        categoryId: 'cat1',
        items: [
            { id: 'item1', text: 'Item 1', completed: false },
            { id: 'item2', text: 'Item 2', completed: true }
        ]
    }
];

describe('SessionDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            sessions: mockSessions,
            lists: mockLists,
            updateListItems: mockUpdateListItems,
            completeSession: mockCompleteSession,
            deleteSession: mockDeleteSession,
            // Add other missing properties as needed by useApp type, mocking them as undefined or simple values
            categories: [],
            addCategory: vi.fn(),
            deleteCategory: vi.fn(),
            reorderCategories: vi.fn(),
            addList: vi.fn(),
            deleteList: vi.fn(),
            copyList: vi.fn(),
            moveList: vi.fn(),
            updateCategoryName: vi.fn(),
            updateListName: vi.fn(),
            reorderLists: vi.fn(),
            addSession: vi.fn(),
            combinations: [],
            addCombination: vi.fn(),
            updateCombination: vi.fn(),
            deleteCombination: vi.fn(),
        } as Partial<ReturnType<typeof AppContext.useApp>> as ReturnType<typeof AppContext.useApp>);
    });

    const renderComponent = () => {
        render(
            <MemoryRouter initialEntries={['/session/session1']}>
                <Routes>
                    <Route path="/session/:sessionId" element={<SessionDetail />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders session details correctly', () => {
        renderComponent();
        expect(screen.getByText('My Session')).toBeDefined();
        expect(screen.getByText('List 1')).toBeDefined();
        expect(screen.getByText('Item 1')).toBeDefined();
        expect(screen.getByText('Item 2')).toBeDefined();
    });

    it('displays correct progress', () => {
        renderComponent();
        // 1 checked out of 2 = 50%
        expect(screen.getByText(/50%/)).toBeDefined();
    });

    it('toggles item completion', async () => {
        renderComponent();

        const checkButtons = screen.getAllByRole('button');
        // Find the check/uncheck buttons. The mock check icon has 'check' testid.
        // Or we can find by class or just blindly click the first that isn't 'Slutför'.
        // The mock renders: <button ...>{item.completed && <Check ... />}</button>
        // Let's filter buttons that trigger toggle.

        // Item 1 (uncompleted) button
        // Item 2 (completed) button
        // 'Slutför' button
        // Back button (<ChevronLeft /> link) - wait link is <a>

        // In this test environment, buttons are buttons.
        fireEvent.click(checkButtons[0]); // Presumably first item toggle

        expect(mockUpdateListItems).toHaveBeenCalledWith('list1', expect.arrayContaining([
            expect.objectContaining({ id: 'item1', completed: true }),
            expect.objectContaining({ id: 'item2', completed: true })
        ]));
    });

    it('completes session', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('sessions.completeSession'));

        // Modal should open
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeDefined();
            expect(screen.getByText('sessions.completeTitle')).toBeDefined();
        });

        fireEvent.click(screen.getByText('Confirm Complete'));

        await waitFor(() => {
            expect(mockCompleteSession).toHaveBeenCalledWith('session1');
            expect(mockDeleteSession).toHaveBeenCalledWith('session1');
        });
    });

    it('renders not found state', () => {
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            sessions: [], // No sessions
            lists: [],
        } as Partial<ReturnType<typeof AppContext.useApp>> as ReturnType<typeof AppContext.useApp>);

        render(
            <MemoryRouter initialEntries={['/session/unknown']}>
                <Routes>
                    <Route path="/session/:sessionId" element={<SessionDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('sessions.notFound')).toBeDefined();
    });
});
