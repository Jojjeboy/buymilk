import React from 'react';
import { PlayCircle, Edit, Trash, List as ListIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ListCombination, List } from '../types';

interface CombinationCardProps {
    combination: ListCombination;
    lists: List[];
    onStart: (listIds: string[]) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const CombinationCard: React.FC<CombinationCardProps> = ({
    combination,
    lists,
    onStart,
    onEdit,
    onDelete
}) => {
    const { t } = useTranslation();
    
    // Find the actual list objects that are part of this combination
    const combinationLists = combination.listIds
        .map(id => lists.find(l => l.id === id))
        .filter((l): l is List => !!l);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {combination.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <ListIcon size={14} />
                        <span>{t('combinations.listCount', { count: combinationLists.length })}</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onEdit(combination.id)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                        title={t('common.edit', 'Redigera')}
                    >
                        <Edit size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(combination.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                        title={t('common.delete', 'Radera')}
                    >
                        <Trash size={18} />
                    </button>
                </div>
            </div>

            {/* List names preview */}
            <div className="flex flex-wrap gap-2 mb-4">
                {combinationLists.slice(0, 4).map(list => (
                    <span 
                        key={list.id} 
                        className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded max-w-[150px] truncate"
                    >
                        {list.name}
                    </span>
                ))}
                {combinationLists.length > 4 && (
                    <span className="text-xs text-gray-500 flex items-center">
                        +{combinationLists.length - 4}
                    </span>
                )}
            </div>

            {/* Start Button */}
            <button
                onClick={() => onStart(combination.listIds)}
                className="w-full py-2 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-all hover:shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
            >
                <PlayCircle size={18} />
                <span>{t('sessions.start', 'Starta Session')}</span>
            </button>
        </div>
    );
};
