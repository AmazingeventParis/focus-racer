/**
 * Pure helper: given a list of photos (each with eventId and bibNumbers),
 * return a Map from "${eventId}::${bibNumber}" to the count of photos
 * that contain that bib for that event.
 *
 * Used by the photo-alerts GET handler to compute per-alert counts in one
 * JS pass over a single batched Prisma result (replaces N photo.count queries).
 */

export type AlertCountPhoto = {
  eventId: string;
  bibNumbers: Array<{ number: string }>;
};

export type AlertDescriptor = {
  eventId: string;
  bibNumber: string;
};

export function buildAlertCounts(
  photos: AlertCountPhoto[],
  alerts: AlertDescriptor[]
): Map<string, number> {
  // Build a set of valid (eventId::bib) pairs so we only tally relevant combos
  const alertPairSet = new Set(alerts.map((a) => `${a.eventId}::${a.bibNumber}`));
  const countMap = new Map<string, number>();

  for (const photo of photos) {
    for (const bib of photo.bibNumbers) {
      const key = `${photo.eventId}::${bib.number}`;
      if (alertPairSet.has(key)) {
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
    }
  }

  return countMap;
}
