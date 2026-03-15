import type { StaircaseConfig, StaircaseState } from '../types/adaptive';

export function createStaircase(config: StaircaseConfig): StaircaseState {
  return {
    currentLevel: config.initialLevel,
    consecutiveCorrect: 0,
    history: [],
  };
}

export function updateStaircase(
  state: StaircaseState,
  correct: boolean,
  config: StaircaseConfig
): StaircaseState {
  const history = [...state.history, { level: state.currentLevel, correct }];
  if (correct) {
    const consecutive = state.consecutiveCorrect + 1;
    const threshold = config.mode === '2-down-1-up' ? 2 : 1;
    if (consecutive >= threshold) {
      return {
        currentLevel: Math.min(
          state.currentLevel + config.stepSize,
          config.maxLevel
        ),
        consecutiveCorrect: 0,
        history,
      };
    }
    return { ...state, consecutiveCorrect: consecutive, history };
  }
  return {
    currentLevel: Math.max(
      state.currentLevel - config.stepSize,
      config.minLevel
    ),
    consecutiveCorrect: 0,
    history,
  };
}

export function getRecentAccuracy(state: StaircaseState, n = 20): number {
  const recent = state.history.slice(-n);
  if (recent.length === 0) return 0.5;
  return recent.filter((t) => t.correct).length / recent.length;
}
