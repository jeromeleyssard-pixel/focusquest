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
    this.controller = new StopSignalController({});
  }

  private bgImage: Phaser.GameObjects.Image | null = null;
  private arrowText: Phaser.GameObjects.Text | null = null;
  private stopBadge: Phaser.GameObjects.Container | null = null;
  private pressedHint: Phaser.GameObjects.Text | null = null;

  private leftTapBg: Phaser.GameObjects.Rectangle | null = null;
  private leftTapLabel: Phaser.GameObjects.Text | null = null;
  private rightTapBg: Phaser.GameObjects.Rectangle | null = null;
  private rightTapLabel: Phaser.GameObjects.Text | null = null;

  preload() {
    this.load.image('stop-bg', STOP_BG_URL);
  }

  create() {
    this.scale.on('resize', this.onGameResize, this);
    this.createTapButtons();
    super.create();
    this.onGameResize();
  }

  private onGameResize = () => {
    this.layoutRoadBackground();
    this.layoutTapButtons();
  };

  /**
   * Remplit l’écran sans déformer le SVG (équivalent CSS object-fit: cover).
   */
  private layoutRoadBackground() {
    if (!this.bgImage) return;
    const frame = this.textures.get('stop-bg').get();
    const srcW = frame.width;
    const srcH = frame.height;
    const gw = this.scale.width;
    const gh = this.scale.height;
    const s = Math.max(gw / srcW, gh / srcH);
    this.bgImage.setDisplaySize(srcW * s, srcH * s);
    this.bgImage.setPosition(gw / 2, gh / 2);
    this.bgImage.setOrigin(0.5, 0.5);
  }

  private createTapButtons() {
    const mk = (side: 'left' | 'right') => {
      const bg = this.add
        .rectangle(0, 0, 200, 52, 0x0d7377, 1)
        .setStrokeStyle(2, 0xffffff, 0.95)
        .setDepth(100);
      bg.setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 0, side === 'left' ? '← Gauche' : 'Droite →', {
          fontFamily: 'Arial Bold',
          fontSize: '20px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(101);
      return { bg, label };
    };
    const L = mk('left');
    const R = mk('right');
    this.leftTapBg = L.bg;
    this.leftTapLabel = L.label;
    this.rightTapBg = R.bg;
    this.rightTapLabel = R.label;
  }

  private layoutTapButtons() {
    if (!this.leftTapBg || !this.rightTapBg || !this.leftTapLabel || !this.rightTapLabel) return;
    const gw = this.scale.width;
    const gh = this.scale.height;
    const w = Math.min(gw * 0.4, 300);
    const h = Math.max(44, Math.min(56, gh * 0.085));
    const y = gh - h / 2 - 14;
    const xL = gw * 0.25;
    const xR = gw * 0.75;

    this.leftTapBg.setPosition(xL, y);
    this.leftTapBg.setSize(w, h);
    this.leftTapLabel.setPosition(xL, y);

    this.rightTapBg.setPosition(xR, y);
    this.rightTapBg.setSize(w, h);
    this.rightTapLabel.setPosition(xR, y);
  }

  private setPressedVisual(kind: 'left' | 'right') {
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
    const flash = (bg: Phaser.GameObjects.Rectangle | null) => {
      if (!bg) return;
      const prev = bg.fillColor;
      bg.setFillStyle(0x1e40af, 1);
      this.time.delayedCall(120, () => bg.setFillStyle(prev, 1));
    };
    flash(kind === 'left' ? this.leftTapBg : this.rightTapBg);

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
    this.stopBadge?.destroy();
    this.stopBadge = null;

    if (!this.bgImage) {
      this.bgImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'stop-bg').setDepth(0);
      this.layoutRoadBackground();
    }

    if (!this.arrowText) {
      this.arrowText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, '', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(90, Math.round(this.scale.width * 0.22))}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(15);
      this.arrowText.setShadow(0, 2, '#000000', 8, true, true);
    }

    const arrow = spec.goLeft ? '←' : '→';
    this.arrowText.setText(arrow);

    if (spec.isStopTrial) {
      this.arrowText.setAlpha(0.0);

      const badgeWidth = Math.min(280, Math.round(this.scale.width * 0.72));
      const badgeHeight = Math.min(90, Math.round(this.scale.height * 0.12));

      const badgeBg = this.add
        .rectangle(this.scale.width / 2, this.scale.height / 2, badgeWidth, badgeHeight, 0xef4444, 1)
        .setOrigin(0.5)
        .setDepth(20);

      badgeBg.setStrokeStyle(3, 0xffffff, 0.9);

      const badgeText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'STOP', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(36, Math.round(this.scale.width * 0.1))}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(21);

      this.stopBadge = this.add.container(0, 0, [badgeBg, badgeText]);
      this.stopBadge.setDepth(22);

      this.leftTapBg?.setAlpha(0.45);
      this.rightTapBg?.setAlpha(0.45);
      this.leftTapLabel?.setAlpha(0.7);
      this.rightTapLabel?.setAlpha(0.7);
    } else {
      this.arrowText.setAlpha(1.0);
      this.leftTapBg?.setAlpha(1);
      this.rightTapBg?.setAlpha(1);
      this.leftTapLabel?.setAlpha(1);
      this.rightTapLabel?.setAlpha(1);
    }

    if (!this.pressedHint) {
      this.pressedHint = this.add
        .text(this.scale.width / 2, this.scale.height - 90, '', {
          fontFamily: 'Arial Bold',
          fontSize: `${Math.min(22, Math.round(this.scale.width * 0.06))}px`,
          color: '#e5e7eb',
        })
        .setOrigin(0.5)
        .setDepth(16);
    }
    this.pressedHint.setAlpha(0);
  }

  mapPointerInput(pointer: Phaser.Input.Pointer) {
    return pointer.x < this.scale.width / 2 ? 'left' : 'right';
  }

  mapKeyboardInput(code: string) {
    if (code === 'ArrowLeft') return 'left';
    if (code === 'ArrowRight') return 'right';
    return null;
  }

  mapControllerResponseFromInput(_spec: StopSignalTrialSpec, kind: 'space' | 'left' | 'right') {
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
