import React from 'react';
import { RefreshCw, LogOut, Activity, BarChart3, SortAsc, Calendar, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SettingsView: React.FC = () => {
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
        const deepLink = window.location.origin; 
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

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <Settings size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('settings.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('settings.subtitle', 'Hantera dina appinställningar och konto')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.language')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'sv', label: 'Svenska' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => i18n.changeLanguage(lang.code)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center font-semibold ${i18n.language === lang.code
                                        ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-800'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('lists.settings.title')}</h3>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 flex items-center gap-2 px-1 uppercase tracking-wider">
                                <SortAsc size={14} />
                                {t('lists.settings.sort')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${sortBy === mode
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                            : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-800'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{t(`lists.sort.${mode}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-2">
                            <button
                                onClick={() => setCalendarAccordionOpen(!calendarAccordionOpen)}
                                className="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                                        <Calendar size={22} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 dark:text-white">{t('lists.settings.calendar.title')}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('lists.settings.calendar.description')}</div>
                                    </div>
                                </div>
                                <ChevronDown className={`text-gray-400 transition-transform duration-300 ${calendarAccordionOpen ? 'rotate-180' : ''}`} size={20} />
                            </button>

                            {calendarAccordionOpen && (
                                <div className="mt-4 space-y-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('lists.settings.calendar.startTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarStartTime}
                                                onChange={(e) => setCalendarStartTime(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('lists.settings.calendar.endTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarEndTime}
                                                onChange={(e) => setCalendarEndTime(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateGoogleCalendarLink}
                                        className="w-full py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <Calendar size={20} />
                                        {t('lists.settings.calendar.addToCalendar')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('history.title', 'Insikter')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                to="/activity"
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                            >
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{t('history.activityLog', 'Aktivitetslogg')}</div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.activityLogDesc', 'Visa ändringshistorik')}</div>
                                </div>
                            </Link>
                            <Link
                                to="/statistics"
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                            >
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <BarChart3 size={22} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{t('history.statistics', 'Statistik')}</div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.statisticsDesc', 'Användningsinsikter')}</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.system', 'System')}</h3>
                            <button
                                onClick={() => {
                                    if ('serviceWorker' in navigator) {
                                        navigator.serviceWorker.getRegistrations().then((registrations) => {
                                            for (const registration of registrations) { registration.unregister(); }
                                            window.location.reload();
                                        });
                                    } else { window.location.reload(); }
                                }}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group w-full"
                            >
                                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <RefreshCw size={22} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 dark:text-white">{t('settings.reloadUpdate', 'Reload & Update')}</div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.reloadUpdateDesc', 'Tvinga uppdatering')}</div>
                                </div>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.account', 'Konto')}</h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                        {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{user?.displayName || user?.email}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => logout()}
                                    className="p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-95"
                                    title={t('settings.logout', 'Logga ut')}
                                >
                                    <LogOut size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
