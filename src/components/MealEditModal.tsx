import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import { X, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MealIngredientsModal } from './MealIngredientsModal';

interface MealEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Meal>) => Promise<void>;
    meal: Meal | null;
}

export const MealEditModal: React.FC<MealEditModalProps> = ({ isOpen, onClose, onSave, meal }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [tags, setTags] = useState('');
    const [instructions, setInstructions] = useState('');
    const [servings, setServings] = useState('');
    const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (meal) {
            setName(meal.name);
            setDescription(meal.description || '');
            setImageUrl(meal.imageUrl || '');
            setTags(meal.tags ? meal.tags.join(', ') : '');
            setInstructions(meal.instructions ? meal.instructions.join('\n') : '');
            setServings(meal.servings ? meal.servings.toString() : '');
        }
    }, [meal]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!meal || !name.trim()) return;
        
        setIsSaving(true);
        try {
            await onSave(meal.id, {
                name: name.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim(),
                tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
                instructions: instructions.split('\n').filter(line => line.trim() !== ''),
                servings: servings ? parseInt(servings, 10) : undefined
            });
            onClose();
        } catch (error) {
            console.error('Failed to save meal:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {t('common.edit', 'Redigera måltid')}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.name', 'Namn')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="T.ex. Pasta Carbonara"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.description', 'Beskrivning')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                            placeholder="Kort beskrivning av rätten..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.imageUrl', 'Bild-URL')}
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.tags', 'Taggar (separerade med komma)')}
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Snabbt, Vegetariskt, Lyxigt"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('common.servings', 'Portioner')}
                            </label>
                            <input
                                type="number"
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="4"
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={() => setIsIngredientsOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-sm font-medium"
                            >
                                <Utensils className="w-4 h-4" />
                                {t('common.editIngredients', 'Ingredienser')}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.instructions', 'Instruktioner (en rad per steg)')}
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                            placeholder="1. Koka upp vatten...&#10;2. Tillsätt pasta..."
                        />
                    </div>
                </div>
                {meal && (
                    <MealIngredientsModal 
                        isOpen={isIngredientsOpen} 
                        onClose={() => setIsIngredientsOpen(false)} 
                        meal={meal} 
                    />
                )}

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {t('common.cancel', 'Avbryt')}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-colors"
                    >
                        {isSaving ? t('common.saving', 'Sparar...') : t('common.save', 'Spara')}
                    </button>
                </div>
            </div>
        </div>
    );
};