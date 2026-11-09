// src/components/board/KanbanBoard.tsx
import React, {useEffect, useRef, useState} from 'react';
import {DragDropContext, Droppable, DropResult} from '@hello-pangea/dnd';
import {
    AlertCircle,
    Archive,
    CheckCircle2,
    Command,
    Download,
    Filter,
    Layout,
    Moon,
    Plus,
    Search,
    Sun,
    Upload,
    X,
} from 'lucide-react';
import {useBoardStore} from '../../store/useBoardStore';
import {BoardColumn, COLOR_OPTIONS} from './BoardColumn';
import {ArchiveModal} from './ArchiveModal';
import {CommandPalette} from './CommandPalette';
import {TaskModal} from './TaskModal';
import {ToastContainer} from './ToastContainer';
import {Column, Priority, Task} from '../../types/board';
import {isPast} from 'date-fns';

export const KanbanBoard: React.FC = () => {
    const {
        columns,
        filters,
        moveTask,
        reorderColumn,
        setFilters,
        addColumn,
        archivedTasks,
        exportBoardData,
        importBoardData,
    } = useBoardStore();

    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newColumnColor, setNewColumnColor] = useState('indigo');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const [activeTaskToEdit, setActiveTaskToEdit] = useState<{ task: Task; columnId: string } | null>(
        null
    );
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return (
                document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches
            );
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
                return;
            }

            if (e.altKey) {
                const key = e.key.toLowerCase();
                switch (key) {
                    case 'n':
                        e.preventDefault();
                        if (columns.length > 0) {
                            setActiveTaskToEdit({task: null as any, columnId: columns[0].id});
                            setIsTaskModalOpen(true);
                        }
                        break;
                    case 't':
                        e.preventDefault();
                        setIsDark((prev) => !prev);
                        break;
                    case 'a':
                        e.preventDefault();
                        setIsArchiveOpen(true);
                        break;
                    case 'e':
                        e.preventDefault();
                        exportBoardData();
                        break;
                    case 'i':
                        e.preventDefault();
                        fileInputRef.current?.click();
                        break;
                    case 'c':
                        e.preventDefault();
                        setFilters({searchQuery: '', priorities: [], tags: []});
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [columns, exportBoardData, setFilters]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDoneColumn = (col: Column) =>
        col.isDone || col.id === 'col-3' || col.title.toLowerCase().includes('done');

    const allTasks = columns.flatMap((c) => c.tasks);
    const totalTasksCount = allTasks.length;

    const completedTasksCount = columns.reduce((acc, col) => {
        if (isDoneColumn(col)) {
            return acc + col.tasks.length;
        }
        return (
            acc +
            col.tasks.filter((t) => t.subtasks.length > 0 && t.subtasks.every((st) => st.completed)).length
        );
    }, 0);

    const overdueTasksCount = columns.reduce((acc, col) => {
        if (isDoneColumn(col)) return acc;
        return (
            acc +
            col.tasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate))).length
        );
    }, 0);

    const isFiltering =
        filters.searchQuery.length > 0 || filters.priorities.length > 0 || filters.tags.length > 0;

    const togglePriorityFilter = (priority: Priority) => {
        const newPriorities = filters.priorities.includes(priority)
            ? filters.priorities.filter((p) => p !== priority)
            : [...filters.priorities, priority];
        setFilters({priorities: newPriorities});
    };

    const filterTasks = (tasks: Task[]) => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesPriority =
                filters.priorities.length === 0 || filters.priorities.includes(task.priority);
            const matchesTags =
                filters.tags.length === 0 || filters.tags.some((tag) => task.tags.includes(tag));
            return matchesSearch && matchesPriority && matchesTags;
        });
    };

    const onDragEnd = (result: DropResult) => {
        const {source, destination, type} = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;
        if (type === 'column') {
            reorderColumn(source.index, destination.index);
            return;
        }
        if (type === 'task') {
            moveTask(source.droppableId, destination.droppableId, source.index, destination.index);
        }
    };

    const handleAddColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (newColumnTitle.trim()) {
            addColumn(newColumnTitle.trim(), newColumnColor);
            setNewColumnTitle('');
            setNewColumnColor('indigo');
            setIsAddingColumn(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const success = importBoardData(content);
            if (!success) {
                alert('Failed to parse JSON backup file. Please ensure it is a valid format.');
            }
        };
        reader.readAsText(file);

        if (e.target) e.target.value = '';
    };

    return (
        <div
            className="relative flex flex-col h-screen bg-slate-50 dark:bg-slate-950 bg-grid-pattern overflow-hidden transition-colors duration-300">
            <div
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"/>
            <div
                className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"/>

            <header
                className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                            <Layout size={20}/>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                Project Workspace
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Kanban Board Architecture</p>
                        </div>
                    </div>

                    <div
                        className="hidden lg:flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <span>Tasks:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                {totalTasksCount}
              </span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                            <CheckCircle2 size={13}/>
                            <span>Completed:</span>
                            <span className="font-semibold">{completedTasksCount}</span>
                        </div>
                        {overdueTasksCount > 0 && (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/40">
                                <AlertCircle size={13}/>
                                <span>Overdue:</span>
                                <span className="font-semibold">{overdueTasksCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="relative flex items-center cursor-pointer group"
                    >
                        <Search className="absolute left-3 text-slate-400 group-hover:text-indigo-500 transition-colors"
                                size={16}/>
                        <input
                            type="text"
                            readOnly
                            placeholder="Search or press Ctrl+K..."
                            value={filters.searchQuery}
                            className="pl-9 pr-14 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl outline-none text-slate-800 dark:text-slate-200 w-60 transition-all placeholder:text-slate-400 cursor-pointer"
                        />
                        <div
                            className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-slate-500 dark:text-slate-300">
                            <Command size={10}/>
                            <span>K</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsArchiveOpen(true)}
                        className="relative p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                        title="Open Archive (Alt+A)"
                    >
                        <Archive size={18}/>
                        {archivedTasks.length > 0 && (
                            <span
                                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {archivedTasks.length}
              </span>
                        )}
                    </button>

                    <button
                        onClick={exportBoardData}
                        className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                        title="Export JSON Backup (Alt+E)"
                    >
                        <Download size={18}/>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".json"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                        title="Import JSON Backup (Alt+I)"
                    >
                        <Upload size={18}/>
                    </button>

                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                        title="Toggle theme (Alt+T)"
                    >
                        {isDark ? <Sun size={18}/> : <Moon size={18}/>}
                    </button>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className={`p-2.5 rounded-xl border transition-colors ${
                                isFiltering
                                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
                                    : 'text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Filter size={18}/>
                        </button>

                        {isFilterMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                    Filter by Priority
                                </h4>
                                <div className="space-y-2">
                                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.priorities.includes(p)}
                                                onChange={() => togglePriorityFilter(p)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {p}
                      </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setFilters({priorities: [], tags: [], searchQuery: ''})}
                                        className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="column" direction="horizontal">
                    {(provided) => (
                        <main
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="relative z-10 flex-1 overflow-x-auto overflow-y-hidden flex gap-6 p-8 items-start"
                        >
                            {columns.map((column, index) => (
                                <BoardColumn
                                    key={column.id}
                                    column={column}
                                    index={index}
                                    filteredTasks={filterTasks(column.tasks)}
                                    isFiltering={isFiltering}
                                />
                            ))}
                            {provided.placeholder}

                            <div className="w-80 shrink-0">
                                {isAddingColumn ? (
                                    <form
                                        onSubmit={handleAddColumn}
                                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
                                    >
                                        <input
                                            type="text"
                                            autoFocus
                                            value={newColumnTitle}
                                            onChange={(e) => setNewColumnTitle(e.target.value)}
                                            placeholder="Column title..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 mb-3"
                                        />

                                        <div className="mb-3">
                                            <label
                                                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                Column Color
                                            </label>
                                            <div className="flex items-center gap-1.5">
                                                {COLOR_OPTIONS.map((c) => (
                                                    <button
                                                        type="button"
                                                        key={c.id}
                                                        onClick={() => setNewColumnColor(c.id)}
                                                        className={`w-5 h-5 rounded-full ${c.dot} flex items-center justify-center transition-transform hover:scale-110 ${
                                                            newColumnColor === c.id ? 'ring-2 ring-offset-1 ring-slate-400' : ''
                                                        }`}
                                                        title={c.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                                            >
                                                Add Column
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingColumn(false)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingColumn(true)}
                                        className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 border-2 border-dashed border-slate-300/70 dark:border-slate-800/70 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 backdrop-blur-sm transition-all font-medium text-sm"
                                    >
                                        <Plus size={18}/> Add another column
                                    </button>
                                )}
                            </div>
                        </main>
                    )}
                </Droppable>
            </DragDropContext>

            <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)}/>

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onOpenCreateTask={() => {
                    if (columns.length > 0) {
                        setActiveTaskToEdit({task: null as any, columnId: columns[0].id});
                        setIsTaskModalOpen(true);
                    }
                }}
                onOpenArchive={() => setIsArchiveOpen(true)}
                onToggleTheme={() => setIsDark(!isDark)}
                onSelectTask={(task, columnId) => {
                    setActiveTaskToEdit({task, columnId});
                    setIsTaskModalOpen(true);
                }}
                isDark={isDark}
            />

            {activeTaskToEdit && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setActiveTaskToEdit(null);
                    }}
                    columnId={activeTaskToEdit.columnId}
                    taskToEdit={activeTaskToEdit.task}
                />
            )}

            {/* Toast Notifications */}
            <ToastContainer/>
        </div>
    );
};