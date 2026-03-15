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

const JUNIOR_SESSION_MAX_SECONDS = 10 * 60;
const JUNIOR_PAUSE_INTERVAL_SECONDS = 3 * 60; // pause proposée toutes les 3 min

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
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const updateLevel = useProfileStore((s) => s.updateLevel);
  const addSession = useProfileStore((s) => s.addSession);
  const getJuniorSessionUsedSeconds = useProfileStore((s) => s.getJuniorSessionUsedSeconds);
  const addJuniorSessionUsedSeconds = useProfileStore((s) => s.addJuniorSessionUsedSeconds);
  const resetJuniorSessionUsed = useProfileStore((s) => s.resetJuniorSessionUsed);

  const id = moduleId as ModuleId | undefined;
  const validId = id && MODULE_IDS.includes(id) ? id : 'gonogo';

  const isJuniorWithInstructions =
    activeProfile?.version === 'junior' && JUNIOR_MODULES.includes(validId);
  const [instructionsDone, setInstructionsDone] = useState(!isJuniorWithInstructions);
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
      addJuniorSessionUsedSeconds(thisGameSeconds);
      const durationSeconds = Math.min(thisGameSeconds, JUNIOR_SESSION_MAX_SECONDS);
      if (lastSegmentSavedAtRef.current < durationSeconds) {
        saveSegment(jsPsych, level, durationSeconds);
      }
      if (getJuniorSessionUsedSeconds() >= JUNIOR_SESSION_MAX_SECONDS) {
        resetJuniorSessionUsed();
      }
      timelineEndedRef.current = true;
      setShowPauseOverlay(true);
    },
    [
      addJuniorSessionUsedSeconds,
      getJuniorSessionUsedSeconds,
      resetJuniorSessionUsed,
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
      if (isJunior) {
        addJuniorSessionUsedSeconds(thisGameSeconds);
        const durationSeconds = Math.min(thisGameSeconds, JUNIOR_SESSION_MAX_SECONDS);
        if (lastSegmentSavedAtRef.current < durationSeconds) {
          saveSegment(jsPsych, level, durationSeconds);
        }
        if (getJuniorSessionUsedSeconds() >= JUNIOR_SESSION_MAX_SECONDS) {
          resetJuniorSessionUsed();
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
      isJunior,
      saveSegment,
      addJuniorSessionUsedSeconds,
      getJuniorSessionUsedSeconds,
      resetJuniorSessionUsed,
    ]
  );

  useEffect(() => {
    if (!isJuniorWithInstructions || instructionsDone) {
      const t = setTimeout(() => setShowDisclaimer(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isJuniorWithInstructions, instructionsDone]);

  useEffect(() => {
    if (isJuniorWithInstructions && !instructionsDone) return;
    if (!containerRef.current || !activeProfile) return;
    void restartCount;

    const jsPsych = initJsPsych({
      display_element: containerRef.current,
    });

    const level = activeProfile.currentLevels[validId] ?? 1;
    sessionRef.current = { jsPsych, level, ended: false };
    const timeline = buildTimelineForModule(validId, jsPsych, level);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isJunior) {
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
        const totalUsed = getJuniorSessionUsedSeconds() + sec;
        if (totalUsed >= JUNIOR_SESSION_MAX_SECONDS) {
          if (intervalId) clearInterval(intervalId);
          jsPsych.abortCurrentTimeline();
          finishAndNavigate(jsPsych, level, true);
          return;
        }
        const pauseMark =
          Math.floor(sec / JUNIOR_PAUSE_INTERVAL_SECONDS) * JUNIOR_PAUSE_INTERVAL_SECONDS;
        if (
          pauseMark >= JUNIOR_PAUSE_INTERVAL_SECONDS &&
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
        if (isJunior) {
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
    isJuniorWithInstructions,
    instructionsDone,
    isJunior,
    finishAndNavigate,
    saveSegment,
    getJuniorSessionUsedSeconds,
  ]);

  const handleQuit = () => {
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

  if (isJuniorWithInstructions && !instructionsDone) {
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
      {isJunior && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <SnailTimer
            elapsedSeconds={elapsedSeconds}
            sessionUsedSeconds={getJuniorSessionUsedSeconds()}
            maxSeconds={JUNIOR_SESSION_MAX_SECONDS}
            pauseIntervalSeconds={JUNIOR_PAUSE_INTERVAL_SECONDS}
          />
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
        className="jspsych-container"
        style={{ minHeight: 200 }}
      />
    </div>
  );
}
