import Phaser from 'phaser';
import { createStaircase, updateStaircase } from '../../../engine/staircase';
import type { StaircaseConfig, StaircaseState, PhaserTrialResult } from '../../../types/adaptive';
import { playCorrectSound, playNeutralSound } from '../../../utils/juniorFeedback';

/**
 * GoNoGo Experience animée avec Phaser
 * Remplace jsPsych HTML avec des graphiques Phaser fluides
 */
export class GoNoGoScene extends Phaser.Scene {
  private currentTrial = 0;
  private totalTrials = 0;
  private isGo = false;
  private respondedThisTrial = false;
  private responseWindowStart = 0;
  private staircaseState: StaircaseState | null = null;
  private staircaseConfig: StaircaseConfig | null = null;
  private results: PhaserTrialResult[] = [];
  private onExperimentFinish: ((results: PhaserTrialResult[]) => void) | null = null;
  private stimulusDisplayTime = 0;
  private responseDeadline = 0;
  private pondBG: Phaser.GameObjects.Image | null = null;

  // Visual assets & properties
  private goImage: Phaser.GameObjects.Image | null = null;
  private nogoImage: Phaser.GameObjects.Image | null = null;
  private levelIndicator: Phaser.GameObjects.Text | null = null;
  private feedbackCircle: Phaser.GameObjects.Ellipse | null = null;

  constructor() {
    super('GoNoGoScene');
  }

  init(data: {
    config: {
      totalTrials: number;
      staircase: StaircaseConfig;
      goRatio: number;
      stimulusDuration: number;
      responseWindow: number;
    };
    onExperimentFinish: (results: PhaserTrialResult[]) => void;
  }) {
    this.totalTrials = data.config.totalTrials;
    this.staircaseConfig = data.config.staircase;
    this.staircaseState = createStaircase(data.config.staircase);
    this.onExperimentFinish = data.onExperimentFinish;
  }

  preload() {
    const BASE = (import.meta.env?.BASE_URL || '/') as string;
    this.load.image('frog-green', `${BASE}assets/images/junior/frog-green.svg`);
    this.load.image('toad-red', `${BASE}assets/images/junior/toad-red.svg`);
    this.load.image('pond-bg', `${BASE}assets/images/junior/pond-bg.svg`);
  }

  create() {
    // Background
    this.pondBG = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'pond-bg')
      .setDisplaySize(this.scale.width * 0.9, this.scale.height * 0.8);

    // Level indicator (top-right)
    this.levelIndicator = this.add
      .text(this.scale.width - 40, 40, `Lvl ${this.staircaseState!.currentLevel}`, {
        fontSize: '24px',
        color: '#fff',
        fontFamily: 'Arial Bold',
      })
      .setOrigin(1, 0);

    // Feedback circle (center, hidden initially)
    this.feedbackCircle = this.add
      .ellipse(
        this.scale.width / 2,
        this.scale.height / 2,
        120,
        120
      )
      .setStrokeStyle(3, 0xffffff)
      .setVisible(false);

    // Input handling
    this.input.on('pointerdown', this.handleTap, this);
    this.input.on('pointerup', this.handleTapEnd, this);

    // Start first trial
    this.startNextTrial();
  }

  private startNextTrial() {
    if (this.currentTrial >= this.totalTrials) {
      this.finishExperiment();
      return;
    }

    // Randomize Go/NoGo
    const config = {
      goRatio: 0.7,
      stimulusDuration: 800,
      responseWindow: 3000,
    };
    this.isGo = Math.random() < config.goRatio;

    const level = this.staircaseState!.currentLevel;
    const duration = Math.max(350, config.stimulusDuration - (level - 1) * 45);
    const window = Math.max(1200, config.responseWindow - (level - 1) * 180);

    // Show stimulus
    this.respondedThisTrial = false;
    this.showStimulus(this.isGo);
    this.stimulusDisplayTime = this.time.now;
    this.responseWindowStart = this.time.now + duration;
    this.responseDeadline = this.time.now + window;

    // Auto-advance after response window
    this.time.delayedCall(window, () => {
      this.endTrial();
    });
  }

  private showStimulus(isGo: boolean) {
    // Clear previous
    if (this.goImage) this.goImage.destroy();
    if (this.nogoImage) this.nogoImage.destroy();

    // Create new stimulus with animation
    const stimulus = isGo
      ? this.add.image(this.scale.width / 2, this.scale.height / 2, 'frog-green')
      : this.add.image(this.scale.width / 2, this.scale.height / 2, 'toad-red');

    stimulus.setDisplaySize(100, 100).setAlpha(0);

    // Fade in animation
    this.tweens.add({
      targets: stimulus,
      alpha: 1,
      duration: 200,
      ease: 'Power2.easeOut',
    });

    if (isGo) {
      this.goImage = stimulus as Phaser.Physics.Arcade.Sprite;
    } else {
      this.nogoImage = stimulus as Phaser.Physics.Arcade.Sprite;
    }
  }

  private handleTap() {
    if (this.currentTrial < this.totalTrials) {
      this.respondedThisTrial = true;
      this.showFeedback(true);
    }
  }

  private handleTapEnd() {
    // Tap handled
  }

  private showFeedback(responded: boolean) {
    if (!this.feedbackCircle) return;

    const isCorrect = this.isGo ? responded : !responded;
    this.feedbackCircle
      .setFillStyle(isCorrect ? 0x22c55e : 0xef4444)
      .setVisible(true)
      .setAlpha(1);

    // Play sound
    if (isCorrect) {
      playCorrectSound();
    } else {
      playNeutralSound();
    }

    // Fade out feedback
    this.tweens.add({
      targets: this.feedbackCircle,
      alpha: 0,
      duration: 400,
      delay: 200,
      onComplete: () => {
        this.feedbackCircle?.setVisible(false);
      },
    });
  }

  private endTrial() {
    const responded = this.respondedThisTrial;
    const correct = this.isGo ? responded : !responded;

    // Update staircase
    this.staircaseState = updateStaircase(
      this.staircaseState!,
      correct,
      this.staircaseConfig!
    );

    // Store result
    const trialData = {
      trialIndex: this.currentTrial,
      stimulusType: this.isGo ? 'go' : 'nogo',
      response: responded ? 'tap' : null,
      reactionTimeMs: responded
        ? Math.max(0, this.time.now - this.responseWindowStart)
        : 0,
      correct,
      difficultyLevel: this.staircaseState!.currentLevel,
    };

    this.results.push(trialData);
    this.currentTrial++;

    // Update level display
    if (this.levelIndicator) {
      this.levelIndicator.setText(`Lvl ${this.staircaseState!.currentLevel}`);
    }

    // Clear stimulus
    if (this.goImage) this.goImage.destroy();
    if (this.nogoImage) this.nogoImage.destroy();

    // Next trial or finish
    this.time.delayedCall(500, () => {
      this.startNextTrial();
    });
  }

  private finishExperiment() {
    if (this.onExperimentFinish) {
      this.onExperimentFinish(this.results);
    }
    this.scene.stop();
  }

  update() {
    // Frame-by-frame update logic (if needed)
  }
}
