import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createQuest, getNextN, updateQuest } from '../../engine/quest';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const NBACK_BG = `${BASE}assets/images/standard/nback-grid-bg.svg`;
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

/** Zone TAP visible : au clic/touch simule la barre d'espace pour mobile. */
const TAP_ZONE_SPACE = `<div class="fq-tap-zone" style="margin-top:12px;text-align:center;"><button type="button" class="fq-tap-btn" style="padding:14px 32px;font-size:18px;font-weight:bold;background:var(--fq-primary,#2563eb);color:#fff;border:none;border-radius:12px;cursor:pointer;min-height:48px;touch-action:manipulation;" onclick="var e=new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true});document.body.dispatchEvent(e);">Appuyer</button></div>`;

export interface NBackConfig {
  totalTrials?: number;
}

/** N-Back Standard avec adaptation QUEST sur N. */
export function buildNBackTimeline(
  _jsPsych: JsPsych,
  config: NBackConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 50;
  let questState = createQuest(2);
  const sequence: string[] = [];
  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const n = getNextN(questState);
    let current = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const canMatch = i >= n;
    const isMatch = canMatch && Math.random() < 0.35;
    if (isMatch) current = sequence[i - n];
    sequence.push(current);

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div class="fq-stimulus-box" style="background-image:url(${NBACK_BG});background-size:cover;background-position:center;min-height:58vh;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;"><div style="font-size:min(20vw,80px);color:#ffffff;font-weight:700;text-shadow:0 2px 10px rgba(0,0,0,0.8);">${current}</div>${TAP_ZONE_SPACE}</div>`,
      choices: [' '],
      stimulus_duration: 1200,
      trial_duration: 2200,
      response_ends_trial: false,
      data: {
        trialType: 'nback',
        n,
        isMatch,
        difficultyLevel: n,
      },
      on_finish: (data: { response: string | null; isMatch?: boolean; correct?: boolean; n?: number }) => {
        const responded = data.response !== null;
        const correct = (data.isMatch && responded) || (!data.isMatch && !responded);
        data.correct = correct;
        questState = updateQuest(questState, data.n ?? n, correct);
      },
    });
  }

  return timeline;
}
