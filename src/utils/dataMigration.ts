/**
 * Data migration utilities to fix corrupted session data
 */
import type { PlayerProfile } from '../types/profile';

/**
 * Fix accuracy values that were stored with wrong scale (multiplied by 100)
 * E.g., 12.5 (wrong) → 0.125 (correct)
 */
export function migrateAccuracyValues(profiles: PlayerProfile[]): PlayerProfile[] {
  return profiles.map((profile) => ({
    ...profile,
    sessions: profile.sessions.map((session) => {
      // If accuracy > 1, it was pre-multiplied by 100
      if (session.accuracy > 1) {
        return {
          ...session,
          accuracy: session.accuracy / 100,
        };
      }
      return session;
    }),
  }));
}

/**
 * Run all necessary migrations on profiles
 */
export function runMigrations(profiles: PlayerProfile[]): PlayerProfile[] {
  let migrated = profiles;
  
  // Migration 1: Fix accuracy scale
  migrated = migrateAccuracyValues(migrated);
  
  return migrated;
}
