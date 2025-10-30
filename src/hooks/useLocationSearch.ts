/**
 * useLocationSearch Hook
 * Manages location search state and Nominatim API integration
 * Extracted from QSOModal for reusability
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import locationService, { NominatimResult, LocationServiceError } from "@/services/locationService";

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
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async () => {
    setIsSearching(true);
    setResults([]);

    try {
      const searchResults = await locationService.searchLocation(query, 10);
      setResults(searchResults);

      if (searchResults.length === 0) {
        throw new Error(t("validation.error.locationNotFound"));
      }
    } catch (error) {
      console.error("Location search error:", error);

      // Translate service error codes
      if (error instanceof LocationServiceError) {
        if (error.code === "emptyQuery") {
          throw new Error(t("validation.error.pleaseEnterLocation"));
        } else if (error.code === "searchFailed") {
          throw new Error(t("validation.error.locationSearchFailed"));
        }
      }

      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [query, t]);

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
