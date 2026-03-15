import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

/** 1-Back visuel Junior — stub pour intégration complète ultérieure. */
export function buildOneBackTimeline(
  _jsPsych: JsPsych,
  _config: { totalTrials?: number }
): Record<string, unknown>[] {
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p>1-Back — À venir</p><p>Espace pour continuer</p>',
      choices: [' '],
    },
  ];
}
