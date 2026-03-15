import type { QuestState } from '../types/adaptive';

export function createQuest(initialThreshold = 2): QuestState {
  return { threshold: initialThreshold, sd: 2, beta: 3.5, trials: 0 };
}

export function updateQuest(
  state: QuestState,
  _nPresented: number,
  correct: boolean
): QuestState {
  const lr = 0.3 / Math.sqrt(state.trials + 1);
  const delta = correct ? lr : -lr;
  const newThreshold = Math.max(1, Math.min(7, state.threshold + delta));
  return {
    ...state,
    threshold: newThreshold,
    sd: state.sd * 0.95,
    trials: state.trials + 1,
  };
}

export function getNextN(state: QuestState): number {
  return Math.max(1, Math.min(6, Math.round(state.threshold)));
}
