import { useState, useCallback, useRef, useEffect } from 'react';
import { AppError, parseError, getErrorMessage } from '../lib/errors';

export interface UseAsyncOptions {
  /** Auto-execute the async function on mount */
  autoRun?: boolean;
  /** Number of times to retry on failure (default: 0) */
  retries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
}

export interface UseAsyncReturn<T> {
  /** The resolved data */
  data: T | null;
  /** Whether the async operation is in progress */
  loading: boolean;
  /** The error object if the operation failed */
  error: AppError | null;
  /** User-friendly error message */
  errorMessage: string;
  /** Whether the operation completed successfully */
  isSuccess: boolean;
  /** Whether the operation has been executed at least once */
  isExecuted: boolean;
  /** Execute the async function with optional arguments */
  execute: <Args extends any[]>(...args: Args) => Promise<T>;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Hook for managing async operations with automatic state management
 * Handles loading, error, and data states automatically
 *
 * @example
 * ```typescript
 * // Simple data fetching
 * const { data, loading, error, execute } = useAsync(
 *   async () => await fetchUsers()
 * );
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 *
 * // Form submission
 * const { execute, loading, error } = useAsync(
 *   async (formData) => await submitForm(formData),
 *   { retries: 2 }
 * );
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     const result = await execute(data);
 *   } catch (err) {
 *     // Error is already in state
 *   }
 * };
 * ```
 */
export function useAsync<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { autoRun = false, retries = 0, retryDelay = 1000 } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isExecuted, setIsExecuted] = useState(false);
  const isMountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Execute the async function with retry logic
   */
  const executeWithRetry = useCallback(
    async <Args extends any[]>(...args: Args): Promise<T> => {
      let lastError: unknown;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (!isMountedRef.current) {
            throw new Error('Component unmounted');
          }

          setLoading(true);
          setError(null);

          const result = await asyncFn(...args);

          if (isMountedRef.current) {
            setData(result);
            setError(null);
            setIsExecuted(true);
          }

          return result;
        } catch (err) {
          lastError = err;

          if (attempt < retries) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      // All retries exhausted
      const parsedError = parseError(lastError);
      if (isMountedRef.current) {
        setError(parsedError);
        setIsExecuted(true);
        setLoading(false);
      }

      throw parsedError;
    },
    [asyncFn, retries, retryDelay]
  );

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setIsExecuted(false);
  }, []);

  /**
   * Auto-run on mount if enabled
   */
  useEffect(() => {
    if (autoRun) {
      executeWithRetry();
    }
  }, [autoRun, executeWithRetry]);

  return {
    data,
    loading,
    error,
    errorMessage: error ? getErrorMessage(error) : '',
    isSuccess: isExecuted && !error && data !== null,
    isExecuted,
    execute: executeWithRetry,
    reset,
  };
}
