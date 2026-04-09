import type { AppVersion, ModuleId } from './profile';

export interface TrialResult {
  trialIndex: number;
  stimulusType: string;
  response: string | null;
  reactionTimeMs: number;
  correct: boolean;
  difficultyLevel: number;
}

export interface SessionData {
  moduleId: ModuleId;
  version: AppVersion;
  month: string;
  durationSeconds: number;
  trials: TrialResult[];
  accuracy: number;
  meanRT: number;
  rtisv: number;
  finalLevel: number;
}

export interface SessionSummary {
  /** ISO date string "YYYY-MM-DD" (ex. "2025-04-10") */
  date: string;
  /** Kept for backward compat — "YYYY-MM" */
  month: string;
  moduleId: ModuleId;
  level: number;
  /** Fraction 0–1 */
  accuracy: number;
  durationSeconds: number;
  /** Mean reaction time (ms) on correct trials */
  meanRT: number;
  /** Reaction-time intra-subject variability (SD of correct RTs) */
  rtisv: number;
}
