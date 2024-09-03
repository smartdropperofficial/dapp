// src/hooks/useErrorHandling.ts
import { useState } from 'react';
import { UnauthorizedError } from '../errors/ErrorManager';

const useErrorHandling = () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: Error): void => {
        if (error instanceof UnauthorizedError) {
            // Gestisci l'errore di non autorizzazione
            console.error('Errore di non autorizzazione:', error.message);
            setError(error.message);
        } else {
            // Gestisci altri tipi di errori
            console.error('Errore sconosciuto:', error);
        }
    };

    return {
        error,
        handleError,
    };
};

export default useErrorHandling;
