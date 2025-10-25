/**
 * TanStack Query hooks for QSO data fetching and mutations
 * Provides caching, optimistic updates, and automatic refetching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QSORecord, Logbook } from "@/types";
import { ImportResult } from "@/types/qso.types";
import apiService from "@/services/apiService";

// Query Keys - centralized for easy cache invalidation
export const qsoKeys = {
  all: ["qsos"] as const,
  lists: () => [...qsoKeys.all, "list"] as const,
  list: (logbookId?: string) =>
    [...qsoKeys.lists(), { logbookId }] as const,
  logbooks: ["logbooks"] as const,
  profile: ["profile"] as const,
  settings: ["settings"] as const,
};

/**
 * Fetch QSO records for a logbook
 */
export function useQSOs(logbookId?: string) {
  return useQuery({
    queryKey: qsoKeys.list(logbookId),
    queryFn: () => apiService.getQSORecords(logbookId),
  });
}

/**
 * Create a new QSO record with optimistic updates
 */
export function useCreateQSO(logbookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newQSO: Omit<QSORecord, "id">) =>
      apiService.createQSORecord(newQSO, logbookId),

    // Optimistic update - add QSO to cache immediately
    onMutate: async (newQSO) => {
      const queryKey = qsoKeys.list(logbookId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousQSOs = queryClient.getQueryData<QSORecord[]>(queryKey);

      // Optimistically update cache
      if (previousQSOs) {
        const optimisticQSO = {
          ...newQSO,
          id: `temp-${Date.now()}`, // Temporary ID
        } as QSORecord;

        queryClient.setQueryData<QSORecord[]>(queryKey, [
          optimisticQSO,
          ...previousQSOs,
        ]);
      }

      return { previousQSOs };
    },

    // On success, replace temp QSO with real one from server
    onSuccess: (savedQSO) => {
      const queryKey = qsoKeys.list(logbookId);
      queryClient.setQueryData<QSORecord[]>(queryKey, (old) => {
        if (!old) return [savedQSO];
        // Replace temp QSO with real one
        return old.map((qso) =>
          qso.id.startsWith("temp-") ? savedQSO : qso
        );
      });
      // Invalidate logbooks to update QSO counts
      queryClient.invalidateQueries({ queryKey: qsoKeys.logbooks });
    },

    // On error, rollback to previous state
    onError: (err, newQSO, context) => {
      if (context?.previousQSOs) {
        queryClient.setQueryData(qsoKeys.list(logbookId), context.previousQSOs);
      }
    },
  });
}

/**
 * Update an existing QSO record with optimistic updates
 */
export function useUpdateQSO(logbookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<QSORecord> }) =>
      apiService.updateQSORecord(id, updates),

    // Optimistic update
    onMutate: async ({ id, updates }) => {
      const queryKey = qsoKeys.list(logbookId);
      await queryClient.cancelQueries({ queryKey });

      const previousQSOs = queryClient.getQueryData<QSORecord[]>(queryKey);

      if (previousQSOs) {
        queryClient.setQueryData<QSORecord[]>(queryKey, (old) =>
          old?.map((qso) => (qso.id === id ? { ...qso, ...updates } : qso)) || []
        );
      }

      return { previousQSOs };
    },

    onSuccess: (updatedQSO) => {
      const queryKey = qsoKeys.list(logbookId);
      queryClient.setQueryData<QSORecord[]>(queryKey, (old) =>
        old?.map((qso) => (qso.id === updatedQSO.id ? updatedQSO : qso)) || []
      );
    },

    onError: (err, variables, context) => {
      if (context?.previousQSOs) {
        queryClient.setQueryData(qsoKeys.list(logbookId), context.previousQSOs);
      }
    },
  });
}

/**
 * Delete a QSO record with optimistic updates
 */
export function useDeleteQSO(logbookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteQSORecord(id),

    // Optimistic update
    onMutate: async (id) => {
      const queryKey = qsoKeys.list(logbookId);
      await queryClient.cancelQueries({ queryKey });

      const previousQSOs = queryClient.getQueryData<QSORecord[]>(queryKey);

      if (previousQSOs) {
        queryClient.setQueryData<QSORecord[]>(
          queryKey,
          previousQSOs.filter((qso) => qso.id !== id)
        );
      }

      return { previousQSOs };
    },

    onSuccess: () => {
      // Invalidate logbooks to update QSO counts
      queryClient.invalidateQueries({ queryKey: qsoKeys.logbooks });
    },

    onError: (err, id, context) => {
      if (context?.previousQSOs) {
        queryClient.setQueryData(qsoKeys.list(logbookId), context.previousQSOs);
      }
    },
  });
}

/**
 * Delete all QSO records in a logbook
 */
export function useDeleteAllQSOs(logbookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.deleteAllQSORecords(logbookId),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: qsoKeys.list(logbookId) });
      // Invalidate logbooks to update QSO counts
      queryClient.invalidateQueries({ queryKey: qsoKeys.logbooks });
    },
  });
}

/**
 * Fetch user logbooks
 */
export function useLogbooks() {
  return useQuery({
    queryKey: qsoKeys.logbooks,
    queryFn: () => apiService.getLogbooks(),
  });
}

/**
 * Create a new logbook
 */
export function useCreateLogbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiService.createLogbook(name),
    onSuccess: () => {
      // Invalidate logbooks query to refetch
      queryClient.invalidateQueries({ queryKey: qsoKeys.logbooks });
    },
  });
}

/**
 * Fetch user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: qsoKeys.profile,
    queryFn: () => apiService.getProfile(),
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { callsign?: string; name?: string; gridSquare?: string }) =>
      apiService.updateProfile(updates),
    onSuccess: () => {
      // Invalidate to force refetch and update localStorage cache
      queryClient.invalidateQueries({ queryKey: qsoKeys.profile });
    },
  });
}

/**
 * Import QSOs from ADIF file
 */
export function useImportQSOs(logbookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiService.importQSORecords(file, logbookId),
    onSuccess: () => {
      // Invalidate and refetch QSOs after import
      queryClient.invalidateQueries({ queryKey: qsoKeys.list(logbookId) });
      // Invalidate logbooks to update QSO counts
      queryClient.invalidateQueries({ queryKey: qsoKeys.logbooks });
    },
  });
}

/**
 * Fetch UI settings from localStorage
 * Makes settings reactive - components re-render when settings change
 */
export function useSettings() {
  return useQuery({
    queryKey: qsoKeys.settings,
    queryFn: async () => {
      if (typeof window === "undefined") {
        return {
          timezone: { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: 0 },
          defaultTxPower: 5,
          mode: "simple" as const,
        };
      }

      // Dynamically import to avoid SSR issues
      const { getStoredTimezone, getDefaultTxPower, getUserMode } = await import("@/utils/settingsUtils");

      return {
        timezone: getStoredTimezone(),
        defaultTxPower: getDefaultTxPower(),
        mode: getUserMode(),
      };
    },
  });
}

/**
 * Update UI settings in localStorage
 * Automatically invalidates cache to trigger re-renders
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      timezone?: { value: string; label: string; offset: number };
      defaultTxPower?: number;
      mode?: "simple" | "advanced";
    }) => {
      if (typeof window === "undefined") return;

      // Dynamically import to avoid SSR issues
      const { saveTimezone, saveDefaultTxPower, saveUserMode } = await import("@/utils/settingsUtils");

      if (updates.timezone) {
        saveTimezone(updates.timezone.value);
      }
      if (updates.defaultTxPower !== undefined) {
        saveDefaultTxPower(updates.defaultTxPower);
      }
      if (updates.mode) {
        saveUserMode(updates.mode);
      }

      return updates;
    },
    onSuccess: () => {
      // Invalidate settings cache to trigger re-renders
      queryClient.invalidateQueries({ queryKey: qsoKeys.settings });
    },
  });
}
