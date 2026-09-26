'use client';

import { useEffect } from 'react';

const TONE_STYLES = {
  milestone: 'border-lime-glow/50 bg-lime-glow/10 text-lime-glow',
  info: 'border-cyan-glow/50 bg-cyan-glow/10 text-cyan-300',
  warning: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
};

function SingleToast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`animate-toastIn card pointer-events-auto flex items-center gap-2 border px-4 py-2.5 shadow-lg ${
        TONE_STYLES[toast.tone] || TONE_STYLES.info
      }`}
    >
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-16 z-40 flex flex-col gap-2 sm:right-6 sm:top-20">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
