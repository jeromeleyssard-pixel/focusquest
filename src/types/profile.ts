import type { SessionSummary } from './session';

export type AppVersion = 'junior' | 'standard';
export type Avatar = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PlayerProfile {
  id: string;
  pseudo: string;
  avatar: Avatar;
  colorTheme: string;
  version: AppVersion;
  createdMonth: string;
  currentLevels: Record<ModuleId, number>;
  badges: BadgeId[];
  sessions: SessionSummary[];
}

export type ModuleId =
  | 'gonogo'
  | 'oneback'
  | 'dccs'
  | 'cpt'
  | 'nback'
  | 'stopsignal'
  | 'taskswitch';

export type BadgeId =
  | 'first_session'
  | 'level_5'
  | 'streak_5'
  | 'module_mastered'
  | 'week_streak';
