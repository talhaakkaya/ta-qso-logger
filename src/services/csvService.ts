/**
 * CSV Import Service
 * Handles CSV parsing, field mapping, and QSO record creation from CSV data
 */

import { QSORecord } from "@/types";
import { ImportResult } from "@/types/qso.types";
import { parseDateTime } from "@/utils/dateParser";
import apiService from "./apiService";

export interface CSVFieldMapping {
  [csvHeader: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

/**
 * Map CSV headers to QSO field indices for fast lookup
 */
function createFieldToIndexMap(
  headers: string[],
  columnMapping: CSVFieldMapping
): Record<string, number> {
  const fieldToIndex: Record<string, number> = {};

  headers.forEach((header, index) => {
    const field = columnMapping[header];
    if (field && field !== "skip") {
      fieldToIndex[field] = index;
    }
  });

  return fieldToIndex;
}

/**
 * Parse datetime from CSV row using field mapping
 */
function parseCSVDateTime(
  row: string[],
  fieldToIndex: Record<string, number>,
  rowNum: number
): string {
  let datetime = "";

  if (fieldToIndex.datetime !== undefined) {
    // Combined datetime field - parse it
    const datetimeStr = row[fieldToIndex.datetime]?.trim() || "";
    if (!datetimeStr) {
      throw new Error("Tarih/saat eksik");
    }
    datetime = parseDateTime(datetimeStr) || "";
  } else if (fieldToIndex.date !== undefined && fieldToIndex.time !== undefined) {
    // Separate date and time fields - parse and combine them
    const dateStr = row[fieldToIndex.date]?.trim() || "";
    const timeStr = row[fieldToIndex.time]?.trim() || "";

    if (!dateStr || !timeStr) {
      throw new Error("Tarih veya saat eksik");
    }

    datetime = parseDateTime(dateStr, timeStr) || "";
  } else {
    throw new Error("Tarih/saat bilgisi bulunamadı");
  }

  if (!datetime) {
    throw new Error("Tarih/saat ayrıştırılamadı");
  }

  return datetime;
}

/**
 * Extract callsign from CSV row
 */
function parseCSVCallsign(
  row: string[],
  fieldToIndex: Record<string, number>
): string {
  return fieldToIndex.callsign !== undefined
    ? row[fieldToIndex.callsign]?.trim() || ""
    : "";
}

/**
 * Parse optional QSO fields from CSV row
 */
function parseOptionalFields(
  row: string[],
  fieldToIndex: Record<string, number>
): Partial<QSORecord> {
  const optionalData: Partial<QSORecord> = {};

  if (fieldToIndex.name !== undefined) {
    optionalData.name = row[fieldToIndex.name]?.trim() || "";
  }

  if (fieldToIndex.freq !== undefined) {
    const freqStr = row[fieldToIndex.freq]?.trim();
    if (freqStr) {
      optionalData.freq = parseFloat(freqStr);
    }
  }

  if (fieldToIndex.mode !== undefined) {
    optionalData.mode = row[fieldToIndex.mode]?.trim() || "";
  }

  if (fieldToIndex.txPower !== undefined) {
    const powerStr = row[fieldToIndex.txPower]?.trim();
    if (powerStr) {
      optionalData.txPower = parseFloat(powerStr);
    }
  }

  if (fieldToIndex.rstSent !== undefined) {
    optionalData.rstSent = row[fieldToIndex.rstSent]?.trim() || "";
  }

  if (fieldToIndex.rstReceived !== undefined) {
    optionalData.rstReceived = row[fieldToIndex.rstReceived]?.trim() || "";
  }

  if (fieldToIndex.qth !== undefined) {
    optionalData.qth = row[fieldToIndex.qth]?.trim() || "";
  }

  if (fieldToIndex.notes !== undefined) {
    optionalData.notes = row[fieldToIndex.notes]?.trim() || "";
  }

  return optionalData;
}

/**
 * Process a single CSV row and create QSO record
 */
async function processCSVRow(
  row: string[],
  rowNum: number,
  fieldToIndex: Record<string, number>
): Promise<QSORecord> {
  // Build QSO record from row
  const qsoData: Partial<QSORecord> = {};

  // Required field: callsign
  const callsign = parseCSVCallsign(row, fieldToIndex);
  if (!callsign) {
    throw new Error("Çağrı işareti eksik");
  }

  // Required field: datetime
  const datetime = parseCSVDateTime(row, fieldToIndex, rowNum);

  // Combine required fields
  qsoData.callsign = callsign;
  qsoData.datetime = datetime;

  // Parse optional fields
  const optionalFields = parseOptionalFields(row, fieldToIndex);
  Object.assign(qsoData, optionalFields);

  // Create the record via API
  const savedRecord = await apiService.createQSORecord(qsoData as Omit<QSORecord, "id">);
  return savedRecord;
}

/**
 * Import QSO records from parsed CSV data with column mapping
 */
export async function importCSVRecords(
  parsedData: ParsedCSV,
  columnMapping: CSVFieldMapping
): Promise<ImportResult> {
  const importedRecords: QSORecord[] = [];
  const errorMessages: string[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Create field mapping
  const fieldToIndex = createFieldToIndexMap(parsedData.headers, columnMapping);

  // Process each row
  for (let i = 0; i < parsedData.rows.length; i++) {
    const row = parsedData.rows[i];
    const rowNum = i + 2; // +2 because header is row 1, and array is 0-indexed

    try {
      const savedRecord = await processCSVRow(row, rowNum, fieldToIndex);
      importedRecords.push(savedRecord);
      successCount++;
    } catch (error) {
      console.error(`Error importing row ${rowNum}:`, error);
      errorMessages.push(`Satır ${rowNum}: ${(error as Error).message}`);
      errorCount++;
    }
  }

  return {
    success: successCount > 0,
    imported: successCount,
    errors: errorCount,
    errorMessages: errorMessages.slice(0, 10), // Limit to 10 error messages
    records: importedRecords,
  };
}

/**
 * Validate CSV column mapping
 * Returns true if mapping has required fields
 */
export function validateCSVMapping(columnMapping: CSVFieldMapping): {
  valid: boolean;
  message?: string;
} {
  const mappedFields = Object.values(columnMapping);

  // Check for callsign
  if (!mappedFields.includes("callsign")) {
    return {
      valid: false,
      message: "Lütfen Çağrı İşareti alanını eşleştirin",
    };
  }

  // Check if either datetime OR (date AND time) are mapped
  const hasDatetime = mappedFields.includes("datetime");
  const hasDate = mappedFields.includes("date");
  const hasTime = mappedFields.includes("time");

  if (!hasDatetime && !(hasDate && hasTime)) {
    return {
      valid: false,
      message: "Lütfen Tarih/Saat (birleşik) veya Tarih ve Saat alanlarını eşleştirin",
    };
  }

  return { valid: true };
}

export default {
  importCSVRecords,
  validateCSVMapping,
};
