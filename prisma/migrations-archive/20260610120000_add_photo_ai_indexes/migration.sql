-- Indexes for AI/admin dashboard queries that filter on these columns
-- (full table scans on a growing Photo table otherwise)
CREATE INDEX IF NOT EXISTS "Photo_ocrProvider_idx" ON "Photo"("ocrProvider");
CREATE INDEX IF NOT EXISTS "Photo_faceIndexed_idx" ON "Photo"("faceIndexed");
CREATE INDEX IF NOT EXISTS "Photo_processedAt_idx" ON "Photo"("processedAt");
