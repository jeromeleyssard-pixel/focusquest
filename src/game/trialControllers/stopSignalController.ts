import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig, StaircaseState } from '../../types/adaptive';
import type {
  StopSignalResponse,
  StopSignalTrialResult,
  StopSignalTrialSpec,
} from './types';
import { TrialController } from './types';

export interface StopSignalControllerConfig {
  totalTrials?: number; // only informational for renderers
  staircase?: StaircaseConfig;
}

const DEFAULT_STAIRCASE: StaircaseConfig = {
  mode: '1-down-1-up',
  targetAccuracy: 0.5,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 5,
};

/**
 * Renderer-agnostic Stop-Signal controller.
 * It encapsulates:
 * - trial generation (goLeft / isStopTrial)
 * - staircase update based on correctness
 * - correctness definition identical to jsPsych renderer
 */
export class StopSignalController
  implements
    TrialController<StopSignalTrialSpec>
{
  private readonly staircaseConfig: StaircaseConfig;
  private staircaseState: StaircaseState;
  private trialIndex = 0;

  constructor(config: StopSignalControllerConfig = {}) {
    this.staircaseConfig = config.staircase ?? DEFAULT_STAIRCASE;
    this.staircaseState = createStaircase(this.staircaseConfig);
  }

  nextTrial(): StopSignalTrialSpec {
    const goLeft = Math.random() < 0.5;
    const isStopTrial = Math.random() < 0.3;
    const level = this.staircaseState.currentLevel;
    const ssdMs = 120 + (level - 1) * 35;
    const responseEndsTrial = !isStopTrial; // go trials end on response

    const spec: StopSignalTrialSpec = {
      kind: 'stopsignal',
      isStopTrial,
      goLeft,
      ssdMs,
      difficultyLevel: level,
      responseEndsTrial,
      stimulusDurationMs: undefined,
      trialDurationMs: 2000,
    };

    this.trialIndex++;
    return spec;
  }

  submitResponse(
    spec: StopSignalTrialSpec,
    response: unknown,
    reactionTimeMs: number | null
  ) {
    const preLevel = spec.difficultyLevel;
    const r = response as StopSignalResponse;
    const isLeftPress = r === 'left';
    const isRightPress = r === 'right';

    const goCorrect =
      (!spec.isStopTrial && spec.goLeft && isLeftPress) ||
      (!spec.isStopTrial && !spec.goLeft && isRightPress);
    const stopCorrect = spec.isStopTrial && r === null;

    const correct = spec.isStopTrial ? stopCorrect : goCorrect;

    this.staircaseState = updateStaircase(
      this.staircaseState,
      correct,
      this.staircaseConfig
    );

    const result: StopSignalTrialResult = {
      kind: 'stopsignal',
      correct,
      reactionTimeMs: r === null ? 0 : reactionTimeMs ?? 0,
      difficultyLevel: preLevel,
      response: r,
    };

    return {
      result,
      difficultyLevel: preLevel,
    };
  }
}

