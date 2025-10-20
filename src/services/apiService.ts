import { QSORecord } from "@/types";
import { ImportResult } from "@/types/qso.types";

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
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // QSO Records API
  async getQSORecords(): Promise<QSORecord[]> {
    return await this.request<QSORecord[]>("/qso");
  }

  async createQSORecord(record: Omit<QSORecord, "id">): Promise<QSORecord> {
    return await this.request<QSORecord>("/qso", {
      method: "POST",
      body: JSON.stringify(record),
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

  // Export API

  async exportQSORecords(): Promise<Blob> {
    const response = await fetch("/api/qso/export", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Import API

  async importQSORecords(file: File): Promise<ImportResult & { records: QSORecord[] }> {
    const formData = new FormData();
    formData.append("file", file);

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
}

const apiService = new ApiService();
export default apiService;
