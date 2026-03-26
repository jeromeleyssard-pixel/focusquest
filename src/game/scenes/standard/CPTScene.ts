import Phaser from 'phaser';
import { createStaircase, updateStaircase } from '../../../engine/staircase';
import type { StaircaseConfig, StaircaseState, PhaserTrialResult } from '../../../types/adaptive';
import { playCorrectSound, playNeutralSound } from '../../../utils/juniorFeedback';
import { EventBus } from '../../EventBus';
import { PHASER_EXPERIMENT_FINISHED } from '../BaseTrialScene';

type Stimulus = 'A' | 'X' | 'B' | 'Y';

interface CPTTrial {
  stimulus: Stimulus;
  isPrecededByA: boolean;
  isTarget: boolean;
}

/**
 * CPT-AX Experience animée avec Phaser
 * Continuous Performance Test avec paradigme AX
 */
export class CPTScene extends Phaser.Scene {
  private currentTrial = 0;
  private totalTrials = 0;
  private sequence: CPTTrial[] = [];
  private currentSequenceIndex = 0;
  private respondedThisTrial = false;
  private responseWindowStart = 0;
  private stimulusDisplayTime = 0;
  private responseDeadline = 0;
  private responseTimeMs: number | null = null;
  private preTrialLevel = 1;
  private staircaseState: StaircaseState | null = null;
  private staircaseConfig: StaircaseConfig | null = null;
  private results: PhaserTrialResult[] = [];
  private onExperimentFinish: ((results: PhaserTrialResult[]) => void) | null = null;

  // Visual assets & properties
  private letterText: Phaser.GameObjects.Text | null = null;
  private radarBG: Phaser.GameObjects.Image | null = null;
  private levelIndicator: Phaser.GameObjects.Text | null = null;
  private feedbackRing: Phaser.GameObjects.Ellipse | null = null;
  private accuracyText: Phaser.GameObjects.Text | null = null;
  private trialProgressText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('CPTScene');
  }

  init(data?: {
    config?: {
      totalTrials: number;
      staircase: StaircaseConfig;
    };
    onExperimentFinish?: (results: PhaserTrialResult[]) => void;
  }) {
    const defaultStaircase: StaircaseConfig = {
      mode: '2-down-1-up',
      targetAccuracy: 0.75,
      stepSize: 1,
      minLevel: 1,
      maxLevel: 10,
      initialLevel: 1,
    };

    if (data?.config) {
      this.totalTrials = data.config.totalTrials;
      this.staircaseConfig = data.config.staircase;
    } else {
      this.totalTrials = 30;
      this.staircaseConfig = defaultStaircase;
    }
    this.staircaseState = createStaircase(this.staircaseConfig);
    this.onExperimentFinish = data?.onExperimentFinish ?? null;
    this.sequence = this.generateCPTSequence(this.totalTrials);
  }

  preload() {
    const BASE = (import.meta.env?.BASE_URL || '/') as string;
    this.load.image('cpt-radar-bg', `${BASE}assets/images/standard/cpt-radar-bg.svg`);
  }

  create() {
    this.radarBG = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'cpt-radar-bg')
      .setDisplaySize(this.scale.width * 0.8, this.scale.height * 0.7);
    this.layoutRadarBackground();

    this.trialProgressText = this.add
      .text(this.scale.width / 2, 22, '', {
        fontSize: '15px',
        color: '#e5e7eb',
        fontFamily: 'Arial Bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(25);

    // Level indicator (top-right)
    this.levelIndicator = this.add
      .text(this.scale.width - 40, 44, `Lvl ${this.staircaseState!.currentLevel}`, {
        fontSize: '22px',
        color: '#fff',
        fontFamily: 'Arial Bold',
      })
      .setOrigin(1, 0)
      .setDepth(20);

    // Accuracy counter (top-left)
    this.accuracyText = this.add
      .text(40, 44, '0/0 (-)', {
        fontSize: '15px',
        color: '#86efac',
        fontFamily: 'Arial',
      })
      .setOrigin(0, 0)
      .setDepth(20);

    this.scale.on('resize', () => {
      this.layoutRadarBackground();
      if (this.trialProgressText) {
        this.trialProgressText.setPosition(this.scale.width / 2, 22);
      }
      if (this.levelIndicator) {
        this.levelIndicator.setPosition(this.scale.width - 40, 44);
      }
      if (this.accuracyText) {
        this.accuracyText.setPosition(40, 44);
      }
    });

    // Letter display (center)
    this.letterText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontSize: '120px',
        color: '#ffffff',
        fontFamily: 'Arial Bold',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Feedback ring (center, hidden initially)
    this.feedbackRing = this.add
      .ellipse(
        this.scale.width / 2,
        this.scale.height / 2,
        150,
        150
      )
      .setStrokeStyle(4, 0xffffff)
      .setVisible(false);

    // Tap button (bottom)
    const tapBtn = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height - 80,
        200,
        60,
        0x0d7377
      )
      .setInteractive()
      .setDepth(10);

    this.add
      .text(this.scale.width / 2, this.scale.height - 80, 'Appuyer', {
        fontSize: '20px',
        color: '#fff',
        fontFamily: 'Arial Bold',
      })
      .setOrigin(0.5)
      .setDepth(11);

    tapBtn.on('pointerdown', () => {
      if (this.currentTrial < this.totalTrials) {
        this.respondedThisTrial = true;
        if (this.responseTimeMs == null) {
          this.responseTimeMs = this.time.now - this.stimulusDisplayTime;
        }
        this.showFeedback();
      }
    });

    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.currentTrial < this.totalTrials) {
        this.respondedThisTrial = true;
        if (this.responseTimeMs == null) {
          this.responseTimeMs = this.time.now - this.stimulusDisplayTime;
        }
        this.showFeedback();
      }
    });

    this.startNextTrial();
  }

  private layoutRadarBackground() {
    if (!this.radarBG) return;
    const frame = this.textures.get('cpt-radar-bg').get();
    const srcW = frame.width;
    const srcH = frame.height;
    const gw = this.scale.width;
    const gh = this.scale.height;
    const s = Math.max((gw * 0.92) / srcW, (gh * 0.85) / srcH);
    this.radarBG.setDisplaySize(srcW * s, srcH * s);
    this.radarBG.setPosition(gw / 2, gh / 2);
    this.radarBG.setOrigin(0.5, 0.5);
  }

  private generateCPTSequence(n: number, targetRatio = 0.25): CPTTrial[] {
    const trials: CPTTrial[] = [];
    let prevWasA = false;

    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let stim: Stimulus;

      if (prevWasA && r < targetRatio) {
        stim = 'X';
      } else if (r < 0.25) {
        stim = 'A';
      } else if (r < 0.5) {
        stim = 'B';
      } else {
        stim = 'Y';
      }

      trials.push({
        stimulus: stim,
        isPrecededByA: prevWasA,
        isTarget: stim === 'X' && prevWasA,
      });

      prevWasA = stim === 'A';
    }

    return trials;
  }

  private startNextTrial() {
    if (this.currentTrial >= this.totalTrials) {
      this.finishExperiment();
      return;
    }

    if (this.trialProgressText) {
      this.trialProgressText.setText(
        `Essai ${this.currentTrial + 1} / ${this.totalTrials}`
      );
    }

    const trial = this.sequence[this.currentSequenceIndex];
    if (!trial) {
      this.finishExperiment();
      return;
    }

    const level = this.staircaseState!.currentLevel;
    this.preTrialLevel = level;
    const duration = Math.max(500, 900 - (level - 1) * 35);
    const window = Math.max(2200, 3200 - (level - 1) * 80);

    // Show letter
    this.respondedThisTrial = false;
    this.responseTimeMs = null;
    this.displayLetter(trial.stimulus);
    this.stimulusDisplayTime = this.time.now;
    this.responseWindowStart = this.time.now + duration;
    this.responseDeadline = this.time.now + window;

    // Auto-advance after
    this.time.delayedCall(window, () => {
      this.endTrial(trial);
    });
  }

  private displayLetter(letter: Stimulus) {
    if (!this.letterText) return;

    this.letterText.setText(letter).setAlpha(0);

    // Fade in with glow effect
    this.tweens.add({
      targets: this.letterText,
      alpha: 1,
      duration: 150,
      ease: 'Power2.easeOut',
    });

    // Add shadow effect for visibility
    this.letterText.setStyle({
      color: '#ffffff',
      textShadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 8,
        fill: true,
      },
    });
  }

  private showFeedback() {
    if (!this.feedbackRing) return;

    this.feedbackRing.setVisible(true).setAlpha(1);

    // Pulse animation
    this.tweens.add({
      targets: this.feedbackRing,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.feedbackRing?.setScale(1).setVisible(false);
      },
    });
  }

  private endTrial(trial: CPTTrial) {
    const responded = this.respondedThisTrial;
    const correct = trial.isTarget ? responded : !responded;

    if (correct) playCorrectSound();
    else playNeutralSound();

    // Update staircase
    this.staircaseState = updateStaircase(
      this.staircaseState!,
      correct,
      this.staircaseConfig!
    );

    // Calculate current accuracy
    const correctTrials = this.results.filter((t) => t.correct).length + (correct ? 1 : 0);
    const accuracy = ((correctTrials / (this.currentTrial + 1)) * 100).toFixed(0);

    // Store result
    const trialData = {
      trialIndex: this.currentTrial,
      stimulus: trial.stimulus,
      response: responded ? 'keypress' : null,
      reactionTimeMs: responded
        ? Math.max(0, this.responseTimeMs ?? 0)
        : 0,
      correct,
      difficultyLevel: this.preTrialLevel,
      isTarget: trial.isTarget,
    };

    this.results.push(trialData);
    this.currentTrial++;
    this.currentSequenceIndex++;

    // Update displays
    if (this.levelIndicator) {
      this.levelIndicator.setText(`Lvl ${this.staircaseState.currentLevel}`);
    }
    if (this.accuracyText) {
      this.accuracyText.setText(`${correctTrials}/${this.currentTrial} (${accuracy}%)`);
    }

    // Clear stimu lus
    if (this.letterText) {
      this.letterText.setAlpha(0);
    }

    // Next trial or finish
    this.time.delayedCall(600, () => {
      this.startNextTrial();
    });
  }

  private finishExperiment() {
    if (this.onExperimentFinish) {
      this.onExperimentFinish(this.results);
    }
    EventBus.emit(PHASER_EXPERIMENT_FINISHED, {
      moduleId: 'cpt',
      results: this.results.map((r) => ({
        correct: r.correct,
        reactionTimeMs: r.reactionTimeMs,
        difficultyLevel: r.difficultyLevel,
      })),
    });
    this.scene.stop();
  }

  update() {
    // Frame-by-frame updates
  }
}
