import { Link } from 'react-router-dom';

export function ParentsPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Guide parents</h1>

      <section style={styles.section}>
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

      <section style={styles.section}>
        <h2>Comprendre les résultats</h2>
        <p>
          Les courbes et le radar reflètent le <strong>niveau de difficulté atteint</strong> et la <strong>précision</strong> dans l&apos;application. Ce sont des indicateurs d&apos;entraînement, pas un diagnostic ni une évaluation clinique. Une progression dans l&apos;app ne garantit pas un transfert automatique à l&apos;école ou au quotidien.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Limites et avertissements</h2>
        <ul style={styles.list}>
          <li>FocusQuest <strong>ne remplace pas</strong> le suivi médical ni les traitements prescrits (médicaments, suivi psychologique, etc.).</li>
          <li>Il n&apos;y a <strong>pas de garantie de transfert</strong> des progrès à la vie scolaire ou quotidienne.</li>
          <li>L&apos;entraînement n&apos;est efficace que s&apos;il est <strong>régulier</strong> (4–5 sessions par semaine selon la littérature).</li>
          <li>Pour la version 5–7 ans, un <strong>gain comportemental immédiat</strong> n&apos;est pas garanti ; des bénéfices potentiels peuvent apparaître après 2–3 mois d&apos;usage régulier.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>FAQ</h2>
        <p><strong>Ces jeux remplacent-ils les médicaments ?</strong> Non. Ils sont un complément, pas un substitut.</p>
        <p><strong>Les données sont-elles envoyées quelque part ?</strong> Non. Tout reste sur l&apos;appareil (localStorage).</p>
        <p><strong>Mon enfant peut-il jouer sans adulte ?</strong> Pour 5–7 ans, la co-présence d&apos;un adulte est recommandée. Pour 8–17 ans, l&apos;enfant peut être autonome.</p>
      </section>

      <p style={styles.back}>
        <Link to="/references">Accéder aux références scientifiques</Link>
        {' '}|{' '}
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
