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
  month: string;
  moduleId: ModuleId;
  level: number;
  accuracy: number;
  durationSeconds: number;
}
