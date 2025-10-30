// Extended QSO types for complex operations

export interface QSOFormData extends Omit<QSORecord, "id"> {
  isNew?: boolean;
}

export interface QSOTableColumn {
  key: keyof QSORecord | "actions";
  label: string;
  sortable?: boolean;
  editable?: boolean;
  width?: string;
}

export interface QSOValidationError {
  field: keyof QSORecord;
  message: string;
}

export interface QSOStatistics {
  total: number;
  byMode: Record<string, number>;
  byYear: Record<string, number>;
  byMonth: Record<string, number>;
  lastBackup?: Date;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors?: number;
  skipped?: number;
  failed?: number;
  errorMessages?: string[];
  records?: QSORecord[];
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: keyof QSORecord;
  direction: SortDirection;
}

import { QSORecord } from "./index";
