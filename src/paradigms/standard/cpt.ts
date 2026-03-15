import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const CPT_BG = `${BASE}assets/images/standard/cpt-radar-bg.svg`;

/** Zone TAP visible : au clic/touch simule la barre d'espace pour mobile. */
const TAP_ZONE_SPACE = `<div class="fq-tap-zone" style="margin-top:12px;text-align:center;"><button type="button" class="fq-tap-btn" style="padding:14px 32px;font-size:18px;font-weight:bold;background:var(--fq-primary,#2563eb);color:#fff;border:none;border-radius:12px;cursor:pointer;min-height:48px;touch-action:manipulation;" onclick="var e=new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true});document.body.dispatchEvent(e);">Appuyer</button></div>`;

type Stimulus = 'A' | 'X' | 'B' | 'Y';

interface CPTTrial {
  stimulus: Stimulus;
  isPrecededByA: boolean;
  isTarget: boolean;
}

export interface CPTConfig {
  staircase: StaircaseConfig;
  totalTrials: number;
}

function generateCPTSequence(n: number, targetRatio = 0.25): CPTTrial[] {
  const trials: CPTTrial[] = [];
  let prevWasA = false;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let stim: Stimulus;
    if (prevWasA && r < targetRatio) stim = 'X';
    else if (r < 0.25) stim = 'A';
    else if (r < 0.5) stim = 'B';
    else stim = 'Y';
    trials.push({
      stimulus: stim,
      isPrecededByA: prevWasA,
      isTarget: stim === 'X' && prevWasA,
    });
    prevWasA = stim === 'A';
  }
  return trials;
}

export function buildCPTTimeline(
  _jsPsych: JsPsych,
  config: CPTConfig
): Record<string, unknown>[] {
  let sc = createStaircase(config.staircase);
  const sequence = generateCPTSequence(config.totalTrials);

  return sequence.map((t) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="cpt-wrap fq-stimulus-box" style="background-image:url(${CPT_BG});background-size:cover;background-position:center;min-height:58vh;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div class="cpt-letter" style="font-size:min(22vw,80px);text-align:center;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.8);font-weight:bold;">${t.stimulus}</div>${TAP_ZONE_SPACE}</div>`,
    choices: [' '],
    stimulus_duration: Math.max(180, 300 - (sc.currentLevel - 1) * 20),
    trial_duration: Math.max(1000, 2000 - (sc.currentLevel - 1) * 90),
    response_ends_trial: false,
    data: { ...t, difficultyLevel: sc.currentLevel },
    on_finish: (data: { response: string | null; correct?: boolean }) => {
      const responded = data.response !== null;
      const correct = t.isTarget ? responded : !responded;
      data.correct = correct;
      sc = updateStaircase(sc, correct, config.staircase);
    },
  }));
}
