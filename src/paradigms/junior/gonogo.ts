import type { JsPsych } from 'jspsych';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

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

export function buildGoNoGoTimeline(
  _jsPsych: JsPsych,
  config: GoNoGoConfig
): Record<string, unknown>[] {
  let staircaseState = createStaircase(config.staircase);
  const timeline: Record<string, unknown>[] = [];

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
      stimulus: isGo ? config.goStimulus : config.nogoStimulus,
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
