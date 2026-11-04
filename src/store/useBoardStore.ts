// src/store/useBoardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Column } from '../types/board';

const initialColumns: Column[] = [
    { id: 'col-1', title: 'To Do', tasks: [] },
    { id: 'col-2', title: 'In Progress', tasks: [] },
    { id: 'col-3', title: 'Done', tasks: [] },
];

export const useBoardStore = create<BoardState>()(
    persist(
        (set) => ({
            columns: initialColumns,
            filters: { searchQuery: '', priorities: [], tags: [] },

            moveTask: (sourceColId, destColId, sourceIndex, destIndex) =>
                set((state) => {
                    const newColumns = [...state.columns];
                    const sourceColIndex = newColumns.findIndex((c) => c.id === sourceColId);
                    const destColIndex = newColumns.findIndex((c) => c.id === destColId);

                    if (sourceColIndex === -1 || destColIndex === -1) return state;

                    const sourceTasks = [...newColumns[sourceColIndex].tasks];
                    const destTasks = sourceColId === destColId ? sourceTasks : [...newColumns[destColIndex].tasks];

                    const [movedTask] = sourceTasks.splice(sourceIndex, 1);
                    destTasks.splice(destIndex, 0, movedTask);

                    newColumns[sourceColIndex] = { ...newColumns[sourceColIndex], tasks: sourceTasks };
                    if (sourceColId !== destColId) {
                        newColumns[destColIndex] = { ...newColumns[destColIndex], tasks: destTasks };
                    }

                    return { columns: newColumns };
                }),

            reorderColumn: (sourceIndex, destIndex) =>
                set((state) => {
                    const newColumns = [...state.columns];
                    const [movedColumn] = newColumns.splice(sourceIndex, 1);
                    newColumns.splice(destIndex, 0, movedColumn);
                    return { columns: newColumns };
                }),

            addTask: (colId, task) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === colId ? { ...col, tasks: [...col.tasks, task] } : col
                    ),
                })),

            updateTask: (colId, taskId, updatedTask) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === colId
                            ? {
                                ...col,
                                tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)),
                            }
                            : col
                    ),
                })),

            deleteTask: (colId, taskId) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === colId
                            ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
                            : col
                    ),
                })),

            addColumn: (title) =>
                set((state) => ({
                    columns: [
                        ...state.columns,
                        { id: `col-${Date.now()}`, title, tasks: [] },
                    ],
                })),

            updateColumn: (colId, title) =>
                set((state) => ({
                    columns: state.columns.map((col) =>
                        col.id === colId ? { ...col, title } : col
                    ),
                })),

            deleteColumn: (colId) =>
                set((state) => ({
                    columns: state.columns.filter((col) => col.id !== colId),
                })),

            setFilters: (newFilters) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                })),
        }),
        {
            name: 'kanban-storage',
            partialize: (state) => ({ columns: state.columns }),
        }
    )
);