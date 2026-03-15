/** Compte à rebours non chiffré pour Junior : un escargot avance le long d'un chemin, avec étapes (maisons) tous les 3 min. */
export interface SnailTimerProps {
  elapsedSeconds: number;
  /** Temps déjà utilisé dans cette session (autres jeux), en secondes. */
  sessionUsedSeconds?: number;
  maxSeconds: number;
  /** Intervalle entre chaque étape (ex. 180 = 3 min). */
  pauseIntervalSeconds?: number;
}

const MILESTONE_COLORS = ['#2e7d32', '#1565c0', '#6a1b9a'];

export function SnailTimer({
  elapsedSeconds,
  sessionUsedSeconds = 0,
  maxSeconds,
  pauseIntervalSeconds = 180,
}: SnailTimerProps) {
  const totalSeconds = sessionUsedSeconds + elapsedSeconds;
  const progress = maxSeconds > 0 ? Math.min(1, totalSeconds / maxSeconds) : 0;

  const milestones: number[] = [];
  for (let s = pauseIntervalSeconds; s < maxSeconds; s += pauseIntervalSeconds) {
    milestones.push(s);
  }

  return (
    <div className="snail-timer" style={styles.container} aria-hidden>
      <div style={styles.track}>
        <div style={styles.path} />
        {milestones.map((sec, i) => {
          const p = maxSeconds > 0 ? Math.min(1, sec / maxSeconds) : 0;
          return (
            <div
              key={sec}
              style={{
                ...styles.milestone,
                left: `${8 + p * 84}%`,
                color: MILESTONE_COLORS[i % MILESTONE_COLORS.length],
              }}
              title={`Étape ${sec / 60} min`}
            >
              🏠
            </div>
          );
        })}
        <div
          style={{
            ...styles.snail,
            left: `${8 + progress * 84}%`,
          }}
          role="img"
          aria-label="Progression de la session"
        >
          🐌
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '8px 16px',
  },
  track: {
    position: 'relative',
    height: 32,
    minWidth: 120,
    maxWidth: 200,
  },
  path: {
    position: 'absolute',
    top: 14,
    left: '4%',
    right: '4%',
    height: 6,
    borderRadius: 4,
    background: 'var(--fq-surface)',
    border: '1px solid var(--fq-text-muted)',
  },
  milestone: {
    position: 'absolute',
    top: -4,
    transform: 'translateX(-50%)',
    fontSize: 16,
    lineHeight: 1,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))',
  },
  snail: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 28,
    lineHeight: 1,
    transition: 'left 1s linear',
  },
};
