import React from 'react';
import ReactDOM from 'react-dom';
import { X, RefreshCw, LogOut, Activity, ChevronRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();

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
