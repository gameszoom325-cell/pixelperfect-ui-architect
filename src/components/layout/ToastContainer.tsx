import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useContracts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const iconConfig = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        }[toast.type];

        const borderConfig = {
          success: 'border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900/95',
          warning: 'border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-900/95',
          error: 'border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-900/95',
          info: 'border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-900/95'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur transition-all duration-300 animate-in slide-in-from-bottom-3 ${borderConfig}`}
          >
            {iconConfig}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight">
                {toast.title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-0.5 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
