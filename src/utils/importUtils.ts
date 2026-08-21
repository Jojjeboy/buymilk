import { v4 as uuidv4 } from 'uuid';
import type { Item } from '../types';

export interface ParsedImportItem {
    text: string;
    note?: string;
    checkIfExistAtHome?: boolean;
}

/**
 * Parses a JSON string and extracts a list of items (text, optional note, optional checkIfExistAtHome).
 * Accepts the following formats:
 *   1. ["Milk", "Eggs"]                                                  — array of strings (supports ? prefix)
 *   2. [{"text": "Pajdeg", "note": "1st", "checkIfExistAtHome": true}]         — array of objects
 *   3. {"items": ["Milk"]}                                               — object with an `items` array of strings
 *   4. {"items": [{"text": "Pajdeg", "checkIfExistAtHome": true}]}              — object with an `items` array of objects
 * Returns the extracted items or throws a descriptive error key.
 */
export function parseJsonItems(raw: string): ParsedImportItem[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw 'errorInvalidJson';
    }

    let arr: unknown[];

    if (Array.isArray(parsed)) {
        arr = parsed;
    } else if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'items' in (parsed as object) &&
        Array.isArray((parsed as Record<string, unknown>).items)
    ) {
        arr = (parsed as Record<string, unknown>).items as unknown[];
    } else {
        throw 'errorInvalidFormat';
    }

    const items: ParsedImportItem[] = [];
    for (const entry of arr) {
        if (typeof entry === 'string' && entry.trim()) {
            const trimmed = entry.trim();
            const isCheck = trimmed.startsWith('?');
            const text = isCheck ? trimmed.replace(/^\?+\s*/, '') : trimmed;
            items.push({ text, checkIfExistAtHome: isCheck ? true : undefined });
        } else if (
            entry !== null &&
            typeof entry === 'object' &&
            typeof (entry as Record<string, unknown>).text === 'string' &&
            ((entry as Record<string, unknown>).text as string).trim()
        ) {
            const rawText = ((entry as Record<string, unknown>).text as string).trim();
            const isCheck = rawText.startsWith('?');
            const text = isCheck ? rawText.replace(/^\?+\s*/, '') : rawText;
            const note = typeof (entry as Record<string, unknown>).note === 'string'
                ? ((entry as Record<string, unknown>).note as string).trim() || undefined
                : undefined;
            const checkIfExistAtHome = typeof (entry as Record<string, unknown>).checkIfExistAtHome === 'boolean'
                ? ((entry as Record<string, unknown>).checkIfExistAtHome as boolean) || undefined
                : (isCheck ? true : undefined);
            items.push({ text, note, checkIfExistAtHome });
        }
    }

    if (items.length === 0) {
        throw 'errorNoItems';
    }

    return items;
}

/**
 * Converts ParsedImportItem objects into the internal Item type.
 */
export function convertToItems(parsedItems: ParsedImportItem[]): Item[] {
    return parsedItems.map(item => ({
        id: uuidv4(),
        text: item.text,
        note: item.note,
        checkIfExistAtHome: item.checkIfExistAtHome,
        completed: false
    }));
}