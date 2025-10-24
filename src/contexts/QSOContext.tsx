"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { QSORecord, FilterState, PaginationState, Logbook } from "@/types";
import { ImportResult } from "@/types/qso.types";
import apiService from "@/services/apiService";
import adifService from "@/services/adifService";
import csvService from "@/services/csvService";
import { ROWS_PER_PAGE } from "@/utils/constants";
import {
  useQSOs,
  useCreateQSO,
  useUpdateQSO,
  useDeleteQSO,
  useDeleteAllQSOs,
  useLogbooks,
  useCreateLogbook,
  useProfile,
  useImportQSOs,
} from "@/hooks/useQSOQueries";

interface QSOContextType {
  // Data
  qsoRecords: QSORecord[];
  filteredRecords: QSORecord[];
  isLoading: boolean;

  // User Profile
  stationGridSquare: string;
  loadUserProfile: () => Promise<void>;

  // Logbook
  logbooks: Logbook[];
  currentLogbook: Logbook | null;
  setCurrentLogbook: (logbookIdOrObject: string | Logbook) => Promise<void>;
  loadLogbooks: () => Promise<void>;
  createLogbook: (name: string) => Promise<Logbook>;

  // Pagination
  pagination: PaginationState;

  // Filters
  filters: FilterState;

  // Actions
  deleteQSORecord: (id: string) => Promise<void>;
  deleteAllQSORecords: () => Promise<number>;

  // Immediate save actions (for modal)
  createQSORecordImmediate: (data: Omit<QSORecord, "id">) => Promise<QSORecord>;
  updateQSORecordImmediate: (id: string, data: Partial<QSORecord>) => Promise<QSORecord>;

  // Export/Import
  exportToADIF: () => Promise<void>;
  importFromADIF: (file: File, logbookId?: string) => Promise<ImportResult>;
  importFromCSV: (
    parsedData: { headers: string[]; rows: string[][] },
    columnMapping: Record<string, string>,
    logbookId?: string
  ) => Promise<ImportResult>;

  // Filter/Search
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;

  // Pagination
  setPage: (page: number) => void;

  // New record tracking
  newRecordId: string | null;
  clearNewRecordId: () => void;
}

const QSOContext = createContext<QSOContextType | undefined>(undefined);

export const QSOProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { status } = useSession();

  // ==================== UI State (kept in context) ====================
  const [filters, setFiltersState] = useState<FilterState>({
    year: "",
    month: "",
    searchTerm: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    rowsPerPage: ROWS_PER_PAGE,
    totalPages: 1,
  });
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  const [currentLogbook, setCurrentLogbookState] = useState<Logbook | null>(null);

  // ==================== TanStack Query Hooks ====================

  // Fetch logbooks
  const { data: logbooksData = [], isLoading: logbooksLoading, refetch: refetchLogbooks } = useLogbooks();

  // Fetch QSOs for current logbook
  const { data: qsoRecords = [], isLoading: qsosLoading, refetch: refetchQSOs } = useQSOs(currentLogbook?.id);

  // Fetch user profile
  const { data: profileData, refetch: refetchProfile } = useProfile();

  // Mutations
  const createQSOMutation = useCreateQSO(currentLogbook?.id);
  const updateQSOMutation = useUpdateQSO(currentLogbook?.id);
  const deleteQSOMutation = useDeleteQSO(currentLogbook?.id);
  const deleteAllQSOMutation = useDeleteAllQSOs(currentLogbook?.id);
  const createLogbookMutation = useCreateLogbook();
  const importQSOMutation = useImportQSOs(currentLogbook?.id);

  // ==================== Computed Values ====================

  // Overall loading state
  const isLoading = logbooksLoading || qsosLoading;

  // User profile data
  const stationGridSquare = profileData?.gridSquare || "";

  // Logbooks list
  const logbooks = logbooksData;

  // Calculate filtered records
  const filteredRecords = useMemo((): QSORecord[] => {
    let filtered = [...qsoRecords];

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter((record) => {
        if (!record.datetime) return false;
        const year = record.datetime.split("-")[0];
        return year === filters.year;
      });
    }

    // Apply month filter
    if (filters.month) {
      filtered = filtered.filter((record) => {
        if (!record.datetime) return false;
        const month = record.datetime.split("-")[1];
        return month === filters.month;
      });
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchUpper = filters.searchTerm.toUpperCase();
      filtered = filtered.filter((record) =>
        Object.values(record).some(
          (value) =>
            value && value.toString().toUpperCase().includes(searchUpper),
        ),
      );
    }

    return filtered;
  }, [qsoRecords, filters]);

  // ==================== Auto-select Default Logbook ====================

  useEffect(() => {
    if (status === "authenticated" && logbooks.length > 0 && !currentLogbook) {
      const defaultLogbook = logbooks.find((lb) => lb.isDefault) || logbooks[0];
      setCurrentLogbookState(defaultLogbook);
    }
  }, [status, logbooks, currentLogbook]);

  // ==================== Update Pagination ====================

  useEffect(() => {
    const totalPages = Math.ceil(filteredRecords.length / ROWS_PER_PAGE);
    setPagination((prev) => ({
      ...prev,
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
    }));
  }, [filteredRecords.length]);

  // ==================== Context Methods ====================

  const loadUserProfile = useCallback(async () => {
    await refetchProfile();
  }, [refetchProfile]);

  const loadLogbooks = useCallback(async () => {
    await refetchLogbooks();
  }, [refetchLogbooks]);

  const setCurrentLogbook = useCallback(async (logbookIdOrObject: string | Logbook) => {
    // Handle both ID (string) and object
    const logbook = typeof logbookIdOrObject === 'string'
      ? logbooks.find((lb) => lb.id === logbookIdOrObject)
      : logbookIdOrObject;

    if (logbook) {
      setCurrentLogbookState(logbook);
      // TanStack Query will automatically refetch QSOs for new logbook
    }
  }, [logbooks]);

  const createLogbook = useCallback(async (name: string): Promise<Logbook> => {
    const newLogbook = await createLogbookMutation.mutateAsync(name);
    return newLogbook;
  }, [createLogbookMutation]);

  const deleteQSORecord = useCallback(
    async (id: string): Promise<void> => {
      await deleteQSOMutation.mutateAsync(id);
    },
    [deleteQSOMutation]
  );

  const deleteAllQSORecords = useCallback(async (): Promise<number> => {
    const result = await deleteAllQSOMutation.mutateAsync();
    return result;
  }, [deleteAllQSOMutation]);

  const createQSORecordImmediate = useCallback(
    async (data: Omit<QSORecord, "id">): Promise<QSORecord> => {
      const savedRecord = await createQSOMutation.mutateAsync(data);
      setNewRecordId(savedRecord.id); // Track new record for highlighting
      return savedRecord;
    },
    [createQSOMutation]
  );

  const updateQSORecordImmediate = useCallback(
    async (id: string, data: Partial<QSORecord>): Promise<QSORecord> => {
      const updatedRecord = await updateQSOMutation.mutateAsync({ id, updates: data });
      return updatedRecord;
    },
    [updateQSOMutation]
  );

  const exportToADIF = useCallback(async (): Promise<void> => {
    try {
      const blob = await apiService.exportQSORecords(currentLogbook?.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      // Include logbook name in filename
      const sanitizedLogbookName = (currentLogbook?.name || 'QSO')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-');
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `qso-export-${sanitizedLogbookName}-${dateStr}.adi`;

      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(
        "Failed to export via API, falling back to local export:",
        error,
      );
      // Fallback to local ADIF export with logbook name
      adifService.downloadADIF(qsoRecords, currentLogbook?.name);
    }
  }, [qsoRecords, currentLogbook]);

  const importFromADIF = useCallback(
    async (file: File, logbookId?: string): Promise<ImportResult> => {
      try {
        // Use provided logbookId or default to current logbook
        const targetLogbookId = logbookId || currentLogbook?.id;

        const result = await importQSOMutation.mutateAsync(file);

        return {
          success: result.success,
          imported: result.imported,
          errors: result.errors || 0,
          errorMessages: result.errorMessages,
        };
      } catch (error) {
        console.error("Failed to import QSO records:", error);
        throw error;
      }
    },
    [currentLogbook, importQSOMutation]
  );

  const importFromCSV = useCallback(
    async (
      parsedData: { headers: string[]; rows: string[][] },
      columnMapping: Record<string, string>,
      logbookId?: string
    ): Promise<ImportResult> => {
      try {
        // Use provided logbookId or default to current logbook
        const targetLogbookId = logbookId || currentLogbook?.id;

        // Use CSV service for import logic
        const result = await csvService.importCSVRecords(parsedData, columnMapping, targetLogbookId);

        // Refresh QSOs and logbooks after import
        await refetchQSOs();
        await refetchLogbooks();

        return result;
      } catch (error) {
        console.error("Failed to import CSV records:", error);
        throw error;
      }
    },
    [currentLogbook, refetchQSOs, refetchLogbooks]
  );

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ year: "", month: "", searchTerm: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const clearNewRecordId = useCallback(() => {
    setNewRecordId(null);
  }, []);

  // ==================== Context Value ====================

  const value: QSOContextType = {
    qsoRecords,
    filteredRecords,
    isLoading,
    stationGridSquare,
    loadUserProfile,
    logbooks,
    currentLogbook,
    setCurrentLogbook,
    loadLogbooks,
    createLogbook,
    pagination,
    filters,
    deleteQSORecord,
    deleteAllQSORecords,
    createQSORecordImmediate,
    updateQSORecordImmediate,
    exportToADIF,
    importFromADIF,
    importFromCSV,
    setFilters,
    clearFilters,
    setPage,
    newRecordId,
    clearNewRecordId,
  };

  return <QSOContext.Provider value={value}>{children}</QSOContext.Provider>;
};

export const useQSO = () => {
  const context = useContext(QSOContext);
  if (context === undefined) {
    throw new Error("useQSO must be used within a QSOProvider");
  }
  return context;
};
