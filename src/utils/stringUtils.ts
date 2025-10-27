/**
 * String Utilities
 * Centralized string manipulation functions to ensure consistency
 * and eliminate duplication across the codebase
 */

/**
 * Converts a string to uppercase using ASCII/English locale rules
 * This prevents Turkish locale issues where 'i' → 'İ' instead of 'I'
 * Use this for callsigns, grid squares, and other radio-related identifiers
 *
 * @param str - String to convert to uppercase
 * @returns Uppercased string using en-US locale
 *
 * @example
 * toCallsignCase("ta1val") // "TA1VAL"
 * toCallsignCase("info")   // "INFO" (not "İNFO" in Turkish locale)
 */
export function toCallsignCase(str: string): string {
  if (typeof str !== "string") return "";
  return str.toLocaleUpperCase("en-US");
}

/**
 * Formats a number with locale-specific formatting
 * Defaults to Turkish locale for consistency with the app's primary audience
 *
 * @param num - Number to format
 * @param locale - Locale string (default: "tr-TR")
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567)           // "1.234.567" (Turkish)
 * formatNumber(1234567, "en-US")  // "1,234,567" (English)
 */
export function formatNumber(num: number, locale: string = "tr-TR"): string {
  if (typeof num !== "number" || isNaN(num)) return "0";
  return num.toLocaleString(locale);
}
