// src/components/board/CommandPalette.tsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
    Archive,
    CheckSquare,
    CornerDownLeft,
    Download,
    Filter,
    Moon,
    Plus,
    Search,
    Sun,
    Upload,
    X,
} from 'lucide-react';
import {useBoardStore} from '../../store/useBoardStore';
import {Task} from '../../types/board';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenCreateTask: () => void;
    onOpenArchive: () => void;
    onToggleTheme: () => void;
    onSelectTask: (task: Task, columnId: string) => void;
    isDark: boolean;
}

interface CommandAction {
    id: string;
    title: string;
    category: 'Actions' | 'Navigation';
    icon: React.ReactNode;
    shortcut: string;
    keyTrigger: string;
    perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  onOpenCreateTask,
                                                                  onOpenArchive,
                                                                  onToggleTheme,
                                                                  onSelectTask,
                                                                  isDark,
                                                              }) => {
    const {columns, exportBoardData, setFilters} = useBoardStore();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allTasks = columns.flatMap((col) =>
        col.tasks.map((task) => ({...task, columnId: col.id, columnTitle: col.title}))
    );

    const matchedTasks = allTasks.filter(
        (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    const staticActions: CommandAction[] = [
        {
            id: 'create-task',
            title: 'Create New Task',
            category: 'Actions',
            icon: <Plus size={16}/>,
            shortcut: 'Alt+N',
            keyTrigger: 'n',
            perform: () => {
                onClose();
                onOpenCreateTask();
            },
        },
        {
            id: 'toggle-theme',
            title: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
            category: 'Actions',
            icon: isDark ? <Sun size={16}/> : <Moon size={16}/>,
            shortcut: 'Alt+T',
            keyTrigger: 't',
            perform: () => {
                onClose();
                onToggleTheme();
            },
        },
        {
            id: 'open-archive',
            title: 'Open Archive Drawer',
            category: 'Navigation',
            icon: <Archive size={16}/>,
            shortcut: 'Alt+A',
            keyTrigger: 'a',
            perform: () => {
                onClose();
                onOpenArchive();
            },
        },
        {
            id: 'export-data',
            title: 'Export Board Backup (JSON)',
            category: 'Actions',
            icon: <Download size={16}/>,
            shortcut: 'Alt+E',
            keyTrigger: 'e',
            perform: () => {
                onClose();
                exportBoardData();
            },
        },
        {
            id: 'import-data',
            title: 'Import Board Backup (JSON)',
            category: 'Actions',
            icon: <Upload size={16}/>,
            shortcut: 'Alt+I',
            keyTrigger: 'i',
            perform: () => {
                onClose();
                fileInputRef.current?.click();
            },
        },
        {
            id: 'clear-filters',
            title: 'Clear All Active Filters',
            category: 'Actions',
            icon: <Filter size={16}/>,
            shortcut: 'Alt+C',
            keyTrigger: 'c',
            perform: () => {
                onClose();
                setFilters({searchQuery: '', priorities: [], tags: []});
            },
        },
    ];

    const matchedActions = staticActions.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
    );

    const combinedItems = [
        ...matchedActions.map((a) => ({type: 'action' as const, item: a})),
        ...matchedTasks.map((t) => ({type: 'task' as const, item: t})),
    ];

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Intercept Alt + Key shortcuts inside the palette
        if (e.altKey) {
            const matchingAction = staticActions.find(
                (a) => a.keyTrigger === e.key.toLowerCase()
            );
            if (matchingAction) {
                e.preventDefault();
                matchingAction.perform();
                return;
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < combinedItems.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedItems.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const current = combinedItems[selectedIndex];
            if (current) {
                if (current.type === 'action') {
                    current.item.perform();
                } else {
                    onClose();
                    onSelectTask(current.item, current.item.columnId);
                }
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{scale: 0.96, opacity: 0, y: -10}}
                        animate={{scale: 1, opacity: 1, y: 0}}
                        exit={{scale: 0.96, opacity: 0, y: -10}}
                        transition={{type: 'spring', damping: 25, stiffness: 350}}
                        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleKeyDown}
                    >
                        {/* Command Header & Search Bar */}
                        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                            <Search className="text-slate-400 mr-3 shrink-0" size={18}/>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search tasks..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                            />
                            <button
                                onClick={onClose}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                            >
                                <X size={16}/>
                            </button>
                        </div>

                        {/* Hidden Input for Import Data */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const content = event.target?.result as string;
                                    useBoardStore.getState().importBoardData(content);
                                };
                                reader.readAsText(file);
                            }}
                            accept=".json"
                            className="hidden"
                        />

                        {/* Command Results Area */}
                        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                            {combinedItems.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No actions or tasks matching &quot;{query}&quot;
                                </div>
                            ) : (
                                <>
                                    {matchedActions.length > 0 && (
                                        <div
                                            className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            System Actions
                                        </div>
                                    )}
                                    {matchedActions.map((action) => {
                                        const globalIndex = combinedItems.findIndex(
                                            (ci) => ci.type === 'action' && ci.item.id === action.id
                                        );
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <div
                                                key={action.id}
                                                onClick={action.perform}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white font-medium'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                          <span
                              className={
                                  isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                              }
                          >
                            {action.icon}
                          </span>
                                                    <span>{action.title}</span>
                                                </div>
                                                {action.shortcut && (
                                                    <span
                                                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                                            isSelected
                                                                ? 'bg-indigo-500/40 text-white border-indigo-400'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                            {action.shortcut}
                          </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {matchedTasks.length > 0 && (
                                        <div
                                            className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Tasks ({matchedTasks.length})
                                        </div>
                                    )}
                                    {matchedTasks.map((task) => {
                                        const globalIndex = combinedItems.findIndex(
                                            (ci) => ci.type === 'task' && ci.item.id === task.id
                                        );
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => {
                                                    onClose();
                                                    onSelectTask(task, task.columnId);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white font-medium'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 truncate pr-4">
                                                    <CheckSquare
                                                        size={16}
                                                        className={
                                                            isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                                                        }
                                                    />
                                                    <span className="truncate">{task.title}</span>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-md border shrink-0 ${
                                                            isSelected
                                                                ? 'bg-indigo-500/30 text-white border-indigo-400'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                            {task.columnTitle}
                          </span>
                                                </div>
                                                <span
                                                    className={`text-xs uppercase font-semibold shrink-0 ${
                                                        isSelected
                                                            ? 'text-white'
                                                            : task.priority === 'urgent'
                                                                ? 'text-red-500'
                                                                : task.priority === 'high'
                                                                    ? 'text-orange-500'
                                                                    : 'text-slate-400'
                                                    }`}
                                                >
                          {task.priority}
                        </span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Footer Navigation Bar */}
                        <div
                            className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] text-slate-400">
                            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd
                      className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs font-mono">
                    ↑↓
                  </kbd>{' '}
                    Navigate
                </span>
                                <span className="flex items-center gap-1">
                  <kbd
                      className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs font-mono">
                    <CornerDownLeft size={10}/>
                  </kbd>{' '}
                                    Select
                </span>
                            </div>
                            <span>
                <kbd
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs font-mono">
                  ESC
                </kbd>{' '}
                                Close
              </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};