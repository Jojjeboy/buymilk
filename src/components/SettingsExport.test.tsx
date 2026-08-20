import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsView } from './SettingsView';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../context/AppContext');
vi.mock('../context/AuthContext');
vi.mock('../context/ToastContext');
vi.mock('../hooks/useWakeLock');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() }
    }),
}));

describe('SettingsView Export & Import Functionality', () => {
    const mockShowToast = vi.fn();
    const mockUpdateListItems = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            user: null,
            logout: vi.fn(),
        } as unknown as ReturnType<typeof useAuth>);

        vi.mocked(useWakeLock).mockReturnValue({
            isSupported: true,
            isLocked: false,
            requestWakeLock: vi.fn(),
            releaseWakeLock: vi.fn(),
        });

        vi.mocked(useToast).mockReturnValue({
            showToast: mockShowToast,
        } as unknown as ReturnType<typeof useToast>);

        vi.mocked(useApp).mockReturnValue({
            lists: [
                {
                    id: '1',
                    items: [
                        { id: 'i1', text: 'Milk', completed: false },
                        { id: 'i2', text: 'Eggs', completed: true }
                    ],
                    settings: { defaultSort: 'manual' }
                }
            ],
            defaultListId: '1',
            updateListSettings: vi.fn(),
            updateListItems: mockUpdateListItems,
            theme: 'system',
            setTheme: vi.fn(),
            itemHistory: [],
            updateHistoryItem: vi.fn(),
            deleteFromHistory: vi.fn(),
            clearAllHistory: vi.fn(),
        } as unknown as ReturnType<typeof useApp>);
    });

    it('renders the export list accordion button', () => {
        render(<SettingsView />);
        expect(screen.getByText('settings.exportTitle')).toBeInTheDocument();
    });

    it('opens export section and shows active items only by default in simple array format', () => {
        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const parsed = JSON.parse(textarea.value);
        expect(parsed).toEqual(['Milk']);
    });

    it('switches export format to objects format with active items by default', () => {
        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const objectsFormatBtn = screen.getByText('settings.formatObjects');
        fireEvent.click(objectsFormatBtn);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const parsed = JSON.parse(textarea.value);
        expect(parsed).toEqual([{ text: 'Milk' }]);
    });

    it('switches export format to wrapped format with active items by default', () => {
        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const wrappedFormatBtn = screen.getByText('settings.formatWrapped');
        fireEvent.click(wrappedFormatBtn);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const parsed = JSON.parse(textarea.value);
        expect(parsed).toEqual({ items: [{ text: 'Milk' }] });
    });

    it('switches scope to all items', () => {
        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const allScopeBtn = screen.getByText('settings.scopeAll');
        fireEvent.click(allScopeBtn);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const parsed = JSON.parse(textarea.value);
        expect(parsed).toEqual(['Milk', 'Eggs']);
    });

    it('copies export json to clipboard when copy button is clicked', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const copyBtn = screen.getByText('settings.copyJson');
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Milk'));
        expect(mockShowToast).toHaveBeenCalledWith('settings.copied', 'success');
    });

    it('triggers file download when download button is clicked', () => {
        const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
        const revokeObjectURLMock = vi.fn();
        global.URL.createObjectURL = createObjectURLMock;
        global.URL.revokeObjectURL = revokeObjectURLMock;

        const clickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        render(<SettingsView />);
        const exportBtn = screen.getByText('settings.exportTitle');
        fireEvent.click(exportBtn);

        const downloadBtn = screen.getByText('settings.downloadJson');
        fireEvent.click(downloadBtn);

        expect(createObjectURLMock).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
        clickMock.mockRestore();
    });

    it('shows simple example JSON format directly in import section', () => {
        render(<SettingsView />);
        const importBtn = screen.getByText('settings.importTitle');
        fireEvent.click(importBtn);

        expect(screen.getByText('settings.jsonFormat')).toBeInTheDocument();
        expect(screen.getByText('[{"text": "Pajdeg", "note": "1st", "checkIfExistAtHome": true}, {"text": "Mjölk", "note": "1liter"}]')).toBeInTheDocument();
    });

    it('successfully imports items with notes from objects format JSON', async () => {
        render(<SettingsView />);
        const importBtn = screen.getByText('settings.importTitle');
        fireEvent.click(importBtn);

        const textarea = screen.getByPlaceholderText('settings.jsonPlaceholder');
        fireEvent.change(textarea, { target: { value: '[{"text": "Oat milk", "note": "Barista"}]' } });

        const submitBtn = screen.getByRole('button', { name: 'common.import' });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        expect(mockUpdateListItems).toHaveBeenCalledWith('1', expect.arrayContaining([
            expect.objectContaining({ text: 'Oat milk', note: 'Barista', completed: false })
        ]));
        expect(mockShowToast).toHaveBeenCalledWith('settings.importSuccess', 'success');
    });

    it('successfully imports items with checkIfExistAtHome from JSON', async () => {
        render(<SettingsView />);
        const importBtn = screen.getByText('settings.importTitle');
        fireEvent.click(importBtn);

        const textarea = screen.getByPlaceholderText('settings.jsonPlaceholder');
        fireEvent.change(textarea, { target: { value: '[{"text": "Kanel", "note": "1 påse", "checkIfExistAtHome": true}, "?Socker"]' } });

        const submitBtn = screen.getByRole('button', { name: 'common.import' });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        expect(mockUpdateListItems).toHaveBeenCalledWith('1', expect.arrayContaining([
            expect.objectContaining({ text: 'Kanel', note: '1 påse', checkIfExistAtHome: true, completed: false }),
            expect.objectContaining({ text: 'Socker', checkIfExistAtHome: true, completed: false })
        ]));
        expect(mockShowToast).toHaveBeenCalledWith('settings.importSuccess', 'success');
    });
});
