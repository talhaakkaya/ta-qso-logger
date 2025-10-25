"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
            // Keep cache forever in memory (until page refresh)
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
