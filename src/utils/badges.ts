import type { PlayerProfile, BadgeId } from '../types/profile';
import type { SessionSummary } from '../types/session';

/** Days between two ISO date strings "YYYY-MM-DD". */
function daysBetween(a: string, b: string): number {
  return Math.abs(
    Math.floor(
      (new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

/**
 * Check all badge conditions and return any newly earned badge IDs.
 * Call this after addSession() — pass the updated profile.
 */
export function checkBadgeUnlocks(
  profile: PlayerProfile,
  _summary: { moduleId: string; level: number }
): BadgeId[] {
  const earned: BadgeId[] = [];
  const sessions = profile.sessions;

  // 🎉 first_session — première session jouée
  if (sessions.length >= 1 && !profile.badges.includes('first_session')) {
    earned.push('first_session');
  }

  // ⭐ level_5 — atteindre le niveau 5 dans n'importe quel module
  const maxLevel = Math.max(...Object.values(profile.currentLevels), 0);
  if (maxLevel >= 5 && !profile.badges.includes('level_5')) {
    earned.push('level_5');
  }

  // 🏆 module_mastered — atteindre le niveau 10 dans un module
  const masteredAny = Object.values(profile.currentLevels).some((l) => l >= 10);
  if (masteredAny && !profile.badges.includes('module_mastered')) {
    earned.push('module_mastered');
  }

  // 🔥 streak_5 — 5 sessions jouées sur 5 jours distincts (pas nécessairement consécutifs)
  if (!profile.badges.includes('streak_5')) {
    const distinctDays = new Set(
      sessions.map((s: SessionSummary) => s.date ?? s.month)
    );
    if (distinctDays.size >= 5) {
      earned.push('streak_5');
    }
  }

  // 📅 week_streak — au moins 5 sessions dans les 7 derniers jours calendaires
  if (!profile.badges.includes('week_streak')) {
    const today = new Date().toISOString().slice(0, 10);
    const last7 = sessions.filter(
      (s: SessionSummary) => daysBetween(s.date ?? s.month, today) <= 6
    );
    if (last7.length >= 5) {
      earned.push('week_streak');
    }
  }

  return earned;
}
