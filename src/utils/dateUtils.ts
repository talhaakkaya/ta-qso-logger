import { format, isValid } from "date-fns";

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "";
  return format(d, "HH:mm");
};

export const formatDateForCSV = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const parseCSVDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
};

export const getWeekdayName = (date: Date): string => {
  const days = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];
  return days[date.getDay()];
};

export const getDaysSince = (date: Date): number => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getCurrentDateTime = (): { date: string; time: string } => {
  const now = new Date();
  return {
    date: formatDate(now),
    time: formatTime(now),
  };
};

export const getCurrentDateTimeString = (): string => {
  const now = new Date();
  // Use UTC time instead of local time
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateTimeForInput = (datetime: string | Date): string => {
  if (!datetime) return "";

  // Force UTC interpretation by adding 'Z' if missing
  let date: Date;
  if (typeof datetime === "string") {
    const dateStringUTC = datetime.includes('Z') ? datetime : datetime + 'Z';
    date = new Date(dateStringUTC);
  } else {
    date = datetime;
  }

  if (!isValid(date)) return "";

  // Use UTC methods to format in UTC time
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateTimeForCSV = (datetime: string): string => {
  if (!datetime) return "";
  const date = new Date(datetime);
  if (!isValid(date)) return datetime;
  return format(date, "dd/MM/yyyy HH:mm");
};

export const parseCSVDateTime = (datetimeStr: string): string => {
  if (!datetimeStr) return "";
  try {
    // Handle format like "23/08/2025 14:30"
    const [datePart, timePart] = datetimeStr.split(" ");
    if (datePart && timePart) {
      const [day, month, year] = datePart.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}`;
    }
  } catch (error) {
    console.warn("Failed to parse datetime:", datetimeStr);
  }
  return datetimeStr;
};

export const generateCSVFilename = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const weekday = getWeekdayName(now);
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  return `QSO-Log-${dd}-${mm}-${yyyy}-${weekday}-${hh}${min}.csv`;
};
