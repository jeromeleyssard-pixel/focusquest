import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import type { ModuleId } from '../types/profile';

const JUNIOR_MODULES: { id: ModuleId; label: string }[] = [
  { id: 'gonogo', label: 'Go/NoGo — La mare magique' },
  { id: 'oneback', label: '1-Back — La forêt des souvenirs' },
  { id: 'dccs', label: 'DCCS — Laboratoire des créatures' },
];

const STANDARD_MODULES: { id: ModuleId; label: string }[] = [
  { id: 'cpt', label: 'CPT-AX — Espace' },
  { id: 'nback', label: 'N-Back — Caverne des gemmes' },
  { id: 'stopsignal', label: 'Stop-Signal — Circuit' },
  { id: 'taskswitch', label: 'Task-Switch — Laboratoire' },
];

export function MainMenu() {
  const navigate = useNavigate();
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) {
    navigate('/');
    return null;
  }

  const modules =
    activeProfile.version === 'junior' ? JUNIOR_MODULES : STANDARD_MODULES;

  return (
    <div style={styles.container}>
      <p className="disclaimer" style={styles.disclaimer}>
        FocusQuest est un outil d&apos;entraînement cognitif. Il n&apos;est pas
        un dispositif médical.
      </p>
      <h1 style={styles.title}>FocusQuest</h1>
      <p style={styles.greeting}>Bonjour {activeProfile.pseudo} !</p>
      <nav style={styles.nav}>
        {modules.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate(`/play/${m.id}`)}
            style={styles.moduleBtn}
          >
            {m.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        style={styles.dashboardBtn}
      >
        Tableau de bord (parents)
      </button>
      <button
        type="button"
        onClick={() => {
          useProfileStore.getState().selectProfile('__none__');
          navigate('/');
        }}
        style={styles.back}
      >
        Changer de joueur
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  disclaimer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    fontSize: 11,
    color: 'var(--fq-text-muted)',
    textAlign: 'center',
    margin: 0,
  },
  title: { margin: 0, color: 'var(--fq-text)' },
  greeting: { margin: 0, color: 'var(--fq-text-muted)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 360 },
  moduleBtn: {
    padding: 16,
    background: 'var(--fq-surface)',
    border: 'none',
    borderRadius: 8,
    color: 'var(--fq-text)',
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'left',
  },
  dashboardBtn: {
    padding: 12,
    background: 'var(--fq-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  back: {
    background: 'transparent',
    color: 'var(--fq-text-muted)',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
