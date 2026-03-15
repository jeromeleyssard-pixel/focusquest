import { useEffect, useRef, useCallback } from 'react';
import type { ModuleId } from '../../types/profile';

const JUNIOR_MODULES: ModuleId[] = ['gonogo', 'oneback', 'dccs'];

const INSTRUCTION_TEXTS: Record<string, string> = {
  gonogo: 'Touche la grenouille verte. Attention au crapaud, ne touche pas !',
  oneback: 'Quand tu vois le même animal que juste avant, touche !',
  dccs:
    'Regarde le panneau en haut. S\'il dit COULEUR : touche ROUGE si la carte est rouge, BLEU si elle est bleue. S\'il dit FORME : touche ÉTOILE si c\'est une étoile, ROND si c\'est un rond. Choisis gauche ou droite selon la règle !',
};

export interface ModuleInstructionsProps {
  moduleId: ModuleId;
  onStart: () => void;
}

export function ModuleInstructions({ moduleId, onStart }: ModuleInstructionsProps) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpoken = useRef(false);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || !JUNIOR_MODULES.includes(moduleId)) return;
    const text = INSTRUCTION_TEXTS[moduleId];
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = 0.9;
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    hasSpoken.current = true;
  }, [moduleId]);

  useEffect(() => {
    speak();
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [speak]);

  const handleStart = () => {
    window.speechSynthesis?.cancel();
    onStart();
  };

  if (!JUNIOR_MODULES.includes(moduleId)) return null;

  return (
    <div className="junior-instructions" style={styles.container}>
      <div style={styles.visual}>
        {moduleId === 'gonogo' && (
          <div style={styles.gonogoVisual}>
            <div style={{ ...styles.bubble, background: '#2e7d32' }} title="Grenouille" />
            <span style={styles.hint}>Touche</span>
            <div style={{ ...styles.bubble, background: '#c62828' }} title="Crapaud" />
            <span style={styles.hint}>Ne touche pas</span>
          </div>
        )}
        {moduleId === 'oneback' && (
          <div style={styles.onebackVisual}>
            <div style={styles.animalPlaceholder}>🐾</div>
            <span style={styles.hint}>Même qu’avant ? Touche !</span>
          </div>
        )}
        {moduleId === 'dccs' && (
          <div style={styles.dccsVisual}>
            <div style={styles.dccsRuleRow}>
              <span style={styles.dccsRule}>Couleur →</span>
              <span style={styles.dccsOption}>Rouge / Bleu</span>
            </div>
            <div style={styles.dccsRuleRow}>
              <span style={styles.dccsRule}>Forme →</span>
              <span style={styles.dccsOption}>Étoile / Rond</span>
            </div>
            <span style={styles.hint}>Regarde le panneau en haut à chaque carte</span>
          </div>
        )}
      </div>
      <button type="button" onClick={handleStart} style={styles.playBtn}>
        Jouer
      </button>
      <button type="button" onClick={speak} style={styles.replayBtn}>
        Réécouter
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    padding: 24,
    gap: 24,
  },
  visual: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  gonogoVisual: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: '50%',
  },
  hint: {
    fontSize: 18,
    color: 'var(--fq-text)',
  },
  onebackVisual: { gap: 8 },
  animalPlaceholder: {
    fontSize: 64,
  },
  dccsVisual: { gap: 12 },
  dccsRuleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dccsRule: { fontWeight: 'bold', color: 'var(--fq-primary)' },
  dccsOption: { color: 'var(--fq-text)' },
  panelPlaceholder: {
    fontSize: 48,
  },
  playBtn: {
    padding: '14px 32px',
    fontSize: 20,
    fontWeight: 'bold',
    background: 'var(--fq-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  },
  replayBtn: {
    padding: 8,
    fontSize: 14,
    background: 'transparent',
    color: 'var(--fq-text-muted)',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
