/**
 * Bot detection and anti-scraping protection.
 * - Blocks known bot/scraper User-Agents
 * - Allows legitimate search engine bots on public pages (not API)
 * - Validates browser headers on page requests
 * - Detects scraping patterns (high-frequency same-route requests)
 */

// Known bot/scraper User-Agent patterns (case-insensitive)
const BLOCKED_UA_PATTERNS = [
  "curl",
  "wget",
  "python-requests",
  "python-urllib",
  "httpx",
  "aiohttp",
  "scrapy",
  "selenium",
  "puppeteer",
  "playwright",
  "headlesschrome",
  "phantomjs",
  "httrack",
  "webcopier",
  "slimerjs",
  "nightmare",
  "mechanize",
  "java/",
  "libwww-perl",
  "go-http-client",
  "node-fetch",
  "undici",
  "axios/",
  "got/",
  "postmanruntime",
];

// Legitimate bots allowed on public pages (not on /api/ routes)
const ALLOWED_BOT_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp", // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "facebookcatalog",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
  "slackbot",
  "applebot",
];

// Aggressive crawlers to always block
const AGGRESSIVE_CRAWLER_PATTERNS = [
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "blexbot",
  "petalbot",
  "bytespider",
  "gptbot",
  "claudebot",
  "ccbot",
  "zoominfobot",
  "dataforseo",
];

export type BotCheckResult =
  | { blocked: false }
  | { blocked: true; reason: string };

/**
 * Check if a request is from a blocked bot.
 * @param userAgent - The User-Agent header
 * @param isApiRoute - Whether the request targets an API route
 */
export function checkBotUserAgent(
  userAgent: string | null,
  isApiRoute: boolean
): BotCheckResult {
  if (!userAgent) {
    // No UA on API routes → block; no UA on page routes → allow (some legitimate clients)
    if (isApiRoute) {
      return { blocked: true, reason: "missing-user-agent" };
    }
    return { blocked: false };
  }

  const uaLower = userAgent.toLowerCase();

  // Always block aggressive crawlers
  for (const pattern of AGGRESSIVE_CRAWLER_PATTERNS) {
    if (uaLower.includes(pattern)) {
      return { blocked: true, reason: `aggressive-crawler:${pattern}` };
    }
  }

  // Check if it's a legitimate bot
  for (const pattern of ALLOWED_BOT_PATTERNS) {
    if (uaLower.includes(pattern)) {
      // Legitimate bots allowed on page routes, blocked on API routes
      if (isApiRoute) {
        return { blocked: true, reason: `bot-on-api:${pattern}` };
      }
      return { blocked: false };
    }
  }

  // Block known scraper/automation tools
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (uaLower.includes(pattern)) {
      return { blocked: true, reason: `blocked-ua:${pattern}` };
    }
  }

  return { blocked: false };
}

/**
 * Validate that a request has typical browser headers.
 * Only enforced on page (non-API) requests.
 */
export function checkBrowserHeaders(headers: {
  accept: string | null;
  acceptLanguage: string | null;
  acceptEncoding: string | null;
}): BotCheckResult {
  // Browsers always send Accept header
  if (!headers.accept) {
    return { blocked: true, reason: "missing-accept-header" };
  }

  // Browsers always send Accept-Language
  if (!headers.acceptLanguage) {
    return { blocked: true, reason: "missing-accept-language" };
  }

  return { blocked: false };
}

// Scraping pattern detection: track requests per IP+route
interface ScrapingEntry {
  timestamps: number[];
}

const scrapingStore = new Map<string, ScrapingEntry>();
const SCRAPING_WINDOW = 10_000; // 10 seconds
const SCRAPING_THRESHOLD = 15; // 15 requests per 10s on same route
const SCRAPING_CLEANUP_INTERVAL = 30_000; // 30 seconds
let lastScrapingCleanup = Date.now();

function cleanupScrapingStore() {
  const now = Date.now();
  if (now - lastScrapingCleanup < SCRAPING_CLEANUP_INTERVAL) return;
  lastScrapingCleanup = now;

  const cutoff = now - SCRAPING_WINDOW;
  for (const [key, entry] of scrapingStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) scrapingStore.delete(key);
  }
}

/**
 * Normalize route path for scraping detection.
 * e.g. /api/events/abc123 → /api/events/[id]
 */
function normalizeRoute(pathname: string): string {
  return pathname
    .replace(/\/[a-zA-Z0-9_-]{20,}/g, "/[id]") // Long IDs
    .replace(/\/\d+/g, "/[n]"); // Numeric IDs
}

/**
 * Check if an IP is making too many requests to the same route.
 * Returns blocked if threshold exceeded.
 */
export function checkScrapingPattern(
  ip: string,
  pathname: string
): BotCheckResult {
  cleanupScrapingStore();

  const route = normalizeRoute(pathname);
  const key = `${ip}:${route}`;
  const now = Date.now();
  const cutoff = now - SCRAPING_WINDOW;

  let entry = scrapingStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    scrapingStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  entry.timestamps.push(now);

  if (entry.timestamps.length > SCRAPING_THRESHOLD) {
    return { blocked: true, reason: `scraping-pattern:${route}` };
  }

  return { blocked: false };
}
