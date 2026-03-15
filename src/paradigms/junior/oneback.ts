import type { JsPsych } from 'jspsych';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';
import { playCorrectSound, playNeutralSound } from '../../utils/juniorFeedback';

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const ANIMALS = [1, 2, 3, 4] as const;
const ANIMAL_SRC = (i: number) => `${BASE}assets/images/junior/oneback/animal${i}.svg`;
const FOREST_BG = `${BASE}assets/images/junior/forest-bg.svg`;

function wrapForet(html: string): string {
  return `<div class="oneback-foret" style="background-image:url(${FOREST_BG});background-size:cover;background-position:center;min-height:200px;display:flex;align-items:center;justify-content:center;border-radius:12px;">${html}</div>`;
}

export interface OneBackConfig {
  totalTrials?: number;
  staircase?: StaircaseConfig;
  isiMinMs?: number;
  isiMaxMs?: number;
  responseWindowMs?: number;
}

const DEFAULT_STAIRCASE: StaircaseConfig = {
  mode: '1-down-1-up',
  targetAccuracy: 0.75,
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
};

/** 1-Back visuel Junior : un stimulus à la fois, tap si "même" que le précédent. */
export function buildOneBackTimeline(
  _jsPsych: JsPsych,
  config: OneBackConfig = {}
): Record<string, unknown>[] {
  const totalTrials = config.totalTrials ?? 40;
  const staircaseConfig = config.staircase ?? DEFAULT_STAIRCASE;
  const isiMinMs = config.isiMinMs ?? 600;
  const isiMaxMs = config.isiMaxMs ?? 2200;
  const responseWindowMs = config.responseWindowMs ?? 3000;

  let staircaseState = createStaircase(staircaseConfig);
  let previousIndex = -1;
  const timeline: Record<string, unknown>[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const isMatch = previousIndex >= 0 && Math.random() < 0.5;
    let animalId: (typeof ANIMALS)[number];
    if (isMatch && previousIndex >= 0) {
      animalId = previousIndex as (typeof ANIMALS)[number];
    } else {
      const others = previousIndex >= 0 ? ANIMALS.filter((a) => a !== previousIndex) : [...ANIMALS];
      animalId = others[Math.floor(Math.random() * others.length)];
    }
    previousIndex = animalId;
    const src = ANIMAL_SRC(animalId);

    const level = staircaseState.currentLevel;
    const isiMs = Math.round(
      isiMaxMs - (level - 1) * ((isiMaxMs - isiMinMs) / Math.max(1, staircaseConfig.maxLevel - staircaseConfig.minLevel))
    );
    const isi = Math.max(isiMinMs, Math.min(isiMaxMs, isiMs));
    const responseWindow = Math.max(1500, responseWindowMs - (level - 1) * 120);

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: '',
      choices: [] as string[],
      trial_duration: isi,
      data: { trialType: 'fixation' },
    });

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: wrapForet(`<div class="oneback-stim" style="display:flex;align-items:center;justify-content:center;"><img src="${src}" alt="Animal" width="80" height="80" /></div>`),
      choices: ['Même'],
      stimulus_duration: null,
      trial_duration: responseWindow,
      data: {
        trialType: 'oneback',
        match: isMatch,
        animalId,
        difficultyLevel: level,
      },
      on_finish: (data: { response: string | null; match?: boolean; correct?: boolean }) => {
        const responded = data.response !== null;
        const correct = (data.match && responded) || (!data.match && !responded);
        data.correct = correct;
        if (correct) playCorrectSound();
        else playNeutralSound();
        staircaseState = updateStaircase(staircaseState, correct, staircaseConfig);
      },
    });
  }

  return timeline;
}
