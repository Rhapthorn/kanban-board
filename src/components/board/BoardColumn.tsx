// src/components/board/BoardColumn.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { Column, Task } from '../../types/board';
import { useBoardStore } from '../../store/useBoardStore';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';

interface BoardColumnProps {
    column: Column;
    index: number;
    filteredTasks: Task[];
    isFiltering: boolean;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ column, index, filteredTasks, isFiltering }) => {
    const { updateColumn, deleteColumn } = useBoardStore();
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

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
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

    const completedTasks = filteredTasks.filter((t) => t.subtasks.length > 0 && t.subtasks.every((st) => st.completed)).length;
    const completionPercentage = filteredTasks.length === 0 ? 0 : Math.round((completedTasks / filteredTasks.length) * 100);

    return (
        <>
            <Draggable draggableId={column.id} index={index} isDragDisabled={isFiltering || isRenaming}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={`flex flex-col w-80 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/50' : ''}`}>
                        <div {...provided.dragHandleProps} className="p-4 flex items-center justify-between group rounded-t-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing">
                            <div className="flex flex-col flex-1 mr-4">
                                {isRenaming ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitRename()} className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-950 border border-indigo-500 rounded outline-none text-slate-900 dark:text-white" />
                                        <button onClick={submitRename} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={14} /></button>
                                        <button onClick={() => setIsRenaming(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">{filteredTasks.length}</span>
                                    </div>
                                )}
                                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
                                </div>
                            </div>

                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10">
                                        <button onClick={() => { setIsRenaming(true); setIsMenuOpen(false); setEditTitle(column.title); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <Edit2 size={14} /> Rename
                                        </button>
                                        <button onClick={() => deleteColumn(column.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Droppable droppableId={column.id} type="task" isDropDisabled={isFiltering}>
                            {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 p-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                    {filteredTasks.map((task, index) => (
                                        <TaskCard key={task.id} task={task} index={index} isDragDisabled={isFiltering} onEdit={handleEditTask} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="p-3 mt-auto">
                            <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <Plus size={16} /> Add Task
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>

            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} columnId={column.id} taskToEdit={taskToEdit} />
        </>
    );
};