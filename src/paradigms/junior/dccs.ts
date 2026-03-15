import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

/** DCCS — Tri de cartes Junior — stub pour intégration complète ultérieure. */
export function buildDCCSTimeline(
  _jsPsych: JsPsych,
  _config: unknown
): Record<string, unknown>[] {
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p>DCCS — À venir</p><p>Espace pour continuer</p>',
      choices: [' '],
    },
  ];
}
