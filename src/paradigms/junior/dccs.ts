import type { JsPsych } from 'jspsych';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';
import { playCorrectSound, playNeutralSound } from '../../utils/juniorFeedback';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const LAB_BG = `${BASE}assets/images/junior/lab-bg.svg`;

function wrapLab(html: string): string {
  return `<div class="dccs-lab fq-stimulus-box fq-junior-paradigm" style="background-image:url(${LAB_BG});background-size:cover;background-position:center;min-height:55vh;padding:16px;border-radius:12px;">${html}</div>`;
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

const DCCS_STAIRCASE: StaircaseConfig = {
  mode: '1-down-1-up',
  targetAccuracy: 0.75,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
};

/** Niveau 1 = peu de changements (1/12), niveau 10 = beaucoup (1/3). */
function switchRateForLevel(level: number): number {
  const t = (level - 1) / 9;
  return 1 / 12 + t * (1 / 3 - 1 / 12);
}

export interface DCCSConfig {
  totalTrials?: number;
  staircase?: StaircaseConfig;
}

/** DCCS Junior : tri par couleur ou par forme, 1-down-1-up sur la fréquence de changement de règle. */
export function buildDCCSTimeline(
  _jsPsych: JsPsych,
  config: DCCSConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 36;
  const staircaseConfig = config.staircase ?? DCCS_STAIRCASE;

  const ref: {
    rule: Rule;
    staircaseState: ReturnType<typeof createStaircase>;
  } = {
    rule: Math.random() < 0.5 ? 'color' : 'shape',
    staircaseState: createStaircase(staircaseConfig),
  };

  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const level = ref.staircaseState.currentLevel;
    const switchRate = switchRateForLevel(level);
    if (i > 0 && Math.random() < switchRate) {
      ref.rule = ref.rule === 'color' ? 'shape' : 'color';
    }

    const currentRule = ref.rule;
    const color: Color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shape: Shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const correctLabel =
      currentRule === 'color' ? COLOR_LABEL[color] : SHAPE_LABEL[shape];
    const choices: [string, string] =
      currentRule === 'color' ? ['Rouge', 'Bleu'] : ['Étoile', 'Rond'];

    const panelLabel = currentRule === 'color' ? 'Trie par COULEUR' : 'Trie par FORME';
    const cardHtml = `
      <div class="dccs-panel" style="margin-bottom:12px;padding:10px 16px;background:var(--fq-primary);color:#fff;border-radius:8px;font-size:min(4.5vw,18px);font-weight:bold;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${panelLabel}</div>
      <p style="margin:8px 0;font-size:min(4vw,16px);color:var(--fq-text);text-align:center;">Où va cette carte ?</p>
      <div class="dccs-card" style="width:min(24vw,110px);height:min(24vw,110px);background:${COLOR_MAP[color]};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:min(12vw,52px);color:#fff;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.2);">${SHAPE_CHAR[shape]}</div>
    `;

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: wrapLab(cardHtml),
      choices,
      stimulus_duration: null,
      trial_duration: Math.max(4000, 8000 - (level - 1) * 350),
      data: {
        trialType: 'dccs',
        rule: currentRule,
        color,
        shape,
        correctLabel,
        difficultyLevel: level,
      },
      on_finish: (data: { response: string | null; correctLabel?: string; correct?: boolean }) => {
        const correct = data.response === data.correctLabel;
        data.correct = correct;
        if (correct) playCorrectSound();
        else playNeutralSound();
        ref.staircaseState = updateStaircase(ref.staircaseState, correct, staircaseConfig);
      },
    });
  }

  return timeline;
}
