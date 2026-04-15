/**
 * AsyncLocalStorage-based request context.
 * Used to pass client IP from the API route handler
 * into the NextAuth authorize() callback.
 */
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  ip: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Run a function within a request context that carries the client IP.
 */
export function runWithIp<T>(ip: string, fn: () => T): T {
  return asyncLocalStorage.run({ ip }, fn);
}

/**
 * Get the client IP from the current async context.
 * Returns "unknown" if not within a runWithIp context.
 */
export function getRequestIp(): string {
  return asyncLocalStorage.getStore()?.ip ?? "unknown";
}
