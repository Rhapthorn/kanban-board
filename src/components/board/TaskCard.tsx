// src/components/board/TaskCard.tsx
import React from 'react';
import {Draggable} from '@hello-pangea/dnd';
import {CheckSquare, Clock, GripHorizontal} from 'lucide-react';
import {Priority, Task} from '../../types/board';
import {format, isPast} from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface TaskCardProps {
    task: Task;
    index: number;
    isDragDisabled: boolean;
    onEdit: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const TaskCard: React.FC<TaskCardProps> = ({task, index, isDragDisabled, onEdit}) => {
    const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
    const isOverdue = isPast(new Date(task.dueDate || new Date()));

    return (
        <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onEdit(task)}
                    className={`group p-4 mb-3 rounded-lg border bg-white dark:bg-slate-800 shadow-sm transition-all cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : 'hover:border-indigo-400 dark:border-slate-700 hover:shadow-md'}
          `}
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
                        <div
                            {...provided.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing ${isDragDisabled ? 'hidden' : 'block'}`}
                        >
                            <GripHorizontal size={16}/>
                        </div>
                    </div>

                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{task.title}</h4>
                    <div
                        className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 prose prose-sm dark:prose-invert">
                        <ReactMarkdown>{task.description}</ReactMarkdown>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        {task.subtasks.length > 0 ? (
                            <div className="flex items-center gap-1">
                                <CheckSquare size={14}
                                             className={completedSubtasks === task.subtasks.length ? 'text-emerald-500' : ''}/>
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                            </div>
                        ) : <div></div>}

                        {task.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                                <Clock size={14}/>
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};