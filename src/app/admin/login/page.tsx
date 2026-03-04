'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                setError(loginError.message);
            } else {
                router.push('/admin');
                router.refresh();
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6 bg-[canvas] font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                <div className="p-8 bg-neutral-900 text-center">
                    <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase font-mono">
                        Hello Sunshine Admin
                    </h1>
                    <p className="text-neutral-400 text-xs mt-2 uppercase tracking-widest font-mono">
                        Secure Authentication Required
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-neutral-900 text-white font-bold rounded-lg shadow-lg hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <span>Log in to Dashboard</span>
                                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
                    <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest">
                        Unauthorized access is strictly monitored
                    </p>
                </div>
            </div>
        </div>
    );
}
