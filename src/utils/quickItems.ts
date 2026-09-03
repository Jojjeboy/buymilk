import type { QuickItem } from '../types';

export const ALL_QUICK_ITEMS: QuickItem[] = [
    // Mejeriprodukter
    { key: 'milk', emoji: '🥛', label: 'Mjölk' },
    { key: 'butter', emoji: '🧈', label: 'Smör' },
    { key: 'eggs', emoji: '🥚', label: 'Ägg' },
    { key: 'filmjolk', emoji: '🥛', label: 'Filmjölk' },
    { key: 'cheese', emoji: '🧀', label: 'Ost' },
    { key: 'cream', emoji: '🥛', label: 'Grädde' },
    { key: 'yogurt', emoji: '🥣', label: 'Yoghurt' },
    
    // Bröd & Bakverk
    { key: 'bread', emoji: '🍞', label: 'Bröd' },
    { key: 'crisps', emoji: '🥨', label: 'Knäckebröd' },
    { key: 'buns', emoji: '🥖', label: 'Bullar' },
    
    // Frukt & Grönt
    { key: 'bananas', emoji: '🍌', label: 'Bananer' },
    { key: 'apples', emoji: '🍎', label: 'Äpple' },
    { key: 'oranges', emoji: '🍊', label: 'Apelsin' },
    { key: 'tomatoes', emoji: '🍅', label: 'Tomater' },
    { key: 'cucumber', emoji: '🥒', label: 'Gurka' },
    { key: 'carrots', emoji: '🥕', label: 'Morot' },
    { key: 'broccoli', emoji: '🥦', label: 'Broccoli' },
    { key: 'salad', emoji: '🥬', label: 'Sallad' },
    { key: 'onion', emoji: '🧅', label: 'Lök' },
    { key: 'potatoes', emoji: '🥔', label: 'Potatis' },
    { key: 'garlic', emoji: '🧄', label: 'Vitlök' },
    
    // Kött & Fisk
    { key: 'chicken', emoji: '🍗', label: 'Kyckling' },
    { key: 'mincedMeat', emoji: '🥩', label: 'Köttfärs' },
    { key: 'bacon', emoji: '🥓', label: 'Bacon' },
    { key: 'salmon', emoji: '🐟', label: 'Lax' },
    { key: 'shrimp', emoji: '🦐', label: 'Räkor' },
    { key: 'pork', emoji: '🍖', label: 'Fläskkarré' },
    
    // Torra varor
    { key: 'pasta', emoji: '🍝', label: 'Pasta' },
    { key: 'rice', emoji: '🍚', label: 'Ris' },
    { key: 'oatmeal', emoji: '🥣', label: 'Havregryn' },
    { key: 'flour', emoji: '🥣', label: 'Mjöl' },
    { key: 'sugar', emoji: '🍬', label: 'Socker' },
    { key: 'tomatoPuree', emoji: '🥫', label: 'Tomatpuré' },
    { key: 'chickpeas', emoji: '🥫', label: 'Kikärter' },
    
    // Drycker
    { key: 'coffee', emoji: '☕', label: 'Kaffe' },
    { key: 'tea', emoji: '🍵', label: 'Te' },
    { key: 'soda', emoji: '🥤', label: 'Läsk' },
    { key: 'juice', emoji: '🍹', label: 'Juice' },
    
    // Övrigt
    { key: 'toiletPaper', emoji: '🧻', label: 'Toapapper' },
    { key: 'salt', emoji: '🧂', label: 'Salt' },
    { key: 'pepper', emoji: '⚫', label: 'Peppar' },
    { key: 'honey', emoji: '🍯', label: 'Honung' },
    { key: 'chocolate', emoji: '🍫', label: 'Choklad' },
    { key: 'cookies', emoji: '🍪', label: 'Kakor' },
    
    // Färdiga måltider
    { key: 'pizza', emoji: '🍕', label: 'Pizza' },
    { key: 'sausage', emoji: '🌭', label: 'Korv' },
    { key: 'leftovers', emoji: '🍲', label: 'Rester' },
];

export const DEFAULT_ENABLED_QUICK_ITEMS = [
    'milk', 'butter', 'eggs', 'bananas', 'bread', 'toiletPaper', 'coffee', 'tomatoes'
];

export function getQuickItemsByKeys(keys: string[]): QuickItem[] {
    return ALL_QUICK_ITEMS.filter(item => keys.includes(item.key));
}