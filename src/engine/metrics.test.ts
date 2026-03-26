import { describe, it, expect } from 'vitest';
import { computeSSRT, computeSwitchCost } from './metrics';

describe('engine/metrics', () => {
  it('computeSSRT returns expected value', () => {
    const goRT = [300, 400, 500, 600];
    const ssRatio = 0.25; // nthPercentile = floor(0.25 * 4) = 1 => 400
    const ssd = 200;
    expect(computeSSRT(goRT, ssRatio, ssd)).toBe(200);
  });

  it('computeSwitchCost returns mean difference', () => {
    const switchTrialsRT = [500, 600];
    const repeatTrialsRT = [450, 480];
    // mean switch = 550, mean repeat = 465 => 85
    expect(computeSwitchCost(switchTrialsRT, repeatTrialsRT)).toBe(85);
  });
});

