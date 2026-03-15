import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createStaircase, updateStaircase } from '../../engine/staircase';
import type { StaircaseConfig } from '../../types/adaptive';

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
    stimulus: `<div class="cpt-letter" style="font-size:72px;text-align:center">${t.stimulus}</div>`,
    choices: [' '],
    stimulus_duration: 300 - (sc.currentLevel - 1) * 15,
    trial_duration: 2000 - (sc.currentLevel - 1) * 50,
    response_ends_trial: false,
    data: { ...t, difficultyLevel: sc.currentLevel },
    on_finish: (data: { response: string | null; correct?: boolean }) => {
      const responded = data.response !== null;
      data.correct = t.isTarget ? responded : !responded;
      sc = updateStaircase(sc, data.correct!, config.staircase);
    },
  }));
}
