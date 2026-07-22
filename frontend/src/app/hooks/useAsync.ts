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

// ============================================================================
// Discriminated Union Types
// ============================================================================

interface IdleState {
  status: 'idle';
  data: null;
  error: null;
  loading: false;
  isSuccess: false;
  isExecuted: false;
}

interface LoadingState {
  status: 'loading';
  data: null;
  error: null;
  loading: true;
  isSuccess: false;
  isExecuted: false;
}

interface SuccessState<T> {
  status: 'success';
  data: T;
  error: null;
  loading: false;
  isSuccess: true;
  isExecuted: true;
}

interface ErrorState {
  status: 'error';
  data: null;
  error: AppError;
  loading: false;
  isSuccess: false;
  isExecuted: true;
}

type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

export type UseAsyncReturn<T> = AsyncState<T> & {
  /** Error message string (only populated if status is 'error') */
  errorMessage: string;
  /** Execute the async function with optional arguments */
  execute: <Args extends any[]>(...args: Args) => Promise<T>;
  /** Reset to idle state */
  reset: () => void;
};

/**
 * Hook for managing async operations with automatic state management
 * Uses discriminated unions to ensure type-safe state combinations
 *
 * @example
 * ```typescript
 * // Simple data fetching
 * const state = useAsync(async () => await fetchUsers());
 *
 * // Check status to narrow types
 * if (state.status === 'success') {
 *   console.log(state.data); // data is T here
 * } else if (state.status === 'error') {
 *   console.log(state.error); // error is AppError here
 * }
 *
 * // Or use with autoRun
 * const { status, data, error } = useAsync(
 *   async () => await fetchUsers(),
 *   { autoRun: true }
 * );
 *
 * // Form submission with retries
 * const state = useAsync(
 *   async (formData) => await submitForm(formData),
 *   { retries: 2 }
 * );
 *
 * if (state.status === 'loading') {
 *   return <p>Submitting...</p>;
 * }
 *
 * if (state.status === 'error') {
 *   return <ErrorAlert message={state.error.message} />;
 * }
 *
 * if (state.status === 'success') {
 *   return <p>Success! {state.data}</p>;
 * }
 * ```
 */
export function useAsync<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { autoRun = false, retries = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    loading: false,
    isSuccess: false,
    isExecuted: false,
  });

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

          if (isMountedRef.current) {
            setState({
              status: 'loading',
              data: null,
              error: null,
              loading: true,
              isSuccess: false,
              isExecuted: false,
            });
          }

          const result = await asyncFn(...args);

          if (isMountedRef.current) {
            setState({
              status: 'success',
              data: result,
              error: null,
              loading: false,
              isSuccess: true,
              isExecuted: true,
            });
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
        setState({
          status: 'error',
          data: null,
          error: parsedError,
          loading: false,
          isSuccess: false,
          isExecuted: true,
        });
      }

      throw parsedError;
    },
    [asyncFn, retries, retryDelay]
  );

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      error: null,
      loading: false,
      isSuccess: false,
      isExecuted: false,
    });
  }, []);

  /**
   * Auto-run on mount if enabled
   */
  useEffect(() => {
    if (autoRun) {
      executeWithRetry();
    }
  }, [autoRun, executeWithRetry]);

  const errorMessage = state.status === 'error' ? getErrorMessage(state.error) : '';

  return {
    ...state,
    errorMessage,
    execute: executeWithRetry,
    reset,
  } as UseAsyncReturn<T>;
}
