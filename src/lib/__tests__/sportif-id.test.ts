import { describe, it, expect } from "vitest";
import { generateSportifId } from "@/lib/sportif-id";

// Valid charset: uppercase letters excluding I, O, and digits excluding 0, 1
const VALID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ID_REGEX = /^FR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

describe("generateSportifId", () => {
  it("returns a string matching the FR-XXXXXX format", () => {
    const id = generateSportifId();
    expect(id).toMatch(ID_REGEX);
  });

  it("always starts with 'FR-'", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateSportifId().startsWith("FR-")).toBe(true);
    }
  });

  it("suffix is exactly 6 characters long", () => {
    const id = generateSportifId();
    expect(id.length).toBe(9); // "FR-" (3) + 6 chars
  });

  it("only uses characters from the restricted charset (no I, O, 0, 1)", () => {
    const forbidden = /[IO01]/;
    for (let i = 0; i < 200; i++) {
      const suffix = generateSportifId().slice(3);
      expect(forbidden.test(suffix)).toBe(false);
    }
  });

  it("generates unique IDs across 10 000 calls", () => {
    const ids = Array.from({ length: 10_000 }, () => generateSportifId());
    const unique = new Set(ids);
    // With 32^6 ≈ 1B possible values the birthday collision probability is negligible
    expect(unique.size).toBe(10_000);
  });
});
