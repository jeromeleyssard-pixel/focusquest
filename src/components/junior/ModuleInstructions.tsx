import { useEffect, useRef, useCallback, useState } from 'react';
import type { ModuleId } from '../../types/profile';
import { useProfileStore } from '../../store/profileStore';
import { getInstructionBundle, getNarrativeForTTS } from '../../content/moduleCopy';

export interface ModuleInstructionsProps {
  moduleId: ModuleId;
  onStart: () => void;
}

export function ModuleInstructions({ moduleId, onStart }: ModuleInstructionsProps) {
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const version = activeProfile?.version ?? 'junior';
  const bundle = getInstructionBundle(moduleId, version);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpoken = useRef(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supportsSpeech, setSupportsSpeech] = useState(true);

  const getBestVoice = useCallback(() => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter((v) => /fr(-|_)?FR/i.test(v.lang));
    if (frenchVoices.length > 0) {
      return (
        frenchVoices.find((v) => /Google|Microsoft|Amazon|Apple/.test(v.name)) || frenchVoices[0]
      );
    }
    return voices.length > 0 ? voices[0] : null;
  }, []);

  const speak = useCallback(() => {
    const text = getNarrativeForTTS(moduleId, version);
    if (!text) return;

    if (!window.speechSynthesis) {
      setSupportsSpeech(false);
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 1;

    if (selectedVoice) {
      u.voice = selectedVoice;
    }

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    hasSpoken.current = true;
  }, [moduleId, selectedVoice, version]);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupportsSpeech(false);
      return;
    }

    const loadVoices = () => {
      const best = getBestVoice();
      if (best) setSelectedVoice(best);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [getBestVoice]);

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

  if (!bundle) return null;

  return (
    <div className="junior-instructions fq-animate-in fq-instructions">
      {!supportsSpeech && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#b71c1c',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Synthèse vocale non disponible : le texte reste affiché à l’écran.
        </div>
      )}
      <h2 className="fq-instructions-title">{bundle.title}</h2>
      <p className="fq-instructions-narrative">{bundle.narrative}</p>
      <div className="fq-instructions-steps" role="list">
        {bundle.steps.map((step, i) => (
          <div key={i} className="fq-instructions-step" role="listitem">
            <span className="fq-instructions-step-num">{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <p className="fq-instructions-controls">{bundle.controlsHint}</p>
      {bundle.commonMistake && (
        <p className="fq-instructions-mistake">Piège fréquent : {bundle.commonMistake}</p>
      )}
      <div className="fq-instructions-visual">
        {moduleId === 'gonogo' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#2e7d32' }} title="Grenouille" />
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--fq-text)' }}>Touche</span>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#c62828' }} title="Crapaud" />
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--fq-text)' }}>Ne touche pas</span>
          </div>
        )}
        {moduleId === 'oneback' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 64 }}>🐾</span>
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--fq-text)' }}>Même qu’avant ? Touche !</span>
          </div>
        )}
        {moduleId === 'dccs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 'bold', color: 'var(--fq-primary)' }}>Couleur →</span>
              <span>Rouge / Bleu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 'bold', color: 'var(--fq-primary)' }}>Forme →</span>
              <span>Étoile / Rond</span>
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fq-text-muted)' }}>
              Regarde le panneau en haut à chaque carte
            </span>
          </div>
        )}
        {moduleId === 'cpt' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
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
              }}
            >
              A
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fq-text-muted)' }}>
              Appuie sur X après A seulement
            </span>
          </div>
        )}
        {moduleId === 'nback' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
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
              }}
            >
              A
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fq-text-muted)' }}>
              Si une lettre revient comme tout à l&apos;heure, appuie
            </span>
          </div>
        )}
        {moduleId === 'stopsignal' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
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
              }}
            >
              ↔
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fq-text-muted)' }}>
              Suis la flèche, arrête-toi au STOP
            </span>
          </div>
        )}
        {moduleId === 'taskswitch' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
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
              }}
            >
              ⇆
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fq-text-muted)' }}>
              La règle en haut peut changer
            </span>
          </div>
        )}
      </div>
      <button type="button" onClick={handleStart} className="fq-btn-primary">
        Jouer
      </button>
      <button type="button" onClick={speak} className="fq-btn-secondary">
        Réécouter
      </button>
    </div>
  );
}
