import { describe, it, expect } from 'vitest';
import type { ModuleId } from '../types/profile';
import { getInstructionBundle } from './moduleCopy';

const ALL_MODULES: ModuleId[] = [
  'gonogo',
  'oneback',
  'dccs',
  'cpt',
  'nback',
  'stopsignal',
  'taskswitch',
];

describe('moduleCopy', () => {
  it('chaque module a titre, narrative, 3 étapes et contrôles', () => {
    for (const id of ALL_MODULES) {
      const j = getInstructionBundle(id, 'junior');
      const s = getInstructionBundle(id, 'standard');
      for (const b of [j, s]) {
        expect(b.title.length).toBeGreaterThan(0);
        expect(b.narrative.length).toBeGreaterThan(0);
        expect(b.steps.length).toBe(3);
        b.steps.forEach((step) => expect(step.length).toBeGreaterThan(0));
        expect(b.controlsHint.length).toBeGreaterThan(0);
      }
    }
  });
});
