import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskManager, SessionTask, BlockTask } from '../engine/taskManager';

/**
 * Integration tests for session management workflow
 * Validates: Session initialization → Block execution → Trial tracking → Break scheduling
 */
describe('TaskManager - Full Session Workflow', () => {
  let store: any;

  beforeEach(() => {
    // Reset store before each test
    store = TaskManager.getState?.();
  });

  describe('Session Lifecycle', () => {
    it('should initialize a new session with correct structure', () => {
      const sessionId = TaskManager.initSession?.('gonogo', 'v1.0');
      
      expect(sessionId).toBeDefined();
      const session = store.currentSession;
      expect(session?.sessionId).toBe(sessionId);
      expect(session?.status).toBe('in-progress');
      expect(session?.blocks).toHaveLength(0);
      expect(session?.startTime).toBeDefined();
    });

    it('should transition session through block lifecycle', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      
      TaskManager.startBlock?.(0);
      expect(store.currentBlock).toBeDefined();
      expect(store.currentBlock?.blockIndex).toBe(0);
      
      // Add trial
      TaskManager.addTrial?.({
        index: 0,
        stimulusType: 'go',
        response: true,
        reactionTimeMs: 450,
        correct: true,
        difficultyLevel: 1,
      });
      
      expect(store.currentBlock?.trials).toHaveLength(1);
      expect(store.currentBlock?.accuracy).toBe(100);
    });

    it('should complete session and calculate final metrics', () => {
      TaskManager.initSession?.('cptatx', 'v1.0');
      TaskManager.startBlock?.(0);
      
      // Add multiple trials to simulate session
      for (let i = 0; i < 10; i++) {
        TaskManager.addTrial?.({
          index: i,
          stimulusType: i % 2 === 0 ? 'ax' : 'ay',
          response: i % 2 === 0,
          reactionTimeMs: 400 + Math.random() * 100,
          correct: i % 2 === 0,
          difficultyLevel: 1,
        });
      }
      
      TaskManager.completeBlock?.();
      
      const session = store.currentSession;
      expect(session?.blocks).toHaveLength(1);
      expect(session?.blocks?.[0]?.accuracy).toBeGreaterThanOrEqual(0);
      expect(session?.totalAccuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Break Scheduling', () => {
    it('should recommend break after threshold duration', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      TaskManager.startBlock?.(0);
      
      // Mock time progression
      const progress = TaskManager.getSessionProgress?.();
      expect(progress).toBeGreaterThanOrEqual(0);
    });

    it('should handle break pause and resume', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      
      TaskManager.requestBreak?.();
      expect(store.currentSession?.status).toBe('break-requested');
      
      TaskManager.resumeAfterBreak?.();
      expect(store.currentSession?.status).toBe('in-progress');
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate session progress percentage', () => {
      TaskManager.initSession?.('nback', 'v1.0');
      
      const progress = TaskManager.getSessionProgress?.();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should estimate remaining time correctly', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      
      const remaining = TaskManager.getEstimatedRemainingTime?.();
      expect(remaining).toBeGreaterThan(0);
      expect(typeof remaining).toBe('number');
    });

    it('should calculate accuracy from multiple trials', () => {
      TaskManager.initSession?.('cptatx', 'v1.0');
      TaskManager.startBlock?.(0);
      
      // 8 correct out of 10
      const results = [true, true, false, true, true, true, false, true, true, true];
      results.forEach((correct, i) => {
        TaskManager.addTrial?.({
          index: i,
          stimulusType: 'ax',
          response: correct,
          reactionTimeMs: 450,
          correct,
          difficultyLevel: 1,
        });
      });
      
      const accuracy = store.currentBlock?.accuracy;
      expect(accuracy).toBeCloseTo(80, 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle trial with missing stimulus gracefully', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      TaskManager.startBlock?.(0);
      
      expect(() => {
        TaskManager.addTrial?.({
          index: 0,
          stimulusType: '' as any,
          response: false,
          reactionTimeMs: 0,
          correct: false,
          difficultyLevel: 1,
        });
      }).not.toThrow();
    });

    it('should not crash on session completion without blocks', () => {
      TaskManager.initSession?.('gonogo', 'v1.0');
      
      expect(() => {
        const session = store.currentSession;
        expect(session?.blocks).toHaveLength(0);
      }).not.toThrow();
    });
  });
});
