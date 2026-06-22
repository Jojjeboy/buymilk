export interface Category {
    id: string;
    nameKey: string;
    keywords: string[];
}

export const categories: Category[] = [
    {
        id: 'produce',
        nameKey: 'aisles.produce',
        keywords: [
            // English
            'apple', 'banana', 'orange', 'berry', 'grape', 'lemon', 'lime', 'avocado', 'tomato', 'potato', 'onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'kale', 'lettuce', 'cucumber', 'pepper', 'zucchini', 'eggplant', 'mushroom', 'corn', 'peas', 'vegetables', 'fruit',
            // Swedish
            'äpple', 'banan', 'apelsin', 'bär', 'vindruva', 'citron', 'lime', 'avokado', 'tomat', 'potatis', 'lök', 'vitlök', 'morot', 'broccoli', 'spenat', 'grönkål', 'sallad', 'gurka', 'paprika', 'zucchini', 'aubergine', 'svamp', 'majs', 'ärtor', 'grönsaker', 'frukt', 'rödlök', 'purjolök', 'selleri', 'rädisa', 'blomkål', 'persilja', 'dill', 'basilika', 'ingefära', 'mangold', 'ruccola'
        ]
    },
    {
        id: 'dairy',
        nameKey: 'aisles.dairy',
        keywords: [
            // English
            'milk', 'cheese', 'butter', 'egg', 'yogurt', 'cream', 'sour cream', 'cottage cheese', 'dairy',
            // Swedish
            'mjölk', 'ost', 'smör', 'ägg', 'yoghurt', 'grädde', 'gräddfil', 'kvarg', 'fil', 'crème fraiche', 'creme fraiche', 'cream', 'kesella', 'färskost', 'ricotta', 'mozzarella', 'parmesan', 'halloumi', 'havremjölk', 'havredryck', 'mejeri'
        ]
    },
    {
        id: 'bakery',
        nameKey: 'aisles.bakery',
        keywords: [
            // English
            'bread', 'bagel', 'croissant', 'muffin', 'cake', 'pastry', 'tortilla', 'bun', 'bakery',
            // Swedish
            'bröd', 'fralla', 'bulle', 'kaka', 'tårta', 'wienerbröd', 'kanelbulle', 'skorpor', 'knäckebröd', 'bageri', 'vetebröd', 'rågsikt', 'limpa', 'pitabröd', 'tunnbröd'
        ]
    },
    {
        id: 'meat',
        nameKey: 'aisles.meat',
        keywords: [
            // English
            'chicken', 'beef', 'pork', 'lamb', 'turkey', 'steak', 'bacon', 'sausage', 'ham', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'meat', 'seafood',
            // Swedish
            'kyckling', 'nötkött', 'fläsk', 'fläskfilé', 'lamm', 'kalkon', 'biff', 'bacon', 'korv', 'skinka', 'fisk', 'lax', 'tonfisk', 'räkor', 'räka', 'krabba', 'hummer', 'kött', 'skaldjur', 'köttfärs', 'kycklingfilé', 'kotlett', 'kassler', 'prinskorv', 'falukorv', 'fläskkarré', 'entrecote', 'torsk', 'sej', 'makrill'
        ]
    },
    {
        id: 'frozen',
        nameKey: 'aisles.frozen',
        keywords: [
            // English
            'frozen', 'ice cream', 'frozen pizza', 'frozen veg', 'frozen fruit',
            // Swedish
            'fryst', 'glass', 'frysta', 'fryspizza', 'frystorkad'
        ]
    },
    {
        id: 'pantry',
        nameKey: 'aisles.pantry',
        keywords: [
            // English
            'pasta', 'rice', 'flour', 'sugar', 'oil', 'vinegar', 'salt', 'pepper', 'canned', 'soup', 'beans', 'lentils', 'honey', 'syrup', 'jam', 'peanut butter', 'pantry', 'dry goods',
            // Swedish
            'pasta', 'ris', 'mjöl', 'socker', 'olja', 'olivolja', 'rapsolja', 'vinäger', 'salt', 'peppar', 'konserv', 'soppa', 'bönor', 'linser', 'honung', 'sirap', 'sylt', 'jordnötssmör', 'skafferi', 'rågmjöl', 'vetemjöl', 'grahamsmjöl', 'bakpulver', 'jäst', 'vaniljsocker', 'ströbröd', 'krossade tomater', 'tomatpuré', 'soja', 'senap', 'ketchup', 'majonäs', 'bulgur', 'couscous', 'havregryn', 'müsli', 'cornflakes', 'makaroner', 'spaghetti', 'nudlar'
        ]
    },
    {
        id: 'beverages',
        nameKey: 'aisles.beverages',
        keywords: [
            // English
            'coffee', 'tea', 'soda', 'juice', 'water', 'milkshake', 'energy drink', 'beverage', 'drink',
            // Swedish
            'kaffe', 'te', 'läsk', 'juice', 'vatten', 'energidryck', 'dryck', 'mineralvatten', 'saft', 'öl', 'vin', 'cider', 'smoothie'
        ]
    },
    {
        id: 'household',
        nameKey: 'aisles.household',
        keywords: [
            // English
            'toilet paper', 'paper towel', 'soap', 'shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'detergent', 'fabric softener', 'trash bag', 'foil', 'wrap', 'household', 'cleaning',
            // Swedish
            'toalettpapper', 'toapapper', 'hushållspapper', 'tvål', 'schampo', 'balsam', 'tandkräm', 'tandborste', 'diskmedel', 'tvättmedel', 'sköljmedel', 'soppåsar', 'aluminiumfolie', 'plastfolie', 'hushåll', 'städ', 'svamp', 'disktrasa', 'allrengöring', 'blöjor', 'bindor', 'deodorant', 'handkräm'
        ]
    },
    {
        id: 'snacks',
        nameKey: 'aisles.snacks',
        keywords: [
            // English
            'chips', 'cookie', 'chocolate', 'candy', 'popcorn', 'nut', 'cracker', 'snack', 'sweet',
            // Swedish
            'chips', 'kex', 'choklad', 'godis', 'popcorn', 'nötter', 'snacks', 'lösgodis', 'tuggummi', 'lakrits', 'saltlakrits'
        ]
    }
];

import { matchesCategoryKeywords } from '../utils/keywordMatch';

export const getItemCategory = (text: string): string | undefined => {
    for (const category of categories) {
        if (matchesCategoryKeywords(text, category.keywords)) {
            return category.id;
        }
    }
    return undefined;
};