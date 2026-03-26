import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig, StaircaseState } from '../../types/adaptive';
import type {
  TaskSwitchResponse,
  TaskSwitchRule,
  TaskSwitchTrialResult,
  TaskSwitchTrialSpec,
} from './types';
import { TrialController } from './types';

export interface TaskSwitchControllerConfig {
  totalTrials?: number; // informational
  staircase?: StaircaseConfig;
}

const DEFAULT_STAIRCASE: StaircaseConfig = {
  mode: '2-down-1-up',
  targetAccuracy: 0.75,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
};

/**
 * Renderer-agnostic Task-Switch controller.
 * Logic matches the existing jsPsych `buildTaskSwitchTimeline`.
 */
export class TaskSwitchController
  implements TrialController<TaskSwitchTrialSpec>
{
  private readonly staircaseConfig: StaircaseConfig;
  private staircaseState: StaircaseState;
  private currentRule: TaskSwitchRule;
  private trialIndex = 0;

  constructor(config: TaskSwitchControllerConfig = {}) {
    this.staircaseConfig = config.staircase ?? DEFAULT_STAIRCASE;
    this.staircaseState = createStaircase(this.staircaseConfig);
    this.currentRule = Math.random() < 0.5 ? 'parity' : 'magnitude';
  }

  nextTrial(): TaskSwitchTrialSpec {
    const level = this.staircaseState.currentLevel;

    const switchRate = Math.min(0.6, 0.1 + (level - 1) * 0.05);
    const didSwitch = this.trialIndex > 0 && Math.random() < switchRate;
    if (didSwitch) {
      this.currentRule = this.currentRule === 'parity' ? 'magnitude' : 'parity';
    }

    const value = 1 + Math.floor(Math.random() * 9);
    const isEven = value % 2 === 0;
    const isHigh = value > 5;

    const correctKey =
      this.currentRule === 'parity'
        ? isEven
          ? 'left'
          : 'right'
        : isHigh
          ? 'left'
          : 'right';

    const trialDurationMs = Math.max(1200, 2600 - (level - 1) * 130);

    const spec: TaskSwitchTrialSpec = {
      kind: 'taskswitch',
      rule: this.currentRule,
      value,
      didSwitch,
      correctKey,
      difficultyLevel: level,
      responseEndsTrial: false,
      stimulusDurationMs: undefined,
      trialDurationMs,
    };

    this.trialIndex++;
    return spec;
  }

  submitResponse(
    spec: TaskSwitchTrialSpec,
    response: unknown,
    reactionTimeMs: number | null
  ) {
    const r = response as TaskSwitchResponse;
    const correct = r === spec.correctKey;
    const preLevel = spec.difficultyLevel;

    this.staircaseState = updateStaircase(
      this.staircaseState,
      correct,
      this.staircaseConfig
    );

    const result: TaskSwitchTrialResult = {
      kind: 'taskswitch',
      correct,
      reactionTimeMs: r === null ? 0 : reactionTimeMs ?? 0,
      difficultyLevel: preLevel,
      response: r,
    };

    return { result, difficultyLevel: preLevel };
  }
}

