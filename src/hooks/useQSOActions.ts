/**
 * useQSOActions Hook
 * Consolidated CRUD operation handlers with toast notifications
 * Eliminates duplication across QSOTable and QSORow components
 */

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { QSORecord } from "@/types";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";

export interface UseQSOActionsReturn {
  handleSave: (data: Omit<QSORecord, "id"> | QSORecord) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

/**
 * Hook to manage QSO CRUD operations with consistent error handling and toast notifications
 * @returns Object with save and delete handler functions
 */
export function useQSOActions(): UseQSOActionsReturn {
  const t = useTranslations();
  const { createQSORecordImmediate, updateQSORecordImmediate, deleteQSORecord } = useQSO();
  const { showToast } = useToast();

  const handleSave = useCallback(
    async (data: Omit<QSORecord, "id"> | QSORecord) => {
      try {
        if ("id" in data) {
          // Edit mode
          await updateQSORecordImmediate(data.id, data);
          showToast(t("validation.success.qsoUpdated"), "success");
        } else {
          // Create mode
          await createQSORecordImmediate(data);
          showToast(t("validation.success.qsoCreated"), "success");
        }
      } catch (error) {
        console.error("Failed to save QSO:", error);
        showToast(t("validation.error.qsoSaveFailed"), "error");
        throw error;
      }
    },
    [createQSORecordImmediate, updateQSORecordImmediate, showToast, t]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteQSORecord(id);
        showToast(t("validation.success.qsoDeleted"), "success");
      } catch (error) {
        console.error("Delete failed:", error);
        showToast(t("validation.error.qsoDeleteFailed"), "error");
        throw error;
      }
    },
    [deleteQSORecord, showToast, t]
  );

  return {
    handleSave,
    handleDelete,
  };
}
