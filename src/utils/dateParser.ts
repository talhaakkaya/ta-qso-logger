/**
 * Smart date/time parser for CSV imports
 * Handles multiple date and time formats from various logging software
 */

/**
 * Parse a date string in various formats to YYYY-MM-DD
 * Supports: DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.
 */
export function parseDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return trimmed.replace(/\//g, '-');
  }

  // Try DD/MM/YYYY or DD-MM-YYYY (European format)
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    const year = ddmmyyyyMatch[3];

    // Check if this looks like DD/MM/YYYY (day > 12 or month <= 12 and reasonable day)
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);

    // If day > 12, it must be DD/MM/YYYY
    if (dayNum > 12) {
      return `${year}-${month}-${day}`;
    }

    // If month > 12, it must be MM/DD/YYYY
    if (monthNum > 12) {
      return `${year}-${day}-${month}`;
    }

    // Ambiguous case (both <= 12) - assume DD/MM/YYYY (European format)
    // This is a common default for amateur radio logging
    return `${year}-${month}-${day}`;
  }

  // Try to parse with native Date object as fallback
  try {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Fall through
  }

  return null;
}

/**
 * Parse a time string in various formats to HH:MM:SS
 * Supports: HH:MM, HH:MM:SS, HH:MM AM/PM, HHMM
 */
export function parseTime(timeStr: string): string | null {
  if (!timeStr || typeof timeStr !== 'string') {
    return null;
  }

  const trimmed = timeStr.trim();
  if (!trimmed) {
    return null;
  }

  // Check for AM/PM format (11:12 PM, 11:12:45 PM)
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const seconds = ampmMatch[3] || '00';
    const meridiem = ampmMatch[4].toUpperCase();

    // Convert to 24-hour format
    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  }

  // Try HH:MM:SS format
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
    const parts = trimmed.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    const seconds = parts[2].padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Try HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const parts = trimmed.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    return `${hours}:${minutes}:00`;
  }

  // Try HHMM format (no separator)
  if (/^\d{3,4}$/.test(trimmed)) {
    const paddedTime = trimmed.padStart(4, '0');
    const hours = paddedTime.substring(0, 2);
    const minutes = paddedTime.substring(2, 4);
    return `${hours}:${minutes}:00`;
  }

  return null;
}

/**
 * Parse a combined datetime string or separate date/time strings
 * Returns ISO format: YYYY-MM-DDTHH:MM:SS
 */
export function parseDateTime(dateStr: string, timeStr?: string): string | null {
  // If we have separate date and time
  if (timeStr) {
    const parsedDate = parseDate(dateStr);
    const parsedTime = parseTime(timeStr);

    if (!parsedDate) {
      throw new Error(`Geçersiz tarih formatı: ${dateStr}`);
    }
    if (!parsedTime) {
      throw new Error(`Geçersiz saat formatı: ${timeStr}`);
    }

    return `${parsedDate}T${parsedTime}`;
  }

  // Combined datetime string - try to split it
  const trimmed = dateStr.trim();

  // Already in ISO format?
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    // Add seconds if missing
    return trimmed.includes(':') && trimmed.split(':').length === 2
      ? `${trimmed}:00`
      : trimmed;
  }

  // Try to split by space or T
  const parts = trimmed.split(/[T\s]+/);
  if (parts.length === 2) {
    return parseDateTime(parts[0], parts[1]);
  }

  // Try parsing as single date (no time)
  const parsedDate = parseDate(trimmed);
  if (parsedDate) {
    return `${parsedDate}T00:00:00`;
  }

  throw new Error(`Geçersiz tarih/saat formatı: ${dateStr}`);
}
