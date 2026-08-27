import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Plus, Trash2, Copy, Braces } from 'lucide-react';
import { Meal } from '../types';

const EXAMPLE_INGREDIENTS_JSON = JSON.stringify([
    { "text": "Krossade tomater", "amount": "1 förp", "checkIfExistAtHome": false },
    { "text": "Lök", "amount": "1 st", "checkIfExistAtHome": true },
    { "text": "Vitlök", "amount": "2 klyftor", "checkIfExistAtHome": true }
], null, 2);

interface MealIngredientsModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: Meal;
}

export const MealIngredientsModal: React.FC<MealIngredientsModalProps> = ({ isOpen, onClose, meal }) => {
    const { updateMeal } = useApp();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [ingredients, setIngredients] = useState<Meal['ingredients']>([]);
    const [newIngredient, setNewIngredient] = useState({ text: '', amount: '' });
    const [isImporting, setIsImporting] = useState(false);
    const [importText, setImportText] = useState('');

    useEffect(() => {
        if (meal) {
            setIngredients(meal.ingredients || []);
        }
    }, [meal]);

    const handleAddIngredient = () => {
        if (!newIngredient.text.trim()) return;
        
        setIngredients([...(ingredients || []), { 
            text: newIngredient.text.trim(), 
            amount: newIngredient.amount.trim(),
            checkIfExistAtHome: false 
        }]);
        setNewIngredient({ text: '', amount: '' });
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients((ingredients || []).filter((_, i) => i !== index));
    };

    const handleImportJSON = () => {
        try {
            const parsed = JSON.parse(importText);
            if (!Array.isArray(parsed)) {
                throw new Error(t('errors.notAnArray', 'JSON måste vara en lista (array) av ingredienser'));
            }

            const importedIngredients = parsed.map(item => ({
                text: item.text || item.name || item.ingredient || 'Okänd ingrediens',
                amount: item.amount || item.quantity || '',
                checkIfExistAtHome: !!item.checkIfExistAtHome
            }));

            setIngredients([...(ingredients || []), ...importedIngredients]);
            setImportText('');
            setIsImporting(false);
            showToast(t('toasts.importSuccess', 'Ingredienser importerade'), 'success');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : t('toasts.error', 'Fel vid import av JSON');
            showToast(errorMessage, 'error');
        }
    };

    const handleToggleHomeCheck = (index: number) => {
        const updated = [...(ingredients || [])];
        if (updated[index]) {
            updated[index] = { 
                ...updated[index], 
                checkIfExistAtHome: !updated[index].checkIfExistAtHome 
            };
            setIngredients(updated);
        }
    };

    const handleSave = async () => {
        try {
            await updateMeal(meal.id, { ingredients });
            showToast(t('toasts.itemUpdated', 'Ingredienser uppdaterade'), 'success');
            onClose();
        } catch {
            showToast(t('toasts.error', 'Ett fel uppstod'), 'error');
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`${t('views.editIngredients', 'Redigera ingredienser')} - ${meal.name}`}
            message=""
            confirmText={t('common.save', 'Spara')}
            onConfirm={handleSave}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {isImporting ? t('views.importIngredients', 'Importera ingredienser') : t('views.addIngredients', 'Lägg till ingredienser')}
                    </h4>
                    {!isImporting && (
                                <button 
                                    onClick={() => setIsImporting(true)}
                                    className="text-xs text-blue-500 hover:underline font-medium flex items-center gap-1"
                                >
                                    <Braces size={12} />
                                    {t('common.importJSON', 'Importera JSON')}
                                </button>
                    )}
                </div>

                {isImporting ? (
                    <div className="space-y-3">
                        <div className="relative">
                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder='[{"text": "Tomater", "amount": "2st"}, ...]'
                                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(EXAMPLE_INGREDIENTS_JSON);
                                    showToast(t('common.copied', 'Exempel kopierat'), 'success');
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-500 transition-colors"
                                title={t('common.copyExample', 'Kopiera exempelformat')}
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleImportJSON}
                                className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                                {t('common.import', 'Importera')}
                            </button>
                            <button 
                                onClick={() => setIsImporting(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                                {t('common.cancel', 'Avbryt')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t('placeholders.ingredientName', 'Ingrediens (t.ex. Tomater)')}
                                value={newIngredient.text}
                                onChange={(e) => setNewIngredient({ ...newIngredient, text: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder={t('placeholders.amount', 'Mängd (t.ex. 2st)')}
                                value={newIngredient.amount}
                                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                                onClick={handleAddIngredient}
                                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                            {(ingredients || []).length === 0 ? (
                                <p className="text-center text-gray-500 py-4">{t('views.noIngredients', 'Inga ingredienser tillagda ännu')}</p>
                            ) : (
                                (ingredients || []).map((ing, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={ing.checkIfExistAtHome} 
                                                onChange={() => handleToggleHomeCheck(index)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                title={t('common.checkHome', 'Kolla om det finns hemma')}
                                            />
                                            <span className="font-medium">
                                                {ing.text} {ing.amount && <span className="text-gray-500 text-sm">({ing.amount})</span>}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveIngredient(index)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};