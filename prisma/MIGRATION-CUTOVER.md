# Migration Cutover: `db push` → `migrate deploy`

> **STATUS: PREPARATION COMPLETE — prod cutover is operator-gated (requires backup first)**

This document covers the plan and operator runbook for replacing
`prisma db push --accept-data-loss` with `prisma migrate deploy` in the
production container. All reversible preparation artifacts (baseline migration,
Dockerfile change) are already committed on branch
`advisor/012-migrate-deploy-spike`. The prod cutover steps below have NOT been
executed.

---

## Findings (Step 1 investigation)

### 1. Migration directory state

14 migration directories exist under `prisma/migrations/`, plus
`migration_lock.toml` (provider = postgresql):

```
20260209000000_init                           (412 lines, initial schema)
20260216093439_add_upload_timestamps
20260216160000_add_credits_system
20260217150000_add_registration_fields
20260217170000_add_support_messaging
20260217180000_add_photo_face_crop_path
20260218000000_add_connect_order_fields
20260218100000_add_read_by_user
20260218120000_add_replies_json
20260225000000_add_gamification              (adds XpEvent, UserLevel, LeaderboardEntry +
                                              UserStreak, PhotoReaction, Referral,
                                              ShareEvent, CreditReward, SmartAlert,
                                              WrappedRecap, XpActionType, LeaderboardPeriod)
20260225100000_add_subscription_fields
20260226000000_add_guest_event_follower
20260604120000_remove_badges_xp_leaderboards (drops UserBadge, XpEvent, UserLevel,
                                              LeaderboardEntry, XpActionType, LeaderboardPeriod)
20260610120000_add_photo_ai_indexes          (3 partial indexes on Photo)
```

The migration chain is internally consistent as a history, but it is
**incomplete relative to the current `schema.prisma`**: the following 12 tables
are present in the schema but were never created by any versioned migration —
they were applied directly to prod via `db push`:

```
ApiKey
DeviceToken
EventFavorite
Horde
HordeConversation
HordeConversationParticipant
HordeMember
HordeMessage
Notification
NotificationPreference
PhotoAlert
PlatformSettings
```

### 2. Schema vs migrations diff

`prisma migrate diff --from-migrations ... --to-schema-datamodel ... --script`
**requires a shadow database connection** and cannot run offline. It was not
executed.

`prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
runs fully offline and produced 1 038 lines of SQL (36 `CREATE TABLE`,
21 `CREATE TYPE`, 86 `CREATE INDEX`/`CREATE UNIQUE INDEX` statements). This
is the baseline migration at `prisma/migrations/00000000000000_baseline/migration.sql`.

### 3. Production `_prisma_migrations` table

Almost certainly empty or partial. `prisma db push` does **not** write rows to
`_prisma_migrations`; only `migrate deploy` / `migrate resolve` do. The operator
**must verify this** before the cutover:

```sql
SELECT COUNT(*) FROM "_prisma_migrations";
-- If 0 (likely): baseline resolve approach applies (Step 3 below).
-- If non-zero: each row maps to a migration file; cross-check manually.
```

### 4. Risk summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| `_prisma_migrations` empty → `migrate deploy` tries to re-create tables that already exist | HIGH | `migrate resolve --applied 00000000000000_baseline` before first `migrate deploy` |
| Live DB shape differs from `schema.prisma` in subtle ways (db push may have applied partial drifts) | MEDIUM | Full pg_dump backup before cutover; restore test in scratch DB |
| 12 tables never in a versioned migration → baseline covers them, but old incremental migrations would conflict | MEDIUM | Baseline replaces the entire chain; resolve it as applied, never replay the incremental ones |

---

## Baseline migration

File: `prisma/migrations/00000000000000_baseline/migration.sql`

Generated offline by:
```
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

It represents the complete current schema (36 tables, 21 enums, 86 indexes) as
a single idempotent `CREATE` script. It is used to **mark** the current DB state
as applied — it is NOT run against a DB that already has the tables.

---

## Dockerfile change (Step 3)

The CMD in `Dockerfile` was changed from:
```
CMD ["sh", "-c", "... && npx prisma db push --accept-data-loss ..."]
```
to:
```
CMD ["sh", "-c", "echo 'Applying migrations...' && npx prisma migrate deploy && node prisma/seed.js && node server.js"]
```

Note: `node prisma/seed.js` is still called on every boot (Session 29 made it
prod-safe — disables test accounts when `NODE_ENV=production`). Removing the
seed from the boot sequence is a separate future cleanup.

---

## Prod cutover runbook (operator — do NOT skip steps)

### Prerequisites

- [ ] You have SSH access to `217.182.89.133` (OVH dedicated server)
- [ ] The container runs Postgres accessible at `DATABASE_URL`
- [ ] Branch `advisor/012-migrate-deploy-spike` has been reviewed and merged
      to `master`
- [ ] `git push amazingevent master` is ready to trigger but NOT yet executed

### Step 1 — Full database backup (mandatory)

```bash
# On the OVH server, inside the postgres container or via docker exec:
docker exec -t focusracer-db pg_dump -U postgres focusracer > /backups/focusracer-$(date +%Y%m%d-%H%M%S).sql

# Verify the dump file is non-empty and restores cleanly in a scratch instance:
docker run --rm -e POSTGRES_PASSWORD=test -d --name pg-scratch postgres:15
docker exec -i pg-scratch psql -U postgres -c "CREATE DATABASE scratch;"
docker exec -i pg-scratch psql -U postgres scratch < /backups/focusracer-<timestamp>.sql
# Confirm row counts match:
docker exec -i pg-scratch psql -U postgres scratch -c "SELECT COUNT(*) FROM \"User\";"
docker stop pg-scratch
```

### Step 2 — Verify live DB shape matches schema

Connect to the production DB and spot-check that the 12 tables listed in
Findings §1 exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Should list all 36 model tables. Missing ones = drift to investigate.
```

### Step 3 — Mark baseline as applied (do NOT re-run it)

The baseline SQL must NOT be executed against a DB that already has the tables.
Instead, tell Prisma the DB is already in this state:

```bash
# Run inside the app container or with DATABASE_URL set:
npx prisma migrate resolve --applied 00000000000000_baseline
```

This inserts a row in `_prisma_migrations` saying the baseline is done.

### Step 4 — Verify migration status

```bash
npx prisma migrate status
# Expected output: "All migrations have been applied"
# If any migration is listed as pending, do NOT proceed. Investigate first.
```

### Step 5 — Deploy the new container

```bash
git push amazingevent master
# Then trigger Coolify deploy via API or dashboard.
# Monitor logs: "Applying migrations..." should appear, followed by
# "Already in sync, no schema changes made." (zero pending migrations).
```

### Step 6 — Smoke test

- Load `https://focusracer.swipego.app` — should respond 200
- Login as admin
- Upload one test photo — should process and appear in gallery
- Check Coolify logs for any Prisma error

### Rollback procedure

1. In Coolify, redeploy the previous image tag (uses `db push` — safe as long
   as the schema has not changed).
2. The backup from Step 1 is the last resort if data corruption occurred.

### Future maintenance

After cutover, every schema change must ship as a versioned migration:
```bash
npx prisma migrate dev --name describe_the_change
```
Never run `prisma db push` against production again.

---

## Files changed in this preparation

| File | Change |
|------|--------|
| `prisma/migrations/00000000000000_baseline/migration.sql` | New — full-schema baseline |
| `Dockerfile` | CMD: `db push --accept-data-loss` → `migrate deploy` |
| `prisma/MIGRATION-CUTOVER.md` | New — this runbook |
