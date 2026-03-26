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
  gonogo: 'Go/NoGo (La mare)',
  oneback: '1-Back (Forêt)',
  dccs: 'DCCS (Laboratoire)',
};

const CHART_COLORS = {
  moyenne: { border: '#0D7377', background: 'rgba(13, 115, 119, 0.1)' },
  gonogo: { border: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)' },
  oneback: { border: '#1565c0', background: 'rgba(21, 101, 192, 0.1)' },
  dccs: { border: '#6a1b9a', background: 'rgba(106, 27, 154, 0.1)' },
  standard: [
    { border: '#0D7377', background: 'rgba(13, 115, 119, 0.1)' },
    { border: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)' },
    { border: '#1565c0', background: 'rgba(21, 101, 192, 0.1)' },
    { border: '#6a1b9a', background: 'rgba(106, 27, 154, 0.1)' },
  ],
};
const STANDARD_MODULES: ModuleId[] = [
  'cpt',
  'nback',
  'stopsignal',
  'taskswitch',
];
const STANDARD_MODULE_LABELS: Record<string, string> = {
  cpt: 'CPT-AX (Attention/Inhibition)',
  nback: 'N-Back (Mémoire)',
  stopsignal: 'Stop-Signal (Inhibition)',
  taskswitch: 'Task-Switch (Flexibilité)',
};

/** Replay sessions to get level of each Junior module after each session (for courbe générale + 3 courbes). */
function juniorLevelsAfterEachSession(
  sessions: { moduleId: ModuleId; level: number }[]
): { gonogo: number; oneback: number; dccs: number }[] {
  const levels = { gonogo: 1, oneback: 1, dccs: 1 };
  const result: { gonogo: number; oneback: number; dccs: number }[] = [];
  for (const s of sessions) {
    if (s.moduleId === 'gonogo') levels.gonogo = s.level;
    else if (s.moduleId === 'oneback') levels.oneback = s.level;
    else if (s.moduleId === 'dccs') levels.dccs = s.level;
    result.push({ ...levels });
  }
  return result;
}

export function Dashboard() {
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) return null;

  const sessions = activeProfile.sessions;
  const isJunior = activeProfile.version === 'junior';
  const moduleIds = isJunior ? JUNIOR_MODULES : STANDARD_MODULES;

  const progressData = isJunior
    ? (() => {
        const levelsAfter = juniorLevelsAfterEachSession(sessions);
        const labels = sessions.map((_, i) => `S${i + 1}`);
        const avg = levelsAfter.map(
          (l) => Math.round((l.gonogo + l.oneback + l.dccs) * 100) / 100
        );
        return {
          labels,
          datasets: [
            {
              label: 'Moyenne (3 jeux)',
              data: avg,
              tension: 0.3,
              borderColor: CHART_COLORS.moyenne.border,
              backgroundColor: CHART_COLORS.moyenne.background,
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
    : {
        labels: sessions.map((_, i) => `S${i + 1}`),
        datasets: moduleIds.map((id, idx) => ({
          label: STANDARD_MODULE_LABELS[id] ?? id,
          data: sessions.filter((s) => s.moduleId === id).map((s) => s.level),
          tension: 0.3,
          borderColor: CHART_COLORS.standard[idx % CHART_COLORS.standard.length].border,
          backgroundColor: CHART_COLORS.standard[idx % CHART_COLORS.standard.length].background,
        })),
      };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        min: 0.5,
        max: undefined as number | undefined,
        ticks: { stepSize: 1 },
      },
    },
  };

  const radarData =
    activeProfile.version === 'standard'
      ? {
          labels: ['Attention', 'Mémoire', 'Inhibition', 'Flexibilité'],
          datasets: [
            {
              data: moduleIds.map((id) => {
                const last = sessions.filter((s) => s.moduleId === id).at(-1);
                return last?.level ?? 1;
              }),
              fill: true,
            },
          ],
        }
      : null;

  return (
    <div className="fq-page fq-dashboard-wrap dashboard">
      <h2 className="fq-page-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 16 }}>
        Progression de {activeProfile.pseudo}
      </h2>
      {isJunior && (
        <p style={styles.subtitle}>
          Moyenne des 3 jeux + courbes par type d&apos;entraînement (inhibition, mémoire, flexibilité).
          Chaque bloc d&apos;environ 3 min ou fin de jeu enregistre un point.
        </p>
      )}
      {!isJunior && (
        <p style={styles.subtitle}>
          Courbes par domaine Standard : Attention, Mémoire, Inhibition et Flexibilité.
          Les pauses et fins de session enregistrent des points de progression.
        </p>
      )}
      {sessions.length === 0 ? (
        <p style={styles.emptyMessage}>
          Aucune session encore. Jouez à un jeu pour voir votre progression ici (chaque 3 min ou fin de partie enregistre un point).
        </p>
      ) : (
        <div style={styles.chartWrap}>
          <Line data={progressData} options={chartOptions} />
        </div>
      )}
      {radarData && (
        <div style={styles.chartWrap}>
          <Radar
            data={radarData}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </div>
      )}
      <button
        type="button"
        className="fq-btn-primary"
        style={{ marginBottom: 12 }}
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
      <Link to="/report" className="fq-link" style={{ display: 'inline-block', marginBottom: 16 }}>
        Voir le rapport parent →
      </Link>
      <p style={styles.disclaimer}>
        Données stockées uniquement sur cet appareil.
      </p>
      <p style={styles.disclaimer}>
        FocusQuest est un outil d&apos;entraînement, pas un dispositif médical.
        Ces indicateurs ne constituent pas un diagnostic.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  subtitle: {
    margin: '0 0 12px',
    fontSize: 14,
    color: 'var(--fq-text-muted)',
  },
  emptyMessage: {
    margin: '0 0 24px',
    padding: 16,
    background: 'var(--fq-surface)',
    borderRadius: 8,
    color: 'var(--fq-text-muted)',
    fontSize: 14,
  },
  chartWrap: { maxWidth: 560, height: 280, marginBottom: 24 },
  exportBtn: {
    marginBottom: 16,
    padding: '10px 20px',
    fontSize: 14,
    background: 'var(--fq-surface)',
    color: 'var(--fq-text)',
    border: '1px solid var(--fq-text-muted)',
    borderRadius: 8,
    cursor: 'pointer',
  },
  reportLink: {
    display: 'inline-block',
    marginBottom: 16,
    marginLeft: 12,
    padding: '10px 20px',
    fontSize: 14,
    background: 'var(--fq-primary)',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
  },
  disclaimer: {
    fontSize: 12,
    color: 'var(--fq-text-muted)',
    marginTop: 8,
  },
};
