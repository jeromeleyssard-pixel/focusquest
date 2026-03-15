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
const STANDARD_MODULES: ModuleId[] = [
  'cpt',
  'nback',
  'stopsignal',
  'taskswitch',
];

export function Dashboard() {
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) return null;

  const sessions = activeProfile.sessions;
  const moduleIds =
    activeProfile.version === 'junior' ? JUNIOR_MODULES : STANDARD_MODULES;

  const progressData = {
    labels: sessions.map((_, i) => `S${i + 1}`),
    datasets: moduleIds.map((id) => ({
      label: id,
      data: sessions.filter((s) => s.moduleId === id).map((s) => s.level),
      tension: 0.3,
    })),
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
    <div className="dashboard" style={styles.container}>
      <h2 style={styles.title}>Progression de {activeProfile.pseudo}</h2>
      <div style={styles.chartWrap}>
        <Line
          data={progressData}
          options={{ responsive: true, maintainAspectRatio: true }}
        />
      </div>
      {radarData && (
        <div style={styles.chartWrap}>
          <Radar
            data={radarData}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </div>
      )}
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
  container: {
    minHeight: '100vh',
    padding: 24,
    color: 'var(--fq-text)',
  },
  title: { margin: '0 0 16px', fontSize: 22 },
  chartWrap: { maxWidth: 500, height: 280, marginBottom: 24 },
  disclaimer: {
    fontSize: 12,
    color: 'var(--fq-text-muted)',
    marginTop: 8,
  },
};
