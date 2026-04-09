import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const TASKSWITCH_BG = `${BASE}assets/images/standard/taskswitch-lab-bg.svg`;

const TAP_BTN = (key: 'ArrowLeft' | 'ArrowRight', label: string) =>
  `<button type="button" class="fq-tap-btn" onclick="var e=new KeyboardEvent('keydown',{key:'${key}',code:'${key}',bubbles:true});document.body.dispatchEvent(e);">${label}</button>`;
const TAP_ZONE_ARROWS = `<div class="fq-tap-zone">${TAP_BTN('ArrowLeft', '← Gauche')}${TAP_BTN('ArrowRight', '→ Droite')}</div>`;

const TS_STAIRCASE: StaircaseConfig = {
  mode: '2-down-1-up',
  targetAccuracy: 0.75,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
};

type Rule = 'parity' | 'magnitude';

export interface TaskSwitchConfig {
  totalTrials?: number;
  staircase?: StaircaseConfig;
}

/** Task-Switch Standard : alternance de règles pair/impair et <5/>5. */
export function buildTaskSwitchTimeline(
  _jsPsych: JsPsych,
  config: TaskSwitchConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 48;
  const staircaseConfig = config.staircase ?? TS_STAIRCASE;
  let sc = createStaircase(staircaseConfig);
  let currentRule: Rule = Math.random() < 0.5 ? 'parity' : 'magnitude';
  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const level = sc.currentLevel;
    const switchRate = Math.min(0.6, 0.1 + (level - 1) * 0.05);
    const didSwitch = i > 0 && Math.random() < switchRate;
    if (didSwitch) currentRule = currentRule === 'parity' ? 'magnitude' : 'parity';

    const value = 1 + Math.floor(Math.random() * 9);
    const isEven = value % 2 === 0;
    const isHigh = value > 5;
    const correctKey = currentRule === 'parity'
      ? (isEven ? 'arrowleft' : 'arrowright')
      : (isHigh ? 'arrowleft' : 'arrowright');
    const leftLabel = currentRule === 'parity' ? 'Pair' : '> 5';
    const rightLabel = currentRule === 'parity' ? 'Impair' : '≤ 5';
    const panel = currentRule === 'parity' ? 'RÈGLE: PAIR/IMPAIR' : 'RÈGLE: >5 / ≤5';

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div class="fq-std-scene" style="background-image:url(${TASKSWITCH_BG});justify-content:space-between;"><div class="fq-ts-rule-pill">${panel}</div><div class="fq-ts-side"><span class="fq-ts-left-label">${leftLabel}</span><span class="fq-ts-number">${value}</span><span class="fq-ts-right-label">${rightLabel}</span></div>${TAP_ZONE_ARROWS}</div>`,
      choices: ['arrowleft', 'arrowright'],
      stimulus_duration: null,
      trial_duration: Math.max(1200, 2600 - (level - 1) * 130),
      response_ends_trial: false,
      data: {
        trialType: 'taskswitch',
        rule: currentRule,
        value,
        didSwitch,
        difficultyLevel: level,
      },
      on_finish: (data: { response: string | null; correct?: boolean }) => {
        const correct = data.response === correctKey;
        data.correct = correct;
        sc = updateStaircase(sc, correct, staircaseConfig);
      },
    });
  }

  return timeline;
}
