import React from 'react';
import { useTaskManager } from '../store/taskManager';

/**
 * Real-time metrics display during an active session
 * Shows: progress bar, accuracy, RT, current level, time elapsed
 */
export function SessionMetricsHUD() {
  const currentSession = useTaskManager((s) => s.currentSession);
  const currentBlock = useTaskManager((s) => s.currentBlock);
  const getSessionProgress = useTaskManager((s) => s.getSessionProgress);
  const getSessionElapsedSeconds = useTaskManager((s) => s.getSessionElapsedSeconds);
  const getEstimatedRemainingTime = useTaskManager((s) => s.getEstimatedRemainingTime);
  const getCurrentBlockTrialCount = useTaskManager((s) => s.getCurrentBlockTrialCount);

  if (!currentSession) {
    return null;
  }

  const progress = getSessionProgress();
  const elapsedSeconds = getSessionElapsedSeconds();
  const remainingSeconds = getEstimatedRemainingTime();
  const blockTrials = getCurrentBlockTrialCount();

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = Math.floor(elapsedSeconds % 60);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecs = Math.floor(remainingSeconds % 60);

  // Get block stats
  const blockAccuracy =
    currentBlock && currentBlock.trials.length > 0
      ? (currentBlock.trials.filter((t) => t.correct).length /
          currentBlock.trials.length) *
        100
      : 0;

  const blockMeanRT =
    currentBlock && currentBlock.trials.length > 0
      ? currentBlock.trials.reduce((sum, t) => sum + t.reactionTimeMs, 0) /
        currentBlock.trials.length
      : 0;

  const currentLevel = currentBlock?.trials[currentBlock.trials.length - 1]?.difficultyLevel || 1;

  return (
    <div className="session-metrics-hud">
      {/* Top bar: Progress and time */}
      <div className="hud-top-panel">
        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-label">Progress</div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                transition: 'width 0.3s ease-out',
              }}
            />
            <span className="progress-percent">{progress}%</span>
          </div>
        </div>

        {/* Time info */}
        <div className="time-section">
          <div className="time-item">
            <span className="time-label">Elapsed</span>
            <span className="time-value">
              {elapsedMinutes}:{String(elapsedSecs).padStart(2, '0')}
            </span>
          </div>
          <div className="time-item">
            <span className="time-label">Remaining</span>
            <span className="time-value">
              {remainingMinutes}:{String(remainingSecs).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar: Metrics */}
      <div className="hud-bottom-panel">
        <div className="metric-group">
          <div className="metric">
            <span className="metric-label">Trials</span>
            <span className="metric-value">{blockTrials}</span>
          </div>

          <div className="metric">
            <span className="metric-label">Accuracy</span>
            <span className="metric-value" style={{ color: getAccuracyColor(blockAccuracy) }}>
              {blockAccuracy.toFixed(0)}%
            </span>
          </div>

          <div className="metric">
            <span className="metric-label">Avg RT</span>
            <span className="metric-value">{Math.round(blockMeanRT)}ms</span>
          </div>

          <div className="metric">
            <span className="metric-label">Level</span>
            <span className="metric-value">{currentLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 75) return '#10b981'; // green
  if (accuracy >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}
