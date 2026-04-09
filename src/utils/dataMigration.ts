/**
 * Data migration utilities to fix / enrich stored session data.
 */
import type { PlayerProfile } from '../types/profile';

/**
 * Migration 1 — Fix accuracy stored as 0-100 instead of 0-1.
 */
export function migrateAccuracyValues(profiles: PlayerProfile[]): PlayerProfile[] {
  return profiles.map((profile) => ({
    ...profile,
    sessions: profile.sessions.map((session) => {
      if (session.accuracy > 1) {
        return { ...session, accuracy: session.accuracy / 100 };
      }
      return session;
    }),
  }));
}

/**
 * Migration 2 — Add missing fields introduced in v2:
 *   date   → falls back to "YYYY-MM-01" derived from existing month
 *   meanRT → defaults to 0
 *   rtisv  → defaults to 0
 */
export function migrateAddSessionFields(profiles: PlayerProfile[]): PlayerProfile[] {
  return profiles.map((profile) => ({
    ...profile,
    sessions: profile.sessions.map((session) => ({
      date: session.date ?? `${session.month}-01`,
      meanRT: session.meanRT ?? 0,
      rtisv: session.rtisv ?? 0,
      ...session,
    })),
  }));
}

/**
 * Run all migrations in order.
 */
export function runMigrations(profiles: PlayerProfile[]): PlayerProfile[] {
  let migrated = profiles;
  migrated = migrateAccuracyValues(migrated);   // v1
  migrated = migrateAddSessionFields(migrated); // v2
  return migrated;
}
