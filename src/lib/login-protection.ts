/**
 * Brute force login protection.
 * Tracks failed login attempts per IP and per email.
 * Progressive lockout: 5 failures → 15min, 10 failures → 1h.
 * Auto-cleanup every 5 minutes.
 */

interface FailureEntry {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

const ipStore = new Map<string, FailureEntry>();
const emailStore = new Map<string, FailureEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min
let lastCleanup = Date.now();

// Lockout thresholds
const LOCKOUT_THRESHOLDS = [
  { attempts: 10, durationMs: 60 * 60 * 1000 }, // 10 failures → 1h
  { attempts: 5, durationMs: 15 * 60 * 1000 }, // 5 failures → 15min
];

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const store of [ipStore, emailStore]) {
    for (const [key, entry] of store) {
      // Remove entries that have expired and no active lockout
      if (entry.lockedUntil < now && now - entry.lastAttempt > 60 * 60 * 1000) {
        store.delete(key);
      }
    }
  }
}

function getLockoutDuration(count: number): number {
  for (const threshold of LOCKOUT_THRESHOLDS) {
    if (count >= threshold.attempts) {
      return threshold.durationMs;
    }
  }
  return 0;
}

function checkEntry(entry: FailureEntry | undefined): {
  locked: boolean;
  remainingMs: number;
  attempts: number;
} {
  if (!entry) {
    return { locked: false, remainingMs: 0, attempts: 0 };
  }

  const now = Date.now();
  if (entry.lockedUntil > now) {
    return {
      locked: true,
      remainingMs: entry.lockedUntil - now,
      attempts: entry.count,
    };
  }

  return { locked: false, remainingMs: 0, attempts: entry.count };
}

/**
 * Check if a login attempt is allowed for the given IP and email.
 * Returns locked status and remaining lockout time.
 */
export function checkLoginAllowed(
  ip: string,
  email: string
): { locked: boolean; remainingMs: number; attempts: number } {
  cleanup();

  const ipCheck = checkEntry(ipStore.get(ip));
  const emailCheck = checkEntry(emailStore.get(email.toLowerCase()));

  // If either is locked, report the longer lockout
  if (ipCheck.locked || emailCheck.locked) {
    return {
      locked: true,
      remainingMs: Math.max(ipCheck.remainingMs, emailCheck.remainingMs),
      attempts: Math.max(ipCheck.attempts, emailCheck.attempts),
    };
  }

  return { locked: false, remainingMs: 0, attempts: Math.max(ipCheck.attempts, emailCheck.attempts) };
}

/**
 * Record a failed login attempt for the given IP and email.
 */
export function recordLoginFailure(ip: string, email: string): void {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase();

  for (const [store, key] of [
    [ipStore, ip],
    [emailStore, normalizedEmail],
  ] as const) {
    let entry = store.get(key);
    if (!entry) {
      entry = { count: 0, lastAttempt: now, lockedUntil: 0 };
      store.set(key, entry);
    }

    entry.count++;
    entry.lastAttempt = now;

    const lockoutMs = getLockoutDuration(entry.count);
    if (lockoutMs > 0) {
      entry.lockedUntil = now + lockoutMs;
    }
  }
}

/**
 * Clear login failures after a successful login.
 */
export function clearLoginFailures(ip: string, email: string): void {
  ipStore.delete(ip);
  emailStore.delete(email.toLowerCase());
}

/**
 * Format remaining lockout time for display.
 */
export function formatLockoutTime(remainingMs: number): string {
  const minutes = Math.ceil(remainingMs / 60_000);
  if (minutes >= 60) {
    const hours = Math.ceil(minutes / 60);
    return `${hours} heure${hours > 1 ? "s" : ""}`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}
