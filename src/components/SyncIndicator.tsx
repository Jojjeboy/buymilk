import React from 'react';
import { Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export const SyncIndicator: React.FC = () => {
    const { t } = useTranslation();
    const { isSyncing } = useApp();

    if (!isSyncing) return null;

    return (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
            <Cloud size={16} className="animate-pulse" />
            <span>{t('common.syncing', 'Syncing changes...')}</span>
        </div>
    );
};