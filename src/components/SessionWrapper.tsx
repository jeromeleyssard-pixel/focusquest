import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initJsPsych } from 'jspsych';
import { useProfileStore } from '../store/profileStore';
import type { ModuleId } from '../types/profile';
import { buildGoNoGoTimeline, GONOGO_JUNIOR_CONFIG } from '../paradigms/junior/gonogo';
import { buildCPTTimeline } from '../paradigms/standard/cpt';
import { buildOneBackTimeline } from '../paradigms/junior/oneback';
import { buildDCCSTimeline } from '../paradigms/junior/dccs';
import { buildNBackTimeline } from '../paradigms/standard/nback';
import { buildStopSignalTimeline } from '../paradigms/standard/stopsignal';
import { buildTaskSwitchTimeline } from '../paradigms/standard/taskswitch';
import { computeRTISV } from '../engine/metrics';
import { ModuleInstructions } from './junior/ModuleInstructions';
import { SnailTimer } from './junior/SnailTimer';
import { runPhaserScene } from '../hooks/usePhaserGame';
import type { AnyTrialResult } from '../game/trialControllers/types';
import { CPTScene } from '../game/scenes/standard/CPTScene';
import { NBackScene } from '../game/scenes/standard/NBackScene';
import { StopSignalScene } from '../game/scenes/standard/StopSignalScene';
import { TaskSwitchScene } from '../game/scenes/standard/TaskSwitchScene';

const JUNIOR_SESSION_MAX_SECONDS = 10 * 60;
const JUNIOR_PAUSE_INTERVAL_SECONDS = 3 * 60; // pause proposée toutes les 3 min
const STANDARD_SESSION_MAX_SECONDS = 20 * 60;
const STANDARD_PAUSE_INTERVAL_SECONDS = 5 * 60;

const MODULE_IDS: ModuleId[] = [
  'gonogo',
  'oneback',
  'dccs',
  'cpt',
  'nback',
  'stopsignal',
  'taskswitch',
];

const JUNIOR_MODULES: ModuleId[] = ['gonogo', 'oneback', 'dccs'];
const STANDARD_MODULES: ModuleId[] = ['cpt', 'nback', 'stopsignal', 'taskswitch'];

function buildTimelineForModule(
  moduleId: ModuleId,
  jsPsych: ReturnType<typeof initJsPsych>,
  initialLevel: number
): Record<string, unknown>[] {
  const stair = {
    mode: '2-down-1-up' as const,
    targetAccuracy: 0.75,
    stepSize: 1,
    minLevel: 1,
    maxLevel: 10,
    initialLevel,
  };

  switch (moduleId) {
    case 'gonogo':
      return buildGoNoGoTimeline(jsPsych, {
        ...GONOGO_JUNIOR_CONFIG,
        staircase: { ...GONOGO_JUNIOR_CONFIG.staircase, initialLevel },
      });
    case 'cpt':
      return buildCPTTimeline(jsPsych, { staircase: stair, totalTrials: 30 });
    case 'oneback':
      return buildOneBackTimeline(jsPsych, {});
    case 'dccs':
      return buildDCCSTimeline(jsPsych, {});
    case 'nback':
      return buildNBackTimeline(jsPsych, {});
    case 'stopsignal':
      return buildStopSignalTimeline(jsPsych, {});
    case 'taskswitch':
      return buildTaskSwitchTimeline(jsPsych, {});
    default:
      return [{ type: 'html-keyboard-response', stimulus: '<p>Module inconnu</p>', choices: [' '] } as unknown as Record<string, unknown>];
  }
}

export function SessionWrapper() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserParentIdRef = useRef(`fq-phaser-${Math.random().toString(36).slice(2)}`);
  const phaserAbortRef = useRef<AbortController | null>(null);
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const updateLevel = useProfileStore((s) => s.updateLevel);
  const addSession = useProfileStore((s) => s.addSession);
  const getJuniorSessionUsedSeconds = useProfileStore((s) => s.getJuniorSessionUsedSeconds);
  const addJuniorSessionUsedSeconds = useProfileStore((s) => s.addJuniorSessionUsedSeconds);
  const resetJuniorSessionUsed = useProfileStore((s) => s.resetJuniorSessionUsed);
  const getStandardSessionUsedSeconds = useProfileStore((s) => s.getStandardSessionUsedSeconds);
  const addStandardSessionUsedSeconds = useProfileStore((s) => s.addStandardSessionUsedSeconds);
  const resetStandardSessionUsed = useProfileStore((s) => s.resetStandardSessionUsed);

  const id = moduleId as ModuleId | undefined;
  const validId = id && MODULE_IDS.includes(id) ? id : 'gonogo';

  const wantsInstructions =
    activeProfile?.version === 'junior'
      ? JUNIOR_MODULES.includes(validId)
      : activeProfile?.version === 'standard'
        ? STANDARD_MODULES.includes(validId)
        : false;

  const [instructionsDone, setInstructionsDone] = useState(!wantsInstructions);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [restartCount, setRestartCount] = useState(0);
  const lastPauseAtRef = useRef(0);
  const lastSegmentSavedAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerPausedRef = useRef(false);
  const timelineEndedRef = useRef(false);
  const sessionRef = useRef<{
    jsPsych: ReturnType<typeof initJsPsych>;
    level: number;
    ended: boolean;
  } | null>(null);

  const isJunior = activeProfile?.version === 'junior';
  const isStandard = activeProfile?.version === 'standard';
  const isTimedVersion = isJunior || isStandard;

  const getSessionUsedSeconds = useCallback(() => {
    if (isJunior) return getJuniorSessionUsedSeconds();
    if (isStandard) return getStandardSessionUsedSeconds();
    return 0;
  }, [isJunior, isStandard, getJuniorSessionUsedSeconds, getStandardSessionUsedSeconds]);

  const addSessionUsedSeconds = useCallback(
    (seconds: number) => {
      if (isJunior) addJuniorSessionUsedSeconds(seconds);
      else if (isStandard) addStandardSessionUsedSeconds(seconds);
    },
    [isJunior, isStandard, addJuniorSessionUsedSeconds, addStandardSessionUsedSeconds]
  );

  const resetSessionUsed = useCallback(() => {
    if (isJunior) resetJuniorSessionUsed();
    else if (isStandard) resetStandardSessionUsed();
  }, [isJunior, isStandard, resetJuniorSessionUsed, resetStandardSessionUsed]);

  const sessionMaxSeconds = isJunior
    ? JUNIOR_SESSION_MAX_SECONDS
    : isStandard
      ? STANDARD_SESSION_MAX_SECONDS
      : 0;
  const pauseIntervalSeconds = isJunior
    ? JUNIOR_PAUSE_INTERVAL_SECONDS
    : isStandard
      ? STANDARD_PAUSE_INTERVAL_SECONDS
      : 0;

  const saveSegment = useCallback(
    (jsPsych: ReturnType<typeof initJsPsych>, level: number, segmentEndSeconds: number) => {
      const data = jsPsych.data.get();
      const values = (data.values() as { correct?: boolean; difficultyLevel?: number }[]) ?? [];
      const withLevel = values.filter((t) => t.difficultyLevel != null);
      const currentLevel =
        withLevel.length > 0
          ? (withLevel[withLevel.length - 1]?.difficultyLevel ?? level)
          : level;
      const correctCount = values.filter((t) => t.correct).length;
      const accuracy = values.length > 0 ? Math.round((correctCount / values.length) * 100) : 0;
      const segmentDuration = segmentEndSeconds - lastSegmentSavedAtRef.current;
      if (segmentDuration <= 0) return;
      lastSegmentSavedAtRef.current = segmentEndSeconds;
      updateLevel(validId, currentLevel);
      addSession({
        month: new Date().toISOString().slice(0, 7),
        moduleId: validId,
        level: currentLevel,
        accuracy,
        durationSeconds: segmentDuration,
      });
    },
    [validId, updateLevel, addSession]
  );

  const saveAndShowPause = useCallback(
    (jsPsych: ReturnType<typeof initJsPsych>, level: number) => {
      const thisGameSeconds = Math.round(jsPsych.getTotalTime() / 1000);
      addSessionUsedSeconds(thisGameSeconds);
      const durationSeconds = Math.min(thisGameSeconds, sessionMaxSeconds);
      if (lastSegmentSavedAtRef.current < durationSeconds) {
        saveSegment(jsPsych, level, durationSeconds);
      }
      if (getSessionUsedSeconds() >= sessionMaxSeconds) {
        resetSessionUsed();
      }
      timelineEndedRef.current = true;
      setShowPauseOverlay(true);
    },
    [
      addSessionUsedSeconds,
      getSessionUsedSeconds,
      resetSessionUsed,
      sessionMaxSeconds,
      saveSegment,
    ]
  );

  const finishAndNavigate = useCallback(
    (
      jsPsych: ReturnType<typeof initJsPsych>,
      level: number,
      useElapsed: boolean,
      options?: { skipNavigate?: boolean }
    ) => {
      if (sessionRef.current?.ended) return;
      sessionRef.current = sessionRef.current ? { ...sessionRef.current, ended: true } : null;
      const data = jsPsych.data.get();
      const values = (data.values() as { correct?: boolean; rt?: number; difficultyLevel?: number }[]) ?? [];
      const withLevel = values.filter((t) => t.difficultyLevel != null);
      const finalLevel =
        withLevel.length > 0
          ? (withLevel[withLevel.length - 1]?.difficultyLevel ?? level)
          : level;
      const correctCount = values.filter((t) => t.correct).length;
      const accuracy = values.length > 0 ? (correctCount / values.length) * 100 : 0;
      const rts = values.map((t) => t.rt).filter((r): r is number => typeof r === 'number');
      computeRTISV(rts);
      const thisGameSeconds = useElapsed
        ? elapsedRef.current
        : Math.round(jsPsych.getTotalTime() / 1000);
      if (isTimedVersion) {
        addSessionUsedSeconds(thisGameSeconds);
        const durationSeconds = Math.min(thisGameSeconds, sessionMaxSeconds);
        if (lastSegmentSavedAtRef.current < durationSeconds) {
          saveSegment(jsPsych, level, durationSeconds);
        }
        if (getSessionUsedSeconds() >= sessionMaxSeconds) {
          resetSessionUsed();
        }
      } else {
        const summary = {
          month: new Date().toISOString().slice(0, 7),
          moduleId: validId,
          level: finalLevel,
          accuracy: Math.round(accuracy),
          durationSeconds: thisGameSeconds,
        };
        updateLevel(validId, finalLevel);
        addSession(summary);
      }
      if (options?.skipNavigate) {
        saveAndShowPause(jsPsych, level);
        return;
      }
      navigate('/menu', { replace: true });
    },
    [
      validId,
      updateLevel,
      addSession,
      navigate,
      isTimedVersion,
      saveSegment,
      addSessionUsedSeconds,
      getSessionUsedSeconds,
      resetSessionUsed,
      sessionMaxSeconds,
      isStandard,
    ]
  );

  useEffect(() => {
    if (!wantsInstructions || instructionsDone) {
      const t = setTimeout(() => setShowDisclaimer(false), 4000);
      return () => clearTimeout(t);
    }
  }, [wantsInstructions, instructionsDone]);

  useEffect(() => {
    if (wantsInstructions && !instructionsDone) return;
    if (!containerRef.current || !activeProfile) return;
    void restartCount;

    if (isStandard && getSessionUsedSeconds() >= sessionMaxSeconds) {
      window.alert('Temps maximum atteint pour cette session Standard. Reviens plus tard.');
      navigate('/menu', { replace: true });
      return;
    }

    const level = activeProfile.currentLevels[validId] ?? 1;

    const usePhaserRenderer = activeProfile.version === 'standard' && STANDARD_MODULES.includes(validId);

    if (usePhaserRenderer) {
      const sceneClass = (() => {
        switch (validId) {
          case 'cpt':
            return CPTScene;
          case 'nback':
            return NBackScene;
          case 'stopsignal':
            return StopSignalScene;
          case 'taskswitch':
            return TaskSwitchScene;
          default:
            return CPTScene;
        }
      })();

      const abort = new AbortController();
      phaserAbortRef.current = abort;
      const startAt = Date.now();

      void (async () => {
        try {
          const results = await runPhaserScene<AnyTrialResult[]>(
            sceneClass,
            phaserParentIdRef.current,
            { signal: abort.signal }
          );

          if (abort.signal.aborted) return;

          const correctCount = results.filter((r) => r.correct).length;
          const accuracyPct = results.length > 0 ? (correctCount / results.length) * 100 : 0;
          const finalLevel = results.at(-1)?.difficultyLevel ?? level;
          const durationSeconds = Math.max(1, Math.round((Date.now() - startAt) / 1000));

          updateLevel(validId, finalLevel);
          addSession({
            month: new Date().toISOString().slice(0, 7),
            moduleId: validId,
            level: finalLevel,
            accuracy: Math.round(accuracyPct),
            durationSeconds,
          });

          if (isTimedVersion) {
            addSessionUsedSeconds(durationSeconds);
            if (getSessionUsedSeconds() >= sessionMaxSeconds) {
              resetSessionUsed();
            }
          }

          navigate('/menu', { replace: true });
        } catch (e) {
          if (abort.signal.aborted) return;
          console.error('Phaser execution failed, fallback jsPsych:', e);

          const jsPsych = initJsPsych({
            display_element: containerRef.current!,
          });
          sessionRef.current = { jsPsych, level, ended: false };
          const timeline = buildTimelineForModule(validId, jsPsych, level);
          void jsPsych
            .run(timeline as Parameters<ReturnType<typeof initJsPsych>['run']>[0])
            .then(() => {
              if (sessionRef.current?.ended) return;
              finishAndNavigate(jsPsych, level, false);
            })
            .catch(() => navigate('/menu', { replace: true }));
        } finally {
          if (phaserAbortRef.current === abort) phaserAbortRef.current = null;
        }
      })();

      return () => {
        abort.abort();
      };
    }

    const jsPsych = initJsPsych({
      display_element: containerRef.current,
    });

    sessionRef.current = { jsPsych, level, ended: false };
    const timeline = buildTimelineForModule(validId, jsPsych, level);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isTimedVersion) {
      setElapsedSeconds(0);
      elapsedRef.current = 0;
      lastPauseAtRef.current = 0;
      lastSegmentSavedAtRef.current = 0;
      timerPausedRef.current = false;
      intervalId = setInterval(() => {
        if (timerPausedRef.current) return;
        const sec = elapsedRef.current + 1;
        elapsedRef.current = sec;
        setElapsedSeconds(sec);
        const totalUsed = getSessionUsedSeconds() + sec;
        if (totalUsed >= sessionMaxSeconds) {
          if (intervalId) clearInterval(intervalId);
          jsPsych.abortCurrentTimeline();
          finishAndNavigate(jsPsych, level, true);
          return;
        }
        const pauseMark =
          Math.floor(sec / pauseIntervalSeconds) * pauseIntervalSeconds;
        if (
          pauseMark >= pauseIntervalSeconds &&
          pauseMark > lastPauseAtRef.current
        ) {
          const ref = sessionRef.current;
          if (ref && !ref.ended) {
            saveSegment(ref.jsPsych, ref.level, pauseMark);
            lastPauseAtRef.current = pauseMark;
            timerPausedRef.current = true;
            setShowPauseOverlay(true);
          }
        }
      }, 1000);
    }

    jsPsych
      .run(timeline as Parameters<ReturnType<typeof initJsPsych>['run']>[0])
      .then(() => {
        if (intervalId) clearInterval(intervalId);
        if (sessionRef.current?.ended) return;
        if (isTimedVersion) {
          saveAndShowPause(jsPsych, level);
        } else {
          finishAndNavigate(jsPsych, level, false);
        }
      })
      .catch(() => {
        if (intervalId) clearInterval(intervalId);
        navigate('/menu', { replace: true });
      });

    return () => {
      if (intervalId) clearInterval(intervalId);
      jsPsych.abortCurrentTimeline();
      sessionRef.current = null;
    };
  }, [
    validId,
    activeProfile,
    updateLevel,
    addSession,
    navigate,
    wantsInstructions,
    instructionsDone,
    isJunior,
    isStandard,
    isTimedVersion,
    finishAndNavigate,
    saveSegment,
    getSessionUsedSeconds,
    sessionMaxSeconds,
    pauseIntervalSeconds,
  ]);

  const handleQuit = () => {
    if (phaserAbortRef.current) {
      phaserAbortRef.current.abort();
      phaserAbortRef.current = null;
      navigate('/menu', { replace: true });
      return;
    }
    if (timelineEndedRef.current) {
      timelineEndedRef.current = false;
      navigate('/menu', { replace: true });
      return;
    }
    if (sessionRef.current && !sessionRef.current.ended) {
      sessionRef.current.jsPsych.abortCurrentTimeline();
      finishAndNavigate(sessionRef.current.jsPsych, sessionRef.current.level, true);
    }
  };

  const handlePauseContinuer = () => {
    if (timelineEndedRef.current) {
      timelineEndedRef.current = false;
      setShowPauseOverlay(false);
      setRestartCount((c) => c + 1);
      return;
    }
    timerPausedRef.current = false;
    setShowPauseOverlay(false);
  };


  const disclaimerHeight = 44;

  if (wantsInstructions && !instructionsDone) {
    return (
      <div
        className="session-layout"
        style={{
          padding: 24,
          paddingTop: showDisclaimer ? disclaimerHeight + 24 : 24,
          minHeight: '100vh',
        }}
      >
        {showDisclaimer && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 999,
              padding: '10px 16px',
              background: 'var(--fq-surface)',
              borderBottom: '1px solid var(--fq-text-muted)',
              fontSize: 12,
              color: 'var(--fq-text-muted)',
              textAlign: 'center',
            }}
          >
            FocusQuest — outil d&apos;entraînement, pas un dispositif médical.
          </div>
        )}
        <ModuleInstructions moduleId={validId} onStart={() => setInstructionsDone(true)} />
      </div>
    );
  }

  return (
    <div
      className={`session-layout${showDisclaimer ? ' has-disclaimer' : ''}`}
      style={{
        padding: 24,
        paddingTop: showDisclaimer ? disclaimerHeight + 24 : 24,
        minHeight: '100vh',
      }}
    >
      {showDisclaimer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            padding: '10px 16px',
            background: 'var(--fq-surface)',
            borderBottom: '1px solid var(--fq-text-muted)',
            fontSize: 12,
            color: 'var(--fq-text-muted)',
            textAlign: 'center',
          }}
        >
          FocusQuest — outil d&apos;entraînement, pas un dispositif médical.
        </div>
      )}
      {showPauseOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--fq-bg)',
              padding: 24,
              borderRadius: 12,
              textAlign: 'center',
              maxWidth: 320,
            }}
            className="fq-animate-in"
          >
            <p style={{ fontSize: 18, margin: '0 0 16px', color: 'var(--fq-text)' }}>
              Pause — Veux-tu continuer ?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handlePauseContinuer}
                style={{
                  padding: '10px 20px',
                  background: 'var(--fq-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPauseOverlay(false);
                  handleQuit();
                }}
                style={{
                  padding: '10px 20px',
                  background: 'var(--fq-surface)',
                  color: 'var(--fq-text)',
                  border: '1px solid var(--fq-text-muted)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                Retour au menu
              </button>
            </div>
          </div>
        </div>
      )}
      {isTimedVersion && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
          {isJunior ? (
            <SnailTimer
              elapsedSeconds={elapsedSeconds}
              sessionUsedSeconds={getSessionUsedSeconds()}
              maxSeconds={sessionMaxSeconds}
              pauseIntervalSeconds={pauseIntervalSeconds}
            />
          ) : (
            <div style={{ fontSize: 14, color: 'var(--fq-text-muted)' }}>
              Session Standard: {Math.min(sessionMaxSeconds, getSessionUsedSeconds() + elapsedSeconds)} / {sessionMaxSeconds}s
            </div>
          )}
          <button
            type="button"
            onClick={handleQuit}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              background: 'var(--fq-surface)',
              color: 'var(--fq-text)',
              border: '1px solid var(--fq-text-muted)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Arrêter
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        id={phaserParentIdRef.current}
        className="jspsych-container"
        style={{ minHeight: '60vh', flex: 1 }}
      />
    </div>
  );
}
