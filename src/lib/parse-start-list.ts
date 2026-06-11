/**
 * Hardened start-list spreadsheet parser.
 *
 * Security properties:
 *  1. Rejects files larger than MAX_FILE_SIZE_BYTES before any parse (DoS guard).
 *  2. Calls XLSX.read() with formula/HTML evaluation disabled (mitigates the
 *     no-fix xlsx HIGH advisories: ReDoS via formula strings, prototype pollution
 *     via HTML fields).
 *  3. Each raw row is validated through a Zod schema so only expected fields
 *     reach the caller — raw spreadsheet objects are never spread downstream.
 *
 * This module is free of server-only imports so it can be used from "use client"
 * pages (xlsx is dynamically imported by the caller).
 */

import { z } from "zod";

/** 5 MB — generous for any realistic start-list (even 50 000 runners < 2 MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** The output shape we care about — everything else is stripped by the schema. */
export interface ParsedEntry {
  bibNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/** Zod schema for a single validated row. */
const parsedEntrySchema = z.object({
  bibNumber: z.string().min(1),
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  email: z.string().optional(),
});

// ─── Header normalisation (unchanged from original) ──────────────────────────

function normalizeHeader(header: string): string {
  const h = header
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (
    h.includes("dossard") ||
    h.includes("bib") ||
    h === "n°" ||
    h === "no" ||
    h === "numero" ||
    h === "number"
  )
    return "bibNumber";
  if (
    h.includes("prenom") ||
    h === "first" ||
    h === "firstname" ||
    h === "first_name" ||
    h === "first name"
  )
    return "firstName";
  if (
    h.includes("nom") ||
    h === "last" ||
    h === "lastname" ||
    h === "last_name" ||
    h === "last name" ||
    h === "name"
  )
    return "lastName";
  if (h.includes("email") || h.includes("mail") || h.includes("courriel"))
    return "email";
  return h;
}

// ─── Row normalisation + schema validation ────────────────────────────────────

/**
 * Map raw spreadsheet rows (arbitrary key→value) through the header normaliser
 * then validate each row against the Zod schema.  Rows that fail validation are
 * silently dropped (same behaviour as the original `filter` call).
 */
export function parseRows(
  rows: Record<string, unknown>[]
): ParsedEntry[] {
  const result: ParsedEntry[] = [];

  for (const row of rows) {
    // Normalise header keys
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      mapped[normalizeHeader(key)] = value != null ? String(value) : "";
    }

    // Validate through schema — strips all unexpected fields
    const parsed = parsedEntrySchema.safeParse({
      bibNumber: mapped.bibNumber ?? "",
      firstName: mapped.firstName ?? "",
      lastName: mapped.lastName ?? "",
      email: mapped.email || undefined,
    });

    if (
      parsed.success &&
      parsed.data.bibNumber &&
      (parsed.data.firstName || parsed.data.lastName)
    ) {
      result.push({
        bibNumber: parsed.data.bibNumber,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        ...(parsed.data.email ? { email: parsed.data.email } : {}),
      });
    }
  }

  return result;
}

// ─── XLSX parse (caller must dynamic-import xlsx) ─────────────────────────────

/**
 * Parse an Excel file from an ArrayBuffer.
 *
 * @param buffer   - raw ArrayBuffer from FileReader.readAsArrayBuffer()
 * @param fileSize - original File.size (bytes) used for the size guard
 * @throws         - if the file exceeds MAX_FILE_SIZE_BYTES
 */
export async function parseXlsxBuffer(
  buffer: ArrayBuffer,
  fileSize: number
): Promise<ParsedEntry[]> {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Le fichier dépasse la taille maximale autorisée (${MAX_FILE_SIZE_BYTES / 1024 / 1024} Mo).`
    );
  }

  // Dynamic import keeps xlsx out of the initial bundle (~300 KB)
  const XLSX = await import("xlsx");

  const data = new Uint8Array(buffer);
  // Safe options: disable formula evaluation (ReDoS surface) and HTML
  // field generation (prototype-pollution surface).
  const workbook = XLSX.read(data, {
    type: "array",
    cellFormula: false,
    cellHTML: false,
    sheetStubs: false,
  });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
  });

  return parseRows(rows);
}
