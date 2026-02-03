import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun, Search, Settings, LayoutGrid, SquareCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchResults } from './SearchResults';
import { SettingsModal } from './SettingsModal';
import { Sidebar } from './Sidebar';
import { OfflineIndicator } from './OfflineIndicator';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { theme, toggleTheme, searchQuery, setSearchQuery } = useApp();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);



    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-shrink-0 sticky top-0 h-screen z-20">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <OfflineIndicator />

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-10 glass p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img src="/buymilk/favicon.png" alt="Logo" className="w-16 h-16 rounded-xl shadow-sm" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    BuyMilk
                                </h1>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                aria-label={t('app.searchPlaceholder')}
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                aria-label={t('app.toggleTheme')}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    </div>
                    {isSearchOpen && (
                        <div className="relative animate-in slide-in-from-top-2 duration-200">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('app.searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-4 w-full mx-auto md:p-8 md:max-w-7xl pb-24 md:pb-8 min-w-0">
                    {searchQuery ? <SearchResults /> : children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 glass pb-safe z-30">
                    <div className="flex justify-around items-center h-16">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center w-full h-full space-y-1
                                ${isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}
                        >
                            <LayoutGrid size={24} />
                            <span className="text-[10px] font-medium">{t('nav.home')}</span>
                        </NavLink>

                        <NavLink
                            to="/todos"
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center w-full h-full space-y-1
                                ${isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}
                        >
                            <SquareCheck size={24} />
                            <span className="text-[10px] font-medium">{t('nav.todos')}</span>
                        </NavLink>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className={`
                                flex flex-col items-center justify-center w-full h-full space-y-1
                                ${isSettingsOpen
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}
                        >
                            <Settings size={24} />
                            <span className="text-[10px] font-medium">{t('nav.settings')}</span>
                        </button>
                    </div>
                </nav>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};
