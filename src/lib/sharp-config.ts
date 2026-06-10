import sharp from "sharp";

// Sharp config: optimized for 16-core dedicated server (64 GB RAM)
// 16 queue workers × 2 vips threads = 32 threads (matches hyperthread count).
// concurrency(1) left half the CPU idle: each worker's Sharp ops ran
// single-threaded while cores sat unused.
sharp.concurrency(2);

// Enable libvips cache: 64 GB RAM available
// memory: limit in MB, items: number of entries, files: open file descriptors
sharp.cache({ memory: 2048, items: 200, files: 200 });

export default sharp;
