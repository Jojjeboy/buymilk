import React from 'react';
import ReactDOM from 'react-dom';
import { X, RefreshCw, LogOut, Activity, ChevronRight, BarChart3, SortAsc, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { lists, defaultListId, updateListSettings } = useApp();
    const list = lists.find(l => l.id === defaultListId);
    const sortBy = list?.settings?.defaultSort || 'manual';

    const [calendarAccordionOpen, setCalendarAccordionOpen] = React.useState(false);
    
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const getNextFullHour = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return toLocalISOString(now);
    };

    const [calendarStartTime, setCalendarStartTime] = React.useState(() =>
        list?.settings?.calendarStartTime || getNextFullHour()
    );
    const [calendarEndTime, setCalendarEndTime] = React.useState(() => {
        if (list?.settings?.calendarEndTime) return list.settings.calendarEndTime;
        const startStr = list?.settings?.calendarStartTime || getNextFullHour();
        const endDate = new Date(startStr);
        endDate.setHours(endDate.getHours() + 1);
        return toLocalISOString(endDate);
    });

    const generateGoogleCalendarLink = () => {
        if (!list) return;

        const title = encodeURIComponent(t('lists.groceryTitle'));
        const itemsText = list.items.map(item => `• ${item.text}`).join('\n');
        const linkText = t('lists.settings.calendar.linkText');
        const deepLink = window.location.origin; // Simplified
        const description = encodeURIComponent(`${itemsText}\n\n${linkText}: ${deepLink}`);

        const formatGoogleTime = (isoString: string) => {
            const date = new Date(isoString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startTime = formatGoogleTime(calendarStartTime);
        const endTime = formatGoogleTime(calendarEndTime);
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startTime}/${endTime}`;
        window.open(calendarUrl, '_blank');
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold">{t('settings.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('settings.language')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`p-3 rounded-xl border transition-all ${i18n.language === 'en'
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('sv')}
                                className={`p-3 rounded-xl border transition-all ${i18n.language === 'sv'
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                Svenska
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('lists.settings.title')}</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5 px-1">
                                <SortAsc size={14} />
                                {t('lists.settings.sort')}
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {(['manual', 'alphabetical', 'completed'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            if (list) {
                                                updateListSettings(list.id, {
                                                    threeStageMode: list.settings?.threeStageMode ?? false,
                                                    defaultSort: mode,
                                                    calendarStartTime: list.settings?.calendarStartTime,
                                                    calendarEndTime: list.settings?.calendarEndTime,
                                                    pinned: list.settings?.pinned
                                                });
                                            }
                                        }}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${sortBy === mode
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{t(`lists.sort.${mode}`)}</span>
                                        {sortBy === mode && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setCalendarAccordionOpen(!calendarAccordionOpen)}
                                className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">{t('lists.settings.calendar.title')}</div>
                                        <div className="text-xs text-gray-500">{t('lists.settings.calendar.description')}</div>
                                    </div>
                                </div>
                                <ChevronDown className={`text-gray-400 transition-transform duration-200 ${calendarAccordionOpen ? 'rotate-180' : ''}`} size={20} />
                            </button>

                            {calendarAccordionOpen && (
                                <div className="mt-4 space-y-4 px-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500">{t('lists.settings.calendar.startTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarStartTime}
                                                onChange={(e) => setCalendarStartTime(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500">{t('lists.settings.calendar.endTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarEndTime}
                                                onChange={(e) => setCalendarEndTime(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateGoogleCalendarLink}
                                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={18} />
                                        {t('lists.settings.calendar.addToCalendar')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('history.title', 'Aktivitet')}</h3>
                        <Link
                            to="/activity"
                            onClick={onClose}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <div className="font-medium">{t('history.activityLog', 'Aktivitetslogg')}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('history.activityLogDesc', 'Visa ändringshistorik')}</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                        <Link
                            to="/statistics"
                            onClick={onClose}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <div className="font-medium">{t('history.statistics', 'Statistik')}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('history.statisticsDesc', 'Användningsinsikter och trender')}</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('settings.system', 'System')}</h3>
                        <button
                            onClick={() => {
                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                                        for (const registration of registrations) {
                                            registration.unregister();
                                        }
                                        window.location.reload();
                                    });
                                } else {
                                    window.location.reload();
                                }
                            }}
                            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group w-full"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                <RefreshCw size={20} />
                            </div>
                            <div>
                                <div className="font-medium">{t('settings.reloadUpdate', 'Reload & Update')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('settings.reloadUpdateDesc', 'Clear cache and reload to get the latest version')}</div>
                            </div>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('settings.account', 'Account')}</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div>
                                <div className="font-medium">{user?.displayName || user?.email}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title={t('settings.logout', 'Logout')}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
