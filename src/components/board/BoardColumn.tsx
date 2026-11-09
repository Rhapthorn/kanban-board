// src/components/board/BoardColumn.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Draggable, Droppable} from '@hello-pangea/dnd';
import {Check, Edit2, Inbox, Lock, MoreHorizontal, Palette, Plus, Trash2, X} from 'lucide-react';
import {Column, Task} from '../../types/board';
import {useBoardStore} from '../../store/useBoardStore';
import {TaskCard} from './TaskCard';
import {TaskModal} from './TaskModal';

interface BoardColumnProps {
    column: Column;
    index: number;
    filteredTasks: Task[];
    isFiltering: boolean;
}

export const COLOR_OPTIONS = [
    {name: 'Indigo', id: 'indigo', bar: 'bg-indigo-500', dot: 'bg-indigo-500'},
    {name: 'Blue', id: 'blue', bar: 'bg-blue-500', dot: 'bg-blue-500'},
    {name: 'Purple', id: 'purple', bar: 'bg-purple-500', dot: 'bg-purple-500'},
    {name: 'Amber', id: 'amber', bar: 'bg-amber-500', dot: 'bg-amber-500'},
    {name: 'Rose', id: 'rose', bar: 'bg-rose-500', dot: 'bg-rose-500'},
    {name: 'Sky', id: 'sky', bar: 'bg-sky-500', dot: 'bg-sky-500'},
    {name: 'Slate', id: 'slate', bar: 'bg-slate-500', dot: 'bg-slate-500'},
];

export const BoardColumn: React.FC<BoardColumnProps> = ({column, index, filteredTasks, isFiltering}) => {
    const {updateColumn, updateColumnColor, deleteColumn, archiveTask, completeTask} = useBoardStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDoneColumn = column.isDone || column.id === 'col-3' || column.title.toLowerCase().includes('done');
    const activeColorId = isDoneColumn ? 'emerald' : column.color || 'indigo';
    const activeColorObj = COLOR_OPTIONS.find((c) => c.id === activeColorId) || {bar: 'bg-emerald-500'};
    const accentBarClass = isDoneColumn ? 'bg-emerald-500' : activeColorObj.bar;

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleArchiveTask = (task: Task) => {
        archiveTask(column.id, task.id);
    };

    const handleCompleteTask = (task: Task) => {
        completeTask(column.id, task.id);
    };

    const handleOpenCreate = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const submitRename = () => {
        if (editTitle.trim() && editTitle !== column.title) {
            updateColumn(column.id, editTitle.trim());
        }
        setIsRenaming(false);
        setIsMenuOpen(false);
    };

    const completedTasks = filteredTasks.filter((t) => isDoneColumn || (t.subtasks.length > 0 && t.subtasks.every((st) => st.completed))).length;
    const completionPercentage = filteredTasks.length === 0 ? 0 : Math.round((completedTasks / filteredTasks.length) * 100);

    return (
        <>
            <Draggable draggableId={column.id} index={index} isDragDisabled={isFiltering || isRenaming}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex flex-col w-80 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-shadow overflow-hidden ${
                            snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/50 z-50' : ''
                        }`}
                    >
                        {/* Top Accent Color Bar */}
                        <div className={`h-1.5 w-full ${accentBarClass}`}/>

                        <div
                            {...provided.dragHandleProps}
                            className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-grab active:cursor-grabbing border-b border-slate-100 dark:border-slate-800/80"
                        >
                            <div className="flex flex-col flex-1 mr-3">
                                {isRenaming ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                            className="flex-1 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-950 border border-indigo-500 rounded outline-none text-slate-900 dark:text-white"
                                        />
                                        <button onClick={submitRename}
                                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                                            <Check size={14}/>
                                        </button>
                                        <button onClick={() => setIsRenaming(false)}
                                                className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{column.title}</h3>
                                        <span
                                            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {filteredTasks.length}
                    </span>
                                    </div>
                                )}
                                <div
                                    className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                                    <div
                                        className={`h-full ${accentBarClass} transition-all duration-300 rounded-full`}
                                        style={{width: `${completionPercentage}%`}}
                                    />
                                </div>
                            </div>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                >
                                    <MoreHorizontal size={18}/>
                                </button>
                                {isMenuOpen && (
                                    <div
                                        className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-20">
                                        <button
                                            onClick={() => {
                                                setIsRenaming(true);
                                                setIsMenuOpen(false);
                                                setEditTitle(column.title);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Edit2 size={14}/> Rename
                                        </button>

                                        {/* Color Customization Section */}
                                        <div
                                            className="px-4 py-2 border-t border-b border-slate-100 dark:border-slate-700/60 my-1">
                                            <div
                                                className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Palette size={12}/> Theme Color
                        </span>
                                                {isDoneColumn && (
                                                    <span
                                                        className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">
                            <Lock size={10}/> Fixed
                          </span>
                                                )}
                                            </div>

                                            {isDoneColumn ? (
                                                <p className="text-[11px] text-slate-400 italic">
                                                    Done column has a locked Emerald color for tracking.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-7 gap-1">
                                                    {COLOR_OPTIONS.map((c) => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => {
                                                                updateColumnColor(column.id, c.id);
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className={`w-5 h-5 rounded-full ${c.dot} flex items-center justify-center transition-transform hover:scale-110 ${
                                                                activeColorId === c.id ? 'ring-2 ring-offset-1 ring-slate-400' : ''
                                                            }`}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {!isDoneColumn && (
                                            <button
                                                onClick={() => deleteColumn(column.id)}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={14}/> Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Droppable droppableId={column.id} type="task" isDropDisabled={isFiltering}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 p-3 min-h-[200px] transition-colors rounded-b-2xl ${
                                        snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                                    }`}
                                >
                                    {filteredTasks.length === 0 ? (
                                        <div
                                            className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-600 my-2">
                                            <Inbox size={28} className="mb-2 stroke-1"/>
                                            <span className="text-xs font-medium">No tasks in this stage</span>
                                        </div>
                                    ) : (
                                        filteredTasks.map((task, index) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                isDragDisabled={isFiltering}
                                                isDone={isDoneColumn}
                                                onEdit={handleEditTask}
                                                onArchive={handleArchiveTask}
                                                onComplete={handleCompleteTask}
                                            />
                                        ))
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="p-3 pt-0">
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all shadow-none hover:shadow-sm"
                            >
                                <Plus size={16}/> Add Task
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>

            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} columnId={column.id}
                       taskToEdit={taskToEdit}/>
        </>
    );
};