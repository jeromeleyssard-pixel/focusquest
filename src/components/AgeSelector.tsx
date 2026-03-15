import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import type { AppVersion } from '../types/profile';

export function AgeSelector() {
  const navigate = useNavigate();
  const { profiles, loadAll } = useProfileStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleVersionSelect = (version: AppVersion) => {
    const existing = profiles.filter((p) => p.version === version);
    if (existing.length > 0) {
      navigate('/profile/resume', { state: { version } });
    } else {
      navigate(`/profile/new/${version}`);
    }
  };

  return (
    <div className="age-selector" style={styles.container}>
      <p className="disclaimer" style={styles.disclaimer}>
        FocusQuest est un outil d&apos;entraînement cognitif. Il n&apos;est pas un
        dispositif médical et ne remplace aucun suivi par un professionnel de
        santé.
      </p>
      <h1 style={styles.title}>FocusQuest</h1>
      <p style={styles.subtitle}>Choisissez la version pour l&apos;enfant</p>
      <div style={styles.footer}>
        <Link to="/references" style={styles.link}>Références scientifiques</Link>
        <span style={styles.sep}> · </span>
        <Link to="/parents" style={styles.link}>Guide parents</Link>
      </div>
      <div style={styles.cards}>
        <button
          type="button"
          className="version-card junior"
          style={{ ...styles.card, ...styles.cardJunior }}
          onClick={() => handleVersionSelect('junior')}
        >
          <span style={styles.cardLabel}>5 à 7 ans</span>
          <span style={styles.cardDesc}>Sessions courtes, tap uniquement</span>
        </button>
        <button
          type="button"
          className="version-card standard"
          style={{ ...styles.card, ...styles.cardStandard }}
          onClick={() => handleVersionSelect('standard')}
        >
          <span style={styles.cardLabel}>8 à 17 ans</span>
          <span style={styles.cardDesc}>Sessions 20 min, clavier / souris</span>
        </button>
      </div>
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
    justifyContent: 'center',
    gap: 24,
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
  title: { fontSize: 28, margin: 0, color: 'var(--fq-text)' },
  subtitle: { margin: 0, color: 'var(--fq-text-muted)' },
  cards: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 200,
    minHeight: 140,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    color: '#fff',
    fontWeight: 600,
  },
  cardJunior: { backgroundColor: 'var(--fq-junior)' },
  cardStandard: { backgroundColor: 'var(--fq-standard)' },
  cardLabel: { fontSize: 20 },
  cardDesc: { fontSize: 12, fontWeight: 400, opacity: 0.9 },
  footer: { marginTop: 8, fontSize: 14 },
  link: { color: 'var(--fq-primary-light)', textDecoration: 'none' },
  sep: { color: 'var(--fq-text-muted)' },
};
