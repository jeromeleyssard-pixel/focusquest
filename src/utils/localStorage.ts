import type { PlayerProfile } from '../types/profile';

const PROFILES_KEY = 'focusquest_profiles';
const MAX_PROFILES = 3;

export function loadProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
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
