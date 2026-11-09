// src/store/useBoardStore.ts
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {BoardStateData, Column, FilterState, Task} from '../types/board';

export interface ToastMessage {
    id: string;
    message: string;
    type?: 'success' | 'info' | 'warning';
    actionLabel?: string;
    onAction?: () => void;
}

interface BoardStore {
    columns: Column[];
    archivedTasks: Task[];
    filters: FilterState;
    toasts: ToastMessage[];

    // Toast Actions
    addToast: (message: string, type?: ToastMessage['type'], actionLabel?: string, onAction?: () => void) => void;
    removeToast: (id: string) => void;

    // Task Actions
    addTask: (columnId: string, task: Task) => void;
    updateTask: (columnId: string, taskId: string, updatedTask: Partial<Task>) => void;
    deleteTask: (columnId: string, taskId: string) => void;
    moveTask: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
    completeTask: (sourceColId: string, taskId: string) => void;

    // Archive Actions
    archiveTask: (columnId: string, taskId: string) => void;
    restoreTask: (taskId: string, targetColumnId?: string) => void;
    deleteArchivedTask: (taskId: string) => void;
    clearArchive: () => void;

    // Column Actions
    addColumn: (title: string, color?: string) => void;
    updateColumn: (columnId: string, title: string) => void;
    updateColumnColor: (columnId: string, color: string) => void;
    deleteColumn: (columnId: string) => void;
    reorderColumn: (sourceIndex: number, destIndex: number) => void;

    // Filters & Import/Export
    setFilters: (filters: Partial<FilterState>) => void;
    exportBoardData: () => void;
    importBoardData: (jsonString: string) => boolean;
}

const initialColumns: Column[] = [
    {id: 'col-1', title: 'To Do', tasks: [], color: 'indigo'},
    {id: 'col-2', title: 'In Progress', tasks: [], color: 'amber'},
    {id: 'col-3', title: 'Done', tasks: [], isDone: true, color: 'emerald'},
];

export const useBoardStore = create<BoardStore>()(
    persist(
        (set, get) => ({
            columns: initialColumns,
            archivedTasks: [],
            filters: {searchQuery: '', priorities: [], tags: []},
            toasts: [],

            addToast: (message, type = 'info', actionLabel, onAction) => {
                const id = `toast-${Date.now()}`;
                set((state) => ({
                    toasts: [...state.toasts, {id, message, type, actionLabel, onAction}],
                }));
                setTimeout(() => get().removeToast(id), 5000);
            },

            removeToast: (id) =>
                set((state) => ({toasts: state.toasts.filter((t) => t.id !== id)})),

            addTask: (columnId, task) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === columnId ? {...col, tasks: [...col.tasks, task]} : col
                    ),
                })),

            updateTask: (columnId, taskId, updatedTask) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === columnId
                            ? {
                                ...col,
                                tasks: col.tasks.map((task) => (task.id === taskId ? {...task, ...updatedTask} : task)),
                            }
                            : col
                    ),
                })),

            deleteTask: (columnId, taskId) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === columnId
                            ? {...col, tasks: col.tasks.filter((task) => task.id !== taskId)}
                            : col
                    ),
                })),

            moveTask: (sourceColId, destColId, sourceIndex, destIndex) =>
                set((state) => {
                    const newCols = [...state.columns];
                    const sourceCol = newCols.find((c) => c.id === sourceColId);
                    const destCol = newCols.find((c) => c.id === destColId);

                    if (!sourceCol || !destCol) return state;

                    const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
                    destCol.tasks.splice(destIndex, 0, movedTask);

                    return {columns: newCols};
                }),

            completeTask: (sourceColId, taskId) =>
                set((state) => {
                    const doneCol =
                        state.columns.find((c) => c.isDone || c.id === 'col-3' || c.title.toLowerCase().includes('done')) ||
                        state.columns[state.columns.length - 1];
                    if (!doneCol) return state;

                    const sourceCol = state.columns.find((c) => c.id === sourceColId);
                    const task = sourceCol?.tasks.find((t) => t.id === taskId);
                    if (!task) return state;

                    const isAlreadyDone = sourceCol?.id === doneCol.id;
                    const targetColId = isAlreadyDone ? state.columns[0]?.id : doneCol.id;

                    if (!targetColId) return state;

                    const updatedTask = {
                        ...task,
                        subtasks: !isAlreadyDone
                            ? task.subtasks.map((st) => ({...st, completed: true}))
                            : task.subtasks,
                    };

                    return {
                        columns: state.columns.map((col) => {
                            if (col.id === sourceColId) {
                                return {...col, tasks: col.tasks.filter((t) => t.id !== taskId)};
                            }
                            if (col.id === targetColId) {
                                return {...col, tasks: [...col.tasks, updatedTask]};
                            }
                            return col;
                        }),
                    };
                }),

            archiveTask: (columnId, taskId) => {
                const state = get();
                const targetCol = state.columns.find((c) => c.id === columnId);
                const taskToArchive = targetCol?.tasks.find((t) => t.id === taskId);
                if (!taskToArchive) return;

                const archivedItem: Task = {
                    ...taskToArchive,
                    archivedAt: new Date().toISOString(),
                    originalColumnId: columnId,
                };

                set((s) => ({
                    columns: s.columns.map((col) =>
                        col.id === columnId
                            ? {...col, tasks: col.tasks.filter((t) => t.id !== taskId)}
                            : col
                    ),
                    archivedTasks: [archivedItem, ...s.archivedTasks],
                }));

                state.addToast(`Archived "${taskToArchive.title}"`, 'info', 'Undo', () => {
                    get().restoreTask(archivedItem.id);
                });
            },

            restoreTask: (taskId, targetColumnId) =>
                set((state) => {
                    const taskToRestore = state.archivedTasks.find((t) => t.id === taskId);
                    if (!taskToRestore) return state;

                    let destColId = targetColumnId || taskToRestore.originalColumnId;
                    const colExists = state.columns.some((c) => c.id === destColId);
                    if (!colExists) {
                        destColId = state.columns[0]?.id;
                    }

                    if (!destColId) return state;

                    const {archivedAt, originalColumnId, ...cleanTask} = taskToRestore;

                    return {
                        archivedTasks: state.archivedTasks.filter((t) => t.id !== taskId),
                        columns: state.columns.map((col) =>
                            col.id === destColId ? {...col, tasks: [...col.tasks, cleanTask]} : col
                        ),
                    };
                }),

            deleteArchivedTask: (taskId) =>
                set((state) => ({
                    archivedTasks: state.archivedTasks.filter((t) => t.id !== taskId),
                })),

            clearArchive: () => set({archivedTasks: []}),

            addColumn: (title, color = 'indigo') =>
                set((state) => ({
                    columns: [...state.columns, {id: `col-${Date.now()}`, title, tasks: [], color}],
                })),

            updateColumn: (columnId, title) =>
                set((state) => ({
                    columns: state.columns.map((col) => (col.id === columnId ? {...col, title} : col)),
                })),

            updateColumnColor: (columnId, color) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === columnId && !col.isDone && col.id !== 'col-3'
                            ? {...col, color}
                            : col
                    ),
                })),

            deleteColumn: (columnId) =>
                set((state) => ({
                    columns: state.columns.filter((col) => col.id !== columnId),
                })),

            reorderColumn: (sourceIndex, destIndex) =>
                set((state) => {
                    const newCols = [...state.columns];
                    const [moved] = newCols.splice(sourceIndex, 1);
                    newCols.splice(destIndex, 0, moved);
                    return {columns: newCols};
                }),

            setFilters: (newFilters) =>
                set((state) => ({filters: {...state.filters, ...newFilters}})),

            exportBoardData: () => {
                const state = get();
                const exportObj: BoardStateData = {
                    columns: state.columns,
                    archivedTasks: state.archivedTasks,
                };
                const blob = new Blob([JSON.stringify(exportObj, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                state.addToast('Board backup downloaded successfully', 'success');
            },

            importBoardData: (jsonString) => {
                try {
                    const parsed = JSON.parse(jsonString) as BoardStateData;
                    if (Array.isArray(parsed.columns)) {
                        set({
                            columns: parsed.columns,
                            archivedTasks: Array.isArray(parsed.archivedTasks) ? parsed.archivedTasks : [],
                        });
                        get().addToast('Board data imported successfully', 'success');
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            },
        }),
        {name: 'kanban-board-storage'}
    )
);