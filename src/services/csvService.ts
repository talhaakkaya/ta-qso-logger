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
      throw new Error("dateTimeRequired");
    }
    datetime = parseDateTime(datetimeStr) || "";
  } else if (fieldToIndex.date !== undefined && fieldToIndex.time !== undefined) {
    // Separate date and time fields - parse and combine them
    const dateStr = row[fieldToIndex.date]?.trim() || "";
    const timeStr = row[fieldToIndex.time]?.trim() || "";

    if (!dateStr || !timeStr) {
      throw new Error("dateOrTimeRequired");
    }

    datetime = parseDateTime(dateStr, timeStr) || "";
  } else {
    throw new Error("dateTimeNotFound");
  }

  if (!datetime) {
    throw new Error("dateTimeParseError");
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
  fieldToIndex: Record<string, number>,
  logbookId?: string
): Promise<QSORecord> {
  // Build QSO record from row
  const qsoData: Partial<QSORecord> = {};

  // Required field: callsign
  const callsign = parseCSVCallsign(row, fieldToIndex);
  if (!callsign) {
    throw new Error("callsignRequired");
  }

  // Required field: datetime
  const datetime = parseCSVDateTime(row, fieldToIndex, rowNum);

  // Combine required fields
  qsoData.callsign = callsign;
  qsoData.datetime = datetime;

  // Parse optional fields
  const optionalFields = parseOptionalFields(row, fieldToIndex);
  Object.assign(qsoData, optionalFields);

  // Create the record via API with logbookId
  const savedRecord = await apiService.createQSORecord(qsoData as Omit<QSORecord, "id">, logbookId);
  return savedRecord;
}

/**
 * Check if a QSO record is a duplicate
 * Compares: callsign (case-insensitive) + datetime (ISO) + frequency
 */
function isDuplicateRecord(
  record: Partial<QSORecord>,
  existingRecords: QSORecord[]
): boolean {
  return existingRecords.some((existing) => {
    // Convert both datetimes to ISO strings for comparison
    const existingDate = new Date(existing.datetime).toISOString();
    const recordDate = record.datetime ? new Date(record.datetime).toISOString() : "";

    // Compare case-insensitively for callsign
    const existingFreq = existing.freq || 0;
    const recordFreq = record.freq || 0;

    return (
      existingDate === recordDate &&
      existing.callsign.toUpperCase() === (record.callsign?.toUpperCase() || "") &&
      existingFreq === recordFreq
    );
  });
}

/**
 * Import QSO records from parsed CSV data with column mapping
 */
export async function importCSVRecords(
  parsedData: ParsedCSV,
  columnMapping: CSVFieldMapping,
  existingRecords: QSORecord[] = [],
  logbookId?: string
): Promise<ImportResult> {
  const importedRecords: QSORecord[] = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  // Create field mapping
  const fieldToIndex = createFieldToIndexMap(parsedData.headers, columnMapping);

  // Process each row
  for (let i = 0; i < parsedData.rows.length; i++) {
    const row = parsedData.rows[i];
    const rowNum = i + 2; // +2 because header is row 1, and array is 0-indexed

    try {
      // Parse row data first to check for duplicates
      const qsoData: Partial<QSORecord> = {};

      // Required field: callsign
      const callsign = parseCSVCallsign(row, fieldToIndex);
      if (!callsign) {
        throw new Error("callsignRequired");
      }

      // Required field: datetime
      const datetime = parseCSVDateTime(row, fieldToIndex, rowNum);

      // Combine required fields
      qsoData.callsign = callsign;
      qsoData.datetime = datetime;

      // Parse optional fields
      const optionalFields = parseOptionalFields(row, fieldToIndex);
      Object.assign(qsoData, optionalFields);

      // Check for duplicates
      if (isDuplicateRecord(qsoData, existingRecords)) {
        skippedCount++;
        continue;
      }

      // Create the record via API with logbookId
      const savedRecord = await apiService.createQSORecord(
        qsoData as Omit<QSORecord, "id">,
        logbookId
      );
      importedRecords.push(savedRecord);
      // Add to existing records to prevent duplicates within the same import
      existingRecords.push(savedRecord);
      successCount++;
    } catch (error) {
      console.error(`Error importing row ${rowNum}:`, error);
      // Just count the failure, like ADIF import does
      failedCount++;
    }
  }

  return {
    success: successCount > 0,
    imported: successCount,
    failed: failedCount,
    skipped: skippedCount,
    records: importedRecords,
  };
}

/**
 * Validate CSV column mapping
 * Returns true if mapping has required fields
 */
export function validateCSVMapping(columnMapping: CSVFieldMapping): {
  valid: boolean;
  errorCode?: string;
} {
  const mappedFields = Object.values(columnMapping);

  // Check for callsign
  if (!mappedFields.includes("callsign")) {
    return {
      valid: false,
      errorCode: "CALLSIGN_REQUIRED",
    };
  }

  // Check if either datetime OR (date AND time) are mapped
  const hasDatetime = mappedFields.includes("datetime");
  const hasDate = mappedFields.includes("date");
  const hasTime = mappedFields.includes("time");

  if (!hasDatetime && !(hasDate && hasTime)) {
    return {
      valid: false,
      errorCode: "DATETIME_REQUIRED",
    };
  }

  return { valid: true };
}

const csvService = {
  importCSVRecords,
  validateCSVMapping,
};

export default csvService;
