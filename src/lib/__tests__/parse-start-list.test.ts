import { describe, it, expect } from "vitest";
import { parseRows, parseXlsxBuffer, MAX_FILE_SIZE_BYTES } from "../parse-start-list";
import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal xlsx ArrayBuffer in memory using XLSX.write so the test
 * exercises the real parse path without touching the filesystem.
 */
function makeXlsxBuffer(rows: Record<string, string>[]): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf: ArrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return buf;
}

// ─── parseRows ────────────────────────────────────────────────────────────────

describe("parseRows", () => {
  it("returns expected rows from a well-formed input", () => {
    const rows = [
      { dossard: "42", prenom: "Alice", nom: "Dupont", email: "alice@example.com" },
      { bib: "7", firstname: "Bob", lastname: "Martin" },
    ];
    const result = parseRows(rows);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      bibNumber: "42",
      firstName: "Alice",
      lastName: "Dupont",
      email: "alice@example.com",
    });
    expect(result[1]).toEqual({
      bibNumber: "7",
      firstName: "Bob",
      lastName: "Martin",
    });
  });

  it("strips unexpected fields — only schema fields are present", () => {
    const rows = [
      {
        dossard: "1",
        prenom: "Eve",
        nom: "Test",
        __proto__: "injected",          // prototype pollution attempt
        evilField: "should-be-stripped",
        constructor: "also-stripped",
      },
    ];
    const result = parseRows(rows);
    expect(result).toHaveLength(1);
    const keys = Object.keys(result[0]);
    expect(keys).not.toContain("evilField");
    expect(keys).not.toContain("constructor");
    expect(keys).toContain("bibNumber");
    expect(keys).toContain("firstName");
    expect(keys).toContain("lastName");
  });

  it("drops rows missing both firstName and lastName", () => {
    const rows = [
      { dossard: "10" }, // no name at all → dropped
      { dossard: "11", nom: "Martin" }, // lastName only → kept
    ];
    const result = parseRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].bibNumber).toBe("11");
  });

  it("drops rows with no bibNumber", () => {
    const rows = [{ prenom: "Alice", nom: "X" }];
    expect(parseRows(rows)).toHaveLength(0);
  });

  it("normalises header variants correctly", () => {
    const rows = [{ "N°": "99", "First Name": "Carol", "Last Name": "Smith" }];
    const result = parseRows(rows);
    expect(result[0].bibNumber).toBe("99");
    expect(result[0].firstName).toBe("Carol");
    expect(result[0].lastName).toBe("Smith");
  });
});

// ─── parseXlsxBuffer ─────────────────────────────────────────────────────────

describe("parseXlsxBuffer", () => {
  it("parses a valid in-memory xlsx and returns expected rows", async () => {
    const rows = [
      { dossard: "1", prenom: "Alice", nom: "A" },
      { dossard: "2", prenom: "Bob", nom: "B" },
    ];
    const buf = makeXlsxBuffer(rows);
    const result = await parseXlsxBuffer(buf, buf.byteLength);
    expect(result).toHaveLength(2);
    expect(result[0].bibNumber).toBe("1");
    expect(result[1].bibNumber).toBe("2");
  });

  it("rejects files exceeding the size cap before any parse", async () => {
    const buf = makeXlsxBuffer([{ dossard: "1", prenom: "X", nom: "Y" }]);
    // Pretend the file.size is over the limit even though the buffer is tiny
    await expect(
      parseXlsxBuffer(buf, MAX_FILE_SIZE_BYTES + 1)
    ).rejects.toThrow(/taille maximale/i);
  });

  it("strips extra keys from xlsx rows via schema", async () => {
    const rows = [
      { dossard: "5", prenom: "Dave", nom: "D", extra_col: "should-not-appear" },
    ];
    const buf = makeXlsxBuffer(rows);
    const result = await parseXlsxBuffer(buf, buf.byteLength);
    expect(result).toHaveLength(1);
    expect(Object.keys(result[0])).not.toContain("extra_col");
  });
});
