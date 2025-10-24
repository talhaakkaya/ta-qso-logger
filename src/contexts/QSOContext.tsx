"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { QSORecord, FilterState, PaginationState, Logbook } from "@/types";
import { ImportResult } from "@/types/qso.types";
import apiService from "@/services/apiService";
import adifService from "@/services/adifService";
import csvService from "@/services/csvService";
import { ROWS_PER_PAGE } from "@/utils/constants";
import { getCurrentDateTimeInTimezone } from "@/utils/settingsUtils";

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
  const { data: session, status } = useSession();
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

  // User profile state
  const [stationGridSquare, setStationGridSquare] = useState<string>("");

  // Logbook state
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [currentLogbook, setCurrentLogbookState] = useState<Logbook | null>(null);

  // Load user profile from API
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to load user profile");
      }
      const profile = await response.json();
      setStationGridSquare(profile.gridSquare || "");
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setStationGridSquare("");
    }
  }, []);

  // Load logbooks from API
  const loadLogbooks = useCallback(async () => {
    try {
      const response = await fetch("/api/logbooks");
      if (!response.ok) {
        throw new Error("Failed to load logbooks");
      }
      const data = await response.json();
      setLogbooks(data);

      // Auto-select default logbook if no current logbook is set
      if (!currentLogbook && data.length > 0) {
        const defaultLogbook = data.find((lb: Logbook) => lb.isDefault) || data[0];
        setCurrentLogbookState(defaultLogbook);
      }
    } catch (error) {
      console.error("Failed to load logbooks:", error);
    }
  }, [currentLogbook]);

  // Set current logbook and reload QSOs
  const setCurrentLogbook = useCallback(async (logbookIdOrObject: string | Logbook) => {
    // Handle both ID (string) and object
    const logbook = typeof logbookIdOrObject === 'string'
      ? logbooks.find((lb) => lb.id === logbookIdOrObject)
      : logbookIdOrObject;

    if (logbook) {
      setCurrentLogbookState(logbook);

      // Reload QSOs for the selected logbook
      setIsLoading(true);
      try {
        const records = await apiService.getQSORecords(logbook.id);
        setQSORecords(records);
      } catch (error) {
        console.error("Failed to load QSO records:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [logbooks]);

  // Create new logbook
  const createLogbook = useCallback(async (name: string): Promise<Logbook> => {
    try {
      const response = await fetch("/api/logbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create logbook");
      }

      const newLogbook = await response.json();

      // Add to local state
      setLogbooks((prev) => [...prev, newLogbook]);

      return newLogbook;
    } catch (error) {
      console.error("Failed to create logbook:", error);
      throw error;
    }
  }, []);

  // Helper function to update logbook QSO count
  const updateLogbookCount = useCallback((logbookId: string, delta: number) => {
    setLogbooks((prev) =>
      prev.map((logbook) =>
        logbook.id === logbookId
          ? { ...logbook, qsoCount: logbook.qsoCount + delta }
          : logbook
      )
    );
  }, []);

  // Load initial data from API only when authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      // Only fetch data when authenticated
      if (status !== "authenticated") {
        if (status === "unauthenticated") {
          setIsLoading(false);
        }
        return;
      }

      // User is authenticated, fetch data
      try {
        // Load user profile (grid square, etc.)
        await loadUserProfile();

        // Load logbooks first
        const response = await fetch("/api/logbooks");
        if (response.ok) {
          const logbooksData = await response.json();
          setLogbooks(logbooksData);

          // Auto-select default logbook
          const defaultLogbook = logbooksData.find((lb: Logbook) => lb.isDefault) || logbooksData[0];
          if (defaultLogbook) {
            setCurrentLogbookState(defaultLogbook);

            // Load QSO records for the default logbook
            const records = await apiService.getQSORecords(defaultLogbook.id);
            setQSORecords(records);
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [status, loadUserProfile]);

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
  const deleteQSORecord = useCallback(
    async (id: string): Promise<void> => {
      try {
        // Call the API to delete the record
        await apiService.deleteQSORecord(id);

        // Remove from local state
        setQSORecords((prev) => prev.filter((record) => record.id !== id));

        // Update logbook count (-1)
        if (currentLogbook) {
          updateLogbookCount(currentLogbook.id, -1);
        }
      } catch (error) {
        console.error("Failed to delete QSO record:", error);
        throw error;
      }
    },
    [currentLogbook, updateLogbookCount]
  );

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

      // Reload logbooks to update all counts (since it affects all logbooks)
      await loadLogbooks();

      return result.deletedCount;
    } catch (error) {
      console.error("Failed to delete all QSO records:", error);
      throw error;
    }
  }, [loadLogbooks]);

  // Immediate save methods for modal
  const createQSORecordImmediate = useCallback(
    async (data: Omit<QSORecord, "id">): Promise<QSORecord> => {
      try {
        // Save to API immediately with current logbook
        const savedRecord = await apiService.createQSORecord(
          data,
          currentLogbook?.id
        );

        // Add to local state
        setQSORecords((prev) => [savedRecord, ...prev]);

        // Update logbook count (+1)
        if (currentLogbook) {
          updateLogbookCount(currentLogbook.id, 1);
        }

        return savedRecord;
      } catch (error) {
        console.error("Failed to create QSO record:", error);
        throw error;
      }
    },
    [currentLogbook, updateLogbookCount],
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

        const result = await apiService.importQSORecords(file, targetLogbookId);

        // Add imported records to local state only if importing to current logbook
        if (result.records && result.records.length > 0) {
          if (targetLogbookId === currentLogbook?.id) {
            setQSORecords((prev) => [...result.records, ...prev]);
          }

          // Update logbook count by number of imported records
          if (targetLogbookId) {
            updateLogbookCount(targetLogbookId, result.records.length);
          }
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
    },
    [currentLogbook, updateLogbookCount]
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

        // Add imported records to local state only if importing to current logbook
        if (result.records && result.records.length > 0) {
          if (targetLogbookId === currentLogbook?.id) {
            setQSORecords((prev) => [...result.records!, ...prev]);
          }

          // Update logbook count by number of imported records
          if (targetLogbookId) {
            updateLogbookCount(targetLogbookId, result.records.length);
          }
        }

        return result;
      } catch (error) {
        console.error("Failed to import CSV records:", error);
        throw error;
      }
    },
    [currentLogbook, updateLogbookCount]
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
