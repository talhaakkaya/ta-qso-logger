import { QSORecord } from "@/types";
import { ImportResult } from "@/types/qso.types";
import { validateQSORecord } from "@/utils/validationUtils";

// Intermediate interface for parsing ADIF data
interface ParsedADIFData extends Partial<QSORecord> {
  qsoDate?: string;
  timeOn?: string;
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date for ADIF (YYYYMMDD)
 */
const formatADIFDate = (datetime: string): string => {
  try {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  } catch {
    return "";
  }
};

/**
 * Format time for ADIF (HHMMSS)
 */
const formatADIFTime = (datetime: string): string => {
  try {
    const date = new Date(datetime);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}${minutes}${seconds}`;
  } catch {
    return "";
  }
};

/**
 * Parse ADIF date and time to ISO datetime string
 */
const parseADIFDateTime = (date: string, time: string): string => {
  try {
    // Date format: YYYYMMDD
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    // Time format: HHMMSS or HHMM
    let hours = "00";
    let minutes = "00";
    let seconds = "00";

    if (time.length >= 4) {
      hours = time.substring(0, 2);
      minutes = time.substring(2, 4);
      if (time.length >= 6) {
        seconds = time.substring(4, 6);
      }
    }

    // Return ISO format datetime string
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } catch {
    return "";
  }
};

/**
 * Create an ADIF field string
 */
const createADIFField = (fieldName: string, value: string | number): string => {
  if (value === null || value === undefined || value === "" || value === 0) {
    return "";
  }

  const stringValue = String(value);
  const length = stringValue.length;

  return `<${fieldName}:${length}>${stringValue}`;
};

/**
 * Parse ADIF field format: <FIELD:LENGTH>VALUE
 */
const parseADIFField = (
  input: string,
): { fieldName: string; value: string; remaining: string } | null => {
  const fieldMatch = input.match(/^<([^:>]+):(\d+)(?::[^>]*)?>([\s\S]*)$/);

  if (!fieldMatch) {
    return null;
  }

  const fieldName = fieldMatch[1].toUpperCase();
  const length = parseInt(fieldMatch[2], 10);
  const afterField = fieldMatch[3];

  const value = afterField.substring(0, length);
  const remaining = afterField.substring(length);

  return { fieldName, value, remaining };
};

class ADIFService {
  /**
   * Export QSO records to ADIF format
   */
  exportToADIF(records: QSORecord[], logbookName?: string, stationCallsign?: string): { filename: string; blob: Blob } {
    const now = new Date();
    const createdDate = now.toISOString().split("T")[0];

    // Build ADIF header
    let adif = "ADIF Export from QSO Logger\n";
    adif += createADIFField("ADIF_VER", "3.1.4") + "\n";
    adif += createADIFField("PROGRAMID", "QSO Logger") + "\n";
    adif += createADIFField("PROGRAMVERSION", "1.0.0") + "\n";
    adif += createADIFField("CREATED_TIMESTAMP", now.toISOString()) + "\n";

    if (stationCallsign) {
      adif += createADIFField("STATION_CALLSIGN", stationCallsign) + "\n";
    }

    adif += "<EOH>\n\n";

    // Add each QSO record
    records.forEach((record) => {
      const qsoDate = formatADIFDate(record.datetime);
      const qsoTime = formatADIFTime(record.datetime);

      if (record.callsign) {
        adif += createADIFField("CALL", record.callsign);
      }
      if (qsoDate) {
        adif += createADIFField("QSO_DATE", qsoDate);
      }
      if (qsoTime) {
        adif += createADIFField("TIME_ON", qsoTime);
      }
      if (record.freq) {
        adif += createADIFField("FREQ", record.freq.toFixed(6));
      }
      if (record.mode) {
        adif += createADIFField("MODE", record.mode);
      }
      if (record.txPower) {
        adif += createADIFField("TX_PWR", record.txPower);
      }
      if (record.rstSent) {
        adif += createADIFField("RST_SENT", record.rstSent);
      }
      if (record.rstReceived) {
        adif += createADIFField("RST_RCVD", record.rstReceived);
      }
      if (record.name) {
        adif += createADIFField("NAME", record.name);
      }
      if (record.qth) {
        adif += createADIFField("GRIDSQUARE", record.qth);
      }
      if (record.notes) {
        adif += createADIFField("COMMENT", record.notes);
      }

      adif += "<EOR>\n\n";
    });

    const blob = new Blob([adif], { type: "text/plain;charset=utf-8" });

    // Include logbook name in filename
    const sanitizedLogbookName = (logbookName || 'QSO')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `qso-export-${sanitizedLogbookName}-${dateStr}.adi`;

    return { filename, blob };
  }

  /**
   * Import QSO records from ADIF file
   */
  async importFromADIF(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const importedRecords: QSORecord[] = [];
      const errorMessages: string[] = [];
      let errors = 0;

      // Remove header (everything before <EOH>)
      const eohIndex = text.indexOf("<EOH>");
      const dataSection = eohIndex >= 0 ? text.substring(eohIndex + 5) : text;

      // Split by <EOR> to get individual records
      const recordStrings = dataSection.split(/<EOR>/i).filter((r) => r.trim());

      recordStrings.forEach((recordString, index) => {
        try {
          const qsoData: ParsedADIFData = {};
          let remaining = recordString.trim();

          // Parse all fields in this record
          while (remaining.length > 0) {
            // Skip whitespace
            remaining = remaining.trim();

            if (remaining.startsWith("<")) {
              const parsed = parseADIFField(remaining);

              if (!parsed) {
                // Could not parse field, skip to next <
                const nextFieldIndex = remaining.indexOf("<", 1);
                if (nextFieldIndex > 0) {
                  remaining = remaining.substring(nextFieldIndex);
                } else {
                  break;
                }
                continue;
              }

              const { fieldName, value, remaining: newRemaining } = parsed;

              // Map ADIF fields to QSORecord fields
              switch (fieldName) {
                case "CALL":
                  qsoData.callsign = value;
                  break;
                case "QSO_DATE":
                  qsoData.qsoDate = value;
                  break;
                case "TIME_ON":
                  qsoData.timeOn = value;
                  break;
                case "FREQ":
                  qsoData.freq = parseFloat(value) || 0;
                  break;
                case "MODE":
                  qsoData.mode = value;
                  break;
                case "TX_PWR":
                  qsoData.txPower = parseFloat(value) || 0;
                  break;
                case "RST_SENT":
                  qsoData.rstSent = value;
                  break;
                case "RST_RCVD":
                  qsoData.rstReceived = value;
                  break;
                case "NAME":
                  qsoData.name = value;
                  break;
                case "GRIDSQUARE":
                  qsoData.qth = value;
                  break;
                case "COMMENT":
                  qsoData.notes = value;
                  break;
              }

              remaining = newRemaining;
            } else {
              // No more fields
              break;
            }
          }

          // Validate required fields
          if (!qsoData.callsign) {
            errors++;
            errorMessages.push(`Record ${index + 1}: Callsign missing`);
            return;
          }

          if (!qsoData.qsoDate) {
            errors++;
            errorMessages.push(`Record ${index + 1}: Date missing`);
            return;
          }

          // Combine date and time
          const datetime = parseADIFDateTime(
            qsoData.qsoDate || "",
            qsoData.timeOn || "0000",
          );

          const record: QSORecord = {
            id: generateId(),
            datetime,
            callsign: qsoData.callsign || "",
            name: qsoData.name || "",
            freq: qsoData.freq || 0,
            mode: qsoData.mode || "",
            txPower: qsoData.txPower || 0,
            rstSent: qsoData.rstSent || "",
            rstReceived: qsoData.rstReceived || "",
            qth: qsoData.qth || "",
            notes: qsoData.notes || "",
          };

          const validationErrors = validateQSORecord(record);
          if (validationErrors.length > 0) {
            errors++;
            errorMessages.push(
              `Record ${index + 1}: ${validationErrors.map((e) => e.message).join(", ")}`,
            );
            return;
          }

          importedRecords.push(record);
        } catch (error) {
          errors++;
          errorMessages.push(`Record ${index + 1}: Processing error`);
        }
      });

      return {
        success: importedRecords.length > 0,
        imported: importedRecords.length,
        errors,
        errorMessages: errorMessages.slice(0, 5), // Show max 5 error messages
        records: importedRecords,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: 1,
        errorMessages: [`Failed to read ADIF file: ${(error as Error).message}`],
        records: [],
      };
    }
  }

  /**
   * Generate ADIF content as string
   */
  generateADIFContent(records: QSORecord[]): string {
    const { blob } = this.exportToADIF(records);
    // This is a synchronous operation but keeping async signature for consistency
    return URL.createObjectURL(blob);
  }

  /**
   * Download ADIF file
   */
  downloadADIF(records: QSORecord[], logbookName?: string, stationCallsign?: string): void {
    const { filename, blob } = this.exportToADIF(records, logbookName, stationCallsign);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

const adifService = new ADIFService();
export default adifService;
