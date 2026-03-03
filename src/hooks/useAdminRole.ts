'use client';

import { useState, useEffect } from 'react';
import { getRoleAction } from '@/app/actions/tickets';

export function useAdminRole() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;
        getRoleAction().then(res => {
            if (mounted && res.success && res.role === 'admin') {
                setIsAdmin(true);
            }
        }).catch(err => {
            console.error('Failed to fetch admin role', err);
        });

        return () => {
            mounted = false;
        };
    }, []);

    return isAdmin;
}
