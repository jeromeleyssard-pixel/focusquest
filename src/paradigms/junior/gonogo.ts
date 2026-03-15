import type { JsPsych } from 'jspsych';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';
import { playCorrectSound, playNeutralSound } from '../../utils/juniorFeedback';

export interface GoNoGoConfig {
  staircase: StaircaseConfig;
  goRatio: number;
  stimulusDuration: number;
  responseWindow: number;
  isi: number;
  totalTrials: number;
  goStimulus: string;
  nogoStimulus: string;
}

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : '/';
const GO_IMG = `${BASE}assets/images/junior/frog-green.svg`;
const NOGO_IMG = `${BASE}assets/images/junior/toad-red.svg`;
const POND_BG = `${BASE}assets/images/junior/pond-bg.svg`;

function wrapMare(stim: string): string {
  return `<div class="gonogo-mare" style="background-image:url(${POND_BG});background-size:cover;background-position:center;min-height:200px;display:flex;align-items:center;justify-content:center;border-radius:12px;">${stim}</div>`;
}

export function buildGoNoGoTimeline(
  _jsPsych: JsPsych,
  config: GoNoGoConfig
): Record<string, unknown>[] {
  let staircaseState = createStaircase(config.staircase);
  const timeline: Record<string, unknown>[] = [];

  const goStimulus =
    config.goStimulus.indexOf('<img') !== -1
      ? config.goStimulus
      : `<div class="stim-go stim-mare"><img src="${GO_IMG}" alt="Grenouille" width="80" height="80" /></div>`;
  const nogoStimulus =
    config.nogoStimulus.indexOf('<img') !== -1
      ? config.nogoStimulus
      : `<div class="stim-nogo stim-mare"><img src="${NOGO_IMG}" alt="Crapaud" width="80" height="80" /></div>`;
  const goStimulusWrapped = wrapMare(goStimulus);
  const nogoStimulusWrapped = wrapMare(nogoStimulus);

  for (let i = 0; i < config.totalTrials; i++) {
    const isGo = Math.random() < config.goRatio;
    const duration =
      config.stimulusDuration - (staircaseState.currentLevel - 1) * 30;
    const window =
      config.responseWindow - (staircaseState.currentLevel - 1) * 100;

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: '',
      choices: [] as string[],
      trial_duration: config.isi,
      data: { trialType: 'fixation' },
    });

    const trialConfig = {
      type: jsPsychHtmlButtonResponse,
      stimulus: isGo ? goStimulusWrapped : nogoStimulusWrapped,
      choices: ['TAP'],
      stimulus_duration: duration,
      trial_duration: Math.max(800, window),
      data: {
        trialType: isGo ? 'go' : 'nogo',
        difficultyLevel: staircaseState.currentLevel,
      },
      on_finish: (data: { response: string | null; rt?: number; correct?: boolean }) => {
        const responded = data.response !== null;
        const correct = isGo ? responded : !responded;
        data.correct = correct;
        if (correct) playCorrectSound();
        else playNeutralSound();
        staircaseState = updateStaircase(staircaseState, correct, config.staircase);
      },
    };
    timeline.push(trialConfig);
  }

  return timeline;
}

export const GONOGO_JUNIOR_CONFIG: GoNoGoConfig = {
  staircase: {
    mode: '1-down-1-up',
    targetAccuracy: 0.65,
    stepSize: 1,
    minLevel: 1,
    maxLevel: 10,
    initialLevel: 1,
  },
  goRatio: 0.7,
  stimulusDuration: 800,
  responseWindow: 3000,
  isi: 1500,
  totalTrials: 60,
  goStimulus: '<div class="stim-go" style="font-size:48px;color:#2e7d32">●</div>',
  nogoStimulus: '<div class="stim-nogo" style="font-size:48px;color:#c62828">●</div>',
};
