import { useCallback } from "react";
import { toast } from "sonner";
import { ToastType } from "@/types";

const toastDuration: Record<ToastType, number> = {
  success: 3000,
  error: 4000,
  warning: 3500,
  info: 3000,
};

export function useToast() {
  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const duration = toastDuration[type];

      switch (type) {
        case "success":
          toast.success(message, { duration });
          break;
        case "error":
          toast.error(message, { duration });
          break;
        case "warning":
          toast.warning(message, { duration });
          break;
        case "info":
          toast.info(message, { duration });
          break;
      }
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
