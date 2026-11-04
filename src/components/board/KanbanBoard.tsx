// src/components/board/KanbanBoard.tsx
import React, {useEffect, useRef, useState} from 'react';
import {DragDropContext, Droppable, DropResult} from '@hello-pangea/dnd';
import {Filter, Plus, Search, X} from 'lucide-react';
import {useBoardStore} from '../../store/useBoardStore';
import {BoardColumn} from './BoardColumn';
import {Priority, Task} from '../../types/board';

export const KanbanBoard: React.FC = () => {
    const {columns, filters, moveTask, reorderColumn, setFilters, addColumn} = useBoardStore();
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isFiltering = filters.searchQuery.length > 0 || filters.priorities.length > 0 || filters.tags.length > 0;

    const togglePriorityFilter = (priority: Priority) => {
        const newPriorities = filters.priorities.includes(priority)
            ? filters.priorities.filter(p => p !== priority)
            : [...filters.priorities, priority];
        setFilters({priorities: newPriorities});
    };

    const filterTasks = (tasks: Task[]) => {
        return tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(task.priority);
            const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => task.tags.includes(tag));
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
            addColumn(newColumnTitle.trim());
            setNewColumnTitle('');
            setIsAddingColumn(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
            <header
                className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Project Workspace</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({searchQuery: e.target.value})}
                            className="pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300 w-64 transition-all"
                        />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                className={`p-2 rounded-lg transition-colors ${isFiltering ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <Filter size={20}/>
                        </button>
                        {isFilterMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Filter by
                                    Priority</h4>
                                <div className="space-y-2">
                                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={filters.priorities.includes(p)}
                                                   onChange={() => togglePriorityFilter(p)}
                                                   className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                                            <span
                                                className="text-sm text-slate-700 dark:text-slate-300 capitalize">{p}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <button onClick={() => setFilters({priorities: [], tags: [], searchQuery: ''})}
                                            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Clear
                                        all filters
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
                        <main ref={provided.innerRef} {...provided.droppableProps}
                              className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 p-6 items-start">
                            {columns.map((column, index) => (
                                <BoardColumn key={column.id} column={column} index={index}
                                             filteredTasks={filterTasks(column.tasks)} isFiltering={isFiltering}/>
                            ))}
                            {provided.placeholder}

                            <div className="w-80 shrink-0">
                                {isAddingColumn ? (
                                    <form onSubmit={handleAddColumn}
                                          className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <input type="text" autoFocus value={newColumnTitle}
                                               onChange={(e) => setNewColumnTitle(e.target.value)}
                                               placeholder="Column title..."
                                               className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 mb-2"/>
                                        <div className="flex items-center gap-2">
                                            <button type="submit"
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">Add
                                                Column
                                            </button>
                                            <button type="button" onClick={() => setIsAddingColumn(false)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                <X size={16}/></button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setIsAddingColumn(true)}
                                            className="flex items-center gap-2 w-full p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all font-medium">
                                        <Plus size={20}/> Add another column
                                    </button>
                                )}
                            </div>
                        </main>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};