import Phaser from 'phaser';
import { BaseTrialScene } from '../BaseTrialScene';
import type { StopSignalTrialSpec } from '../../trialControllers/types';
import type { AnyTrialResult } from '../../trialControllers/types';
import { StopSignalController } from '../../trialControllers/stopSignalController';
import type { StopSignalResponse, StopSignalTrialResult } from '../../trialControllers/types';
import { playCorrectSound, playNeutralSound } from '../../../utils/juniorFeedback';

const BASE_ASSET = (import.meta.env?.BASE_URL || '/') as string;
const STOP_BG_URL = `${BASE_ASSET}assets/images/standard/stopsignal-road-bg.svg`;

export class StopSignalScene extends BaseTrialScene<StopSignalTrialSpec> {
  constructor() {
    super('StopSignalScene');
    this.totalTrials = 48;
    this.moduleId = 'stopsignal';
    this.controller = new StopSignalController({}); // default config matches jsPsych renderer
  }

  private bgImage: Phaser.GameObjects.Image | null = null;
  private arrowText: Phaser.GameObjects.Text | null = null;
  private stopBadge: Phaser.GameObjects.Container | null = null;
  private pressedHint: Phaser.GameObjects.Text | null = null;

  preload() {
    this.load.image('stop-bg', STOP_BG_URL);
  }

  private setPressedVisual(kind: 'left' | 'right') {
    // Small immediate feedback: tint the arrow slightly
    if (this.arrowText) {
      this.arrowText.setColor(kind === 'left' ? '#93c5fd' : '#fca5a5');
      this.tweens.add({
        targets: this.arrowText,
        duration: 180,
        alpha: 0.85,
        yoyo: true,
        hold: 0,
      });
    }
    if (this.pressedHint) {
      this.pressedHint.setText(kind === 'left' ? 'GO ←' : 'GO →');
      this.pressedHint.setAlpha(1);
      this.tweens.add({
        targets: this.pressedHint,
        duration: 220,
        alpha: 0,
      });
    }
  }

  renderStimulus(spec: StopSignalTrialSpec) {
    // Reset
    this.stopBadge?.destroy();
    this.stopBadge = null;

    if (!this.bgImage) {
      this.bgImage = this.add
        .image(this.scale.width / 2, 0, 'stop-bg')
        .setOrigin(0.5, 0);
      this.bgImage.setDisplaySize(this.scale.width, this.scale.height);
    }

    if (!this.arrowText) {
      this.arrowText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, '', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(90, Math.round(this.scale.width * 0.22))}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.arrowText.setShadow(0, 2, '#000000', 8, true, true);
    }

    const arrow = spec.goLeft ? '←' : '→';
    this.arrowText.setText(arrow);

    // Show STOP for inhibition trials without covering the decorative background circles
    if (spec.isStopTrial) {
      this.arrowText.setAlpha(0.0);

      const badgeWidth = Math.min(280, Math.round(this.scale.width * 0.72));
      const badgeHeight = Math.min(90, Math.round(this.scale.height * 0.12));

      const badgeBg = this.add
        .rectangle(this.scale.width / 2, this.scale.height / 2, badgeWidth, badgeHeight, 0xef4444, 1)
        .setOrigin(0.5);

      badgeBg.setStrokeStyle(3, 0xffffff, 0.9);

      const badgeText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'STOP', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(36, Math.round(this.scale.width * 0.10))}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5);

      this.stopBadge = this.add.container(0, 0, [badgeBg, badgeText]);
      this.stopBadge.setDepth(20);
    } else {
      this.arrowText.setAlpha(1.0);
    }

    // Prepare pressed hint (hidden unless a response occurs)
    if (!this.pressedHint) {
      this.pressedHint = this.add
        .text(this.scale.width / 2, this.scale.height - 90, '', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(22, Math.round(this.scale.width * 0.06))}px`,
          color: '#e5e7eb',
        })
        .setOrigin(0.5);
    }
    this.pressedHint.setAlpha(0);
  }

  mapPointerInput(pointer: Phaser.Input.Pointer) {
    // Tap zones: left half => left, right half => right
    return pointer.x < this.scale.width / 2 ? 'left' : 'right';
  }

  mapKeyboardInput(code: string) {
    if (code === 'ArrowLeft') return 'left';
    if (code === 'ArrowRight') return 'right';
    return null;
  }

  mapControllerResponseFromInput(spec: StopSignalTrialSpec, kind: 'space' | 'left' | 'right') {
    // For Stop-Signal we ignore SPACE and only accept left/right.
    if (kind === 'left') {
      this.setPressedVisual('left');
      return 'left' as StopSignalResponse;
    }
    if (kind === 'right') {
      this.setPressedVisual('right');
      return 'right' as StopSignalResponse;
    }
    return null;
  }

  getNoResponse(_spec: StopSignalTrialSpec) {
    return null as StopSignalResponse;
  }

  protected renderFeedback(result: AnyTrialResult) {
    super.renderFeedback(result);
    if (result.correct) playCorrectSound();
    else playNeutralSound();
  }
}

