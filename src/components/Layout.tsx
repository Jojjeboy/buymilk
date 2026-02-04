import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchResults } from './SearchResults';
import { Sidebar } from './Sidebar';
import { OfflineIndicator } from './OfflineIndicator';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { theme, toggleTheme, searchQuery, setSearchQuery } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-shrink-0 sticky top-0 h-screen z-20">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay/Drawer */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div 
                        className="absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-300 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 flex justify-end">
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <Sidebar onNavClick={() => setIsMenuOpen(false)} />
                    </div>
                </div>
            )}

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
                                <Search size={22} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                aria-label={t('app.toggleTheme')}
                            >
                                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 ml-1"
                                aria-label="Menu"
                            >
                                <Menu size={26} />
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
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all px-4"
                            />
                        </div>
                    )}
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-4 w-full mx-auto md:p-8 md:max-w-7xl pb-8 min-w-0">
                    {searchQuery ? <SearchResults /> : children}
                </main>
            </div>
        </div>
    );
};
