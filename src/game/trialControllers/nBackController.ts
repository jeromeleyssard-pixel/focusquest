import { createQuest, getNextN, updateQuest } from '../../engine/quest';
import type { QuestState } from '../../types/adaptive';
import type {
  NBackResponse,
  NBackTrialResult,
  NBackTrialSpec,
} from './types';
import { TrialController } from './types';

export interface NBackControllerConfig {
  totalTrials?: number; // only informational for renderers
  initialThreshold?: number;
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

/**
 * Renderer-agnostic N-Back controller.
 * It matches the existing jsPsych behavior (including the current match logic).
 */
export class NBackController implements TrialController<NBackTrialSpec> {
  private questState: QuestState;
  private sequence: string[] = [];
  private trialIndex = 0;

  constructor(config: NBackControllerConfig = {}) {
    this.questState = createQuest(config.initialThreshold ?? 2);
  }

  nextTrial(): NBackTrialSpec {
    const n = getNextN(this.questState);
    let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    const canMatch = this.trialIndex >= n;
    const isMatch = canMatch && Math.random() < 0.35;
    if (isMatch) letter = this.sequence[this.trialIndex - n];

    this.sequence.push(letter);

    const spec: NBackTrialSpec = {
      kind: 'nback',
      n,
      isMatch,
      letter,
      difficultyLevel: n,
      responseEndsTrial: false,
      stimulusDurationMs: 1200,
      trialDurationMs: 2200,
    };

    this.trialIndex++;
    return spec;
  }

  submitResponse(
    spec: NBackTrialSpec,
    response: unknown,
    reactionTimeMs: number | null
  ) {
    const responded = response as NBackResponse;
    const correct = (spec.isMatch && responded) || (!spec.isMatch && !responded);

    this.questState = updateQuest(this.questState, spec.n, correct);

    const result: NBackTrialResult = {
      kind: 'nback',
      correct,
      reactionTimeMs: responded ? reactionTimeMs ?? 0 : 0,
      difficultyLevel: spec.n,
      response: responded,
    };

    return { result, difficultyLevel: spec.n };
  }
}

