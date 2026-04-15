/**
 * Geocode a location string using OpenStreetMap Nominatim.
 * Free, no API key, rate limited to 1 req/s per Nominatim usage policy.
 */

let lastRequestTime = 0;

export async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Enforce 1 request/second rate limit (Nominatim policy)
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < 1100) {
      await new Promise((r) => setTimeout(r, 1100 - elapsed));
    }
    lastRequestTime = Date.now();

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
