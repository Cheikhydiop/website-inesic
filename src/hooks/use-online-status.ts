import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour détecter le statut réseau (online/offline)
 * Utilisé pour afficher des indicateurs visuels et adapter le comportement de l'app
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    const handleOnline = useCallback(() => setIsOnline(true), []);
    const handleOffline = useCallback(() => setIsOnline(false), []);

    useEffect(() => {
        window.addEventListener('online', handleOnline, { passive: true });
        window.addEventListener('offline', handleOffline, { passive: true });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return isOnline;
}
