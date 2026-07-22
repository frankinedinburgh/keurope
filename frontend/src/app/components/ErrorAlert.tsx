import { X } from 'lucide-react';

export interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Reusable error alert component
 * Shows errors to users with consistent styling
 */
export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
