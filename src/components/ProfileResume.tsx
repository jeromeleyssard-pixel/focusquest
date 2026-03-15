import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import type { AppVersion } from '../types/profile';

export function ProfileResume() {
  const navigate = useNavigate();
  const location = useLocation();
  const version = (location.state as { version?: AppVersion })?.version ?? 'standard';
  const { profiles, loadAll, selectProfile } = useProfileStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const list = profiles.filter((p) => p.version === version);

  useEffect(() => {
    if (profiles.length > 0 && list.length === 0) navigate(`/profile/new/${version}`);
  }, [profiles.length, list.length, version, navigate]);

  const handleResume = (id: string) => {
    selectProfile(id);
    navigate('/menu');
  };

  const handleNewPlayer = () => {
    navigate(`/profile/new/${version}`);
  };

  if (list.length === 0) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reprendre ou nouveau joueur</h2>
      <div style={styles.list}>
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleResume(p.id)}
            style={styles.card}
          >
            <span style={styles.pseudo}>{p.pseudo}</span>
            <span style={styles.meta}>
              Niveau max : {Math.max(...Object.values(p.currentLevels))}
            </span>
          </button>
        ))}
      </div>
      <button type="button" onClick={handleNewPlayer} style={styles.newBtn}>
        Changer de joueur / Nouveau profil
      </button>
      <button type="button" onClick={() => navigate('/')} style={styles.back}>
        Retour
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
  title: { margin: 0, color: 'var(--fq-text)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 },
  card: {
    padding: 16,
    background: 'var(--fq-surface)',
    border: 'none',
    borderRadius: 8,
    color: 'var(--fq-text)',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  pseudo: { fontWeight: 600, fontSize: 18 },
  meta: { fontSize: 12, color: 'var(--fq-text-muted)' },
  newBtn: {
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
