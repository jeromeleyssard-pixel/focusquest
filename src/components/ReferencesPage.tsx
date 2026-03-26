import { Link } from 'react-router-dom';

export function ReferencesPage() {
  return (
    <div className="fq-page fq-prose">
      <h1 className="fq-page-title">Références scientifiques et choix de conception</h1>

      <section>
        <h2>Références scientifiques</h2>
        <p>
          FocusQuest s&apos;appuie sur des paradigmes publiés en revues à comité de lecture.
          Voici une sélection d&apos;études récentes (2020-2026) sur l&apos;entraînement cognitif pour le TDAH :
        </p>
        <ul>
          <li>
            <strong>Entraînement cognitif et fonctions exécutives</strong> — Carcelén-Fraile MC et al., Healthcare 2025 ; Revue systématique et méta-analyse sur l&apos;entraînement cognitif pour améliorer les fonctions exécutives et la régulation émotionnelle chez les enfants avec troubles neurodéveloppementaux (incluant TDAH).
          </li>
          <li>
            <strong>Technologies immersives (XR/VR)</strong> — Valverde Olivares B et al., Children 2025 ; Revue systématique 2020-2024 sur l&apos;utilisation des technologies de réalité étendue pour l&apos;éducation inclusive des enfants neurodivergents, incluant le TDAH.
          </li>
          <li>
            <strong>Thérapie musicale et fonctions exécutives</strong> — Li X et al., African Journal of Reproductive Health 2025 ; Analyse scientométrique montrant que la musique améliore le contrôle des impulsions et la concentration chez les enfants TDAH.
          </li>
          <li>
            <strong>Approches de précision en santé mentale infantile</strong> — Lyeo JS et al., Frontiers in Psychiatry 2026 ; Revue explorant les approches personnalisées pour optimiser les interventions cognitives chez les enfants avec TDAH.
          </li>
          <li>
            <strong>Paradigmes classiques validés</strong> — Zelazo PD, Developmental Science 2006 ; Diamond A & Lee K, Science 2011 ; Rueda MR et al., Dev Psychol 2012 ; jsPsych : Leeuw JR, Behavior Research Methods 2015.
          </li>
          <li>
            <strong>Algorithmes adaptatifs</strong> — Levitt H, Journal of the Acoustical Society of America 1971 ; QUEST : Watson AB & Pelli DG, Perception & Psychophysics 1983.
          </li>
        </ul>
      </section>

      <section>
        <h2>Choix de conception et avancées récentes</h2>
        <p>
          <strong>Paradigmes validés et modernes</strong> : Go/NoGo, 1-Back, DCCS (Junior) et CPT-AX, N-Back, Stop-Signal, Task-Switching (Standard) sont des tâches cognitives validées pour mesurer l&apos;attention, la mémoire de travail et le contrôle inhibiteur. Les études récentes (2020-2026) montrent l&apos;efficacité de ces paradigmes pour améliorer les fonctions exécutives chez les enfants TDAH.
        </p>
        <p>
          <strong>Deux tranches d&apos;âge adaptées</strong> : 5–7 ans et 8–17 ans correspondent à des capacités développementales différentes (durée d&apos;attention, motricité, lecture). Les paramètres sont adaptés selon les dernières recherches sur le développement cognitif infantile.
        </p>
        <p>
          <strong>Algorithmes adaptatifs avancés</strong> : Le staircase et le QUEST maintiennent la difficulté à un niveau proche du seuil de l&apos;enfant, pour un entraînement efficace sans frustration excessive. Les études récentes confirment l&apos;efficacité de ces approches personnalisées.
        </p>
        <p>
          <strong>Technologies immersives émergentes</strong> : Les revues systématiques 2020-2024 montrent le potentiel des technologies XR (VR/AR) pour améliorer l&apos;engagement et l&apos;efficacité de l&apos;entraînement cognitif chez les enfants neurodivergents.
        </p>
        <p>
          <strong>Approches multimodales</strong> : L&apos;intégration avec d&apos;autres thérapies (musicale, motrice) montre des bénéfices synergiques pour les fonctions exécutives, comme démontré dans les analyses scientométriques récentes.
        </p>
        <p>
          <strong>Données locales et confidentialité</strong> : Toutes les données restent sur l&apos;appareil (localStorage). Aucune donnée personnelle n&apos;est collectée ni envoyée, conformément à la vie privée et à la conformité (France / RGPD). Cette approche respecte les recommandations récentes en matière de protection des données sensibles en santé mentale infantile.
        </p>
      </section>

      <section>
        <h2>Tendances émergentes et perspectives (2020-2026)</h2>
        <p>
          Les recherches récentes mettent en évidence plusieurs évolutions importantes dans l&apos;entraînement cognitif pour le TDAH :
        </p>
        <ul>
          <li>
            <strong>Technologies immersives (XR/VR)</strong> : Les revues systématiques montrent que les environnements virtuels augmentent l&apos;engagement et l&apos;efficacité de l&apos;entraînement cognitif chez les enfants neurodivergents.
          </li>
          <li>
            <strong>Approches multimodales</strong> : Combinaison avec thérapies musicales, motrices ou environnementales pour des bénéfices synergiques sur les fonctions exécutives.
          </li>
          <li>
            <strong>Personnalisation avancée</strong> : Utilisation de données comportementales pour adapter les interventions de manière plus précise aux besoins individuels.
          </li>
          <li>
            <strong>Impact environnemental</strong> : Les études récentes soulignent l&apos;influence des facteurs environnementaux (pollution, stress) sur les fonctions cognitives, suggérant des interventions plus holistiques.
          </li>
          <li>
            <strong>Évaluation longitudinale</strong> : Nécessité d&apos;études à plus long terme pour mesurer le transfert des apprentissages aux situations de la vie quotidienne.
          </li>
        </ul>
        <p>
          <em>FocusQuest intègre ces avancées en maintenant une approche fondée sur les preuves tout en restant accessible et respectueuse de la vie privée des utilisateurs.</em>
        </p>
      </section>

      <p style={{ marginTop: 24 }}>
        <Link to="/" className="fq-link">
          Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
