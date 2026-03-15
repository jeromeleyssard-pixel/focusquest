import type { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

/** Task-Switching — stub pour intégration complète ultérieure. */
export function buildTaskSwitchTimeline(
  _jsPsych: JsPsych,
  _config: unknown
): Record<string, unknown>[] {
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p>Task-Switch — À venir</p><p>Espace pour continuer</p>',
      choices: [' '],
    },
  ];
}
