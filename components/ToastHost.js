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
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`text-white rounded-xl shadow-lg px-4 py-3 flex items-start pointer-events-auto animate-slide-up backdrop-blur-sm ${
            typeStyles[t.type] || typeStyles.info
          }`}
        >
          <div className="flex-1 text-sm font-medium">{t.message}</div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-slide-up { 
          animation: slide-up 200ms ease-out; 
        }
      `}</style>
    </div>
  );
}


