/**
 * Location Service
 * Handles geolocation lookups using OpenStreetMap Nominatim API
 */

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

/**
 * Search for a location using Nominatim API
 * @param query - Location search query (e.g., "Istanbul, Turkey")
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of location results
 */
export async function searchLocation(
  query: string,
  limit: number = 10
): Promise<NominatimResult[]> {
  if (!query || !query.trim()) {
    throw new Error("Arama sorgusu boş olamaz");
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.append("q", query.trim());
  url.searchParams.append("format", "json");
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "QSO Logger/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Konum araması başarısız oldu");
  }

  const results: NominatimResult[] = await response.json();
  return results;
}

/**
 * Convert Nominatim result to coordinates
 */
export function getCoordinatesFromResult(result: NominatimResult): {
  lat: number;
  lon: number;
} {
  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
  };
}

const locationService = {
  searchLocation,
  getCoordinatesFromResult,
};

export default locationService;
