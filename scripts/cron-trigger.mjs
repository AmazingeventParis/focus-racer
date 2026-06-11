// Triggers an internal cron endpoint from inside the container.
//
// Why this exists: cron endpoints live under /api/cron/* and are protected by
//   (1) bot detection that blocks `curl`/known tool User-Agents, and
//   (2) Bearer-token auth (CRON_SECRET).
// Calling them from a Coolify Scheduled Task with a raw curl one-liner is both
// blocked by the bot filter and awkward to store (Coolify mangles complex
// commands). This script is the stable entry point:
//
//   node scripts/cron-trigger.mjs <endpoint>
//   e.g. node scripts/cron-trigger.mjs auto-archive
//
// It calls the app on localhost (avoids public-domain hairpin issues), sends a
// non-blocked User-Agent + the Bearer header, prints the status, and exits
// non-zero on failure so the scheduler surfaces problems.

const endpoint = process.argv[2];
if (!endpoint) {
  console.error("Usage: node scripts/cron-trigger.mjs <endpoint>");
  process.exit(2);
}

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error(`[cron:${endpoint}] CRON_SECRET is not set in the environment`);
  process.exit(2);
}

const port = process.env.PORT || "3000";
const url = `http://localhost:${port}/api/cron/${endpoint}`;

try {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "FocusRacerCron/1.0",
      Authorization: `Bearer ${secret}`,
    },
  });
  const body = await res.text();
  console.log(`[cron:${endpoint}] HTTP ${res.status} ${body}`);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  console.error(`[cron:${endpoint}] request failed: ${err.message}`);
  process.exit(1);
}
