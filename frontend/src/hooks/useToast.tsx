import { useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const ToastContainer = () => {
    return (
      <>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              position: 'fixed',
              top: `${20 + (index * 90)}px`,
              right: '20px',
              zIndex: 10000 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </>
    );
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    ToastContainer,
  };
};
