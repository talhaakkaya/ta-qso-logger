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

  useEffect(() => {
    setUserMode(getUserMode());
  }, []);

  return userMode;
}
