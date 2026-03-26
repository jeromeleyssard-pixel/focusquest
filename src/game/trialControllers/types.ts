export type TrialKind = 'stopsignal' | 'nback' | 'taskswitch';

export interface TrialSpecBase {
  kind: TrialKind;
  difficultyLevel: number;
  /**
   * Whether the trial should end immediately after a (first) valid response.
   * Used to emulate jsPsych `response_ends_trial`.
   */
  responseEndsTrial: boolean;
  /**
   * The total time the trial can run (ms), used by renderers that need to
   * schedule an auto-advance even when no response happens.
   */
  trialDurationMs: number;
  /**
   * When stimulus is visible for renderers that need a separation between
   * stimulus duration and trial duration (ms).
   */
  stimulusDurationMs?: number;
}

export type StopSignalResponse = 'left' | 'right' | null;

export interface StopSignalTrialSpec extends TrialSpecBase {
  kind: 'stopsignal';
  isStopTrial: boolean;
  goLeft: boolean;
  ssdMs: number;
}

export type NBackResponse = boolean; // true if participant pressed the response key

export interface NBackTrialSpec extends TrialSpecBase {
  kind: 'nback';
  n: number;
  isMatch: boolean;
  letter: string;
}

export type TaskSwitchResponse = 'left' | 'right' | null;

export type TaskSwitchRule = 'parity' | 'magnitude';

export interface TaskSwitchTrialSpec extends TrialSpecBase {
  kind: 'taskswitch';
  rule: TaskSwitchRule;
  value: number;
  didSwitch: boolean;
  correctKey: 'left' | 'right';
}

export interface TrialResultBase {
  correct: boolean;
  reactionTimeMs: number;
  difficultyLevel: number;
}

export interface StopSignalTrialResult extends TrialResultBase {
  kind: 'stopsignal';
  response: StopSignalResponse;
}

export interface NBackTrialResult extends TrialResultBase {
  kind: 'nback';
  response: NBackResponse;
}

export interface TaskSwitchTrialResult extends TrialResultBase {
  kind: 'taskswitch';
  response: TaskSwitchResponse;
}

export type AnyTrialResult = StopSignalTrialResult | NBackTrialResult | TaskSwitchTrialResult;

export interface TrialController<TSpec> {
  nextTrial(): TSpec;
  submitResponse(spec: TSpec, response: unknown, reactionTimeMs: number | null): {
    result: AnyTrialResult;
    // Updated controller state is internal, but we expose the updated level for convenience.
    difficultyLevel: number;
  };
}

