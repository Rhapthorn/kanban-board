// src/types/board.ts
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
    dueDate: string;
    subtasks: Subtask[];
}

export interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

export interface FilterState {
    searchQuery: string;
    priorities: Priority[];
    tags: string[];
}

export interface BoardState {
    columns: Column[];
    filters: FilterState;
    moveTask: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
    reorderColumn: (sourceIndex: number, destIndex: number) => void;
    addTask: (colId: string, task: Task) => void;
    updateTask: (colId: string, taskId: string, updatedTask: Partial<Task>) => void;
    deleteTask: (colId: string, taskId: string) => void;
    addColumn: (title: string) => void;
    updateColumn: (colId: string, title: string) => void;
    deleteColumn: (colId: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
}