import type { AppVersion, ModuleId } from '../types/profile';

/** Matrice éditoriale : objectif, consigne, étapes, contrôles (charte Phase 0). */
export interface ModuleInstructionBundle {
  title: string;
  /** Texte principal + synthèse vocale */
  narrative: string;
  /** Trois étapes max */
  steps: [string, string, string];
  /** Rappel des contrôles */
  controlsHint: string;
  /** Erreur fréquente à éviter */
  commonMistake?: string;
}

const BUNDLES: Record<ModuleId, ModuleInstructionBundle> = {
  gonogo: {
    title: 'Go / No-Go — La mare magique',
    narrative:
      "Des animaux apparaissent. Tape sur la grenouille verte. Si tu vois le crapaud rouge, ne fais rien : c'est un piège !",
    steps: [
      'Regarde l’animal au centre.',
      'Grenouille verte : tape vite.',
      'Crapaud rouge : ne touche pas.',
    ],
    controlsHint: 'Touche l’écran (ou la barre Espace sur ordinateur).',
    commonMistake: 'Réagir trop vite au crapaud.',
  },
  oneback: {
    title: '1-Back — La forêt des souvenirs',
    narrative:
      "Des animaux défilent. Quand l’animal est le même que celui d’avant, tape. Sinon, attends le suivant.",
    steps: [
      'Retiens le dernier animal vu.',
      'Compare avec le nouveau.',
      'Même animal qu’avant : tape ; sinon non.',
    ],
    controlsHint: 'Tape au bon moment ; pas besoin de se précipiter sur chaque image.',
    commonMistake: 'Confondre avec un animal vu il y a longtemps.',
  },
  dccs: {
    title: 'DCCS — Laboratoire des créatures',
    narrative:
      "Un panneau en haut dit quelle règle suivre : couleur ou forme. Envoie la carte vers la bonne côté selon cette règle.",
    steps: [
      'Lis la règle affichée en haut.',
      'Regarde la carte au centre.',
      'Choisis gauche ou droite selon la règle du moment.',
    ],
    controlsHint: 'Gauche / droite (touches ou boutons à l’écran).',
    commonMistake: 'Oublier de changer de stratégie quand la règle change.',
  },
  cpt: {
    title: 'CPT-AX — Espace',
    narrative:
      "Des lettres défilent. Réponds seulement quand tu vois un X qui arrive juste après un A. Pour toutes les autres suites, ne réponds pas.",
    steps: [
      'Repère la lettre A.',
      'Attends la lettre suivante.',
      "Si c'est un X juste après A : réponds ; sinon reste silencieux.",
    ],
    controlsHint: 'Barre Espace ou bouton « Appuyer ».',
    commonMistake: 'Appuyer sur d’autres lettres que la cible AX.',
  },
  nback: {
    title: 'N-Back — Caverne des gemmes',
    narrative:
      "Des lettres s’affichent une par une. Quand la lettre est la même que celle d’il y a quelques positions (le jeu l’ajuste tout seul), appuie. Sinon, ne fais rien.",
    steps: [
      'Suis la suite des lettres.',
      'Repère les répétitions à la bonne distance.',
      'Match : appuie ; pas de match : attends.',
    ],
    controlsHint: 'Barre Espace ou tap sur la zone de réponse.',
    commonMistake: 'Réagir à une lettre qui ne correspond pas au bon écart.',
  },
  stopsignal: {
    title: 'Stop-Signal — Circuit',
    narrative:
      "Des flèches indiquent gauche ou droite : réponds vite. Si le mot STOP apparaît, bloque ta réponse et n’appuie pas.",
    steps: [
      'Réponds au sens de la flèche.',
      'Si STOP s’affiche : n’appuie pas.',
      'Utilise les boutons Gauche / Droite ou les flèches clavier.',
    ],
    controlsHint: 'Boutons « Gauche » / « Droite », ou touches flèches.',
    commonMistake: 'Appuyer malgré le signal STOP.',
  },
  taskswitch: {
    title: 'Task-Switch — Laboratoire',
    narrative:
      "Un panneau indique la règle (pair / impair ou comparer à 5). La règle peut changer : adapte-toi à chaque essai.",
    steps: [
      'Lis la règle en haut.',
      'Regarde le nombre au centre.',
      'Choisis gauche ou droite selon la règle active.',
    ],
    controlsHint: 'Flèches gauche / droite ou zones tactiles.',
    commonMistake: 'Continuer avec l’ancienne règle après un changement.',
  },
};

/** Variantes mineures Standard : formulations un peu plus « ado ». */
const STANDARD_TWEAKS: Partial<Record<ModuleId, Partial<ModuleInstructionBundle>>> = {
  cpt: {
    controlsHint: 'Espace ou clic sur le bouton ; reste concentré sur la suite A → X.',
  },
  nback: {
    narrative:
      "Des lettres défilent. Appuie lorsque la lettre correspond à celle d’il y a N positions (N est ajusté automatiquement). Sinon, ne réponds pas.",
  },
};

export function getInstructionBundle(
  moduleId: ModuleId,
  version: AppVersion
): ModuleInstructionBundle {
  const base = BUNDLES[moduleId];
  const tweak = version === 'standard' ? STANDARD_TWEAKS[moduleId] : undefined;
  if (!tweak) return base;
  return { ...base, ...tweak };
}

export function getNarrativeForTTS(
  moduleId: ModuleId,
  version: AppVersion
): string {
  return getInstructionBundle(moduleId, version).narrative;
}
