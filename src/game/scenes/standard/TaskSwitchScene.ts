import Phaser from 'phaser';
import { BaseTrialScene } from '../BaseTrialScene';
import type { AnyTrialResult, TaskSwitchResponse, TaskSwitchTrialSpec } from '../../trialControllers/types';
import { TaskSwitchController } from '../../trialControllers/taskSwitchController';
import { playCorrectSound, playNeutralSound } from '../../../utils/juniorFeedback';

const BASE_ASSET = (import.meta.env?.BASE_URL || '/') as string;
const TASKSWITCH_BG_URL = `${BASE_ASSET}assets/images/standard/taskswitch-lab-bg.svg`;

export class TaskSwitchScene extends BaseTrialScene<TaskSwitchTrialSpec> {
  constructor() {
    super('TaskSwitchScene');
    this.totalTrials = 48;
    this.moduleId = 'taskswitch';
    this.controller = new TaskSwitchController({});
  }

  private bgImage: Phaser.GameObjects.Image | null = null;
  private panelText: Phaser.GameObjects.Text | null = null;
  private leftLabelText: Phaser.GameObjects.Text | null = null;
  private rightLabelText: Phaser.GameObjects.Text | null = null;
  private valueText: Phaser.GameObjects.Text | null = null;

  private setPressedVisual(kind: 'left' | 'right') {
    if (!this.valueText) return;
    this.valueText.setColor(kind === 'left' ? '#93c5fd' : '#bfdbfe');
    this.tweens.add({
      targets: this.valueText,
      duration: 120,
      alpha: 0.85,
      yoyo: true,
    });
  }

  preload() {
    this.load.image('taskswitch-bg', TASKSWITCH_BG_URL);
  }

  renderStimulus(spec: TaskSwitchTrialSpec) {
    // Background
    if (!this.bgImage) {
      this.bgImage = this.add
        .image(this.scale.width / 2, 0, 'taskswitch-bg')
        .setOrigin(0.5, 0);
      this.bgImage.setDisplaySize(this.scale.width, this.scale.height);
    }

    const panel = spec.rule === 'parity' ? 'RÈGLE: PAIR/IMPAIR' : 'RÈGLE: >5 / ≤5';
    const leftLabel = spec.rule === 'parity' ? 'Pair' : '> 5';
    const rightLabel = spec.rule === 'parity' ? 'Impair' : '≤ 5';

    const panelFontSize = Math.min(18, Math.round(this.scale.width * 0.05));
    const labelFontSize = Math.min(18, Math.round(this.scale.width * 0.045));
    const valueFontSize = Math.min(88, Math.round(this.scale.width * 0.2));

    // Panel
    if (!this.panelText) {
      this.panelText = this.add
        .text(this.scale.width / 2, 34, panel, {
          fontFamily: 'Arial Bold',
          fontSize: `${panelFontSize}px`,
          color: '#ffffff',
          backgroundColor: 'rgba(17,24,39,0.75)',
        })
        .setOrigin(0.5, 0);
      this.panelText.setPadding(10, 6, 10, 6);
    } else {
      this.panelText.setText(panel);
    }

    // Left / Right labels + value
    if (!this.leftLabelText) {
      this.leftLabelText = this.add
        .text(this.scale.width * 0.25, this.scale.height / 2, leftLabel, {
          fontFamily: 'Arial Bold',
          fontSize: `${labelFontSize}px`,
          color: '#fde68a',
        })
        .setOrigin(0.5);
    } else {
      this.leftLabelText.setText(leftLabel);
    }

    if (!this.rightLabelText) {
      this.rightLabelText = this.add
        .text(this.scale.width * 0.75, this.scale.height / 2, rightLabel, {
          fontFamily: 'Arial Bold',
          fontSize: `${labelFontSize}px`,
          color: '#bfdbfe',
        })
        .setOrigin(0.5);
    } else {
      this.rightLabelText.setText(rightLabel);
    }

    if (!this.valueText) {
      this.valueText = this.add
        .text(this.scale.width / 2, this.scale.height / 2 + 12, String(spec.value), {
          fontFamily: 'Arial Bold',
          fontSize: `${valueFontSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5);
    } else {
      this.valueText.setText(String(spec.value));
      this.valueText.setColor('#ffffff');
    }
  }

  mapPointerInput(pointer: Phaser.Input.Pointer) {
    return pointer.x < this.scale.width / 2 ? 'left' : 'right';
  }

  mapKeyboardInput(code: string) {
    if (code === 'ArrowLeft') return 'left';
    if (code === 'ArrowRight') return 'right';
    return null;
  }

  mapControllerResponseFromInput(spec: TaskSwitchTrialSpec, kind: 'space' | 'left' | 'right') {
    if (kind === 'left') {
      this.setPressedVisual('left');
      return 'left' as TaskSwitchResponse;
    }
    if (kind === 'right') {
      this.setPressedVisual('right');
      return 'right' as TaskSwitchResponse;
    }
    return null;
  }

  getNoResponse(_spec: TaskSwitchTrialSpec) {
    return null as TaskSwitchResponse;
  }

  protected renderFeedback(result: AnyTrialResult) {
    super.renderFeedback(result);
    if (result.correct) playCorrectSound();
    else playNeutralSound();
  }
}

