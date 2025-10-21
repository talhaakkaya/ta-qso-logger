const TIMEZONE_KEY = "qso-logger-timezone";
const STATION_CALLSIGN_KEY = "qso-logger-station-callsign";
const DEFAULT_TX_POWER_KEY = "qso-logger-default-tx-power";
const MODE_KEY = "qso-logger-mode";

export type UserMode = 'simple' | 'advanced';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: number; // Offset in minutes from UTC
}

export interface UserSettings {
  timezone: TimezoneOption;
  stationCallsign: string;
  defaultTxPower: number;
  mode: UserMode;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: 0 },
  { value: "GMT", label: "GMT (Greenwich Mean Time)", offset: 0 },
  { value: "UTC+1", label: "UTC+1 (Central European Time)", offset: 60 },
  { value: "UTC+2", label: "UTC+2 (Eastern European Time)", offset: 120 },
  { value: "UTC+3", label: "UTC+3 (Turkey Time)", offset: 180 },
  { value: "UTC+4", label: "UTC+4", offset: 240 },
  { value: "UTC+5", label: "UTC+5", offset: 300 },
  { value: "UTC+5:30", label: "UTC+5:30 (India)", offset: 330 },
  { value: "UTC+6", label: "UTC+6", offset: 360 },
  { value: "UTC+7", label: "UTC+7", offset: 420 },
  { value: "UTC+8", label: "UTC+8 (China/Singapore)", offset: 480 },
  { value: "UTC+9", label: "UTC+9 (Japan/Korea)", offset: 540 },
  { value: "UTC+10", label: "UTC+10 (Australia East)", offset: 600 },
  { value: "UTC+11", label: "UTC+11", offset: 660 },
  { value: "UTC+12", label: "UTC+12 (New Zealand)", offset: 720 },
  { value: "UTC-1", label: "UTC-1 (Azores)", offset: -60 },
  { value: "UTC-2", label: "UTC-2", offset: -120 },
  { value: "UTC-3", label: "UTC-3 (Brazil)", offset: -180 },
  { value: "UTC-4", label: "UTC-4 (Atlantic)", offset: -240 },
  { value: "UTC-5", label: "UTC-5 (Eastern US)", offset: -300 },
  { value: "UTC-6", label: "UTC-6 (Central US)", offset: -360 },
  { value: "UTC-7", label: "UTC-7 (Mountain US)", offset: -420 },
  { value: "UTC-8", label: "UTC-8 (Pacific US)", offset: -480 },
  { value: "UTC-9", label: "UTC-9 (Alaska)", offset: -540 },
  { value: "UTC-10", label: "UTC-10 (Hawaii)", offset: -600 },
  { value: "UTC-11", label: "UTC-11", offset: -660 },
  { value: "UTC-12", label: "UTC-12", offset: -720 },
];

/**
 * Get the stored timezone from localStorage
 * Returns UTC if not set
 */
export const getStoredTimezone = (): TimezoneOption => {
  if (typeof window === "undefined") {
    return TIMEZONE_OPTIONS[0]; // Default to UTC for SSR
  }

  const stored = localStorage.getItem(TIMEZONE_KEY);
  if (stored) {
    const option = TIMEZONE_OPTIONS.find((tz) => tz.value === stored);
    if (option) {
      return option;
    }
  }

  // Default to UTC
  return TIMEZONE_OPTIONS[0];
};

/**
 * Save timezone preference to localStorage
 */
export const saveTimezone = (timezone: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TIMEZONE_KEY, timezone);
  }
};

/**
 * Get the stored station callsign from localStorage
 * Returns empty string if not set
 */
export const getStationCallsign = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(STATION_CALLSIGN_KEY) || "";
};

/**
 * Save station callsign to localStorage
 */
export const saveStationCallsign = (callsign: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STATION_CALLSIGN_KEY, callsign.toUpperCase().trim());
  }
};

/**
 * Get the stored default transmit power from localStorage
 * Returns 5W if not set
 */
export const getDefaultTxPower = (): number => {
  if (typeof window === "undefined") {
    return 5; // Default to 5W for SSR
  }

  const stored = localStorage.getItem(DEFAULT_TX_POWER_KEY);
  if (stored) {
    const power = parseFloat(stored);
    if (!isNaN(power) && power >= 0) {
      return power;
    }
  }

  // Default to 5W
  return 5;
};

/**
 * Save default transmit power to localStorage
 */
export const saveDefaultTxPower = (power: number): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEFAULT_TX_POWER_KEY, power.toString());
  }
};

/**
 * Get the stored user mode from localStorage
 * Returns 'simple' if not set (beginner-friendly default)
 */
export const getUserMode = (): UserMode => {
  if (typeof window === "undefined") {
    return "simple"; // Default to simple mode for SSR
  }

  const stored = localStorage.getItem(MODE_KEY);
  if (stored === "advanced" || stored === "simple") {
    return stored;
  }

  // Default to simple mode for new users
  return "simple";
};

/**
 * Save user mode to localStorage
 */
export const saveUserMode = (mode: UserMode): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(MODE_KEY, mode);
  }
};

/**
 * Check if user is in simple mode
 */
export const isSimpleMode = (): boolean => {
  return getUserMode() === "simple";
};

/**
 * Check if user is in advanced mode
 */
export const isAdvancedMode = (): boolean => {
  return getUserMode() === "advanced";
};

/**
 * Get all user settings
 */
export const getUserSettings = (): UserSettings => {
  return {
    timezone: getStoredTimezone(),
    stationCallsign: getStationCallsign(),
    defaultTxPower: getDefaultTxPower(),
    mode: getUserMode(),
  };
};

/**
 * Save all user settings
 */
export const saveUserSettings = (settings: Partial<UserSettings>): void => {
  if (settings.timezone) {
    saveTimezone(settings.timezone.value);
  }
  if (settings.stationCallsign !== undefined) {
    saveStationCallsign(settings.stationCallsign);
  }
  if (settings.defaultTxPower !== undefined) {
    saveDefaultTxPower(settings.defaultTxPower);
  }
  if (settings.mode !== undefined) {
    saveUserMode(settings.mode);
  }
};

/**
 * Get current datetime string in the stored timezone
 * Returns format: YYYY-MM-DDTHH:mm (suitable for datetime-local input)
 */
export const getCurrentDateTimeInTimezone = (): string => {
  const timezone = getStoredTimezone();
  const now = new Date();

  // Apply the timezone offset to current UTC time
  // getTime() already returns UTC milliseconds, so just add the offset
  const targetTime = new Date(now.getTime() + timezone.offset * 60000);

  // Manually format to avoid toISOString() converting back to UTC
  const year = targetTime.getUTCFullYear();
  const month = String(targetTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(targetTime.getUTCDate()).padStart(2, "0");
  const hours = String(targetTime.getUTCHours()).padStart(2, "0");
  const minutes = String(targetTime.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format a date string to the stored timezone
 * @param dateString ISO date string or datetime-local format
 * @returns Formatted datetime string in the stored timezone
 */
export const formatDateTimeInTimezone = (dateString: string): string => {
  if (!dateString) return "";

  try {
    // Append 'Z' to force UTC interpretation if not already present
    const dateStringUTC = dateString.includes('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateStringUTC);
    const timezone = getStoredTimezone();

    // Apply the timezone offset to the date
    // getTime() already returns UTC milliseconds, so just add the offset
    const targetTime = new Date(date.getTime() + timezone.offset * 60000);

    // Manually format to avoid toISOString() converting back to UTC
    const year = targetTime.getUTCFullYear();
    const month = String(targetTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(targetTime.getUTCDate()).padStart(2, "0");
    const hours = String(targetTime.getUTCHours()).padStart(2, "0");
    const minutes = String(targetTime.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

/**
 * Format a date string for display with timezone applied
 * @param dateString ISO date string or datetime-local format
 * @returns Formatted datetime string for display (dd/MM/yyyy HH:mm) in the stored timezone
 */
export const formatDateTimeForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  try {
    // Append 'Z' to force UTC interpretation if not already present
    const dateStringUTC = dateString.includes('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateStringUTC);
    const timezone = getStoredTimezone();

    // Apply the timezone offset to the date
    // getTime() already returns UTC milliseconds, so just add the offset
    const targetTime = new Date(date.getTime() + timezone.offset * 60000);

    // Manually format to avoid toISOString() converting back to UTC
    const year = targetTime.getUTCFullYear();
    const month = String(targetTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(targetTime.getUTCDate()).padStart(2, "0");
    const hours = String(targetTime.getUTCHours()).padStart(2, "0");
    const minutes = String(targetTime.getUTCMinutes()).padStart(2, "0");

    // Return in display format: dd/MM/yyyy HH:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};
