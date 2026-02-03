import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Sun,
    Search,
    LayoutGrid,
    SquareCheck,
    Settings,
    Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { Commit } from '../types';
import commitsData from '../commits.json';

const commits = commitsData as Commit[];

export const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme, searchQuery, setSearchQuery } = useApp();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const latestCommit = commits[0];

    const navItems = [
        { path: '/', icon: LayoutGrid, label: t('nav.home', 'Hem') },
        { path: '/todos', icon: SquareCheck, label: t('nav.todos', 'Att göra') },
    ];

    return (
        <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            {/* Logo Area */}
            <div className="p-6">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/anti/favicon.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-sm" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Anti
                    </h1>
                </Link>
            </div>

            {/* Search Area */}
            <div className="px-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('app.searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <item.icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 group"
                >
                    <Settings size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{t('nav.settings', 'Inställningar')}</span>
                </button>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                        title={t('app.toggleTheme')}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>

                {/* Commit Info */}
                {latestCommit && (
                    <div className="px-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400 dark:text-gray-500">
                                <span className="uppercase">
                                    {(() => {
                                        const commitDate = new Date(latestCommit.date);
                                        const now = new Date();
                                        const isCurrentYear = commitDate.getFullYear() === now.getFullYear();
                                        const day = commitDate.getDate().toString().padStart(2, '0');
                                        const month = commitDate.toLocaleString('sv-SE', { month: 'short' });
                                        const year = isCurrentYear ? '' : ` ${commitDate.getFullYear()}`;
                                        return `${day} ${month}${year}`;
                                    })()}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <Link
                                    to="/activity"
                                    className="transition-colors hover:text-blue-500 dark:hover:text-blue-400 truncate"
                                    title={latestCommit.message}
                                >
                                    {latestCommit.message.length > 20
                                        ? `${latestCommit.message.substring(0, 20)}...`
                                        : latestCommit.message}
                                </Link>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};
