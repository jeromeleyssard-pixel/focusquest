import Phaser from 'phaser';
import { BaseTrialScene } from '../BaseTrialScene';
import type { NBackTrialSpec, AnyTrialResult } from '../../trialControllers/types';
import { NBackController } from '../../trialControllers/nBackController';
import { playCorrectSound, playNeutralSound } from '../../../utils/juniorFeedback';

const BASE_ASSET = (import.meta.env?.BASE_URL || '/') as string;
const NBACK_BG_URL = `${BASE_ASSET}assets/images/standard/nback-grid-bg.svg`;

export class NBackScene extends BaseTrialScene<NBackTrialSpec> {
  constructor() {
    super('NBackScene');
    this.totalTrials = 48;
    this.moduleId = 'nback';
    this.controller = new NBackController({}); // defaults match jsPsych renderer
  }

  private bgImage: Phaser.GameObjects.Image | null = null;
  private letterText: Phaser.GameObjects.Text | null = null;
  private letterHideTimer: Phaser.Time.TimerEvent | null = null;

  preload() {
    this.load.image('nback-bg', NBACK_BG_URL);
  }

  renderStimulus(spec: NBackTrialSpec) {
    // Reset timers
    if (this.letterHideTimer) this.letterHideTimer.remove(false);
    this.letterHideTimer = null;

    if (!this.bgImage) {
      this.bgImage = this.add
        .image(this.scale.width / 2, 0, 'nback-bg')
        .setOrigin(0.5, 0);
      this.bgImage.setDisplaySize(this.scale.width, this.scale.height);
    }

    if (!this.letterText) {
      this.letterText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, '', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(110, Math.round(this.scale.width * 0.26))}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.letterText.setShadow(0, 2, '#000000', 10, true, true);
    }

    this.letterText.setText(spec.letter);
    this.letterText.setColor('#ffffff');
    this.letterText.setAlpha(1);

    const stimulusMs = spec.stimulusDurationMs ?? spec.trialDurationMs;
    this.letterHideTimer = this.time.delayedCall(stimulusMs, () => {
      this.letterText?.setAlpha(0);
    });
  }

  mapPointerInput(_pointer: Phaser.Input.Pointer) {
    // Any tap counts as "space" for n-back
    return 'space' as const;
  }

  mapKeyboardInput(code: string) {
    if (code === 'Space') return 'space' as const;
    return null;
  }

  mapControllerResponseFromInput(_spec: NBackTrialSpec, kind: 'space' | 'left' | 'right') {
    if (kind !== 'space') return null;

    // Immediate tactile feedback
    if (this.letterText) {
      this.letterText.setColor('#fde68a');
      this.tweens.add({
        targets: this.letterText,
        duration: 150,
        scale: 1.08,
        yoyo: true,
      });
    }

    return true; // responded=true
  }

  getNoResponse(_spec: NBackTrialSpec) {
    return false;
  }

  protected renderFeedback(result: AnyTrialResult) {
    super.renderFeedback(result);
    if (result.correct) playCorrectSound();
    else playNeutralSound();
  }
}

