import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const TASKSWITCH_BG = `${BASE}assets/images/standard/taskswitch-lab-bg.svg`;

const TAP_BTN = (key: 'ArrowLeft' | 'ArrowRight', label: string) =>
  `<button type="button" class="fq-tap-btn" style="padding:14px 24px;font-size:20px;font-weight:bold;background:var(--fq-primary,#2563eb);color:#fff;border:none;border-radius:12px;cursor:pointer;min-height:48px;touch-action:manipulation;" onclick="var e=new KeyboardEvent('keydown',{key:'${key}',code:'${key}',bubbles:true});document.body.dispatchEvent(e);">${label}</button>`;
const TAP_ZONE_ARROWS = `<div class="fq-tap-zone" style="margin-top:12px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">${TAP_BTN('ArrowLeft', '← Gauche')}${TAP_BTN('ArrowRight', '→ Droite')}</div>`;

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
      stimulus: `<div class="fq-stimulus-box" style="background-image:url(${TASKSWITCH_BG});background-size:cover;background-position:center;min-height:58vh;border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;"><div style="align-self:center;background:rgba(17,24,39,0.75);color:#fff;padding:8px 14px;border-radius:8px;font-weight:700;font-size:min(4vw,18px);">${panel}</div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="color:#fde68a;font-weight:600;font-size:min(4.5vw,18px);">${leftLabel}</div><div style=\"font-size:min(18vw,72px);color:#fff;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.8);\">${value}</div><div style="color:#bfdbfe;font-weight:600;font-size:min(4.5vw,18px);">${rightLabel}</div></div>${TAP_ZONE_ARROWS}</div>`,
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
