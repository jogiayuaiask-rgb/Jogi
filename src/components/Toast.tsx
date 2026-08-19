import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-slideUp">
      <div
        className={`rounded-2xl p-4 shadow-2xl border flex items-start space-x-3 backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-900/90 text-white border-emerald-500/50'
            : isError
            ? 'bg-rose-900/90 text-white border-rose-500/50'
            : 'bg-[#355C5D]/95 text-white border-[#7EBAC0]/40'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Info className="w-5 h-5 text-[#7EBAC0]" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold font-headline">{toast.title}</h4>
          <p className="text-xs text-white/90 font-body mt-0.5 leading-snug">
            {toast.description}
          </p>
          {toast.onRetry && (
            <button 
              onClick={() => { toast.onRetry?.(); onDismiss(); }}
              className="mt-2 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Quick Fix (Retry Sync)
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
