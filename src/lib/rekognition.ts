import {
  RekognitionClient,
  DetectTextCommand,
  DetectLabelsCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  SearchFacesCommand,
  CreateCollectionCommand,
  ListCollectionsCommand,
} from "@aws-sdk/client-rekognition";
import { readFileSync } from "fs";
import { aiConfig } from "./ai-config";

let client: RekognitionClient | null = null;

function getClient(): RekognitionClient {
  if (!client) {
    client = new RekognitionClient({
      region: aiConfig.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

// ---------- OCR via DetectText ----------

export interface RekognitionOCRResult {
  bibNumbers: string[];
  confidence: number;
  rawDetections: { text: string; confidence: number; type: string }[];
}

const BIB_NUMBER_REGEX = /\b\d{1,5}\b/g;

// Higher confidence threshold for single-digit numbers (most prone to false positives)
const SMALL_BIB_CONFIDENCE = 90;

/**
 * Remove bib numbers that are substrings of other detected numbers.
 * E.g. if we detect "3" and "350", remove "3" (likely a partial read).
 * Also handles: "1" + "18" → keep only "18", "8" + "18" → keep only "18".
 */
function removeSubsumedBibs(bibs: { number: string; confidence: number }[]): { number: string; confidence: number }[] {
  if (bibs.length <= 1) return bibs;

  // Sort by length descending (longest first = most likely complete reads)
  const sorted = [...bibs].sort((a, b) => b.number.length - a.number.length);
  const kept: { number: string; confidence: number }[] = [];

  for (const bib of sorted) {
    // Check if this number is a prefix or suffix of any already-kept longer number
    const isSubsumed = kept.some((longer) => {
      if (longer.number.length <= bib.number.length) return false;
      return longer.number.startsWith(bib.number) || longer.number.endsWith(bib.number);
    });
    if (!isSubsumed) {
      kept.push(bib);
    }
  }

  return kept;
}

export async function detectTextFromImage(
  imageInput: string | Buffer,
  validBibs?: Set<string>
): Promise<RekognitionOCRResult> {
  const imageBytes = typeof imageInput === "string" ? readFileSync(imageInput) : imageInput;
  const rekognition = getClient();
  const minConfidence = aiConfig.ocrConfidenceThreshold; // default 70%

  const response = await rekognition.send(
    new DetectTextCommand({
      Image: { Bytes: imageBytes },
    })
  );

  const detections = (response.TextDetections || []).map((d) => ({
    text: d.DetectedText || "",
    confidence: d.Confidence || 0,
    type: d.Type || "",
  }));

  const avgConfidence =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
      : 0;

  // Extract bib numbers from WORD-level detections (each carries its own confidence)
  // This is more precise than joining LINE texts where confidence is lost per-token
  const wordDetections = detections.filter((d) => d.type === "WORD");

  const candidates: { number: string; confidence: number }[] = [];
  for (const det of wordDetections) {
    // Skip low-confidence detections
    if (det.confidence < minConfidence) continue;

    const matches = det.text.match(BIB_NUMBER_REGEX) || [];
    for (const match of matches) {
      const n = parseInt(match, 10);
      if (n < 1 || n > 99999) continue;
      if (n >= 1900 && n <= 2100) continue; // Filter years

      // Single-digit numbers require higher confidence (most false positives)
      if (n <= 9 && det.confidence < SMALL_BIB_CONFIDENCE) continue;

      candidates.push({ number: match, confidence: det.confidence });
    }
  }

  // Deduplicate: keep highest confidence per number
  const bestByNumber = new Map<string, number>();
  for (const c of candidates) {
    const existing = bestByNumber.get(c.number);
    if (!existing || c.confidence > existing) {
      bestByNumber.set(c.number, c.confidence);
    }
  }

  let bibsWithConf = Array.from(bestByNumber.entries()).map(([number, confidence]) => ({
    number,
    confidence,
  }));

  // Remove subsumed numbers (e.g. "3" from "350", "1" from "18")
  bibsWithConf = removeSubsumedBibs(bibsWithConf);

  let bibNumbers = bibsWithConf.map((b) => b.number);

  // If start-list provided, filter to only valid bibs
  if (validBibs && validBibs.size > 0) {
    const validated = bibNumbers.filter((b) => validBibs.has(b));
    // Keep at least the validated ones; if none match, keep all for manual review
    if (validated.length > 0) {
      bibNumbers = validated;
    }
  }

  return {
    bibNumbers: bibNumbers.sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
    confidence: avgConfidence,
    rawDetections: detections,
  };
}

// ---------- Label Detection ----------

export interface LabelResult {
  name: string;
  confidence: number;
  parents: string[];
}

export async function detectLabels(
  imageInput: string | Buffer,
  maxLabels: number = 20,
  minConfidence: number = 70
): Promise<LabelResult[]> {
  const imageBytes = typeof imageInput === "string" ? readFileSync(imageInput) : imageInput;
  const rekognition = getClient();

  const response = await rekognition.send(
    new DetectLabelsCommand({
      Image: { Bytes: imageBytes },
      MaxLabels: maxLabels,
      MinConfidence: minConfidence,
    })
  );

  return (response.Labels || []).map((label) => ({
    name: label.Name || "",
    confidence: label.Confidence || 0,
    parents: (label.Parents || []).map((p) => p.Name || ""),
  }));
}

// ---------- Face Indexing ----------

export async function ensureFaceCollection(): Promise<void> {
  const rekognition = getClient();
  const collectionId = aiConfig.faceCollectionId;

  try {
    const listResp = await rekognition.send(new ListCollectionsCommand({}));
    if (listResp.CollectionIds?.includes(collectionId)) return;

    await rekognition.send(
      new CreateCollectionCommand({ CollectionId: collectionId })
    );
    console.log(`Created Rekognition face collection: ${collectionId}`);
  } catch (err) {
    // Collection may already exist
    console.error("Face collection setup error:", err);
  }
}

export interface IndexedFace {
  faceId: string;
  confidence: number;
  boundingBox: { width: number; height: number; left: number; top: number };
}

export async function indexFaces(
  imageInput: string | Buffer,
  externalImageId: string
): Promise<IndexedFace[]> {
  const imageBytes = typeof imageInput === "string" ? readFileSync(imageInput) : imageInput;
  const rekognition = getClient();

  await ensureFaceCollection();

  const response = await rekognition.send(
    new IndexFacesCommand({
      CollectionId: aiConfig.faceCollectionId,
      Image: { Bytes: imageBytes },
      ExternalImageId: externalImageId,
      DetectionAttributes: ["DEFAULT"],
      MaxFaces: 10,
      QualityFilter: "AUTO",
    })
  );

  return (response.FaceRecords || []).map((record) => ({
    faceId: record.Face?.FaceId || "",
    confidence: record.Face?.Confidence || 0,
    boundingBox: {
      width: record.Face?.BoundingBox?.Width || 0,
      height: record.Face?.BoundingBox?.Height || 0,
      left: record.Face?.BoundingBox?.Left || 0,
      top: record.Face?.BoundingBox?.Top || 0,
    },
  }));
}

// ---------- Face Search by Selfie ----------

export interface FaceMatch {
  externalImageId: string;
  faceId: string;
  similarity: number;
}

export async function searchFaceByImage(
  imageBytes: Buffer,
  maxFaces: number = 20,
  threshold: number = 80
): Promise<FaceMatch[]> {
  const rekognition = getClient();

  await ensureFaceCollection();

  const response = await rekognition.send(
    new SearchFacesByImageCommand({
      CollectionId: aiConfig.faceCollectionId,
      Image: { Bytes: imageBytes },
      MaxFaces: maxFaces,
      FaceMatchThreshold: threshold,
    })
  );

  return (response.FaceMatches || []).map((match) => ({
    externalImageId: match.Face?.ExternalImageId || "",
    faceId: match.Face?.FaceId || "",
    similarity: match.Similarity || 0,
  }));
}

// ---------- Face Search by FaceId (for clustering) ----------

/**
 * Search for similar faces using an existing FaceId from the collection.
 * This is cheaper than SearchFacesByImage ($0.0004 vs $0.001).
 * Used for face clustering after indexing.
 */
export async function searchFacesByFaceId(
  faceId: string,
  maxFaces: number = 100,
  threshold: number = 85
): Promise<FaceMatch[]> {
  const rekognition = getClient();

  const response = await rekognition.send(
    new SearchFacesCommand({
      CollectionId: aiConfig.faceCollectionId,
      FaceId: faceId,
      MaxFaces: maxFaces,
      FaceMatchThreshold: threshold,
    })
  );

  return (response.FaceMatches || []).map((match) => ({
    externalImageId: match.Face?.ExternalImageId || "",
    faceId: match.Face?.FaceId || "",
    similarity: match.Similarity || 0,
  }));
}
