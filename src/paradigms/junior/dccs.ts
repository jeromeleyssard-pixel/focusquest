import type { JsPsych } from 'jspsych';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { playCorrectSound, playNeutralSound } from '../../utils/juniorFeedback';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const LAB_BG = `${BASE}assets/images/junior/lab-bg.svg`;

function wrapLab(html: string): string {
  return `<div class="dccs-lab" style="background-image:url(${LAB_BG});background-size:cover;background-position:center;min-height:220px;padding:16px;border-radius:12px;">${html}</div>`;
}

type Rule = 'color' | 'shape';
type Color = 'red' | 'blue';
type Shape = 'star' | 'circle';

const COLORS: Color[] = ['red', 'blue'];
const SHAPES: Shape[] = ['star', 'circle'];

const COLOR_MAP: Record<Color, string> = { red: '#c62828', blue: '#1565c0' };
const SHAPE_CHAR: Record<Shape, string> = { star: '★', circle: '●' };
const COLOR_LABEL: Record<Color, string> = { red: 'Rouge', blue: 'Bleu' };
const SHAPE_LABEL: Record<Shape, string> = { star: 'Étoile', circle: 'Rond' };

export interface DCCSConfig {
  totalTrials?: number;
  switchRateInitial?: number;
  switchRateMax?: number;
}

/** DCCS Junior : tri par couleur ou par forme, panneau indique la règle, deux boîtes (tap gauche/droite). */
export function buildDCCSTimeline(
  _jsPsych: JsPsych,
  config: DCCSConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 36;
  const switchRateInitial = config.switchRateInitial ?? 1 / 10;
  const switchRateMax = config.switchRateMax ?? 1 / 3;

  let currentRule: Rule = Math.random() < 0.5 ? 'color' : 'shape';
  let switchRate = switchRateInitial;
  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    if (i > 0 && Math.random() < switchRate) {
      currentRule = currentRule === 'color' ? 'shape' : 'color';
      switchRate = Math.min(switchRateMax, switchRate + 0.05);
    }

    const color: Color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shape: Shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    const correctLabel =
      currentRule === 'color' ? COLOR_LABEL[color] : SHAPE_LABEL[shape];
    const choices: [string, string] =
      currentRule === 'color' ? ['Rouge', 'Bleu'] : ['Étoile', 'Rond'];

    const panelLabel = currentRule === 'color' ? 'Trie par COULEUR' : 'Trie par FORME';
    const cardHtml = `
      <div class="dccs-panel" style="margin-bottom:12px;padding:10px 16px;background:var(--fq-primary);color:#fff;border-radius:8px;font-size:18px;font-weight:bold;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${panelLabel}</div>
      <p style="margin:8px 0;font-size:15px;color:var(--fq-text);text-align:center;">Où va cette carte ?</p>
      <div class="dccs-card" style="width:90px;height:90px;background:${COLOR_MAP[color]};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:44px;color:#fff;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.2);">${SHAPE_CHAR[shape]}</div>
    `;

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: wrapLab(cardHtml),
      choices,
      stimulus_duration: null,
      trial_duration: 8000,
      data: {
        trialType: 'dccs',
        rule: currentRule,
        color,
        shape,
        correctLabel,
        difficultyLevel: 1,
      },
      on_finish: (data: { response: string | null; correctLabel?: string; correct?: boolean }) => {
        data.correct = data.response === data.correctLabel;
        if (data.correct) playCorrectSound();
        else playNeutralSound();
      },
    });
  }

  return timeline;
}
