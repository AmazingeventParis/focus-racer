/**
 * Geocode a location string using OpenStreetMap Nominatim.
 * Free, no API key, rate limited to 1 req/s.
 */
export async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=fr`,
      {
        headers: { "User-Agent": "FocusRacer/1.0 (contact@focusracer.com)" },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lng),
      };
    }
    return null;
  } catch {
    return null;
  }
}
