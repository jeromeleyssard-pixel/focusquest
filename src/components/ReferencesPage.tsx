import { Link } from 'react-router-dom';

export function ReferencesPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Références scientifiques et choix de conception</h1>

      <section style={styles.section}>
        <h2>Références scientifiques</h2>
        <p>
          FocusQuest s&apos;appuie sur des paradigmes publiés en revues à comité de lecture.
        </p>
        <ul style={styles.list}>
          <li>
            <strong>EndeavorRx / TDAH numérique</strong> — Kollins SH et al., Lancet Digital Health 2020 ; STARS-Adjunct, npj Digital Medicine 2021 ; extension adolescents, npj Mental Health Research 2024.
          </li>
          <li>
            <strong>Paradigmes</strong> — DCCS : Zelazo, Developmental Science 2006 ; entraînement fonctions exécutives : Diamond & Lee, Science 2011 ; Rueda et al., Dev Psychol 2012 ; jsPsych : Leeuw, Behavior Research Methods 2015.
          </li>
          <li>
            <strong>Algorithmes</strong> — Staircase : Levitt 1971 ; QUEST : Watson & Pelli, 1983, Perception & Psychophysics.
          </li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>Choix de conception</h2>
        <p>
          <strong>Paradigmes</strong> : Go/NoGo, 1-Back, DCCS (Junior) et CPT-AX, N-Back, Stop-Signal, Task-Switching (Standard) sont des tâches cognitives validées pour mesurer l&apos;attention, la mémoire de travail et le contrôle inhibiteur.
        </p>
        <p>
          <strong>Deux tranches d&apos;âge</strong> : 5–7 ans et 8–17 ans correspondent à des capacités développementales différentes (durée d&apos;attention, motricité, lecture). Les paramètres (fenêtre de réponse, durée des sessions) sont adaptés à chaque tranche.
        </p>
        <p>
          <strong>Algorithmes adaptatifs</strong> : le staircase et le QUEST maintiennent la difficulté à un niveau proche du seuil de l&apos;enfant, pour un entraînement efficace sans frustration excessive.
        </p>
        <p>
          <strong>Pas de serveur</strong> : toutes les données restent sur l&apos;appareil (localStorage). Aucune donnée personnelle n&apos;est collectée ni envoyée, conformément à la vie privée et à la conformité (France / RGPD).
        </p>
      </section>

      <p style={styles.back}>
        <Link to="/">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: 24,
    maxWidth: 720,
    margin: '0 auto',
    color: 'var(--fq-text)',
  },
  title: { fontSize: 22, marginBottom: 24 },
  section: { marginBottom: 24 },
  list: { paddingLeft: 20 },
  back: { marginTop: 24 },
};
