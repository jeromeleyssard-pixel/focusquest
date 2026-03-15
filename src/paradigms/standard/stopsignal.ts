import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

/** Stop-Signal Task — stub pour intégration complète ultérieure. */
export function buildStopSignalTimeline(
  _jsPsych: JsPsych,
  _config: unknown
): Record<string, unknown>[] {
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p>Stop-Signal — À venir</p><p>Espace pour continuer</p>',
      choices: [' '],
    },
  ];
}
