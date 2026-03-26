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
    <div className="fq-page">
      <p className="disclaimer fq-disclaimer">
        FocusQuest est un outil d&apos;entraînement cognitif. Il n&apos;est pas
        un dispositif médical.
      </p>
      <h1 className="fq-page-title">FocusQuest</h1>
      <p className="fq-page-subtitle">Bonjour {activeProfile.pseudo} !</p>
      <nav className="fq-nav-stack">
        {modules.map((m) => (
          <button
            key={m.id}
            type="button"
            className="fq-nav-btn"
            onClick={() => navigate(`/play/${m.id}`)}
          >
            {m.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="fq-btn-primary"
        style={{ marginTop: 8 }}
        onClick={() => navigate('/dashboard')}
      >
        Tableau de bord (parents)
      </button>
      <button
        type="button"
        className="fq-btn-secondary"
        onClick={() => {
          useProfileStore.getState().selectProfile('__none__');
          navigate('/');
        }}
      >
        Changer de joueur
      </button>
    </div>
  );
}
