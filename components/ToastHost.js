'use client';

import { useEffect, useState } from 'react';
import { subscribeToToasts } from '@/lib/toast';

const typeStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-600',
  info: 'bg-blue-600',
  announcement: 'bg-purple-600',
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, { ...toast, createdAt: Date.now() }]);
      const duration = toast.duration ?? 2500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, duration);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-2 right-2 z-[100] w-full max-w-sm px-2 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`text-white rounded-lg shadow-lg px-4 py-3 flex items-start pointer-events-auto animate-slide-in ${
            typeStyles[t.type] || typeStyles.info
          }`}
        >
          <div className="flex-1 text-sm">{t.message}</div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 160ms ease-out; }
      `}</style>
    </div>
  );
}


