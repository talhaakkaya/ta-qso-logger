import { QSORecord } from "@/types";
import { QSOValidationError } from "@/types/qso.types";

export const validateCallsign = (callsign: string): boolean => {
  // Basic callsign validation - can be enhanced with regex
  return callsign.length >= 3 && callsign.length <= 10;
};

export const validateQSORecord = (
  record: Partial<QSORecord>,
): QSOValidationError[] => {
  const errors: QSOValidationError[] = [];

  if (!record.datetime) {
    errors.push({ field: "datetime", message: "Tarih ve saat gereklidir" });
  }

  if (!record.callsign) {
    errors.push({ field: "callsign", message: "Çağrı işareti gereklidir" });
  } else if (!validateCallsign(record.callsign)) {
    errors.push({ field: "callsign", message: "Geçersiz çağrı işareti" });
  }

  return errors;
};

export const sanitizeInput = (str: string): string => {
  if (typeof str !== "string") return "";

  return str.replace(/[<>&"']/g, (match) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#x27;",
    };
    return map[match];
  });
};

export const toUpperCase = (str: string): string => {
  return str.toUpperCase();
};
