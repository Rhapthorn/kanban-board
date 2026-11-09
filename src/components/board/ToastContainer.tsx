// src/components/board/ToastContainer.tsx
import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertTriangle, CheckCircle2, Info, X} from 'lucide-react';
import {ToastMessage, useBoardStore} from '../../store/useBoardStore';

export const ToastContainer: React.FC = () => {
    const {toasts, removeToast} = useBoardStore();

    const getIcon = (type?: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={16} className="text-emerald-500"/>;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500"/>;
            default:
                return <Info size={16} className="text-indigo-500"/>;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{opacity: 0, y: 20, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 10, scale: 0.95}}
                        transition={{type: 'spring', damping: 25, stiffness: 350}}
                        className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-900/90 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60"
                    >
                        {getIcon(toast.type)}
                        <span className="text-xs font-medium flex-1 text-slate-200">{toast.message}</span>

                        {toast.actionLabel && toast.onAction && (
                            <button
                                onClick={() => {
                                    toast.onAction?.();
                                    removeToast(toast.id);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                            >
                                {toast.actionLabel}
                            </button>
                        )}

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
                        >
                            <X size={14}/>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};