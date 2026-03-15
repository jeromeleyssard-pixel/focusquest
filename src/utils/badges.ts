import type { PlayerProfile, BadgeId } from '../types/profile';

/**
 * Vérifie les conditions de déblocage des badges (ex. première session, niveau 5, streak 5).
 */
export function checkBadgeUnlocks(
  profile: PlayerProfile,
  summary: { moduleId: string; level: number }
): BadgeId | null {
  if (profile.sessions.length === 1 && profile.badges.indexOf('first_session') < 0)
    return 'first_session';
  if (summary.level >= 5 && profile.badges.indexOf('level_5') < 0) return 'level_5';
  const recent = profile.sessions.slice(-5);
  if (
    recent.length === 5 &&
    profile.badges.indexOf('streak_5') < 0
  )
    return 'streak_5';
  return null;
}
