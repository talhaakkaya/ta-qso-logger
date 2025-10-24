"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create QueryClient instance once per component mount
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data NEVER goes stale - only mutations update cache
            staleTime: Infinity,
            // Keep cache forever in memory
            gcTime: Infinity,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus
            refetchOnWindowFocus: false,
            // Don't refetch on mount (cache is always fresh)
            refetchOnMount: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  // Create async localStorage persister with official wrapper
  const [persister] = useState(() => {
    // Official TanStack Query wrapper for localStorage
    const asyncLocalStorage = {
      getItem: async (key: string) => {
        return window.localStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        window.localStorage.removeItem(key);
      },
    };

    return createAsyncStoragePersister({
      storage: asyncLocalStorage,
      key: "qso-query-cache",
    });
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries
            return query.state.status === "success";
          },
        },
      }}
    >
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
}
