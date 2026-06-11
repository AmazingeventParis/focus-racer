import { describe, it, expect } from "vitest";
import { buildAlertCounts } from "@/lib/alert-counts";

describe("buildAlertCounts", () => {
  it("returns empty map when no photos", () => {
    const map = buildAlertCounts([], [{ eventId: "e1", bibNumber: "42" }]);
    expect(map.size).toBe(0);
  });

  it("returns empty map when no alerts", () => {
    const photos = [{ eventId: "e1", bibNumbers: [{ number: "42" }] }];
    const map = buildAlertCounts(photos, []);
    expect(map.size).toBe(0);
  });

  it("counts one photo matching one alert", () => {
    const photos = [{ eventId: "e1", bibNumbers: [{ number: "42" }] }];
    const alerts = [{ eventId: "e1", bibNumber: "42" }];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBe(1);
  });

  it("counts multiple photos for the same (eventId, bib)", () => {
    const photos = [
      { eventId: "e1", bibNumbers: [{ number: "42" }] },
      { eventId: "e1", bibNumbers: [{ number: "42" }] },
      { eventId: "e1", bibNumbers: [{ number: "42" }, { number: "99" }] },
    ];
    const alerts = [{ eventId: "e1", bibNumber: "42" }];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBe(3);
  });

  it("keeps counts separate across different events", () => {
    const photos = [
      { eventId: "e1", bibNumbers: [{ number: "42" }] },
      { eventId: "e2", bibNumbers: [{ number: "42" }] },
    ];
    const alerts = [
      { eventId: "e1", bibNumber: "42" },
      { eventId: "e2", bibNumber: "42" },
    ];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBe(1);
    expect(map.get("e2::42")).toBe(1);
  });

  it("ignores photos not matching any alert (wrong bib)", () => {
    const photos = [{ eventId: "e1", bibNumbers: [{ number: "99" }] }];
    const alerts = [{ eventId: "e1", bibNumber: "42" }];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBeUndefined();
    expect(map.size).toBe(0);
  });

  it("ignores photos not matching any alert (wrong event)", () => {
    const photos = [{ eventId: "e2", bibNumbers: [{ number: "42" }] }];
    const alerts = [{ eventId: "e1", bibNumber: "42" }];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBeUndefined();
    expect(map.size).toBe(0);
  });

  it("handles multiple bibs per photo — counts photo once per matching (event, bib) pair", () => {
    // Photo has bibs [42, 99] in e1; alerts track both bibs separately
    const photos = [{ eventId: "e1", bibNumbers: [{ number: "42" }, { number: "99" }] }];
    const alerts = [
      { eventId: "e1", bibNumber: "42" },
      { eventId: "e1", bibNumber: "99" },
    ];
    const map = buildAlertCounts(photos, alerts);
    expect(map.get("e1::42")).toBe(1);
    expect(map.get("e1::99")).toBe(1);
  });

  it("hasNewPhotos logic: count > lastNotifiedCount", () => {
    // Simulate two photos published after the last notification
    const photos = [
      { eventId: "e1", bibNumbers: [{ number: "42" }] },
      { eventId: "e1", bibNumbers: [{ number: "42" }] },
    ];
    const alerts = [{ eventId: "e1", bibNumber: "42" }];
    const map = buildAlertCounts(photos, alerts);
    const count = map.get("e1::42") ?? 0;
    const lastNotifiedCount = 1;
    expect(count > lastNotifiedCount).toBe(true);
  });
});
