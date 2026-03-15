import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const STOP_BG = `${BASE}assets/images/standard/stopsignal-road-bg.svg`;

const STOP_STAIRCASE: StaircaseConfig = {
  mode: '1-down-1-up',
  targetAccuracy: 0.5,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 5,
};

export interface StopSignalConfig {
  totalTrials?: number;
  staircase?: StaircaseConfig;
}

/** Stop-Signal Task Standard avec SSD adaptatif. */
export function buildStopSignalTimeline(
  _jsPsych: JsPsych,
  config: StopSignalConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 48;
  const staircaseConfig = config.staircase ?? STOP_STAIRCASE;
  let sc = createStaircase(staircaseConfig);
  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const goLeft = Math.random() < 0.5;
    const isStopTrial = Math.random() < 0.3;
    const level = sc.currentLevel;
    const ssd = 120 + (level - 1) * 35;
    const arrow = goLeft ? '←' : '→';

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="background-image:url(${STOP_BG});background-size:cover;background-position:center;min-height:220px;border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative;"><div style="font-size:72px;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.8);">${arrow}</div>${isStopTrial ? `<div style="position:absolute;top:24px;right:24px;padding:6px 12px;background:#ef4444;color:white;border-radius:8px;font-weight:bold;opacity:0.9;">STOP</div>` : ''}</div>`,
      choices: ['arrowleft', 'arrowright'],
      stimulus_duration: null,
      trial_duration: 2000,
      response_ends_trial: false,
      data: {
        trialType: 'stopsignal',
        isStopTrial,
        goLeft,
        ssd,
        difficultyLevel: level,
      },
      on_finish: (data: { response: string | null; isStopTrial?: boolean; goLeft?: boolean; correct?: boolean }) => {
        const isLeftPress = data.response === 'arrowleft';
        const isRightPress = data.response === 'arrowright';
        const goCorrect = (data.goLeft && isLeftPress) || (!data.goLeft && isRightPress);
        const stopCorrect = data.response === null;
        const correct = data.isStopTrial ? stopCorrect : goCorrect;
        data.correct = correct;
        sc = updateStaircase(sc, correct, staircaseConfig);
      },
    });
  }

  return timeline;
}
