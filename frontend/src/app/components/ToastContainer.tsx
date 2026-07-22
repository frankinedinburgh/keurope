import { useToast } from '../context/ToastContext';
import { Toast } from './Toast';

/**
 * Container component that displays all active toasts
 * Place this once in your root layout (e.g., App or Layout component)
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
