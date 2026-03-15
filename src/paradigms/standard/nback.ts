import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

/** N-Back Standard — stub pour intégration QUEST ultérieure. */
export function buildNBackTimeline(
  _jsPsych: JsPsych,
  _config: unknown
): Record<string, unknown>[] {
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p>N-Back — À venir</p><p>Espace pour continuer</p>',
      choices: [' '],
    },
  ];
}
