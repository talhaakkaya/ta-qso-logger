/**
 * useModal Hook
 * Generic modal state management
 * Eliminates repetitive useState patterns across modals
 */

import { useState, useCallback } from "react";

export interface UseModalReturn<T = any> {
  show: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook to manage modal open/close state and associated data
 * @param initialData - Optional initial data for the modal
 * @returns Modal state and control functions
 */
export function useModal<T = any>(initialData: T | null = null): UseModalReturn<T> {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<T | null>(initialData);

  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setShow(true);
  }, []);

  const close = useCallback(() => {
    setShow(false);
    // Clear data on close to prevent stale data in next open
    setData(null);
  }, []);

  return {
    show,
    data,
    open,
    close,
    setData,
  };
}
