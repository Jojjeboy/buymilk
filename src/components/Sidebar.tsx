import { NavLink, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Sun,
    LayoutGrid,
    SquareCheck,
    Settings,
    Moon,
    Search,
    X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Commit } from '../types';
import commitsData from '../commits.json';

const commits = commitsData as Commit[];

interface SidebarProps {
    onNavClick?: () => void;
}

// eslint-disable-next-line react/prop-types
export const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const latestCommit = commits[0];

    const handleSearchChange = (val: string) => {
        if (val) {
            setSearchParams({ q: val }, { replace: true });
        } else {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('q');
            setSearchParams(nextParams, { replace: true });
        }
    };

    const navItems = [
        { path: '/', icon: LayoutGrid, label: t('nav.home') },
        { path: '/todos', icon: SquareCheck, label: t('nav.todos') },
        { path: '/settings', icon: Settings, label: t('nav.settings') },
    ];

    return (
        <div className="flex h-full flex-col glass border-r-0">
            {/* Logo Area */}
            <div className="p-6">
                <Link to="/" onClick={() => {
                    handleSearchChange('');
                    onNavClick?.();
                }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/buymilk/favicon.png" alt="Logo" className="w-20 h-20 rounded-2xl shadow-sm" />
                    <h1 className="text-2xl font-bold text-[#2c6de3]">
                        BuyMilk
                    </h1>
                </Link>
            </div>

            {/* Search Input (Desktop/Drawer) */}
            <div className="px-4 mb-6">
                <div className="relative group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={t('app.searchPlaceholder')}
                        className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onNavClick}
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
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                            title={t('app.toggleTheme')}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
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
                                    onClick={onNavClick}
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
        </div>
    );
};
