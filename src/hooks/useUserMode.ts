/**
 * useUserMode Hook
 * Manages user mode (simple/advanced) state
 * Uses TanStack Query to make it reactive to settings changes
 */

import { useSettings } from "@/hooks/useQSOQueries";

type UserMode = "simple" | "advanced";

/**
 * Hook to get and track user mode preference reactively
 * @returns Current user mode (simple or advanced)
 */
export function useUserMode(): UserMode {
  const { data: settingsData } = useSettings();

  // Return mode from settings query, fallback to simple mode
  return settingsData?.mode ?? "simple";
}
