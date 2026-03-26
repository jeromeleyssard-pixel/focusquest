import { describe, it, expect, beforeEach } from 'vitest';
import { hashPseudo } from '../../src/utils/localStorage';
import { runMigrations } from '../../src/utils/dataMigration';

describe('localStorage utils', () => {
  describe('hashPseudo', () => {
    it('returns 8-char hex string', () => {
      const h = hashPseudo('Test');
      expect(h).toMatch(/^[0-9a-f]{8}$/);
    });

    it('is deterministic', () => {
      expect(hashPseudo('Léo')).toBe(hashPseudo('Léo'));
    });

    it('differs for different inputs', () => {
      expect(hashPseudo('A')).not.toBe(hashPseudo('B'));
    });
  });

  describe('dataMigration', () => {
    it('normalizes old accuracy values > 1 to 0-1 scale', () => {
      const profiles = [
        {
          id: '1',
          pseudo: 'Test',
          avatar: 0,
          colorTheme: 'blue',
          version: 'standard',
          createdMonth: '2026-01',
          currentLevels: { gonogo: 1, cpt: 1, oneback: 1, nback: 1, stopsignal: 1, dccs: 1, taskswitch: 1 },
          badges: [],
          sessions: [
            { month: '2026-03', moduleId: 'cpt', level: 3, accuracy: 12.5, durationSeconds: 300 },
            { month: '2026-04', moduleId: 'gonogo', level: 4, accuracy: 0.8, durationSeconds: 300 },
          ],
        },
      ];

      const migrated = runMigrations(profiles);
      expect(migrated[0].sessions[0].accuracy).toBeCloseTo(0.125);
      expect(migrated[0].sessions[1].accuracy).toBeCloseTo(0.8);
    });
  });
});
