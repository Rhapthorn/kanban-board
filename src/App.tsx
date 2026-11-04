// src/App.tsx
import React from 'react';
import {KanbanBoard} from './components/board/KanbanBoard';

const App: React.FC = () => {
    return (
        <div className="min-h-screen text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/30">
            <KanbanBoard/>
        </div>
    );
};

export default App;