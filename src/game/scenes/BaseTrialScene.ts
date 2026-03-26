import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import type {
  AnyTrialResult,
  TrialController,
  TrialSpecBase,
} from '../trialControllers/types';

export const PHASER_EXPERIMENT_FINISHED = 'phaser-experiment-finished';

type PointerInputKind = 'space' | 'left' | 'right';

/**
 * Base scene implementing a common trial loop:
 * stimulus -> (input) -> feedback -> transition to next trial
 *
 * It is renderer-agnostic: it relies on a TrialController (adaptive logic)
 * and asks subclasses to render the stimulus + map inputs.
 */
export abstract class BaseTrialScene<TSpec extends TrialSpecBase> extends Phaser.Scene {
  protected controller!: TrialController<TSpec>;
  protected totalTrials = 0;
  protected moduleId = 'unknown';

  protected results: AnyTrialResult[] = [];

  private currentSpec: TSpec | null = null;
  private currentTrialIndex = 0;

  private trialTimer: Phaser.Time.TimerEvent | null = null;
  private stimulusOnsetMs = 0;

  private responded = false;
  private storedResponse: unknown = null;
  private storedReactionTimeMs: number | null = null;
  private isFinalizing = false;

  private feedbackMs = 450;
  private feedbackEllipse: Phaser.GameObjects.Ellipse | null = null;

  protected abstract renderStimulus(spec: TSpec): void;
  protected abstract mapPointerInput(pointer: Phaser.Input.Pointer): PointerInputKind | null;
  protected abstract mapKeyboardInput(code: string): PointerInputKind | null;
  protected abstract mapControllerResponseFromInput(spec: TSpec, kind: PointerInputKind): unknown | null;
  protected abstract getNoResponse(spec: TSpec): unknown;

  protected renderFeedback(result: AnyTrialResult) {
    if (!this.feedbackEllipse) return;
    const correct = result.correct;
    this.feedbackEllipse.setVisible(true);

    const color = correct ? 0x22c55e : 0xef4444; // green/red
    this.feedbackEllipse.setFillStyle(color, 0.25);
    this.feedbackEllipse.setStrokeStyle(4, correct ? 0x22c55e : 0xef4444, 1);

    // Pulse (GPU friendly: scale/opacity)
    this.feedbackEllipse.setScale(1);
    this.tweens.add({
      targets: this.feedbackEllipse,
      scale: 1.18,
      alpha: 0,
      duration: this.feedbackMs,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.feedbackEllipse?.setVisible(false);
        this.feedbackEllipse?.setAlpha(1);
      },
    });
  }

  create() {
    // Feedback overlay
    this.feedbackEllipse = this.add
      .ellipse(this.scale.width / 2, this.scale.height / 2, 220, 220, 0xffffff)
      .setVisible(false)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(50);

    // Input listeners: pointer + keyboard
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.currentSpec || this.isFinalizing) return;
      const kind = this.mapPointerInput(pointer);
      if (!kind) return;
      this.handleResponseInput(kind);
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.currentSpec || this.isFinalizing) return;
      const kind = this.mapKeyboardInput(event.code);
      if (!kind) return;
      this.handleResponseInput(kind);
    });

    this.startNextTrial();
  }

  private handleResponseInput(kind: PointerInputKind) {
    if (!this.currentSpec) return;

    if (!this.responded) {
      const mapped = this.mapControllerResponseFromInput(this.currentSpec, kind);
      if (mapped === null) return; // input not relevant for this trial

      this.responded = true;
      this.storedResponse = mapped;
      this.storedReactionTimeMs = this.time.now - this.stimulusOnsetMs;
    }

    // If response ends the trial, finalize immediately.
    if (this.currentSpec.responseEndsTrial && !this.isFinalizing) {
      this.finalizeTrial();
    }
  }

  protected startNextTrial() {
    this.isFinalizing = false;
    this.responded = false;
    this.storedResponse = null;
    this.storedReactionTimeMs = null;

    if (this.currentTrialIndex >= this.totalTrials) {
      this.finishExperiment();
      return;
    }

    const spec = this.controller.nextTrial();
    this.currentSpec = spec;
    this.renderStimulus(spec);

    this.stimulusOnsetMs = this.time.now;

    // Stop any previous timer (safety)
    if (this.trialTimer) this.trialTimer.remove(false);

    this.trialTimer = this.time.delayedCall(spec.trialDurationMs, () => {
      if (this.isFinalizing) return;
      this.finalizeTrial();
    });
    this.currentTrialIndex++;
  }

  private finalizeTrial() {
    if (!this.currentSpec || this.isFinalizing) return;
    this.isFinalizing = true;

    // Cancel timer to avoid double-finalize
    if (this.trialTimer) this.trialTimer.remove(false);

    const responseToSubmit = this.responded ? this.storedResponse : this.getNoResponse(this.currentSpec);
    const rtToSubmit = this.responded ? this.storedReactionTimeMs : null;

    const { result } = this.controller.submitResponse(this.currentSpec, responseToSubmit, rtToSubmit);
    this.results.push(result);
    this.renderFeedback(result);

    this.time.delayedCall(this.feedbackMs, () => {
      this.currentSpec = null;
      this.startNextTrial();
    });
  }

  protected finishExperiment() {
    EventBus.emit(PHASER_EXPERIMENT_FINISHED, {
      moduleId: this.moduleId,
      results: this.results,
    });
    this.scene.stop();
  }

  update() {
    // no-op: all timing handled by timers
  }
}

