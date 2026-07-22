import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as ToastType } from '../context/ToastContext';

export interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

/**
 * Individual toast notification component
 * Displays a message with an icon and close button
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300); // Match animation duration
  };

  // Auto-dismiss if duration is set
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(handleDismiss, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="size-5 text-green-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="size-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="size-5 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="size-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-96 opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md
          ${getBgColor()}
        `}
      >
        {getIcon()}
        <p className={`flex-1 text-sm font-medium ${getTextColor()}`}>{toast.message}</p>
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-neutral-600 flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
