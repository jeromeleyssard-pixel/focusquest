import { Link } from 'react-router-dom';

export function ParentsPage() {
  return (
    <div className="fq-page fq-prose">
      <h1 className="fq-page-title">Guide parents</h1>

      <section>
        <h2>Utilisation</h2>
        <p>
          <strong>Choisir la version</strong> : 5–7 ans (Junior) ou 8–17 ans (Standard) selon l&apos;âge de l&apos;enfant. Créez un profil avec un pseudo (pas le vrai nom). Pour les 5–7 ans, la présence d&apos;un adulte à côté de l&apos;enfant est recommandée.
        </p>
        <p>
          <strong>Tableau de bord</strong> : accessible depuis le menu (« Tableau de bord parents »). Il affiche les courbes de progression et, en version Standard, un radar des quatre domaines (attention, mémoire, inhibition, flexibilité). Les données ne quittent jamais l&apos;appareil.
        </p>
        <p>
          <strong>Export</strong> : un bouton « Exporter mes données » (à intégrer dans le dashboard) permet de télécharger un fichier JSON local pour garder une trace personnelle.
        </p>
      </section>

      <section>
        <h2>Conseils d&apos;utilisation</h2>
        <h3>Version Junior (5–7 ans)</h3>
        <ul>
          <li><strong>Fréquence idéale</strong> : 3–4 sessions par semaine (espacées dans la semaine, pas tous les jours)</li>
          <li><strong>Durée des sessions</strong> : 10–15 minutes maximum pour maintenir l&apos;attention</li>
          <li><strong>Moments recommandés</strong> : Après l&apos;école ou le week-end, quand l&apos;enfant est reposé</li>
          <li><strong>Supervision</strong> : Présence d&apos;un adulte recommandée pour expliquer les consignes et encourager</li>
        </ul>
        <p><strong>Résultats attendus</strong> : Amélioration progressive des fonctions exécutives après 4–6 semaines d&apos;usage régulier. Des bénéfices comportementaux (meilleure concentration, impulsivité réduite) peuvent apparaître après 2–3 mois. Les progrès sont souvent subtils au début.</p>

        <h3>Version Standard (8–17 ans)</h3>
        <ul>
          <li><strong>Fréquence idéale</strong> : 4–5 sessions par semaine pour une efficacité optimale</li>
          <li><strong>Durée des sessions</strong> : 15–20 minutes, avec possibilité d&apos;autonomie progressive</li>
          <li><strong>Moments recommandés</strong> : En semaine après les devoirs, ou selon le rythme de l&apos;adolescent</li>
          <li><strong>Supervision</strong> : Autonomie possible, mais suivi parental recommandé les premières semaines</li>
        </ul>
        <p><strong>Résultats attendus</strong> : Amélioration des fonctions exécutives (attention, mémoire, inhibition, flexibilité) observable après 3–4 semaines. Des effets positifs sur la concentration scolaire et la gestion des émotions peuvent être remarqués après 1–2 mois d&apos;usage régulier.</p>

        <h3>Conseils généraux</h3>
        <ul>
          <li><strong>Régularité avant intensité</strong> : Mieux vaut des sessions courtes régulières que des longues sessions espacées</li>
          <li><strong>Adaptation individuelle</strong> : Ajustez selon la fatigue et la motivation de l&apos;enfant</li>
          <li><strong>Combinaison</strong> : L&apos;entraînement cognitif est plus efficace combiné avec d&apos;autres stratégies (routines, organisation, suivi médical)</li>
          <li><strong>Patience</strong> : Les bénéfices ne sont pas immédiats ; comptez au minimum 4 semaines avant d&apos;évaluer les premiers effets</li>
        </ul>
      </section>

      <section>
        <h2>Comment fonctionne l&apos;application</h2>
        <p>
          FocusQuest utilise des <strong>algorithmes adaptatifs</strong> basés sur la méthode de l&apos;escalier (staircase) pour ajuster automatiquement la difficulté des exercices selon les performances de l&apos;utilisateur. Les paradigmes cognitifs (Go/No-Go, N-Back, Stop-Signal, Task-Switching pour la version Standard ; DCCS, Go/No-Go, One-Back pour la version Junior) sont directement issus de la recherche scientifique sur les fonctions exécutives chez les personnes avec TDAH.
        </p>
        <p>
          Chaque session dure environ 15-20 minutes et comprend plusieurs exercices courts. L&apos;application enregistre localement les performances (précision, temps de réaction) pour adapter la difficulté et suivre la progression. Les données restent exclusivement sur l&apos;appareil et ne sont jamais transmises.
        </p>
      </section>

      <section>
        <h2>Comprendre les résultats</h2>
        <p>
          Les courbes et le radar reflètent le <strong>niveau de difficulté atteint</strong> et la <strong>précision</strong> dans l&apos;application. Ce sont des indicateurs d&apos;entraînement, pas un diagnostic ni une évaluation clinique. Une progression dans l&apos;app ne garantit pas un transfert automatique à l&apos;école ou au quotidien.
        </p>
        <p>
          <strong>Interprétation des courbes</strong> : Elles montrent l&apos;évolution du niveau de difficulté (axe vertical) au fil des sessions (axe horizontal). Une courbe ascendante indique une amélioration des capacités cognitives ciblées. La précision (pourcentage de réponses correctes) est également tracée.
        </p>
        <p>
          <strong>Radar des fonctions exécutives</strong> (version Standard uniquement) : Représente les performances dans quatre domaines clés - attention, mémoire de travail, inhibition et flexibilité cognitive. Chaque axe va de 0 à 100% et reflète le niveau de maîtrise relatif.
        </p>
        <p>
          <strong>Conseils pour envisager des résultats</strong> : Les progrès sont généralement subtils et nécessitent une utilisation régulière (4-5 sessions par semaine). Pour la version Junior, des bénéfices comportementaux peuvent apparaître après 2-3 mois. Pour la version Standard, une amélioration des fonctions exécutives peut être observée après 1-2 mois, mais le transfert aux situations réelles varie selon l&apos;individu. Il est recommandé de combiner l&apos;entraînement avec d&apos;autres stratégies (organisation, routines, suivi médical).
        </p>
      </section>

      <section>
        <h2>Limites et avertissements</h2>
        <ul>
          <li>FocusQuest <strong>ne remplace pas</strong> le suivi médical ni les traitements prescrits (médicaments, suivi psychologique, etc.).</li>
          <li>Il n&apos;y a <strong>pas de garantie de transfert</strong> des progrès à la vie scolaire ou quotidienne.</li>
          <li>L&apos;entraînement n&apos;est efficace que s&apos;il est <strong>régulier</strong> (4–5 sessions par semaine selon la littérature).</li>
          <li>Pour la version 5–7 ans, un <strong>gain comportemental immédiat</strong> n&apos;est pas garanti ; des bénéfices potentiels peuvent apparaître après 2–3 mois d&apos;usage régulier.</li>
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <p><strong>Ces jeux remplacent-ils les médicaments ?</strong> Non. Ils sont un complément, pas un substitut.</p>
        <p><strong>Les données sont-elles envoyées quelque part ?</strong> Non. Tout reste sur l&apos;appareil (localStorage).</p>
        <p><strong>Mon enfant peut-il jouer sans adulte ?</strong> Pour 5–7 ans, la co-présence d&apos;un adulte est recommandée. Pour 8–17 ans, l&apos;enfant peut être autonome.</p>
      </section>

      <p style={{ marginTop: 24 }}>
        <Link to="/references" className="fq-link">
          Accéder aux références scientifiques
        </Link>
        {' '}|{' '}
        <Link to="/" className="fq-link">
          Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
