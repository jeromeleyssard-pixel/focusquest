import { describe, it, expect } from 'vitest';
import { StopSignalController } from './stopSignalController';
import { NBackController } from './nBackController';
import { TaskSwitchController } from './taskSwitchController';
import type { StopSignalTrialSpec, NBackTrialSpec, TaskSwitchTrialSpec } from './types';

describe('trial controllers (equivalence rules)', () => {
  it('StopSignalController: correctness rules + difficultyLevel pre-update', () => {
    const controller = new StopSignalController({});

    const goLeftSpec: StopSignalTrialSpec = {
      kind: 'stopsignal',
      isStopTrial: false,
      goLeft: true,
      ssdMs: 0,
      difficultyLevel: 3,
      responseEndsTrial: true,
      trialDurationMs: 2000,
    };

    const res1 = controller.submitResponse(goLeftSpec, 'left', 123);
    expect(res1.result.correct).toBe(true);
    expect(res1.result.reactionTimeMs).toBe(123);
    expect(res1.result.difficultyLevel).toBe(3);

    const res2 = controller.submitResponse(goLeftSpec, 'right', 456);
    expect(res2.result.correct).toBe(false);
    expect(res2.result.reactionTimeMs).toBe(456);
    expect(res2.result.difficultyLevel).toBe(3);

    const stopSpec: StopSignalTrialSpec = {
      ...goLeftSpec,
      isStopTrial: true,
      goLeft: true,
      responseEndsTrial: false,
    };

    const res3 = controller.submitResponse(stopSpec, null, null);
    expect(res3.result.correct).toBe(true);
    expect(res3.result.reactionTimeMs).toBe(0);
    expect(res3.result.difficultyLevel).toBe(3);

    const res4 = controller.submitResponse(stopSpec, 'left', 100);
    expect(res4.result.correct).toBe(false);
    expect(res4.result.reactionTimeMs).toBe(100);
    expect(res4.result.difficultyLevel).toBe(3);
  });

  it('NBackController: correctness rules + reactionTimeMs mapping', () => {
    const controller = new NBackController({});

    const specMatch: NBackTrialSpec = {
      kind: 'nback',
      n: 2,
      isMatch: true,
      letter: 'A',
      difficultyLevel: 2,
      responseEndsTrial: false,
      stimulusDurationMs: 1200,
      trialDurationMs: 2200,
    };

    const res1 = controller.submitResponse(specMatch, true, 150);
    expect(res1.result.correct).toBe(true);
    expect(res1.result.reactionTimeMs).toBe(150);
    expect(res1.result.difficultyLevel).toBe(2);

    const res2 = controller.submitResponse(specMatch, false, 150);
    expect(res2.result.correct).toBe(false);
    expect(res2.result.reactionTimeMs).toBe(0);

    const specNoMatch: NBackTrialSpec = { ...specMatch, isMatch: false };

    const res3 = controller.submitResponse(specNoMatch, false, 300);
    expect(res3.result.correct).toBe(true);
    expect(res3.result.reactionTimeMs).toBe(0);

    const res4 = controller.submitResponse(specNoMatch, true, 300);
    expect(res4.result.correct).toBe(false);
    expect(res4.result.reactionTimeMs).toBe(300);
  });

  it('TaskSwitchController: correctness rules', () => {
    const controller = new TaskSwitchController({});

    const spec: TaskSwitchTrialSpec = {
      kind: 'taskswitch',
      rule: 'parity',
      value: 4,
      didSwitch: false,
      correctKey: 'left',
      difficultyLevel: 2,
      responseEndsTrial: false,
      trialDurationMs: 1600,
    };

    const res1 = controller.submitResponse(spec, 'left', 200);
    expect(res1.result.correct).toBe(true);
    expect(res1.result.reactionTimeMs).toBe(200);
    expect(res1.result.difficultyLevel).toBe(2);

    const res2 = controller.submitResponse(spec, 'right', 200);
    expect(res2.result.correct).toBe(false);
    expect(res2.result.reactionTimeMs).toBe(200);
    expect(res2.result.difficultyLevel).toBe(2);

    const res3 = controller.submitResponse(spec, null, null);
    expect(res3.result.correct).toBe(false);
    expect(res3.result.reactionTimeMs).toBe(0);
  });
});

