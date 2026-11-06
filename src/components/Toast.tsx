import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none print:hidden">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-slate-800',
    info: 'bg-white border-blue-200 text-slate-800',
    warning: 'bg-white border-amber-200 text-slate-800',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl shadow-lg border ${
        bgStyles[toast.type]
      } transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
          {toast.description && (
            <p className="text-xs text-slate-500 mt-0.5">{toast.description}</p>
          )}
          {toast.actionText && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="mt-2 text-xs font-bold text-[#FF6B00] hover:text-[#d95b00] underline cursor-pointer"
            >
              {toast.actionText}
            </button>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
