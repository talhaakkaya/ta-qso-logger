/**
 * useLocationSearch Hook
 * Manages location search state and Nominatim API integration
 * Extracted from QSOModal for reusability
 */

import { useState, useCallback } from "react";
import locationService, { NominatimResult } from "@/services/locationService";

export interface UseLocationSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: NominatimResult[];
  isSearching: boolean;
  search: () => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook to manage location search functionality
 * @returns Location search state and control functions
 */
export function useLocationSearch(): UseLocationSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) {
      throw new Error("Lütfen bir konum girin");
    }

    setIsSearching(true);
    setResults([]);

    try {
      const searchResults = await locationService.searchLocation(query, 10);
      setResults(searchResults);

      if (searchResults.length === 0) {
        throw new Error("Konum bulunamadı");
      }
    } catch (error) {
      console.error("Location search error:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clearResults,
  };
}
