import { useCallback } from 'react';
import type { ModuleId } from '../types/profile';
import type { SessionData, TrialResult } from '../types/session';
import { useProfileStore } from '../store/profileStore';
import { useTaskManager } from '../store/taskManager';
import { GoNoGoScene } from '../game/scenes/junior/GoNoGoScene';
import { CPTScene } from '../game/scenes/standard/CPTScene';
import { runPhaserScene } from '../hooks/usePhaserGame';

/**
 * Enhanced session runner that supports both jsPsych and Phaser
 */
export function useEnhancedSessionRunner() {
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const updateLevel = useProfileStore((s) => s.updateLevel);
  const addSession = useProfileStore((s) => s.addSession);
  const initSession = useTaskManager((s) => s.initSession);
  const completeSession = useTaskManager((s) => s.completeSession);

  const runPhaserExperiment = useCallback(
    async (
      moduleId: ModuleId,
      initialLevel: number,
      parentId: string
    ): Promise<SessionData | null> => {
      if (!activeProfile) return null;

      initSession(moduleId, activeProfile.version);

      try {
        let sceneClass: typeof import('phaser').Scene;
        let config: any;

        if (moduleId === 'gonogo') {
          sceneClass = GoNoGoScene;
          config = {
            totalTrials: 60,
            staircase: {
              mode: '1-down-1-up',
              targetAccuracy: 0.65,
              stepSize: 1,
              minLevel: 1,
              maxLevel: 10,
              initialLevel,
            },
            goRatio: 0.7,
            stimulusDuration: 800,
            responseWindow: 3000,
          };
        } else if (moduleId === 'cpt') {
          sceneClass = CPTScene;
          config = {
            totalTrials: 72,
            staircase: {
              mode: '2-down-1-up',
              targetAccuracy: 0.75,
              stepSize: 1,
              minLevel: 1,
              maxLevel: 10,
              initialLevel,
            },
          };
        } else {
          throw new Error(`Phaser scene not implemented for module: ${moduleId}`);
        }

        const results = (await runPhaserScene(sceneClass, parentId)) as Array<{
          stimulusType?: string;
          stimulus?: string;
          response: string | null;
          reactionTimeMs: number;
          correct: boolean;
          difficultyLevel: number;
        }>;

        // Process results
        const sessionStartTime = Date.now();
        const trials: TrialResult[] = results.map(
          (r, i: number) => ({
            trialIndex: i,
            stimulusType: r.stimulusType || r.stimulus || 'unknown',
            response: r.response,
            reactionTimeMs: r.reactionTimeMs,
            correct: r.correct,
            difficultyLevel: r.difficultyLevel,
          })
        );

        const correctTrials = trials.filter((t) => t.correct).length;
        const accuracy = trials.length > 0 ? correctTrials / trials.length : 0;
        const meanRT =
          trials.length > 0
            ? trials.reduce((sum, t) => sum + t.reactionTimeMs, 0) /
              trials.length
            : 0;

        // Calculate RT ISV (variability)
        const rtisv = calculateRTISV(trials);

        // Get final level from last trial
        const finalLevel = trials[trials.length - 1]?.difficultyLevel || initialLevel;

        const sessionData: SessionData = {
          moduleId,
          version: activeProfile.version,
          month: new Date().toISOString().slice(0, 7),
          durationSeconds: Math.round((Date.now() - sessionStartTime) / 1000),
          trials,
          accuracy,
          meanRT,
          rtisv,
          finalLevel,
        };

        // Update profile
        updateLevel(moduleId, finalLevel);
        const month = new Date().toISOString().slice(0, 7);
        const sessionSummary = {
          month,
          moduleId,
          level: finalLevel,
          accuracy,
          durationSeconds: sessionData.durationSeconds,
        };
        addSession(sessionSummary);

        completeSession();

        return sessionData;
      } catch (error) {
        console.error('Phaser experiment error:', error);
        return null;
      }
    },
    [activeProfile, initSession, completeSession, updateLevel, addSession]
  );

  return {
    runPhaserExperiment,
  };
}

/**
 * Calculate reaction time intra-subject variability
 */
function calculateRTISV(trials: TrialResult[]): number {
  const rts = trials
    .filter((t) => t.correct)
    .map((t) => t.reactionTimeMs);

  if (rts.length < 2) return 0;

  const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
  const variance =
    rts.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / rts.length;
  const stdDev = Math.sqrt(variance);

  // RTISV = SD / Mean (variability index)
  return mean > 0 ? stdDev / mean : 0;
}
