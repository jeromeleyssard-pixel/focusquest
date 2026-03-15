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
    <div style={styles.container}>
      <h2 style={styles.title}>
        Nouveau joueur — {v === 'junior' ? '5 à 7 ans' : '8 à 17 ans'}
      </h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Pseudo (2–12 caractères)
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value.slice(0, 12))}
            minLength={2}
            maxLength={12}
            placeholder="Léo, Superhéros..."
            style={styles.input}
            autoFocus
          />
        </label>
        <label style={styles.label}>
          Avatar
          <div style={styles.avatarRow}>
            {Array.from({ length: AVATAR_OPTIONS }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(i)}
                style={{
                  ...styles.avatarBtn,
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
                  style={styles.avatarImg}
                />
              </button>
            ))}
          </div>
        </label>
        <label style={styles.label}>
          Couleur
          <div style={styles.colorRow}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  ...styles.colorBtn,
                  backgroundColor: c,
                  borderColor: color === c ? '#fff' : 'transparent',
                }}
              />
            ))}
          </div>
        </label>
        <button
          type="submit"
          disabled={pseudo.trim().length < 2}
          style={styles.submit}
        >
          Créer le profil
        </button>
      </form>
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
  form: { display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--fq-text)' },
  input: { padding: 8, fontSize: 16, borderRadius: 8 },
  avatarRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  avatarBtn: {
    width: 64,
    height: 64,
    borderRadius: 12,
    border: '2px solid',
    padding: 0,
    background: 'var(--fq-surface)',
    color: 'var(--fq-text)',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  avatarImg: {
    display: 'block',
    width: 64,
    height: 64,
    objectFit: 'cover',
  },
  colorRow: { display: 'flex', gap: 8 },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid',
    cursor: 'pointer',
  },
  submit: {
    padding: 12,
    background: 'var(--fq-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
  },
  back: {
    background: 'transparent',
    color: 'var(--fq-text-muted)',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
