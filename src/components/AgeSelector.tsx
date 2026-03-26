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
    <div className="age-selector fq-page fq-page--centered">
      <p className="disclaimer fq-disclaimer">
        FocusQuest est un outil d&apos;entraînement cognitif. Il n&apos;est pas un
        dispositif médical et ne remplace aucun suivi par un professionnel de
        santé.
      </p>
      <h1 className="fq-page-title">FocusQuest</h1>
      <p className="fq-page-subtitle">Choisissez la version pour l&apos;enfant</p>
      <div style={{ marginTop: 8, fontSize: 'var(--text-sm)' }}>
        <Link to="/references" className="fq-link">
          Références scientifiques
        </Link>
        <span style={{ color: 'var(--fq-text-muted)' }}> · </span>
        <Link to="/parents" className="fq-link">
          Guide parents
        </Link>
      </div>
      <div className="fq-card-row">
        <button
          type="button"
          className="fq-card fq-card--junior"
          onClick={() => handleVersionSelect('junior')}
        >
          <span className="fq-card-label">5 à 7 ans</span>
          <span className="fq-card-desc">Sessions courtes, tap uniquement</span>
        </button>
        <button
          type="button"
          className="fq-card fq-card--standard"
          onClick={() => handleVersionSelect('standard')}
        >
          <span className="fq-card-label">8 à 17 ans</span>
          <span className="fq-card-desc">Sessions 20 min, clavier / souris</span>
        </button>
      </div>
    </div>
  );
}
