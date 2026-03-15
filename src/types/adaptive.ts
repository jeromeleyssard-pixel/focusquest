export interface StaircaseConfig {
  mode: '1-down-1-up' | '2-down-1-up';
  targetAccuracy: number;
  stepSize: number;
  minLevel: number;
  maxLevel: number;
  initialLevel: number;
}

export interface StaircaseState {
  currentLevel: number;
  consecutiveCorrect: number;
  history: { level: number; correct: boolean }[];
}

export interface QuestState {
  threshold: number;
  sd: number;
  beta: number;
  trials: number;
}
