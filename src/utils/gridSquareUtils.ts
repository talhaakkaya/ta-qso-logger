/**
 * Maidenhead Grid Square (Locator) System utilities
 * Converts geographic coordinates to grid square format
 * Format: 2 letters + 2 digits + 2 letters + 2 digits + 2 letters (up to 10 chars, e.g., JO01aa00aa)
 */

/**
 * Convert latitude and longitude coordinates to Maidenhead grid square
 * @param lat Latitude in decimal degrees (-90 to +90)
 * @param lon Longitude in decimal degrees (-180 to +180)
 * @param precision Number of characters (4, 6, 8, or 10)
 * @returns Grid square locator (e.g., "JO01", "JO01AA", "JO01AA00", "JO01AA00AA")
 */
export function coordinatesToGridSquare(lat: number, lon: number, precision: number = 6): string {
  // Validate input ranges
  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and +90 degrees");
  }
  if (lon < -180 || lon > 180) {
    throw new Error("Longitude must be between -180 and +180 degrees");
  }
  if (![4, 6, 8, 10].includes(precision)) {
    throw new Error("Precision must be 4, 6, 8, or 10 characters");
  }

  // Normalize coordinates to positive values
  // Longitude: -180° to +180° becomes 0° to 360°
  // Latitude: -90° to +90° becomes 0° to 180°
  const adjustedLon = lon + 180;
  const adjustedLat = lat + 90;

  // Field (2 letters): A-R
  // Longitude: 18 fields of 20° each
  // Latitude: 18 fields of 10° each
  const fieldLon = String.fromCharCode(65 + Math.floor(adjustedLon / 20));
  const fieldLat = String.fromCharCode(65 + Math.floor(adjustedLat / 10));

  // Square (2 digits): 0-9
  // Longitude: 10 squares of 2° each within a field
  // Latitude: 10 squares of 1° each within a field
  const squareLon = Math.floor((adjustedLon % 20) / 2);
  const squareLat = Math.floor((adjustedLat % 10) / 1);

  let gridSquare = `${fieldLon}${fieldLat}${squareLon}${squareLat}`;

  if (precision === 4) {
    return gridSquare.toUpperCase();
  }

  // Subsquare (2 letters): a-x
  // Longitude: 24 subsquares of 5' (5 arc minutes) each within a square
  // Latitude: 24 subsquares of 2.5' (2.5 arc minutes) each within a square
  const subsquareLonMinutes = (adjustedLon % 2) * 60; // Convert to arc minutes
  const subsquareLatMinutes = (adjustedLat % 1) * 60; // Convert to arc minutes

  const subsquareLon = String.fromCharCode(97 + Math.floor(subsquareLonMinutes / 5));
  const subsquareLat = String.fromCharCode(97 + Math.floor(subsquareLatMinutes / 2.5));

  gridSquare += `${subsquareLon}${subsquareLat}`;

  if (precision === 6) {
    return gridSquare.toUpperCase();
  }

  // Extended square (2 digits): 0-9
  // Longitude: 10 squares of 0.5' (30 arc seconds) each
  // Latitude: 10 squares of 0.25' (15 arc seconds) each
  const extSquareLonSeconds = (subsquareLonMinutes % 5) * 60; // Convert to arc seconds
  const extSquareLatSeconds = (subsquareLatMinutes % 2.5) * 60;

  const extSquareLon = Math.floor(extSquareLonSeconds / 30);
  const extSquareLat = Math.floor(extSquareLatSeconds / 15);

  gridSquare += `${extSquareLon}${extSquareLat}`;

  if (precision === 8) {
    return gridSquare.toUpperCase();
  }

  // Extended subsquare (2 letters): a-x
  // Longitude: 24 subsquares of 1.25" each
  // Latitude: 24 subsquares of 0.625" each
  const extSubsquareLon = String.fromCharCode(97 + Math.floor((extSquareLonSeconds % 30) / 1.25));
  const extSubsquareLat = String.fromCharCode(97 + Math.floor((extSquareLatSeconds % 15) / 0.625));

  gridSquare += `${extSubsquareLon}${extSubsquareLat}`;

  return gridSquare.toUpperCase();
}

/**
 * Validate if a string is a valid Maidenhead grid square format
 * @param gridSquare String to validate
 * @returns true if valid format, false otherwise
 */
export function isValidGridSquare(gridSquare: string): boolean {
  // Grid square can be 4, 6, 8, or 10 characters
  // Format: AA00, AA00aa, AA00aa00, AA00aa00aa (case insensitive)
  const pattern = /^[A-R]{2}[0-9]{2}([a-x]{2}([0-9]{2}([a-x]{2})?)?)?$/i;
  return pattern.test(gridSquare);
}

/**
 * Convert grid square back to approximate center coordinates
 * Useful for displaying location on a map
 * @param gridSquare 4, 6, 8, or 10 character grid square
 * @returns Object with lat/lon of the grid square center
 */
export function gridSquareToCoordinates(gridSquare: string): { lat: number; lon: number } | null {
  if (!isValidGridSquare(gridSquare)) {
    return null;
  }

  const upper = gridSquare.toUpperCase();

  // Extract field (2 letters)
  const fieldLon = upper.charCodeAt(0) - 65; // A=0, R=17
  const fieldLat = upper.charCodeAt(1) - 65;

  // Extract square (2 digits)
  const squareLon = parseInt(upper.charAt(2), 10);
  const squareLat = parseInt(upper.charAt(3), 10);

  // Calculate base position
  let lon = fieldLon * 20 + squareLon * 2 - 180;
  let lat = fieldLat * 10 + squareLat * 1 - 90;

  if (upper.length === 4) {
    // For 4-character format, return center of square
    lon += 1; // Center of 2° square
    lat += 0.5; // Center of 1° square
  } else if (upper.length >= 6) {
    // Extract subsquare (2 letters)
    const subsquareLon = upper.charCodeAt(4) - 65; // A=0, X=23
    const subsquareLat = upper.charCodeAt(5) - 65;

    lon += (subsquareLon * 5) / 60; // 5 arc minutes
    lat += (subsquareLat * 2.5) / 60; // 2.5 arc minutes

    if (upper.length === 6) {
      // Add center offset for subsquare
      lon += 2.5 / 60; // Center of 5 arc minute subsquare
      lat += 1.25 / 60; // Center of 2.5 arc minute subsquare
    } else if (upper.length >= 8) {
      // Extract extended square (2 digits)
      const extSquareLon = parseInt(upper.charAt(6), 10);
      const extSquareLat = parseInt(upper.charAt(7), 10);

      lon += (extSquareLon * 30) / 3600; // 30 arc seconds
      lat += (extSquareLat * 15) / 3600; // 15 arc seconds

      if (upper.length === 8) {
        // Add center offset for extended square
        lon += 15 / 3600; // Center of 30 arc second square
        lat += 7.5 / 3600; // Center of 15 arc second square
      } else if (upper.length === 10) {
        // Extract extended subsquare (2 letters)
        const extSubsquareLon = upper.charCodeAt(8) - 65;
        const extSubsquareLat = upper.charCodeAt(9) - 65;

        lon += (extSubsquareLon * 1.25) / 3600; // 1.25 arc seconds
        lat += (extSubsquareLat * 0.625) / 3600; // 0.625 arc seconds

        // Add center offset for extended subsquare
        lon += 0.625 / 3600; // Center of 1.25 arc second subsquare
        lat += 0.3125 / 3600; // Center of 0.625 arc second subsquare
      }
    }
  }

  return { lat, lon };
}
