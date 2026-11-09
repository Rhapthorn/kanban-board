// src/components/board/TaskCard.tsx
import React from 'react';
import {Draggable} from '@hello-pangea/dnd';
import {Archive, CheckCircle2, CheckSquare, Clock, Edit2, GripHorizontal} from 'lucide-react';
import {Priority, Task} from '../../types/board';
import {differenceInDays, format, isPast, isToday, isTomorrow} from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface TaskCardProps {
    task: Task;
    index: number;
    isDragDisabled: boolean;
    isDone?: boolean;
    onEdit: (task: Task) => void;
    onArchive: (task: Task) => void;
    onComplete: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const getSmartDueDate = (dateString: string, isDone?: boolean) => {
    const date = new Date(dateString);
    if (isDone) return {text: format(date, 'MMM d'), colorClass: 'text-slate-400'};

    if (isToday(date)) return {text: 'Due Today', colorClass: 'text-amber-500 font-semibold'};
    if (isTomorrow(date)) return {text: 'Due Tomorrow', colorClass: 'text-blue-500 font-medium'};

    if (isPast(date)) {
        const daysAgo = Math.abs(differenceInDays(new Date(), date));
        return {
            text: daysAgo === 0 ? 'Overdue' : `Overdue by ${daysAgo}d`,
            colorClass: 'text-red-500 font-semibold',
        };
    }

    return {text: format(date, 'MMM d'), colorClass: 'text-slate-500 dark:text-slate-400'};
};

export const TaskCard: React.FC<TaskCardProps> = ({
                                                      task,
                                                      index,
                                                      isDragDisabled,
                                                      isDone,
                                                      onEdit,
                                                      onArchive,
                                                      onComplete,
                                                  }) => {
    const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
    const subtaskPercentage =
        task.subtasks.length > 0 ? Math.round((completedSubtasks / task.subtasks.length) * 100) : 0;

    const dueDateInfo = task.dueDate ? getSmartDueDate(task.dueDate, isDone) : null;

    return (
        <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`group p-4 mb-3 rounded-xl border bg-white dark:bg-slate-800/90 shadow-sm transition-all ${
                        snapshot.isDragging
                            ? 'shadow-2xl ring-2 ring-indigo-500 scale-[1.02] z-50'
                            : 'hover:border-indigo-400 dark:border-slate-700/80 hover:shadow-md'
                    }`}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${priorityColors[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
                            {task.tags.map((tag) => (
                                <span key={tag}
                                      className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                  {tag}
                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onComplete(task)}
                                className={`p-1.5 rounded-md transition-all ${
                                    isDone
                                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 opacity-100'
                                        : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 opacity-0 group-hover:opacity-100'
                                }`}
                                title={isDone ? 'Move back to To Do' : 'Mark as Completed'}
                            >
                                <CheckCircle2 size={14}/>
                            </button>
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                title="Edit Task"
                            >
                                <Edit2 size={14}/>
                            </button>
                            <button
                                onClick={() => onArchive(task)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                title="Archive Task"
                            >
                                <Archive size={14}/>
                            </button>
                            <div
                                {...provided.dragHandleProps}
                                className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing ${isDragDisabled ? 'hidden' : 'block'}`}
                            >
                                <GripHorizontal size={16}/>
                            </div>
                        </div>
                    </div>

                    <h4 className={`font-medium mb-1 ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                        {task.title}
                    </h4>
                    <div
                        className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 prose prose-sm dark:prose-invert">
                        <ReactMarkdown>{task.description}</ReactMarkdown>
                    </div>

                    {/* Subtask Visual Progress Bar */}
                    {task.subtasks.length > 0 && (
                        <div className="mb-3">
                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        subtaskPercentage === 100 || isDone ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`}
                                    style={{width: `${subtaskPercentage}%`}}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        {task.subtasks.length > 0 ? (
                            <div className="flex items-center gap-1">
                                <CheckSquare size={14}
                                             className={completedSubtasks === task.subtasks.length || isDone ? 'text-emerald-500' : ''}/>
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                            </div>
                        ) : <div></div>}

                        {dueDateInfo && (
                            <div className={`flex items-center gap-1 ${dueDateInfo.colorClass}`}>
                                <Clock size={14}/>
                                <span>{dueDateInfo.text}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};