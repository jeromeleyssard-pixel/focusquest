import { describe, it, expect, beforeEach } from 'vitest';
import { hashPseudo } from '../../src/utils/localStorage';

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
});
