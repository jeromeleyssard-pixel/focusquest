import { useEffect, useRef } from 'react';
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

const MODULE_IDS: ModuleId[] = [
  'gonogo',
  'oneback',
  'dccs',
  'cpt',
  'nback',
  'stopsignal',
  'taskswitch',
];

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

  const id = moduleId as ModuleId | undefined;
  const validId = id && MODULE_IDS.includes(id) ? id : 'gonogo';

  useEffect(() => {
    if (!containerRef.current || !activeProfile) return;

    const jsPsych = initJsPsych({
      display_element: containerRef.current,
    });

    const level = activeProfile.currentLevels[validId] ?? 1;
    const timeline = buildTimelineForModule(validId, jsPsych, level);

    jsPsych
      .run(timeline as Parameters<ReturnType<typeof initJsPsych>['run']>[0])
      .then(() => {
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
        computeRTISV(rts); // could use for analytics

        const summary = {
          month: new Date().toISOString().slice(0, 7),
          moduleId: validId,
          level: finalLevel,
          accuracy: Math.round(accuracy),
          durationSeconds: Math.round(jsPsych.getTotalTime() / 1000),
        };

        updateLevel(validId, finalLevel);
        addSession(summary);
        navigate('/menu', { replace: true });
      })
      .catch(() => {
        navigate('/menu', { replace: true });
      });

    return () => {
      jsPsych.abortCurrentTimeline();
    };
  }, [validId, activeProfile, updateLevel, addSession, navigate]);

  return (
    <div className="session-layout" style={{ padding: 24, minHeight: '100vh' }}>
      <div
        ref={containerRef}
        className="jspsych-container"
        style={{ minHeight: 200 }}
      />
      <p style={{ color: 'var(--fq-text-muted)', fontSize: 12, marginTop: 8 }}>
        FocusQuest — outil d&apos;entraînement, pas un dispositif médical.
      </p>
    </div>
  );
}
