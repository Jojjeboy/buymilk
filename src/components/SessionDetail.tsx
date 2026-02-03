import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

export const SessionDetail: React.FC = () => {
    const { t } = useTranslation();
    const { sessionId } = useParams<{ sessionId: string }>();
    const { sessions, lists, updateListItems, completeSession, deleteSession } = useApp();
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const session = sessions.find((s) => s.id === sessionId);
    const sessionLists = session
        ? session.listIds
            .map(listId => lists.find(l => l.id === listId))
            .filter(Boolean) as typeof lists // Preserve order from listIds
        : [];

    React.useEffect(() => {
        if (session) {
            document.title = `Anti - ${session.name}`;
        }
    }, [session]);

    if (!session) {
        return (
            <div className="text-center py-10">
                <p>{t('sessions.notFound', 'Session hittades inte')}</p>
                <Link to="/" className="text-blue-500 hover:underline">
                    {t('categories.goBack', 'Gå tillbaka')}
                </Link>
            </div>
        );
    }

    const handleToggleItem = async (listId: string, itemId: string) => {
        const list = lists.find((l) => l.id === listId);
        if (list) {
            const threeStageMode = list.settings?.threeStageMode ?? false;
            const newItems = list.items.map((item) => {
                if (item.id !== itemId) return item;

                // Logic for state cycling
                let newState: 'unresolved' | 'ongoing' | 'completed';
                let newCompleted: boolean;

                if (threeStageMode) {
                    // Cycle: unresolved -> ongoing -> completed -> unresolved
                    if (item.completed) {
                        // Was completed, go to unresolved
                        newState = 'unresolved';
                        newCompleted = false;
                    } else if (item.state === 'ongoing') {
                        // Was ongoing, go to completed
                        newState = 'completed';
                        newCompleted = true;
                    } else {
                        // Was unresolved, go to ongoing
                        newState = 'ongoing';
                        newCompleted = false;
                    }
                } else {
                    // Normal toggle
                    newCompleted = !item.completed;
                    newState = newCompleted ? 'completed' : 'unresolved';
                }

                return { ...item, completed: newCompleted, state: newState };
            });
            await updateListItems(listId, newItems);
        }
    };

    const confirmComplete = async () => {
        await completeSession(session.id);
        setCompleteModalOpen(false);
        // Delete the session after completing
        await deleteSession(session.id);
        // Navigate back to category or home
        if (session.categoryId) {
            navigate(`/category/${session.categoryId}`);
        } else {
            navigate('/');
        }
    };

    // Calculate progress
    const totalItems = sessionLists.reduce((sum, list) => sum + list.items.length, 0);
    const completedItems = sessionLists.reduce(
        (sum, list) => sum + list.items.filter((item) => item.completed).length,
        0
    );
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Link
                    to={session.categoryId ? `/category/${session.categoryId}` : '/'}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft />
                </Link>
                <h2 className="text-xl font-semibold">{session.name}</h2>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t('sessions.progress', 'Framsteg')}
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {progressPercent}% ({completedItems}/{totalItems})
                    </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Lists */}
            <div className="space-y-6">
                {sessionLists.map((list) => (
                    <div
                        key={list.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {/* List Header */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {list.name}
                                </h3>
                                <Link
                                    to={`/list/${list.id}`}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {t('sessions.viewFullList', 'Visa lista')}
                                </Link>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="p-4 space-y-2">
                            {list.items.length === 0 ? (
                                <p className="text-center text-gray-500 py-2">
                                    {t('lists.emptyList', 'Listan är tom')}
                                </p>
                            ) : (
                                list.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                            item.completed
                                                ? 'bg-gray-50 dark:bg-gray-700/50'
                                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <button
                                            onClick={() => handleToggleItem(list.id, item.id)}
                                            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                                                item.completed
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : item.state === 'ongoing'
                                                    ? 'bg-orange-400 border-orange-400'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                            }`}
                                        >
                                            {item.completed && <Check size={14} className="text-white" />}
                                            {!item.completed && item.state === 'ongoing' && <Circle size={10} className="text-white fill-white" />}
                                        </button>
                                        <span
                                            className={`flex-1 transition-all ${
                                                item.completed
                                                    ? 'line-through text-gray-500 dark:text-gray-400'
                                                    : 'text-gray-900 dark:text-gray-100'
                                            }`}
                                        >
                                            {item.text}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}

                {sessionLists.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">
                        {t('sessions.noListsInSession', 'Inga listor i denna session')}
                    </p>
                )}
            </div>

            {/* Complete Session Button */}
            <button
                onClick={() => setCompleteModalOpen(true)}
                className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
            >
                {t('sessions.completeSession', 'Slutför Session & Återställ Listor')}
            </button>

            {/* Complete Confirmation Modal */}
            <Modal
                isOpen={completeModalOpen}
                onClose={() => setCompleteModalOpen(false)}
                onConfirm={confirmComplete}
                title={t('sessions.completeTitle', 'Slutför Session')}
                message={t(
                    'sessions.completeMessage',
                    'Detta kommer att återställa alla listor i sessionen (markera alla items som icke-avklarade) och ta bort sessionen. Vill du fortsätta?'
                )}
                confirmText={t('sessions.complete', 'Slutför')}
                isDestructive
            />
        </div>
    );
};
