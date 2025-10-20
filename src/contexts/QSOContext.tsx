"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { QSORecord, FilterState, PaginationState } from "@/types";
import { ImportResult } from "@/types/qso.types";
import apiService from "@/services/apiService";
import adifService from "@/services/adifService";
import { ROWS_PER_PAGE } from "@/utils/constants";
import { getCurrentDateTimeInTimezone } from "@/utils/settingsUtils";

interface QSOContextType {
  // Data
  qsoRecords: QSORecord[];
  filteredRecords: QSORecord[];
  isLoading: boolean;

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
  importFromADIF: (file: File) => Promise<ImportResult>;

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
  const [qsoRecords, setQSORecords] = useState<QSORecord[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const records = await apiService.getQSORecords();
        setQSORecords(records);
      } catch (error) {
        console.error("Failed to load QSO records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Calculate filtered records
  const getFilteredRecords = useCallback((): QSORecord[] => {
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

  const filteredRecords = getFilteredRecords();

  // Update pagination when filtered records change
  useEffect(() => {
    const totalPages = Math.ceil(filteredRecords.length / ROWS_PER_PAGE);
    setPagination((prev) => ({
      ...prev,
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
    }));
  }, [filteredRecords.length]);

  // Actions
  const deleteQSORecord = useCallback(async (id: string): Promise<void> => {
    try {
      // Call the API to delete the record
      await apiService.deleteQSORecord(id);

      // Remove from local state
      setQSORecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error("Failed to delete QSO record:", error);
      throw error;
    }
  }, []);

  const deleteAllQSORecords = useCallback(async (): Promise<number> => {
    try {
      // Call the API to delete all records
      const response = await fetch("/api/qso/delete-all", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all QSO records");
      }

      const result = await response.json();

      // Clear local state
      setQSORecords([]);

      return result.deletedCount;
    } catch (error) {
      console.error("Failed to delete all QSO records:", error);
      throw error;
    }
  }, []);

  // Immediate save methods for modal
  const createQSORecordImmediate = useCallback(
    async (data: Omit<QSORecord, "id">): Promise<QSORecord> => {
      try {
        // Save to API immediately
        const savedRecord = await apiService.createQSORecord(data);

        // Add to local state
        setQSORecords((prev) => [savedRecord, ...prev]);

        return savedRecord;
      } catch (error) {
        console.error("Failed to create QSO record:", error);
        throw error;
      }
    },
    [],
  );

  const updateQSORecordImmediate = useCallback(
    async (id: string, data: Partial<QSORecord>): Promise<QSORecord> => {
      try {
        // Update on API immediately
        const updatedRecord = await apiService.updateQSORecord(id, data);

        // Update local state
        setQSORecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record)),
        );

        return updatedRecord;
      } catch (error) {
        console.error("Failed to update QSO record:", error);
        throw error;
      }
    },
    [],
  );

  const exportToADIF = useCallback(async (): Promise<void> => {
    try {
      const blob = await apiService.exportQSORecords();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = `qso-export-${new Date().toISOString().split("T")[0]}.adi`;
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
      // Fallback to local ADIF export
      adifService.downloadADIF(qsoRecords);
    }
  }, [qsoRecords]);

  const importFromADIF = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      const result = await apiService.importQSORecords(file);

      // Add imported records to local state
      if (result.records && result.records.length > 0) {
        setQSORecords((prev) => [...result.records, ...prev]);
      }

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
  }, []);

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

  const value: QSOContextType = {
    qsoRecords,
    filteredRecords,
    isLoading,
    pagination,
    filters,
    deleteQSORecord,
    deleteAllQSORecords,
    createQSORecordImmediate,
    updateQSORecordImmediate,
    exportToADIF,
    importFromADIF,
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
