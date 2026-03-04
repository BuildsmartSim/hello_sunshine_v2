"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

// Using local storage so the state persists across refreshes for the admin
const defaultTasks = [
    {
        id: '1',
        title: 'Send Re-Engagement Broadcast',
        description: 'Email the 665 historical WPForms users a single opt-in/re-engagement campaign to legally build the new marketing list.',
        completed: false
    }
];

export function AdminTodoList() {
    const [tasks, setTasks] = useState(defaultTasks);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('hello_sunshine_admin_todos');
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse todos", e);
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('hello_sunshine_admin_todos', JSON.stringify(tasks));
        }
    }, [tasks, mounted]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    if (!mounted) return null; // Prevent hydration mismatch

    const pendingCount = tasks.filter(t => !t.completed).length;

    return (
        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 flex flex-col shadow-sm">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h4 className="font-mono uppercase tracking-widest text-sm font-bold text-charcoal flex items-center gap-2">
                        <span>Action Items</span>
                        {pendingCount > 0 && (
                            <span className="bg-[#ffd24d]/30 text-charcoal px-2 py-0.5 rounded-full text-[10px]">
                                {pendingCount} Pending
                            </span>
                        )}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-md">
                        Priority tasks for platform growth and compliance. Click a task to mark it as complete.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${task.completed ? 'bg-neutral-50 border-neutral-100 opacity-60' : 'bg-white border-neutral-200 hover:border-[#ffd24d]/50 hover:bg-[#ffd24d]/5'}`}
                    >
                        <button className="mt-0.5 flex-shrink-0 focus:outline-none transition-colors duration-200">
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-neutral-300 hover:text-[#ffd24d]" />
                            )}
                        </button>
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold transition-colors duration-200 ${task.completed ? 'text-neutral-400 line-through' : 'text-charcoal'}`}>
                                {task.title}
                            </span>
                            <span className={`text-xs mt-1 transition-colors duration-200 ${task.completed ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {task.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
