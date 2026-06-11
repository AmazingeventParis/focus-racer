/**
 * Guard: returns false for any S3 key that contains an `originals/` segment.
 * HD originals are the paid product and must never be served through the public
 * proxy — only through the authenticated download routes.
 */
export function isServableUploadKey(s3Key: string): boolean {
  if (/(^|\/)originals\//.test(s3Key) || s3Key.endsWith("/originals")) {
    return false;
  }
  return true;
}
