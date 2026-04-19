/**
 * Toast Hook for React Native
 * Provides toast notification functionality similar to sonner
 */

import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const addToast = useCallback((type: ToastType, options: ToastOptions) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = options.duration ?? 4000;

    const toast: Toast = {
      id,
      type,
      title: options.title,
      description: options.description,
      duration,
    };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);
      timeoutRefs.current.set(id, timeout);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return addToast('success', opts);
  }, [addToast]);

  const error = useCallback((options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return addToast('error', opts);
  }, [addToast]);

  const warning = useCallback((options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return addToast('warning', opts);
  }, [addToast]);

  const info = useCallback((options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return addToast('info', opts);
  }, [addToast]);

  const dismiss = useCallback((id?: string) => {
    if (id) {
      removeToast(id);
    } else {
      setToasts([]);
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    }
  }, [removeToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    dismiss,
    removeToast,
  };
};

// Create a singleton toast instance for global access
let globalToastInstance: ReturnType<typeof useToast> | null = null;

export const setGlobalToast = (instance: ReturnType<typeof useToast>) => {
  globalToastInstance = instance;
};

export const toast = {
  success: (options: ToastOptions | string) => globalToastInstance?.success(options),
  error: (options: ToastOptions | string) => globalToastInstance?.error(options),
  warning: (options: ToastOptions | string) => globalToastInstance?.warning(options),
  info: (options: ToastOptions | string) => globalToastInstance?.info(options),
  dismiss: (id?: string) => globalToastInstance?.dismiss(id),
};

export default useToast;
