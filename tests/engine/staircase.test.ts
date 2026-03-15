import { describe, it, expect } from 'vitest';
import {
  createStaircase,
  updateStaircase,
  getRecentAccuracy,
} from '../../src/engine/staircase';
import type { StaircaseConfig } from '../../src/types/adaptive';

describe('Staircase 2-down/1-up', () => {
  it('monte après 2 réponses correctes consécutives', () => {
    const cfg: StaircaseConfig = {
      mode: '2-down-1-up',
      targetAccuracy: 0.75,
      stepSize: 1,
      minLevel: 1,
      maxLevel: 10,
      initialLevel: 3,
    };
    let s = createStaircase(cfg);
    s = updateStaircase(s, true, cfg);
    expect(s.currentLevel).toBe(3);
    s = updateStaircase(s, true, cfg);
    expect(s.currentLevel).toBe(4);
  });

  it('descend immédiatement après une erreur', () => {
    const cfg: StaircaseConfig = {
      mode: '2-down-1-up',
      targetAccuracy: 0.75,
      stepSize: 1,
      minLevel: 1,
      maxLevel: 10,
      initialLevel: 5,
    };
    let s = createStaircase(cfg);
    s = updateStaircase(s, false, cfg);
    expect(s.currentLevel).toBe(4);
  });

  it('ne descend pas sous minLevel', () => {
    const cfg: StaircaseConfig = {
      mode: '1-down-1-up',
      targetAccuracy: 0.65,
      stepSize: 1,
      minLevel: 1,
      maxLevel: 10,
      initialLevel: 1,
    };
    let s = createStaircase(cfg);
    s = updateStaircase(s, false, cfg);
    expect(s.currentLevel).toBe(1);
  });
});

describe('getRecentAccuracy', () => {
  it('returns 0.5 when history is empty', () => {
    const s = createStaircase({
      mode: '1-down-1-up',
      targetAccuracy: 0.65,
      stepSize: 1,
      minLevel: 1,
      maxLevel: 10,
      initialLevel: 1,
    });
    expect(getRecentAccuracy(s)).toBe(0.5);
  });
});
