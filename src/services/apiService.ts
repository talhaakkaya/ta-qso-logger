import { QSORecord } from "@/types";
import { ImportResult } from "@/types/qso.types";
import { QRZLookupResult } from "@/types/qrz.types";

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.error || `API request failed: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  // QSO Records API
  async getQSORecords(logbookId?: string): Promise<QSORecord[]> {
    const url = logbookId ? `/qso?logbookId=${logbookId}` : "/qso";
    return await this.request<QSORecord[]>(url);
  }

  async createQSORecord(record: Omit<QSORecord, "id">, logbookId?: string): Promise<QSORecord> {
    const data = logbookId ? { ...record, logbookId } : record;
    return await this.request<QSORecord>("/qso", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateQSORecord(
    id: string,
    updates: Partial<QSORecord>,
  ): Promise<QSORecord> {
    return await this.request<QSORecord>(`/qso/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteQSORecord(id: string): Promise<void> {
    await this.request(`/qso/${id}`, {
      method: "DELETE",
    });
  }

  async deleteAllQSORecords(logbookId?: string): Promise<number> {
    const url = logbookId
      ? `/qso/delete-all?logbookId=${logbookId}`
      : "/qso/delete-all";
    return await this.request<number>(url, {
      method: "DELETE",
    });
  }

  // Export API

  async exportQSORecords(logbookId?: string): Promise<Blob> {
    const url = logbookId
      ? `/api/qso/export?logbookId=${logbookId}`
      : "/api/qso/export";

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Import API

  async importQSORecords(file: File, logbookId?: string): Promise<ImportResult & { records: QSORecord[] }> {
    const formData = new FormData();
    formData.append("file", file);
    if (logbookId) {
      formData.append("logbookId", logbookId);
    }

    const response = await fetch("/api/qso/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Import failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // QRZ API

  async checkQRZConfig(): Promise<{ enabled: boolean }> {
    return await this.request<{ enabled: boolean }>(`/qrz/config`);
  }

  async lookupCallsign(callsign: string): Promise<QRZLookupResult> {
    return await this.request<QRZLookupResult>(`/qrz/${callsign}`);
  }

  // Logbook API

  async getLogbooks(): Promise<any[]> {
    return await this.request<any[]>("/logbooks");
  }

  async createLogbook(name: string): Promise<any> {
    return await this.request<any>("/logbooks", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  // Profile API

  async getProfile(): Promise<any> {
    return await this.request<any>("/profile");
  }

  async updateProfile(updates: {
    callsign?: string;
    name?: string;
    gridSquare?: string;
  }): Promise<any> {
    return await this.request<any>("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }
}

const apiService = new ApiService();
export default apiService;
