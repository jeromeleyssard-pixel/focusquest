import type { PlayerProfile } from '../types/profile';
import { runMigrations } from './dataMigration';

const PROFILES_KEY = 'focusquest_profiles';
const MIGRATION_VERSION_KEY = 'focusquest_migration_v';
const CURRENT_MIGRATION_VERSION = 1;
const MAX_PROFILES = 3;

export function loadProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    let profiles = raw ? JSON.parse(raw) : [];
    
    // Run migrations if needed
    const migratedVersion = parseInt(localStorage.getItem(MIGRATION_VERSION_KEY) || '0', 10);
    if (migratedVersion < CURRENT_MIGRATION_VERSION) {
      profiles = runMigrations(profiles);
      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION.toString());
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    
    return profiles;
  } catch {
    return [];
  }
}

export function saveProfile(profile: PlayerProfile): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) profiles[idx] = profile;
  else if (profiles.length < MAX_PROFILES) profiles.push(profile);
  else profiles[0] = profile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function hashPseudo(pseudo: string): string {
  let h = 0;
  for (const c of pseudo) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h).toString(16).padStart(8, '0');
}
