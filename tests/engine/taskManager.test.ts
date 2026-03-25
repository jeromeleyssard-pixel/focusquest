import { describe, it, expect } from 'vitest';
import { useTaskManager } from '../../src/store/taskManager';

/**
 * Integration tests for TaskManager store
 * Validates: Session initialization, block execution, trial tracking
 */
describe('TaskManager - Zustand Store', () => {
  describe('Store Structure', () => {
    it('should have required store methods', () => {
      const store = useTaskManager.getState();
      
      // Verify all required methods exist
      expect(typeof store.initSession).toBe('function');
      expect(typeof store.startBlock).toBe('function');
      expect(typeof store.addTrial).toBe('function');
      expect(typeof store.completeBlock).toBe('function');
      expect(typeof store.getSessionProgress).toBe('function');
      expect(typeof store.getEstimatedRemainingTime).toBe('function');
    });

    it('should initialize with null sessions', () => {
      const store = useTaskManager.getState();
      
      // Initial state should have no active session
      expect(store.currentSession).toBeNull();
      expect(store.currentBlock).toBeNull();
    });
  });

  describe('Session Initialization', () => {
    it('should create a session with correct moduleId', () => {
      const store = useTaskManager.getState();
      
      // Initialize session
      store.initSession('gonogo', 'junior');
      
      const updatedState = useTaskManager.getState();
      expect(updatedState.currentSession).toBeDefined();
      expect(updatedState.currentSession?.moduleId).toBe('gonogo');
      expect(updatedState.currentSession?.status).toBe('in-progress');
    });
  });

  describe('Store Methods', () => {
    it('should have expected return types for progress methods', () => {
      const store = useTaskManager.getState();
      
      const progress = store.getSessionProgress();
      const remaining = store.getEstimatedRemainingTime();
      
      // These should return numbers
      expect(typeof progress).toBe('number');
      expect(typeof remaining).toBe('number');
    });
  });

  describe('Trial Tracking', () => {
    it('should accept trial data without errors', () => {
      const store = useTaskManager.getState();
      
      store.initSession('gonogo', 'junior');
      store.startBlock(0);
      
      // Add a trial - should not throw
      expect(() => {
        store.addTrial({
          index: 0,
          stimulusType: 'go',
          response: 'tap',
          reactionTimeMs: 450,
          correct: true,
          difficultyLevel: 1,
        });
      }).not.toThrow();
    });
  });
});
