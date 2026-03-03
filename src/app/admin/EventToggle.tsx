'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { toggleEventActiveAction, toggleEventFeatureAction } from '@/app/actions/admin';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { useAdminRole } from '@/hooks/useAdminRole';

interface EventToggleProps {
    eventId: string;
    initialState: boolean;
    type: 'active' | 'featured';
}

export function EventToggle({ eventId, initialState, type }: EventToggleProps) {
    const isAdmin = useAdminRole();
    const [isPending, startTransition] = useTransition();
    const [optimisticState, setOptimisticState] = useState(initialState);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Sync with server state if things change from outside
    useEffect(() => {
        setOptimisticState(initialState);
    }, [initialState]);

    const handleToggleRequest = () => {
        if (isAdmin) {
            handleConfirmToggle('');
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handleConfirmToggle = (pin: string) => {
        setIsPinModalOpen(false);
        const nextState = !optimisticState;
        setOptimisticState(nextState);

        startTransition(async () => {
            let success = false;
            if (type === 'active') {
                success = await toggleEventActiveAction(eventId, nextState, pin);
            } else {
                success = await toggleEventFeatureAction(eventId, nextState, pin);
            }
            if (!success) {
                // Revert on failure
                setOptimisticState(!nextState);
            }
        });
    };

    const isActive = optimisticState;

    return (
        <>
            <button
                onClick={handleToggleRequest}
                disabled={isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isActive ? 'bg-primary' : 'bg-neutral-300'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={isActive}
            >
                <span className="sr-only">Toggle {type}</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleConfirmToggle}
                title={`Toggle Event ${type}`}
                description={`Enter Manager PIN to change this event's visibility`}
            />
        </>
    );
}
