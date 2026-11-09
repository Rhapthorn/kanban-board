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
    archivedAt?: string;
    originalColumnId?: string;
}

export interface Column {
    id: string;
    title: string;
    tasks: Task[];
    isDone?: boolean;
    color?: string;
}

export interface FilterState {
    searchQuery: string;
    priorities: Priority[];
    tags: string[];
}

export interface BoardStateData {
    columns: Column[];
    archivedTasks: Task[];
    workspaceTitle?: string;
    workspaceSubtitle?: string;
    workspaceIcon?: string;
    customIconUrl?: string;
}