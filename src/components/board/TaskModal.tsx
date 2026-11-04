// src/components/board/TaskModal.tsx
import React, {useEffect, useState} from 'react';
import {Plus, Trash2, X} from 'lucide-react';
import {useBoardStore} from '../../store/useBoardStore';
import {Priority, Subtask, Task} from '../../types/board';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    columnId: string;
    taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({isOpen, onClose, columnId, taskToEdit}) => {
    const {addTask, updateTask, deleteTask} = useBoardStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    useEffect(() => {
        if (taskToEdit && isOpen) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setPriority(taskToEdit.priority);
            setDueDate(taskToEdit.dueDate);
            setTagsInput(taskToEdit.tags.join(', '));
            setSubtasks(taskToEdit.subtasks);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setTagsInput('');
            setSubtasks([]);
        }
    }, [taskToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const taskData: Task = {
            id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            priority,
            tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
            dueDate,
            subtasks,
        };

        if (taskToEdit) {
            updateTask(columnId, taskToEdit.id, taskData);
        } else {
            addTask(columnId, taskData);
        }
        onClose();
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, {id: `st-${Date.now()}`, title: newSubtask.trim(), completed: false}]);
        setNewSubtask('');
    };

    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(st => st.id === id ? {...st, completed: !st.completed} : st));
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleDelete = () => {
        if (taskToEdit) {
            deleteTask(columnId, taskToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {taskToEdit ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title
                                *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as Priority)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due
                                    Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags
                                (comma separated)</label>
                            <input
                                type="text"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtasks</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                    placeholder="Add a subtask..."
                                    className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
                                />
                                <button type="button" onClick={handleAddSubtask}
                                        className="px-3 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                                    <Plus size={16}/>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {subtasks.map((st) => (
                                    <div key={st.id}
                                         className="flex items-center justify-between group bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" checked={st.completed}
                                                   onChange={() => toggleSubtask(st.id)}
                                                   className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                                            <span
                                                className={`text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{st.title}</span>
                                        </div>
                                        <button type="button" onClick={() => removeSubtask(st.id)}
                                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div
                    className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                    {taskToEdit ? (
                        <button type="button" onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                            <Trash2 size={16}/> Delete
                        </button>
                    ) : <div></div>}

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" form="task-form"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                            {taskToEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};