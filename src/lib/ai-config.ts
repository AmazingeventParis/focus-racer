/**
 * AI processing configuration.
 * All thresholds and feature flags are environment-driven.
 */

export const aiConfig = {
  /** Is AWS configured? */
  get awsEnabled(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    );
  },

  /** Minimum OCR confidence to auto-accept (0-100) */
  get ocrConfidenceThreshold(): number {
    return parseInt(process.env.AI_OCR_CONFIDENCE_THRESHOLD || "70", 10);
  },

  /** Minimum quality score to pass (0-100, lower = blurrier) */
  get qualityThreshold(): number {
    return parseInt(process.env.AI_QUALITY_THRESHOLD || "30", 10);
  },

  /** Auto-edit images on upload */
  get autoEditEnabled(): boolean {
    return process.env.AI_AUTO_EDIT_ENABLED !== "false";
  },

  /** Index faces in Rekognition on upload */
  get faceIndexEnabled(): boolean {
    return this.awsEnabled && process.env.AI_FACE_INDEX_ENABLED !== "false";
  },

  /** Detect labels (clothing, accessories) */
  get labelDetectionEnabled(): boolean {
    return this.awsEnabled && process.env.AI_LABEL_DETECTION_ENABLED !== "false";
  },

  /**
   * Object storage configuration (S3-compatible).
   * Works with AWS S3 (native) OR any S3-compatible provider (OVH Object Storage, etc.).
   * Reads STORAGE_S3_* first, falls back to AWS_* for backward compatibility.
   * Storage is fully decoupled from Rekognition (which only ever receives image bytes),
   * so the storage backend can live on OVH while the AI stays on AWS.
   */
  get storage() {
    const endpoint = process.env.STORAGE_S3_ENDPOINT || ""; // empty = AWS S3 native endpoint
    return {
      /** Custom endpoint for S3-compatible providers, e.g. https://s3.gra.io.cloud.ovh.net */
      endpoint,
      region:
        process.env.STORAGE_S3_REGION || process.env.AWS_REGION || "eu-west-1",
      bucket: process.env.STORAGE_S3_BUCKET || process.env.AWS_S3_BUCKET || "",
      accessKeyId:
        process.env.STORAGE_S3_ACCESS_KEY_ID ||
        process.env.AWS_ACCESS_KEY_ID ||
        "",
      secretAccessKey:
        process.env.STORAGE_S3_SECRET_ACCESS_KEY ||
        process.env.AWS_SECRET_ACCESS_KEY ||
        "",
      /** Path-style addressing — required by most S3-compatible providers (OVH). Auto-on when a custom endpoint is set. */
      forcePathStyle:
        process.env.STORAGE_S3_FORCE_PATH_STYLE === "true" || !!endpoint,
      /** Optional public/CDN base URL serving objects directly (skips presigning). */
      publicBaseUrl:
        process.env.STORAGE_PUBLIC_URL || process.env.AWS_CLOUDFRONT_URL || "",
    };
  },

  /** S3 bucket for storage (empty = use local) */
  get s3Bucket(): string {
    return this.storage.bucket;
  },

  /** Is S3 storage active? */
  get s3Enabled(): boolean {
    return !!(
      this.storage.bucket &&
      this.storage.accessKeyId &&
      this.storage.secretAccessKey
    );
  },

  /** Public/CDN URL for direct delivery (CloudFront on AWS, or OVH public container). */
  get cloudfrontUrl(): string {
    return this.storage.publicBaseUrl;
  },

  /** AWS region */
  get region(): string {
    return process.env.AWS_REGION || "eu-west-1";
  },

  /** Rekognition face collection ID */
  get faceCollectionId(): string {
    return process.env.AWS_REKOGNITION_COLLECTION_ID || "focusracer-faces";
  },
};
