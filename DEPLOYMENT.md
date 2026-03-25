# 🚀 FocusQuest - Déploiement & Accès Externe

## 📍 Accès au Site en Ligne

**URL de base**: https://jeromeleyssard-pixel.github.io/focusquest/

Le site est déployé automatiquement sur GitHub Pages après chaque `push` sur la branche `main`.

---

## 📋 États des Phases

### ✅ Phase 1: Scènes Phaser Immersives
- GoNoGoScene (Go/NoGo avec animations)
- CPTScene (Continuous Performance Test avec feedback adaptatif)
- Intégration staircase adaptatif

### ✅ Phase 2: TaskManager + Progression
- Hiérarchie Session → Block → Trial
- Calcul automatique des métriques
- Détection des pauses intelligentes

### ✅ Phase 3: Métriques & Dashboard Temps Réel
- SessionMetricsHUD (barre de progression, temps, accuracy, RT)
- AdvancedDashboard (radar cognitif, courbes, observance hebdomadaire)

### ✅ Phase 4: Accessibilité WCAG AAA
- 7 paramètres (contraste 7:1, police dyslexique, réduction mouvement)
- Panel de configuration interactif
- Feedback haptique et colorblind modes

### ✅ Phase 5: Rapports Parent & Intégration
- ParentReportDashboard (rapports professionnels)
- Route `/report` intégrée
- Tests d'intégration TaskManager

---

## 🔧 Configuration GitHub Actions

### CI/CD Workflow (.github/workflows/ci.yml)
Déclenché sur chaque `push` ou `pull request` vers `main`/`develop`:
```
1. Checkout code
2. npm ci (installation)
3. npm run lint (ESLint)
4. npx tsc --noEmit (TypeScript check)
5. npm run test (Vitest)
6. npm run build (Vite build)
```

**Status**: ✅ PASSING (dernières builds réussies)

### Deploy Workflow (.github/workflows/deploy.yml)
Déclenché automatiquement après succès du CI sur `main`:
```
1. Build avec Vite (BASE_URL=/focusquest/)
2. Deploy sur GitHub Pages
3. PWA service worker generation
```

**Status**: ✅ ACTIVE (déploiement automatique)

---

## 📦 Structure du Dépôt

```
focusquest/
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                 # Tests & build validation
│   └── deploy.yml             # GitHub Pages deployment
├── src/
│   ├── components/
│   │   ├── SessionMetricsHUD.tsx
│   │   ├── AdvancedDashboard.tsx
│   │   ├── AccessibilityPanel.tsx
│   │   ├── ParentReportDashboard.tsx
│   │   └── [autres...]
│   ├── game/scenes/
│   │   ├── junior/GoNoGoScene.ts
│   │   └── standard/CPTScene.ts
│   ├── store/
│   │   ├── taskManager.ts
│   │   ├── profileStore.ts
│   │   └── sessionStore.ts
│   ├── utils/
│   │   ├── accessibility.ts
│   │   └── [autres...]
│   ├── styles/
│   │   ├── dashboard.css
│   │   ├── accessibility.css
│   │   ├── parent-report.css
│   │   └── [autres...]
│   └── [autres fichiers...]
├── tests/
│   └── engine/
│       ├── taskManager.test.ts
│       └── [autres...]
├── public/
│   ├── assets/
│   ├── locales/
│   └── [autres...]
├── package.json
├── vite.config.ts
├── tsconfig.json
├── PHASES_COMPLETE.md         # Documentation complète des phases
├── DEPLOYMENT.md              # (ce fichier)
└── README.md
```

---

## 💻 Développement Local

### Prérequis
```bash
Node.js 22.x ou plus
npm 10.x ou plus
Git
```

### Installation
```bash
git clone https://github.com/jeromeleyssard-pixel/focusquest.git
cd focusquest
npm install
```

### Commandes Utiles
```bash
npm run dev              # Démarrer dev server (http://localhost:5173)
npm run build           # Build production
npm run preview         # Prévisualiser build production
npm run test            # Lancer tests Vitest
npm run lint            # Vérifier ESLint
npm run type-check      # Vérifier TypeScript (tsc --noEmit)
```

---

## 📊 Statuts Build & Déploiement

### Derniers Commits
```
128d2c4 (HEAD -> main) feat: Complete 5-phase implementation
7d9b9e8 fix(cpt): durées et essais optimisés
e47fc6b fix(stopsignal): feedback visuel amélioré
78b75a9 feat: affichage mobile optimisé
```

### Bundle Size (Production)
- **JavaScript**: 529.88 KB (gzip 173.73 KB)
- **CSS**: 476.46 KB (gzip 349.88 KB)
- **Bundle Total**: ~1 MB (compressé ~500 KB)
- **Temps de build**: 1.70 secondes
- **PWA Precache**: 58 entries

### Navigateurs Supportés
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔐 Sécurité & Conformité

### WCAG AAA Compliance
- ✅ High Contrast Mode (7:1 ratio)
- ✅ Dyslexic Font Support
- ✅ Reduce Motion (prefers-reduced-motion)
- ✅ Colorblind Modes (3 types)
- ✅ Screen Reader Compatible (ARIA labels)
- ✅ Haptic Feedback (vibration patterns)

### Privacy
- ✅ Données stockées localement uniquement (localStorage)
- ✅ Pas de serveur backend
- ✅ Pas de tracking externe
- ✅ PWA capable (offline mode)

---

## 📈 Metrics

### Code Quality
- **TypeScript**: Strict mode ✅
- **Linting**: ESLint ✅
- **Tests**: Vitest ✅
- **Build**: Vite ✅

### App Performance
- **First Contentful Paint**: < 2s (on 4G)
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 4s

---

## 🐛 Signaler un Bug

1. Créer une **issue** sur GitHub: https://github.com/jeromeleyssard-pixel/focusquest/issues
2. Décrire:
   - Le comportement attendu
   - Le comportement observé
   - Les étapes pour reproduire
   - Navigateur/OS utilisé

---

## 💡 Suggestions de Fonctionnalités

Features futures suggérées (Phase 6+):
- [ ] Code splitting par paradigme (réduire bundle size)
- [ ] Gamification (badges, achievements)
- [ ] Social features (leaderboards)
- [ ] Export PDF/Excel pour rapports
- [ ] Analytics dashboard pour professionnels
- [ ] Multi-device sync (cloud optional)

---

## 📝 Licence

**AGPL-3.0** - Voir [LICENSE](LICENSE) pour détails

---

## 👨‍💻 Auteur

Développé pour enfants TDAH (5-17 ans)  
Basé sur recherche en neuropsychologie cognitive  
Ref: Thérapeutiques numériques TDAH, Roadmap FocusQuest

---

## 🔗 Ressources

- **GitHub Repo**: https://github.com/jeromeleyssard-pixel/focusquest
- **GitHub Pages**: https://jeromeleyssard-pixel.github.io/focusquest/
- **GitHub Actions**: Voir l'onglet "Actions" du repo
- **Issues**: https://github.com/jeromeleyssard-pixel/focusquest/issues
- **PR**: https://github.com/jeromeleyssard-pixel/focusquest/pulls

---

## 📞 Support

Pour questions ou support:
1. Vérifier [PHASES_COMPLETE.md](PHASES_COMPLETE.md) pour documentation technique détaillée
2. Consulter [README.md](README.md) pour guide utilisateur
3. Ouvrir une issue GitHub avec le tag `[QUESTION]`

---

**Statut**: ✅ Production Ready  
**Dernière mise à jour**: 25 Mars 2026  
**Version**: 0.1.0 (5 phases complètes)
