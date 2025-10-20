import { useCallback } from "react";
import toast, { ToastOptions } from "react-hot-toast";
import { ToastType } from "@/types";

const toastConfig: Record<ToastType, Partial<ToastOptions>> = {
  success: {
    duration: 3000,
    icon: "✅",
    style: {
      background: "#198754",
      color: "#fff",
    },
  },
  error: {
    duration: 4000,
    icon: "❌",
    style: {
      background: "#dc3545",
      color: "#fff",
    },
  },
  warning: {
    duration: 3500,
    icon: "⚠️",
    style: {
      background: "#ffc107",
      color: "#000",
    },
  },
  info: {
    duration: 3000,
    icon: "ℹ️",
    style: {
      background: "#0dcaf0",
      color: "#000",
    },
  },
};

export function useToast() {
  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const config = toastConfig[type];
      toast(message, config);
    },
    [],
  );

  const showPromiseToast = useCallback(
    <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
    ) => {
      return toast.promise(promise, messages);
    },
    [],
  );

  return {
    showToast,
    showPromiseToast,
  };
}
