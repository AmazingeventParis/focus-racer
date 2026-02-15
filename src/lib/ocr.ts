import Tesseract from "tesseract.js";
import { OCRResult } from "@/types";
import { aiConfig } from "./ai-config";
import { detectTextFromImage } from "./rekognition";

const BIB_NUMBER_REGEX = /\b\d{1,5}\b/g;

/**
 * Extract bib numbers from image.
 *
 * @param forceProvider - "aws" | "tesseract" | undefined
 *   - "aws" → force Rekognition (requires AWS keys)
 *   - "tesseract" → force Tesseract.js (free, slower)
 *   - undefined → auto: AWS if configured, Tesseract otherwise
 */
export async function extractBibNumbers(
  imagePath: string,
  validBibs?: Set<string>,
  forceProvider?: "aws" | "tesseract"
): Promise<OCRResult & { provider: string }> {
  if (forceProvider === "tesseract") {
    return extractWithTesseract(imagePath, validBibs);
  }
  if (forceProvider === "aws" && aiConfig.awsEnabled) {
    return extractWithRekognition(imagePath, validBibs);
  }
  // Auto: AWS if available, Tesseract otherwise
  if (aiConfig.awsEnabled) {
    return extractWithRekognition(imagePath, validBibs);
  }
  return extractWithTesseract(imagePath, validBibs);
}

// --- AWS Rekognition (production) ---

async function extractWithRekognition(
  imagePath: string,
  validBibs?: Set<string>
): Promise<OCRResult & { provider: string }> {
  console.log(`[OCR] AWS Rekognition on: ${imagePath}`);
  const result = await detectTextFromImage(imagePath, validBibs);
  console.log(`[OCR] Rekognition found ${result.bibNumbers.length} bibs (confidence: ${result.confidence.toFixed(1)}%)`);

  return {
    bibNumbers: result.bibNumbers,
    confidence: result.confidence,
    rawText: result.rawDetections.map((d) => d.text).join(" "),
    provider: "ocr_aws",
  };
}

// --- Tesseract.js (dev/local fallback when AWS not configured) ---

const OCR_TIMEOUT_MS = 30_000; // 30s max per photo

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

async function extractWithTesseract(
  imagePath: string,
  validBibs?: Set<string>
): Promise<OCRResult & { provider: string }> {
  try {
    console.log(`[OCR] Tesseract (no AWS) on: ${imagePath}`);

    // Create worker manually to avoid worker-script module issues on Render
    const worker = await Tesseract.createWorker("eng", 1, {
      // Disable worker threads to avoid MODULE_NOT_FOUND errors on Render
      workerPath: undefined,
      corePath: undefined,
      langPath: undefined,
    });

    const result = await withTimeout(
      (async () => {
        try {
          const res = await worker.recognize(imagePath);
          await worker.terminate();
          return res;
        } catch (err) {
          await worker.terminate();
          throw err;
        }
      })(),
      OCR_TIMEOUT_MS,
      "Tesseract OCR"
    );

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    const matches = rawText.match(BIB_NUMBER_REGEX) || [];

    let bibNumbers = [...new Set(matches)].filter((num) => {
      const n = parseInt(num, 10);
      return n >= 1 && n <= 99999 && !(n >= 1900 && n <= 2100);
    });

    if (validBibs && validBibs.size > 0) {
      const validated = bibNumbers.filter((b) => validBibs.has(b));
      if (validated.length > 0) bibNumbers = validated;
    }

    bibNumbers.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    console.log(`[OCR] Tesseract found: ${bibNumbers.join(", ") || "none"} (confidence: ${confidence.toFixed(1)}%)`);

    return {
      bibNumbers,
      confidence,
      rawText,
      provider: "ocr_tesseract",
    };
  } catch (error) {
    console.error("[OCR] Tesseract error:", error);
    return {
      bibNumbers: [],
      confidence: 0,
      rawText: "",
      provider: "ocr_tesseract",
    };
  }
}

/**
 * Process photo OCR (backward-compatible wrapper).
 */
export async function processPhotoOCR(
  imagePath: string,
  validBibs?: Set<string>,
  forceProvider?: "aws" | "tesseract"
): Promise<{ numbers: string[]; confidence: number; provider: string }> {
  const result = await extractBibNumbers(imagePath, validBibs, forceProvider);
  return {
    numbers: result.bibNumbers,
    confidence: result.confidence,
    provider: result.provider,
  };
}
