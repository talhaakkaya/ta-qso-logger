/**
 * useUserMode Hook
 * Manages user mode (simple/advanced) state
 * Eliminates duplication of getUserMode() with useEffect pattern
 */

import { useState, useEffect } from "react";
import { getUserMode } from "@/utils/settingsUtils";

type UserMode = "simple" | "advanced";

/**
 * Hook to get and track user mode preference
 * @returns Current user mode (simple or advanced)
 */
export function useUserMode(): UserMode {
  const [userMode, setUserMode] = useState<UserMode>("simple");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserMode(getUserMode());
  }, []);

  // Return simple mode during SSR/initial render to prevent hydration mismatch
  // After mount, return the actual user mode from localStorage
  return mounted ? userMode : "simple";
}
