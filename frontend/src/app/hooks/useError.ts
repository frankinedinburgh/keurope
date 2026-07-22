import { useState, useCallback } from 'react';
import { AppError, parseError, getErrorMessage, logError, isUnauthorized } from '../lib/errors';

export interface UseErrorReturn {
  error: AppError | null;
  isError: boolean;
  errorMessage: string;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
}

/**
 * Hook for managing error state in components
 * Handles parsing, logging, and displaying errors
 */
export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((rawError: unknown) => {
    const parsedError = parseError(rawError);
    setErrorState(parsedError);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback(
    (rawError: unknown, context?: string) => {
      logError(rawError, context);
      setError(rawError);

      // Auto-clear error after 5 seconds (optional)
      // setTimeout(() => clearError(), 5000);
    },
    [setError]
  );

  return {
    error,
    isError: error !== null,
    errorMessage: error ? getErrorMessage(error) : '',
    setError,
    clearError,
    handleError,
  };
}
