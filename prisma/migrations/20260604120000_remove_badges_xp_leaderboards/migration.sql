-- Remove gamification: badges, XP/levels, leaderboards
-- Kept: streaks, reactions, referrals, shares, credit rewards, smart alerts, wrapped recaps

-- Drop tables (CASCADE removes dependent foreign keys/indexes)
DROP TABLE IF EXISTS "UserBadge" CASCADE;
DROP TABLE IF EXISTS "XpEvent" CASCADE;
DROP TABLE IF EXISTS "UserLevel" CASCADE;
DROP TABLE IF EXISTS "LeaderboardEntry" CASCADE;

-- Drop enums no longer referenced by any table
DROP TYPE IF EXISTS "XpActionType";
DROP TYPE IF EXISTS "LeaderboardPeriod";
