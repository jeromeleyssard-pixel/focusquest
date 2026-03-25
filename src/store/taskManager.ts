import { create } from 'zustand';
import type { ModuleId } from '../types/profile';

export type TaskStatus = 'pending' | 'in-progress' | 'paused' | 'completed' | 'failed';

export interface TrialTask {
  index: number;
  stimulusType: string;
  response: string | null;
  reactionTimeMs: number;
  correct: boolean;
  difficultyLevel: number;
  timestamp: number;
}

export interface BlockTask {
  blockIndex: number;
  moduleId: ModuleId;
  startTime: number;
  endTime?: number;
  trials: TrialTask[];
  status: TaskStatus;
  accuracy: number;
  meanRT: number;
}

export interface SessionTask {
  sessionId: string;
  moduleId: ModuleId;
  version: 'junior' | 'standard';
  startTime: number;
  endTime?: number;
  blocks: BlockTask[];
  status: TaskStatus;
  totalAccuracy: number;
  totalMeanRT: number;
  finalLevel: number;
  estimatedBreakTime?: number; // minutes until next break recommended
}

interface TaskManager {
  // Current session
  currentSession: SessionTask | null;
  currentBlock: BlockTask | null;

  // States
  sessionStatus: TaskStatus;
  blockStatus: TaskStatus;
  isBreakActive: Boolean;

  // Actions
  initSession: (moduleId: ModuleId, version: 'junior' | 'standard') => void;
  startBlock: (blockIndex: number) => void;
  addTrial: (trial: TrialTask) => void;
  completeBlock: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  cancelSession: () => void;
  requestBreak: () => void;
  resumeAfterBreak: () => void;

  // Getters
  getSessionProgress: () => number; // 0-100
  getCurrentBlockTrialCount: () => number;
  getSessionElapsedSeconds: () => number;
  getEstimatedRemainingTime: () => number; // in seconds
}

const JUNIOR_SESSION_MAX_SECONDS = 10 * 60;
const STANDARD_SESSION_MAX_SECONDS = 20 * 60;
const JUNIOR_BREAK_INTERVAL = 3 * 60; // 3 min
const STANDARD_BREAK_INTERVAL = 5 * 60; // 5 min

export const useTaskManager = create<TaskManager>((set, get) => ({
  currentSession: null,
  currentBlock: null,
  sessionStatus: 'pending',
  blockStatus: 'pending',
  isBreakActive: false,

  initSession: (moduleId: ModuleId, version: 'junior' | 'standard') => {
    const sessionId = `${moduleId}-${Date.now()}`;
    const newSession: SessionTask = {
      sessionId,
      moduleId,
      version,
      startTime: Date.now(),
      blocks: [],
      status: 'in-progress',
      totalAccuracy: 0,
      totalMeanRT: 0,
      finalLevel: 1,
    };
    set({
      currentSession: newSession,
      sessionStatus: 'in-progress',
    });
  },

  startBlock: (blockIndex: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const newBlock: BlockTask = {
      blockIndex,
      moduleId: currentSession.moduleId,
      startTime: Date.now(),
      trials: [],
      status: 'in-progress',
      accuracy: 0,
      meanRT: 0,
    };

    set({ currentBlock: newBlock, blockStatus: 'in-progress' });
  },

  addTrial: (trial: TrialTask) => {
    const { currentBlock } = get();
    if (!currentBlock) return;

    const updatedBlock = {
      ...currentBlock,
      trials: [...currentBlock.trials, trial],
    };

    // Recalculate block stats
    const correctTrials = updatedBlock.trials.filter((t) => t.correct).length;
    updatedBlock.accuracy =
      updatedBlock.trials.length > 0
        ? correctTrials / updatedBlock.trials.length
        : 0;

    const totalRT = updatedBlock.trials.reduce(
      (sum, t) => sum + (t.correct ? t.reactionTimeMs : 0),
      0
    );
    updatedBlock.meanRT =
      correctTrials > 0 ? totalRT / correctTrials : 0;

    set({ currentBlock: updatedBlock });
  },

  completeBlock: () => {
    const { currentBlock, currentSession } = get();
    if (!currentBlock || !currentSession) return;

    const completedBlock = { ...currentBlock, status: 'completed' as const, endTime: Date.now() };
    const updatedSession = {
      ...currentSession,
      blocks: [...currentSession.blocks, completedBlock],
    };

    // Update session stats
    const allTrials = updatedSession.blocks.flatMap((b) => b.trials);
    const correctTrials = allTrials.filter((t) => t.correct).length;
    updatedSession.totalAccuracy =
      allTrials.length > 0 ? correctTrials / allTrials.length : 0;

    const totalRT = allTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0);
    updatedSession.totalMeanRT = allTrials.length > 0 ? totalRT / allTrials.length : 0;

    // Update final level
    const lastLevel = allTrials[allTrials.length - 1]?.difficultyLevel || 1;
    updatedSession.finalLevel = lastLevel;

    set({
      currentSession: updatedSession,
      currentBlock: null,
      blockStatus: 'completed',
    });

    // Check if break is needed
    const elapsedSeconds = (Date.now() - updatedSession.startTime) / 1000;
    const breakInterval =
      currentSession.version === 'junior'
        ? JUNIOR_BREAK_INTERVAL
        : STANDARD_BREAK_INTERVAL;

    if (
      elapsedSeconds > 0 &&
      elapsedSeconds % breakInterval < 60 &&
      elapsedSeconds < (currentSession.version === 'junior'
        ? JUNIOR_SESSION_MAX_SECONDS
        : STANDARD_SESSION_MAX_SECONDS)
    ) {
      // Break recommended soon
      set({
        currentSession: {
          ...updatedSession,
          estimatedBreakTime: Math.ceil(
            (breakInterval - (elapsedSeconds % breakInterval)) / 60
          ),
        },
      });
    }
  },

  pauseSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      sessionStatus: 'paused',
      currentSession: { ...currentSession, status: 'paused' },
    });
  },

  resumeSession: () => {
    set({ sessionStatus: 'in-progress', isBreakActive: false });
  },

  completeSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      sessionStatus: 'completed',
      currentSession: {
        ...currentSession,
        status: 'completed',
        endTime: Date.now(),
      },
    });
  },

  cancelSession: () => {
    set({
      sessionStatus: 'failed',
      currentSession: null,
      currentBlock: null,
      isBreakActive: false,
    });
  },

  requestBreak: () => {
    set({ isBreakActive: true, sessionStatus: 'paused' });
  },

  resumeAfterBreak: () => {
    set({ isBreakActive: false, sessionStatus: 'in-progress' });
  },

  getSessionProgress: () => {
    const { currentSession } = get();
    if (!currentSession) return 0;

    // Estimate based on time elapsed
    const maxSeconds =
      currentSession.version === 'junior'
        ? JUNIOR_SESSION_MAX_SECONDS
        : STANDARD_SESSION_MAX_SECONDS;
    const elapsed = (Date.now() - currentSession.startTime) / 1000;
    return Math.min(100, Math.round((elapsed / maxSeconds) * 100));
  },

  getCurrentBlockTrialCount: () => {
    const { currentBlock } = get();
    return currentBlock?.trials.length || 0;
  },

  getSessionElapsedSeconds: () => {
    const { currentSession } = get();
    if (!currentSession) return 0;
    return (Date.now() - currentSession.startTime) / 1000;
  },

  getEstimatedRemainingTime: () => {
    const { currentSession } = get();
    if (!currentSession) return 0;

    const maxSeconds =
      currentSession.version === 'junior'
        ? JUNIOR_SESSION_MAX_SECONDS
        : STANDARD_SESSION_MAX_SECONDS;
    const elapsed = (Date.now() - currentSession.startTime) / 1000;
    return Math.max(0, maxSeconds - elapsed);
  },
}));
