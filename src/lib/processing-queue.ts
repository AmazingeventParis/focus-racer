/**
 * Bounded processing queue for photo AI pipeline.
 *
 * Limits concurrent photo processing to avoid CPU/memory saturation.
 * Default: 1 concurrent worker (optimized for Render 512MB).
 *
 * Usage:
 *   processingQueue.enqueue(() => processPhoto(photoId, ...))
 */

type Task = () => Promise<void>;

const MAX_CONCURRENT = parseInt(process.env.AI_MAX_CONCURRENT || "1", 10);

let running = 0;
const queue: Task[] = [];

function tryRunNext() {
  while (running < MAX_CONCURRENT && queue.length > 0) {
    const task = queue.shift()!;
    running++;
    task()
      .catch((err) => console.error("[Queue] Task error:", err))
      .finally(() => {
        running--;
        // Force garbage collection hint after each task
        if (global.gc) {
          global.gc();
        }
        tryRunNext();
      });
  }
}

export const processingQueue = {
  enqueue(task: Task): void {
    queue.push(task);
    tryRunNext();
  },

  /** Current queue stats (for monitoring/debug) */
  get stats() {
    return {
      running,
      queued: queue.length,
      maxConcurrent: MAX_CONCURRENT,
    };
  },
};
