export interface QSORecord {
  id: string;
  datetime: string;
  callsign: string;
  name: string;
  freq: number;
  mode: string;
  txPower: number;
  rstSent: string;
  rstReceived: string;
  qth: string;
  notes: string;
}

export interface FilterState {
  year: string;
  month: string;
  searchTerm: string;
}

export interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Month {
  value: string;
  label: string;
}

export interface QCode {
  code: string;
  description: string;
}

export interface CSVExportData {
  filename: string;
  content: string;
  date: Date;
}

export interface Logbook {
  id: string;
  name: string;
  isDefault: boolean;
  qsoCount: number;
}
