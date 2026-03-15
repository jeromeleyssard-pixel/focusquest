import { describe, it, expect } from 'vitest';
import { createQuest, updateQuest, getNextN } from '../../src/engine/quest';

describe('QUEST', () => {
  it('createQuest returns initial state', () => {
    const q = createQuest(2);
    expect(q.threshold).toBe(2);
    expect(q.trials).toBe(0);
  });

  it('getNextN returns integer in [1, 6]', () => {
    const q = createQuest(3);
    const n = getNextN(q);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(6);
    expect(Number.isInteger(n)).toBe(true);
  });

  it('updateQuest updates trials', () => {
    const q = createQuest(2);
    const q2 = updateQuest(q, 2, true);
    expect(q2.trials).toBe(1);
  });
});
