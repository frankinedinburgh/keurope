import { useEffect, useRef, RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  /** Threshold for intersection (0-1, default: 0.1) */
  threshold?: number;
  /** Root margin for intersection (default: '0px') */
  rootMargin?: string;
  /** Whether to enable the observer (default: true) */
  enabled?: boolean;
}

/**
 * Hook for managing IntersectionObserver for infinite scroll
 * Automatically handles observer setup and cleanup
 *
 * @param ref - Ref to the trigger element
 * @param onIntersect - Callback when element enters viewport
 * @param options - IntersectionObserver options
 *
 * @example
 * ```typescript
 * const triggerRef = useRef<HTMLDivElement>(null);
 *
 * useInfiniteScroll(
 *   triggerRef,
 *   () => {
 *     setDisplayedCount(prev => prev + 12);
 *   },
 *   { threshold: 0.1 }
 * );
 *
 * return (
 *   <>
 *     <div>Products list...</div>
 *     <div ref={triggerRef}>Load more trigger</div>
 *   </>
 * );
 * ```
 */
export function useInfiniteScroll(
  ref: RefObject<HTMLElement | null>,
  onIntersect: () => void,
  options: UseInfiniteScrollOptions = {}
): void {
  const { threshold = 0.1, rootMargin = '0px', enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Start observing if ref is set
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup on unmount or dependency change
    return () => {
      observer.disconnect();
    };
  }, [ref, onIntersect, threshold, rootMargin, enabled]);
}
