// src/components/board/ArchiveModal.tsx
import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertOctagon, Archive, RotateCcw, Trash2, X} from 'lucide-react';
import {useBoardStore} from '../../store/useBoardStore';
import {format} from 'date-fns';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({isOpen, onClose}) => {
    const {archivedTasks, restoreTask, deleteArchivedTask, clearArchive, columns} = useBoardStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{x: '100%'}}
                        animate={{x: 0}}
                        exit={{x: '100%'}}
                        transition={{type: 'spring', damping: 25, stiffness: 250}}
                        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
                    >
                        <div
                            className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Archive size={20} className="text-indigo-600 dark:text-indigo-400"/>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Archived Tasks</h2>
                                <span
                                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {archivedTasks.length}
                </span>
                            </div>
                            <button onClick={onClose}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {archivedTasks.length === 0 ? (
                                <div
                                    className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-600">
                                    <Archive size={40} className="mb-2 stroke-1"/>
                                    <p className="text-sm font-medium">Archive is empty</p>
                                </div>
                            ) : (
                                archivedTasks.map((task) => {
                                    const targetCol = columns.find((c) => c.id === task.originalColumnId);

                                    return (
                                        <div
                                            key={task.id}
                                            className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                                                <span
                                                    className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                          {task.priority}
                        </span>
                                            </div>

                                            {task.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                                            )}

                                            <div
                                                className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>{task.archivedAt ? format(new Date(task.archivedAt), 'MMM d, HH:mm') : 'Archived'}</span>
                                                    {targetCol && (
                                                        <span className="text-[10px] text-indigo-500 font-medium">
                              From: {targetCol.title}
                            </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => restoreTask(task.id)}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                                                        title="Restore to original column"
                                                    >
                                                        <RotateCcw size={13}/> Restore
                                                    </button>
                                                    <button
                                                        onClick={() => deleteArchivedTask(task.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {archivedTasks.length > 0 && (
                            <div
                                className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                                <button
                                    onClick={clearArchive}
                                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 rounded-xl transition-colors"
                                >
                                    <AlertOctagon size={14}/> Clear Archive Permanently
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};