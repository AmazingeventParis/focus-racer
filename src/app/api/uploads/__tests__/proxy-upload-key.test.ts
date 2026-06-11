import { describe, it, expect } from "vitest";
import { isServableUploadKey } from "../upload-key-utils";

describe("isServableUploadKey", () => {
  it("rejects a key that contains originals/ segment", () => {
    expect(isServableUploadKey("events/abc/originals/x.jpg")).toBe(false);
  });

  it("rejects a key that ends with /originals", () => {
    expect(isServableUploadKey("events/abc/originals")).toBe(false);
  });

  it("rejects originals/ at the root of the key", () => {
    expect(isServableUploadKey("originals/x.jpg")).toBe(false);
  });

  it("allows thumbs/ keys", () => {
    expect(isServableUploadKey("events/abc/thumbs/wm_x.webp")).toBe(true);
  });

  it("allows web/ keys", () => {
    expect(isServableUploadKey("events/abc/web/web_x.webp")).toBe(true);
  });

  it("allows platform/ keys (watermark)", () => {
    expect(isServableUploadKey("platform/watermark.png")).toBe(true);
  });

  it("does not reject keys that merely contain the word 'originals' as a substring in the filename", () => {
    // e.g. a thumbnail named "originals_backup.webp" — not an originals/ segment
    expect(isServableUploadKey("events/abc/thumbs/originals_backup.webp")).toBe(true);
  });
});
