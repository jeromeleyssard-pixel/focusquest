import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import type { ModuleId } from '../types/profile';
import type { SessionSummary } from '../types/session';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

const JUNIOR_MODULES: ModuleId[] = ['gonogo', 'oneback', 'dccs'];
const JUNIOR_MODULE_LABELS: Record<string, string> = {
  gonogo: 'Go/NoGo',
  oneback: '1-Back',
  dccs: 'DCCS',
};

const CHART_COLORS = {
  moyenne: { border: '#0D7377', background: 'rgba(13, 115, 119, 0.1)' },
  gonogo:  { border: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)' },
  oneback: { border: '#1565c0', background: 'rgba(21, 101, 192, 0.1)' },
  dccs:    { border: '#6a1b9a', background: 'rgba(106, 27, 154, 0.1)' },
  standard: [
    { border: '#0D7377', background: 'rgba(13, 115, 119, 0.1)' },
    { border: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)' },
    { border: '#1565c0', background: 'rgba(21, 101, 192, 0.1)' },
    { border: '#6a1b9a', background: 'rgba(106, 27, 154, 0.1)' },
  ],
  rt: { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
};

const STANDARD_MODULES: ModuleId[] = ['cpt', 'nback', 'stopsignal', 'taskswitch'];
const STANDARD_MODULE_LABELS: Record<string, string> = {
  cpt: 'CPT-AX',
  nback: 'N-Back',
  stopsignal: 'Stop-Signal',
  taskswitch: 'Task-Switch',
};

/** Format date "YYYY-MM-DD" → "10/04" */
function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Rebuild per-module level after each session (Junior) */
function juniorLevelsAfterEachSession(
  sessions: SessionSummary[]
): { gonogo: number; oneback: number; dccs: number }[] {
  const levels = { gonogo: 1, oneback: 1, dccs: 1 };
  return sessions.map((s) => {
    if (s.moduleId === 'gonogo') levels.gonogo = s.level;
    else if (s.moduleId === 'oneback') levels.oneback = s.level;
    else if (s.moduleId === 'dccs') levels.dccs = s.level;
    return { ...levels };
  });
}

/** Sort sessions by date ascending (immutable) */
function sortedByDate(sessions: SessionSummary[]): SessionSummary[] {
  return [...sessions].sort((a, b) =>
    (a.date ?? a.month) < (b.date ?? b.month) ? -1 : 1
  );
}

const COMMON_LINE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { labels: { color: '#e2e8f0' } } },
  scales: {
    x: { ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
  },
};

export function Dashboard() {
  const activeProfile = useProfileStore((s) => s.activeProfile);
  if (!activeProfile) return null;

  const isJunior = activeProfile.version === 'junior';
  const sorted = sortedByDate(activeProfile.sessions);
  const moduleIds = isJunior ? JUNIOR_MODULES : STANDARD_MODULES;

  /* ── Level progression chart ── */
  const progressData = isJunior
    ? (() => {
        const levelsAfter = juniorLevelsAfterEachSession(sorted);
        const labels = sorted.map((s) => fmtDate(s.date ?? s.month));
        const avg = levelsAfter.map(
          (l) => +((l.gonogo + l.oneback + l.dccs) / 3).toFixed(2)
        );
        return {
          labels,
          datasets: [
            {
              label: 'Moyenne',
              data: avg,
              tension: 0.3,
              borderColor: CHART_COLORS.moyenne.border,
              backgroundColor: CHART_COLORS.moyenne.background,
              fill: true,
            },
            ...(JUNIOR_MODULES as ('gonogo' | 'oneback' | 'dccs')[]).map((id, idx) => ({
              label: JUNIOR_MODULE_LABELS[id] ?? id,
              data: levelsAfter.map((l) => l[id]),
              tension: 0.3,
              borderColor: [CHART_COLORS.gonogo, CHART_COLORS.oneback, CHART_COLORS.dccs][idx].border,
              backgroundColor: [CHART_COLORS.gonogo, CHART_COLORS.oneback, CHART_COLORS.dccs][idx].background,
            })),
          ],
        };
      })()
    : (() => {
        // Shared timeline: all sessions in chronological order
        const labels = sorted.map((s) => fmtDate(s.date ?? s.month));
        return {
          labels,
          datasets: moduleIds.map((id, idx) => {
            // Build a sparse data array aligned to the shared label array
            const moduleSessions = sorted.filter((s) => s.moduleId === id);
            let mIdx = 0;
            const data = sorted.map((s) => {
              if (s.moduleId === id) {
                return moduleSessions[mIdx++]?.level ?? null;
              }
              return null;
            });
            return {
              label: STANDARD_MODULE_LABELS[id] ?? id,
              data,
              spanGaps: true,
              tension: 0.3,
              borderColor: CHART_COLORS.standard[idx % CHART_COLORS.standard.length].border,
              backgroundColor: CHART_COLORS.standard[idx % CHART_COLORS.standard.length].background,
            };
          }),
        };
      })();

  /* ── Accuracy chart ── */
  const accuracyData = {
    labels: sorted.map((s) => fmtDate(s.date ?? s.month)),
    datasets: moduleIds.map((id, idx) => {
      let mIdx = 0;
      const moduleSessions = sorted.filter((s) => s.moduleId === id);
      const data = sorted.map((s) => {
        if (s.moduleId === id) {
          const acc = moduleSessions[mIdx++]?.accuracy ?? null;
          return acc !== null ? Math.round(acc * 100) : null;
        }
        return null;
      });
      return {
        label: isJunior ? (JUNIOR_MODULE_LABELS[id] ?? id) : (STANDARD_MODULE_LABELS[id] ?? id),
        data,
        spanGaps: true,
        tension: 0.3,
        borderColor: (isJunior
          ? [CHART_COLORS.gonogo, CHART_COLORS.oneback, CHART_COLORS.dccs]
          : CHART_COLORS.standard)[idx % 4].border,
        backgroundColor: 'transparent',
      };
    }),
  };

  /* ── RT chart (only sessions with meanRT > 0) ── */
  const rtSessions = sorted.filter((s) => (s.meanRT ?? 0) > 0);
  const showRT = rtSessions.length >= 2;
  const rtData = {
    labels: rtSessions.map((s) => fmtDate(s.date ?? s.month)),
    datasets: [
      {
        label: 'TR moyen (ms)',
        data: rtSessions.map((s) => Math.round(s.meanRT ?? 0)),
        tension: 0.3,
        borderColor: CHART_COLORS.rt.border,
        backgroundColor: CHART_COLORS.rt.background,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Variabilité TR (ms)',
        data: rtSessions.map((s) => Math.round(s.rtisv ?? 0)),
        tension: 0.3,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        yAxisID: 'y',
      },
    ],
  };

  /* ── Radar (Standard) ── */
  const radarData =
    activeProfile.version === 'standard'
      ? {
          labels: ['Attention', 'Mémoire', 'Inhibition', 'Flexibilité'],
          datasets: [
            {
              data: moduleIds.map((id) => {
                const last = sorted.filter((s) => s.moduleId === id).at(-1);
                return last?.level ?? 1;
              }),
              fill: true,
              borderColor: '#0D7377',
              backgroundColor: 'rgba(13,115,119,0.2)',
            },
          ],
        }
      : null;

  const levelOptions = {
    ...COMMON_LINE_OPTIONS,
    scales: {
      ...COMMON_LINE_OPTIONS.scales,
      y: { ...COMMON_LINE_OPTIONS.scales.y, min: 0.5, max: 10, ticks: { color: '#94a3b8', stepSize: 1 } },
    },
  };
  const accOptions = {
    ...COMMON_LINE_OPTIONS,
    scales: {
      ...COMMON_LINE_OPTIONS.scales,
      y: { ...COMMON_LINE_OPTIONS.scales.y, min: 0, max: 100, ticks: { color: '#94a3b8', callback: (v: unknown) => `${v}%` } },
    },
  };

  return (
    <div className="fq-page fq-dashboard-wrap dashboard">
      <h2 className="fq-page-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 8 }}>
        Progression de {activeProfile.pseudo}
      </h2>

      {sorted.length === 0 ? (
        <p style={styles.emptyMessage}>
          Aucune session encore. Jouez à un jeu pour voir votre progression ici.
        </p>
      ) : (
        <>
          {/* Niveau */}
          <h3 style={styles.chartTitle}>Niveau de difficulté</h3>
          <div style={styles.chartWrap}>
            <Line data={progressData} options={levelOptions} />
          </div>

          {/* Précision */}
          <h3 style={styles.chartTitle}>Précision (%)</h3>
          <div style={styles.chartWrap}>
            <Line data={accuracyData} options={accOptions} />
          </div>

          {/* Temps de réaction */}
          {showRT && (
            <>
              <h3 style={styles.chartTitle}>Temps de réaction (ms)</h3>
              <p style={styles.subtitle}>
                TR moyen sur les essais corrects + variabilité (RTISV). Une variabilité élevée est un indicateur sensible au TDAH.
              </p>
              <div style={styles.chartWrap}>
                <Line data={rtData} options={COMMON_LINE_OPTIONS} />
              </div>
            </>
          )}

          {/* Radar */}
          {radarData && (
            <>
              <h3 style={styles.chartTitle}>Profil cognitif</h3>
              <div style={{ ...styles.chartWrap, maxWidth: 340 }}>
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: { r: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } } },
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <button
          type="button"
          className="fq-btn-primary"
          onClick={() => {
            const data = JSON.stringify(activeProfile, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focusquest-${activeProfile.pseudo}-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Exporter mes données
        </button>
        <Link to="/report" className="fq-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Rapport parent →
        </Link>
      </div>

      <p style={styles.disclaimer}>Données stockées uniquement sur cet appareil.</p>
      <p style={styles.disclaimer}>
        FocusQuest est un outil d&apos;entraînement, pas un dispositif médical. Ces indicateurs ne constituent pas un diagnostic.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  subtitle: { margin: '0 0 8px', fontSize: 13, color: 'var(--fq-text-muted)' },
  chartTitle: { margin: '20px 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--fq-text)' },
  emptyMessage: {
    margin: '0 0 24px',
    padding: 16,
    background: 'var(--fq-surface)',
    borderRadius: 8,
    color: 'var(--fq-text-muted)',
    fontSize: 14,
  },
  chartWrap: { width: '100%', maxWidth: 560, marginBottom: 12 },
  disclaimer: { fontSize: 12, color: 'var(--fq-text-muted)', marginTop: 8 },
};
