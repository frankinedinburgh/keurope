/**
 * Base skeleton component with pulse animation for loading states
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-neutral-200 dark:bg-neutral-700 rounded
        animate-pulse
        ${className}
      `}
    />
  );
}
