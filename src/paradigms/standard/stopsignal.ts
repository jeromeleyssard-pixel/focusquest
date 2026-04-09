import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const STOP_BG = `${BASE}assets/images/standard/stopsignal-road-bg.svg`;

const TAP_BTN = (key: 'ArrowLeft' | 'ArrowRight', label: string) =>
  `<button type="button" class="fq-tap-btn" onclick="var e=new KeyboardEvent('keydown',{key:'${key}',code:'${key}',bubbles:true});document.body.dispatchEvent(e);">${label}</button>`;
const TAP_ZONE_ARROWS = `<div class="fq-tap-zone">${TAP_BTN('ArrowLeft', '← Gauche')}${TAP_BTN('ArrowRight', '→ Droite')}</div>`;

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

    const slideDir = goLeft ? '-28px' : '28px';
    const goContent = `<div class="fq-std-arrow" style="--slide-dir:${slideDir};">${arrow}</div>`;
    const stopContent = `<div class="fq-stop-badge">STOP</div>`;
    const stimulusHtml = `<div class="fq-std-scene" style="background-image:url(${STOP_BG});background-position:top center;">${isStopTrial ? stopContent : goContent}${TAP_ZONE_ARROWS}</div>`;

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: stimulusHtml,
      choices: ['arrowleft', 'arrowright'],
      stimulus_duration: null,
      trial_duration: 2000,
      response_ends_trial: !isStopTrial,
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
