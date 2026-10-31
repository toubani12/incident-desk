'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const Icon = { success: CircleCheck, error: CircleAlert, info: Info };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const I = Icon[t.type] || Info;
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <I size={18} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
