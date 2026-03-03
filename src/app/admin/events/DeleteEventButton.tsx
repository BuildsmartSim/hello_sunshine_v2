'use client';

import React, { useState } from 'react';
import { deleteEventAction } from '@/app/actions/event_management';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { useAdminRole } from '@/hooks/useAdminRole';

export function DeleteEventButton({ eventId, eventTitle }: { eventId: string, eventTitle: string }) {
    const isAdmin = useAdminRole();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const requestDeleteAuth = () => {
        setIsConfirming(false);
        if (isAdmin) {
            handleDelete('');
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handleDelete = async (pin: string) => {
        setIsPinModalOpen(false);
        setIsDeleting(true);
        const res = await deleteEventAction(eventId, pin);
        if (!res.success) {
            alert(res.error || 'Failed to delete event');
            setIsDeleting(false);
            setIsConfirming(false);
        }
    };

    return (
        <div className="relative inline-block ml-3">
            <button
                type="button"
                onClick={() => setIsConfirming(true)}
                className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                title="Delete Event"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>

            {isConfirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-w-sm w-full mx-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">Delete Event?</h3>
                        <p className="text-sm text-center text-neutral-500 mb-6">
                            Are you sure you want to delete <span className="font-bold text-neutral-800">"{eventTitle}"</span>? This action cannot be undone and any associated unsynced data will be lost.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirming(false)}
                                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={requestDeleteAuth}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleDelete}
                title="Event Deletion Required"
                description={`Enter Manager PIN to confirm deletion of "${eventTitle}"`}
            />
        </div>
    );
}
