import { useEffect, useRef, useCallback } from 'react';
import type { ModuleId } from '../../types/profile';

const INSTRUCTION_TEXTS: Record<ModuleId, string> = {
  gonogo: 'Touche la grenouille verte. Attention au crapaud, ne touche pas !',
  oneback: 'Quand tu vois le même animal que juste avant, touche !',
  dccs:
    'Regarde le panneau en haut. S\'il dit COULEUR : touche ROUGE si la carte est rouge, BLEU si elle est bleue. S\'il dit FORME : touche ÉTOILE si c\'est une étoile, ROND si c\'est un rond. Choisis gauche ou droite selon la règle !',
  cpt: 'Appuie seulement quand tu vois X juste après A. Pour toutes les autres lettres, ne réponds pas.',
  nback:
    'Si la lettre est la même qu\'il y a N lettres en arrière, appuie. Sinon, ne fais rien.',
  stopsignal:
    'Suis la flèche aussi vite que possible. Si le signal STOP apparaît, arrête-toi et n\'appuie plus.',
  taskswitch:
    'Regarde la règle en haut. Parfois on trie par COULEUR, parfois par FORME ou NOMBRE. Change de règle quand le panneau change.',
};

export interface ModuleInstructionsProps {
  moduleId: ModuleId;
  onStart: () => void;
}

export function ModuleInstructions({ moduleId, onStart }: ModuleInstructionsProps) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpoken = useRef(false);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
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

  if (!INSTRUCTION_TEXTS[moduleId]) return null;

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
        {moduleId === 'cpt' && (
          <div style={styles.standardBlock}>
            <div style={styles.standardIcon}>A</div>
            <span style={styles.hint}>Appuie sur X après A seulement</span>
          </div>
        )}
        {moduleId === 'nback' && (
          <div style={styles.standardBlock}>
            <div style={styles.standardIcon}>N</div>
            <span style={styles.hint}>Même lettre qu\'il y a N coups ?</span>
          </div>
        )}
        {moduleId === 'stopsignal' && (
          <div style={styles.standardBlock}>
            <div style={styles.standardIcon}>↔</div>
            <span style={styles.hint}>Suis la flèche, arrête-toi au STOP</span>
          </div>
        )}
        {moduleId === 'taskswitch' && (
          <div style={styles.standardBlock}>
            <div style={styles.standardIcon}>⇆</div>
            <span style={styles.hint}>La règle en haut peut changer, suis-la</span>
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
  standardBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  standardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: 'var(--fq-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: 'var(--fq-primary)',
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
