import { XpActionType } from "@prisma/client";

export interface XpActionConfig {
  xp: number;
  oneTime: boolean;
  // For per-entity one-time actions (e.g., per event)
  perEntity?: boolean;
}

export const XP_CONFIG: Record<XpActionType, XpActionConfig> = {
  // Sportif actions
  PHOTO_PURCHASE:     { xp: 10, oneTime: false },
  EVENT_FAVORITE:     { xp: 5,  oneTime: false },
  PROFILE_COMPLETE:   { xp: 50, oneTime: true },
  FRIEND_ADDED:       { xp: 15, oneTime: false },
  PHOTO_SHARED:       { xp: 10, oneTime: false },
  PHOTO_REACTION:     { xp: 2,  oneTime: false },
  REFERRAL_COMPLETED: { xp: 100, oneTime: false },

  // Photographe actions
  PHOTO_UPLOADED:     { xp: 1,  oneTime: false },
  EVENT_PUBLISHED:    { xp: 30, oneTime: false },
  PHOTO_SOLD:         { xp: 5,  oneTime: false },
  BADGE_EARNED:       { xp: 25, oneTime: false },
  STRIPE_CONNECTED:   { xp: 100, oneTime: true },
  HIGH_OCR_RATE:      { xp: 50, oneTime: false, perEntity: true },

  // Organisateur actions
  EVENT_CREATED:      { xp: 20, oneTime: false },
  START_LIST_IMPORTED: { xp: 30, oneTime: false },
  HIGH_COVERAGE:      { xp: 50, oneTime: false, perEntity: true },

  // Tous rôles
  DAILY_LOGIN:        { xp: 5,  oneTime: false },
  STREAK_BONUS:       { xp: 10, oneTime: false },
};

// Leaderboard categories to increment per action
export const ACTION_LEADERBOARD_CATEGORIES: Partial<Record<XpActionType, string>> = {
  PHOTO_PURCHASE: "photos_bought",
  PHOTO_SOLD: "photos_sold",
  PHOTO_UPLOADED: "photos_uploaded",
  EVENT_PUBLISHED: "events",
  EVENT_CREATED: "events",
  EVENT_FAVORITE: "events_followed",
};
