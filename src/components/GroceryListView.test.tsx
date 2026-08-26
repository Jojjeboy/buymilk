 a import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroceryListView } from './GroceryListView';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the hooks
vi.mock('../context/AppContext');
vi.mock('../context/ToastContext');
vi.mock('../hooks/useVoiceInput');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => defaultValue || key,
    }),
}));

describe('GroceryListView Voice Input', () => {
    const mockUpdateListItems = vi.fn();
    const mockUpdateListAccess = vi.fn();
    let mockTranscript = '';

    beforeEach(() => {
        mockTranscript = '';
        vi.mocked(useVoiceInput).mockImplementation(() => ({
            isListening: true,
            transcript: mockTranscript,
            startListening: vi.fn(),
            stopListening: vi.fn(),
            resetTranscript: vi.fn(),
            hasSupport: true,
        }));

        vi.clearAllMocks();
        
        vi.mocked(useApp).mockReturnValue({
            lists: [{ id: '1', items: [], settings: {}, isPending: false }],
            defaultListId: '1',
            updateListItems: mockUpdateListItems,
            updateListAccess: mockUpdateListAccess,
            loading: false,
            itemHistory: [],
            addToHistory: vi.fn(),
            categories: [],
            addCategory: vi.fn(),
            mealPlans: [],
        } as unknown as ReturnType<typeof useApp>);

        vi.mocked(useToast).mockReturnValue({
            showToast: vi.fn(),
        } as unknown as ReturnType<typeof useToast>);
    });

    it('renders the microphone button when voice input is supported', () => {
        vi.mocked(useVoiceInput).mockReturnValue({
            isListening: false,
            transcript: '',
            startListening: vi.fn(),
            stopListening: vi.fn(),
            resetTranscript: vi.fn(),
            hasSupport: true,
        });

        render(<GroceryListView />);
        
        expect(screen.getByTitle('Voice Input')).toBeInTheDocument();
    });

    it('does not render the microphone button when voice input is not supported', () => {
        vi.mocked(useVoiceInput).mockReturnValue({
            isListening: false,
            transcript: '',
            startListening: vi.fn(),
            stopListening: vi.fn(),
            resetTranscript: vi.fn(),
            hasSupport: false,
        });

        render(<GroceryListView />);
        
        expect(screen.queryByTitle('Voice Input')).not.toBeInTheDocument();
    });

    it('calls startListening when the microphone button is clicked and not listening', () => {
        const startListening = vi.fn();
        vi.mocked(useVoiceInput).mockReturnValue({
            isListening: false,
            transcript: '',
            startListening,
            stopListening: vi.fn(),
            resetTranscript: vi.fn(),
            hasSupport: true,
        });

        render(<GroceryListView />);
        
        const micButton = screen.getByTitle('Voice Input');
        fireEvent.click(micButton);
        
        expect(startListening).toHaveBeenCalledTimes(1);
    });

    it('calls stopListening when the microphone button is clicked and listening', () => {
        const stopListening = vi.fn();
        vi.mocked(useVoiceInput).mockReturnValue({
            isListening: true,
            transcript: '',
            startListening: vi.fn(),
            stopListening,
            resetTranscript: vi.fn(),
            hasSupport: true,
        });

        render(<GroceryListView />);
        
        const micButton = screen.getByTitle('Stop Listening');
        fireEvent.click(micButton);
        
        expect(stopListening).toHaveBeenCalledTimes(1);
    });

    it('updates the input field when the transcript changes', async () => {
        const { rerender } = render(<GroceryListView />);
        
        const input = screen.getByPlaceholderText('lists.addItemPlaceholder');
        expect(input).toHaveValue('');
        
        // Update the variable that the mock implementation uses
        mockTranscript = 'Milk';

        await act(async () => {
            rerender(<GroceryListView key="updated" />);
        });
        
        await waitFor(() => {
            const updatedInput = screen.getByPlaceholderText('lists.addItemPlaceholder');
            expect(updatedInput).toHaveValue('Milk');
        }, { timeout: 2000 });
    });
});