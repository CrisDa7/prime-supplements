import { createContext, useContext } from 'react';
import Swal from 'sweetalert2';

const ToastContext = createContext(null);

const icons = {
  success: 'success',
  error: 'error',
  warning: 'warning',
};

export function ToastProvider({ children }) {
  const showToast = (msg, type = 'success') => {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: icons[type] || 'success',
      title: msg,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
      background: '#171717',
      color: '#d4d4d4',
      iconColor: type === 'error' ? '#e05454' : type === 'warning' ? '#e8884e' : '#7ec84e',
      customClass: {
        popup: 'rounded-xl border border-[#222] shadow-2xl',
        title: 'text-sm font-medium',
        timerProgressBar: 'bg-[#333]',
      },
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
