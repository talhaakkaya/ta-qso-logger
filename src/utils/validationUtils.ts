import { QSORecord } from "@/types";
import { QSOValidationError } from "@/types/qso.types";
import { toCallsignCase } from "./stringUtils";

export const validateCallsign = (callsign: string): boolean => {
  // Basic callsign validation - can be enhanced with regex
  return callsign.length >= 3 && callsign.length <= 10;
};

export const validateQSORecord = (
  record: Partial<QSORecord>,
  t?: (key: string) => string,
): QSOValidationError[] => {
  const errors: QSOValidationError[] = [];

  // Fallback to English if no translation function provided
  const getMessage = (key: string, fallback: string) => t ? t(key) : fallback;

  if (!record.datetime) {
    errors.push({
      field: "datetime",
      message: getMessage("validation.required.dateAndTime", "Date and time are required")
    });
  }

  if (!record.callsign) {
    errors.push({
      field: "callsign",
      message: getMessage("validation.required.callsign", "Callsign is required")
    });
  } else if (!validateCallsign(record.callsign)) {
    errors.push({
      field: "callsign",
      message: getMessage("validation.invalid.callsign", "Invalid callsign")
    });
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
  return toCallsignCase(str);
};
