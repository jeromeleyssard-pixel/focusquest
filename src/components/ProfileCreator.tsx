import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import type { AppVersion } from '../types/profile';

const AVATAR_OPTIONS = 8;
const COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63', '#00BCD4'];

export function ProfileCreator() {
  const { version } = useParams<{ version: AppVersion }>();
  const navigate = useNavigate();
  const createProfile = useProfileStore((s) => s.createProfile);
  const [pseudo, setPseudo] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [color, setColor] = useState(COLORS[0]);

  const v = version === 'junior' || version === 'standard' ? version : 'standard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = pseudo.trim();
    if (p.length < 2 || p.length > 12) return;
    createProfile(p, avatar as 0, color, v);
    navigate('/menu');
  };

  return (
    <div className="fq-page fq-page--centered">
      <h2 className="fq-page-title" style={{ fontSize: 'var(--text-2xl)' }}>
        Nouveau joueur — {v === 'junior' ? '5 à 7 ans' : '8 à 17 ans'}
      </h2>
      <form onSubmit={handleSubmit} className="fq-form">
        <label className="fq-label">
          Pseudo (2–12 caractères)
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value.slice(0, 12))}
            minLength={2}
            maxLength={12}
            placeholder="Léo, Superhéros..."
            className="fq-input"
            autoFocus
          />
        </label>
        <label className="fq-label">
          Avatar
          <div className="fq-avatar-row">
            {Array.from({ length: AVATAR_OPTIONS }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(i)}
                className="fq-avatar-btn"
                style={{
                  borderColor: avatar === i ? color : 'transparent',
                  borderWidth: avatar === i ? 3 : 1,
                }}
                title={`Avatar ${i + 1}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/images/avatars/avatar_${i}.svg`}
                  alt={`Avatar ${i + 1}`}
                  width={64}
                  height={64}
                  style={{ display: 'block', width: 64, height: 64, objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </label>
        <label className="fq-label">
          Couleur
          <div className="fq-color-row">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="fq-color-swatch"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? '#fff' : 'transparent',
                }}
                aria-label={`Couleur ${c}`}
              />
            ))}
          </div>
        </label>
        <button
          type="submit"
          disabled={pseudo.trim().length < 2}
          className="fq-btn-primary"
        >
          Créer le profil
        </button>
      </form>
      <button type="button" className="fq-btn-secondary" onClick={() => navigate('/')}>
        Retour
      </button>
    </div>
  );
}
