import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../store/profileStore';
import type { SessionSummary } from '../types/session';
import type { PlayerProfile } from '../types/profile';
import '../styles/parent-report.css';

/** Sort sessions by date ascending (immutable). */
function sortedByDate(sessions: SessionSummary[]): SessionSummary[] {
  return [...sessions].sort((a, b) =>
    (a.date ?? a.month) < (b.date ?? b.month) ? -1 : 1
  );
}

/** Format ISO date "YYYY-MM-DD" → "10/04/2025". */
function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Days between two ISO date strings. */
function daysBetween(isoA: string, isoB: string): number {
  return Math.abs(
    Math.floor(
      (new Date(isoA + 'T00:00:00').getTime() - new Date(isoB + 'T00:00:00').getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.75) return '#10b981';
  if (accuracy >= 0.6) return '#f59e0b';
  return '#ef4444';
}

const DOMAIN_MAP: Record<string, string> = {
  gonogo: 'Inhibition',
  oneback: 'Mémoire de travail',
  dccs: 'Flexibilité',
  cpt: 'Attention',
  nback: 'Mémoire de travail',
  stopsignal: 'Inhibition',
  taskswitch: 'Flexibilité',
};

// ─────────────────────────────────────────────────────────────
export function ParentReportDashboard() {
  const { t } = useTranslation();
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) {
    return <div>{t('parentReport.noData')}</div>;
  }

  const sorted = sortedByDate(activeProfile.sessions);

  return (
    <div className="parent-report-dashboard">
      <div className="report-header">
        <h1>{t('parentReport.title')} — {activeProfile.pseudo}</h1>
        <span className="report-date">{new Date().toLocaleDateString('fr-FR')}</span>
      </div>

      <section className="report-section executive-summary">
        <h2>📊 Résumé</h2>
        <ReportSummary profile={activeProfile} sorted={sorted} />
      </section>

      <section className="report-section">
        <h2>📈 Trajectoire (12 dernières sessions)</h2>
        <TrajectoryChart sorted={sorted} />
      </section>

      <section className="report-section">
        <h2>⏱ Temps de réaction</h2>
        <RTChart sorted={sorted} />
      </section>

      <section className="report-section">
        <h2>🧠 Profil cognitif</h2>
        <CognitiveAssessment sorted={sorted} />
      </section>

      <section className="report-section">
        <h2>💡 Recommandations</h2>
        <Recommendations profile={activeProfile} sorted={sorted} />
      </section>

      <section className="report-section alerts">
        <h2>⚠️ Alertes</h2>
        <Alerts sorted={sorted} />
      </section>

      <p className="print-note">💻 {t('parentReport.printNote')}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function ReportSummary({ profile, sorted }: { profile: PlayerProfile; sorted: SessionSummary[] }) {
  const stats = useMemo(() => {
    const totalSessions = sorted.length;
    const avgAccuracy =
      totalSessions > 0
        ? sorted.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions
        : 0;
    const latestLevel = sorted.at(-1)?.level ?? 1;
    const totalMinutes = Math.round(
      sorted.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
    );
    const lastDate = sorted.at(-1)?.date ?? sorted.at(-1)?.month ?? null;
    const daysSinceLast = lastDate ? daysBetween(lastDate, new Date().toISOString().slice(0, 10)) : null;

    return { totalSessions, avgAccuracy, latestLevel, totalMinutes, lastDate, daysSinceLast };
  }, [sorted]);

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span className="summary-label">Sessions totales</span>
        <span className="summary-value">{stats.totalSessions}</span>
        <span className="summary-subtext">{stats.totalMinutes} min investies</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Précision moyenne</span>
        <span className="summary-value" style={{ color: getAccuracyColor(stats.avgAccuracy) }}>
          {Math.round(stats.avgAccuracy * 100)}%
        </span>
        <span className="summary-subtext">sur tous les essais corrects</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Niveau actuel</span>
        <span className="summary-value">{stats.latestLevel}/10</span>
        <span className="summary-subtext">difficulté adaptative</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Engagement</span>
        <span className="summary-value">
          {stats.totalSessions > 10 ? '✅ Excellent' : stats.totalSessions > 5 ? '🟡 Bon' : '🔴 À stimuler'}
        </span>
        <span className="summary-subtext">
          {stats.daysSinceLast !== null
            ? stats.daysSinceLast === 0
              ? 'Dernière session : aujourd\'hui'
              : `Dernière session : il y a ${stats.daysSinceLast} j (${fmtDate(stats.lastDate!)})`
            : 'Aucune session'}
        </span>
      </div>
      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="summary-card" style={{ gridColumn: '1 / -1' }}>
          <span className="summary-label">Badges débloqués</span>
          <span className="summary-value" style={{ fontSize: '1.4rem', letterSpacing: '0.15em' }}>
            {profile.badges.map((b) => BADGE_EMOJI[b] ?? '🏅').join(' ')}
          </span>
        </div>
      )}
    </div>
  );
}

const BADGE_EMOJI: Record<string, string> = {
  first_session: '🎉',
  level_5: '⭐',
  streak_5: '🔥',
  module_mastered: '🏆',
  week_streak: '📅',
};

// ─────────────────────────────────────────────────────────────
function TrajectoryChart({ sorted }: { sorted: SessionSummary[] }) {
  const last12 = sorted.slice(-12);

  if (last12.length === 0) return <p className="no-data">Aucune session.</p>;

  return (
    <div className="trajectory-container">
      <div className="trajectory-row">
        <div className="trajectory-label">Précision</div>
        <div className="trajectory-data">
          {last12.map((s, i) => {
            const acc = Math.round(s.accuracy * 100);
            return (
              <div key={i} className="trajectory-item" title={`${fmtDate(s.date ?? s.month)} — ${s.moduleId}`}>
                <div
                  className="trajectory-bar"
                  style={{ height: `${acc}%`, backgroundColor: getAccuracyColor(s.accuracy) }}
                  role="img"
                  aria-label={`Session ${i + 1}: ${acc}%`}
                />
                <span className="trajectory-value">{acc}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="trajectory-row">
        <div className="trajectory-label">Niveau</div>
        <div className="trajectory-data">
          {last12.map((s, i) => (
            <div key={i} className="trajectory-item">
              <span className="level-badge">{s.level}</span>
              <span className="trajectory-value" style={{ fontSize: 10 }}>{fmtDate(s.date ?? s.month).slice(0, 5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function RTChart({ sorted }: { sorted: SessionSummary[] }) {
  const rtSessions = sorted.filter((s) => (s.meanRT ?? 0) > 0).slice(-12);

  if (rtSessions.length < 2) {
    return <p className="no-data">Données TR disponibles après 2+ sessions.</p>;
  }

  const maxRT = Math.max(...rtSessions.map((s) => s.meanRT ?? 0), 1);

  return (
    <div className="trajectory-container">
      <div className="trajectory-row">
        <div className="trajectory-label">TR moyen (ms)</div>
        <div className="trajectory-data">
          {rtSessions.map((s, i) => {
            const rt = Math.round(s.meanRT ?? 0);
            const pct = Math.round((rt / maxRT) * 100);
            return (
              <div key={i} className="trajectory-item" title={`${fmtDate(s.date ?? s.month)}`}>
                <div
                  className="trajectory-bar"
                  style={{ height: `${pct}%`, backgroundColor: '#f59e0b' }}
                />
                <span className="trajectory-value">{rt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="trajectory-row">
        <div className="trajectory-label">Variabilité (ms)</div>
        <div className="trajectory-data">
          {rtSessions.map((s, i) => {
            const rv = Math.round(s.rtisv ?? 0);
            const maxRV = Math.max(...rtSessions.map((x) => x.rtisv ?? 0), 1);
            const pct = Math.round((rv / maxRV) * 100);
            return (
              <div key={i} className="trajectory-item">
                <div
                  className="trajectory-bar"
                  style={{ height: `${pct}%`, backgroundColor: '#ef4444' }}
                />
                <span className="trajectory-value">{rv}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>
        Une variabilité (RTISV) élevée et persistante peut indiquer une irrégularité attentionnelle — à mentionner au professionnel de santé.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function CognitiveAssessment({ sorted }: { sorted: SessionSummary[] }) {
  const assessment = useMemo(() => {
    const domains: Record<string, { count: number; totalAccuracy: number; totalLevel: number }> = {
      Attention: { count: 0, totalAccuracy: 0, totalLevel: 0 },
      'Mémoire de travail': { count: 0, totalAccuracy: 0, totalLevel: 0 },
      Inhibition: { count: 0, totalAccuracy: 0, totalLevel: 0 },
      Flexibilité: { count: 0, totalAccuracy: 0, totalLevel: 0 },
    };

    sorted.forEach((s) => {
      const domain = DOMAIN_MAP[s.moduleId];
      if (domain && domain in domains) {
        domains[domain].count++;
        domains[domain].totalAccuracy += s.accuracy;
        domains[domain].totalLevel += s.level;
      }
    });

    return Object.entries(domains).map(([name, d]) => ({
      name,
      accuracy: d.count > 0 ? d.totalAccuracy / d.count : 0,
      avgLevel: d.count > 0 ? d.totalLevel / d.count : 0,
      count: d.count,
    }));
  }, [sorted]);

  return (
    <div className="cognitive-assessment">
      {assessment.map(({ name, accuracy, avgLevel, count }) => (
        <div key={name} className="assessment-row">
          <span className="domain-name">{name}</span>
          <div className="domain-bar">
            <div
              className="domain-fill"
              style={{ width: `${Math.round(accuracy * 100)}%`, backgroundColor: getAccuracyColor(accuracy) }}
            />
          </div>
          <span className="domain-stats">
            {Math.round(accuracy * 100)}% — niv. moy. {avgLevel.toFixed(1)} ({count} sessions)
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Recommendations({ profile, sorted }: { profile: PlayerProfile; sorted: SessionSummary[] }) {
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (sorted.length === 0) {
      recs.push('🎯 Commencez par jouer à un jeu pour voir apparaître les recommandations.');
      return recs;
    }

    const avgAccuracy = sorted.reduce((s, x) => s + x.accuracy, 0) / sorted.length;
    const recentSessions = sorted.slice(-5);
    const recentAvg = recentSessions.reduce((s, x) => s + x.accuracy, 0) / recentSessions.length;

    // Accuracy global
    if (avgAccuracy < 0.55) {
      recs.push('⚠️ Précision globale en dessous de 55 %. Envisagez des sessions plus courtes ou commencez par les niveaux les plus simples.');
    } else if (avgAccuracy > 0.82) {
      recs.push('🌟 Excellente précision ! L\'enfant est prêt pour des niveaux plus difficiles.');
    }

    // Tendance récente
    if (recentSessions.length >= 3 && recentAvg > avgAccuracy + 0.08) {
      recs.push('📈 Progression notable sur les 5 dernières sessions — continuez sur cette lancée !');
    } else if (recentSessions.length >= 3 && recentAvg < avgAccuracy - 0.08) {
      recs.push('📉 Légère baisse de précision récente. Vérifiez les conditions de jeu (fatigue, distractions).');
    }

    // Fréquence
    if (sorted.length < 5) {
      recs.push('🎯 Encouragez des sessions régulières : 3 à 5 fois par semaine est idéal pour observer des progrès.');
    }

    // Par domaine cognitif
    const domainAccuracies: Record<string, number[]> = {};
    sorted.forEach((s) => {
      const d = DOMAIN_MAP[s.moduleId];
      if (d) {
        if (!domainAccuracies[d]) domainAccuracies[d] = [];
        domainAccuracies[d].push(s.accuracy);
      }
    });
    for (const [domain, accs] of Object.entries(domainAccuracies)) {
      const avg = accs.reduce((a, b) => a + b, 0) / accs.length;
      if (avg < 0.58 && accs.length >= 3) {
        recs.push(`🧠 Le domaine "${domain}" montre une précision faible (${Math.round(avg * 100)}%) — c'est une piste à explorer avec un professionnel.`);
      }
    }

    // Niveau élevé atteint
    const maxLevel = Math.max(...sorted.map((s) => s.level), 0);
    if (maxLevel >= 9) {
      recs.push('🚀 Niveau très élevé atteint ! Explorez les autres modules pour diversifier l\'entraînement.');
    }

    // TR variabilité élevée
    const rtSessions = sorted.filter((s) => (s.rtisv ?? 0) > 0);
    if (rtSessions.length >= 5) {
      const avgRTISV = rtSessions.reduce((a, s) => a + (s.rtisv ?? 0), 0) / rtSessions.length;
      const avgRT = rtSessions.reduce((a, s) => a + (s.meanRT ?? 0), 0) / rtSessions.length;
      if (avgRT > 0 && avgRTISV / avgRT > 0.45) {
        recs.push('⏱ Variabilité du temps de réaction élevée (CV > 45 %). Ce profil peut être associé à une instabilité attentionnelle — à mentionner au professionnel de santé.');
      }
    }

    if (recs.length === 0) {
      recs.push('✅ Progression sur la bonne voie. Continuez la routine actuelle.');
    }

    // Badges manquants
    if (!profile.badges.includes('streak_5') && sorted.length >= 3) {
      recs.push('🔥 Encore quelques sessions pour débloquer le badge "Série de 5" !');
    }

    return recs;
  }, [profile, sorted]);

  return (
    <div className="recommendations-list">
      {recommendations.map((rec, i) => (
        <div key={i} className="recommendation-item">{rec}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Alerts({ sorted }: { sorted: SessionSummary[] }) {
  const alerts = useMemo(() => {
    const list: Array<{ level: 'warning' | 'info'; message: string }> = [];

    if (sorted.length === 0) {
      list.push({ level: 'info', message: '✅ Aucune session enregistrée.' });
      return list;
    }

    // Tendance à la baisse (3 dernières sessions)
    const recent3 = sorted.slice(-3);
    if (recent3.length === 3) {
      const avgRecent = recent3.reduce((s, x) => s + x.accuracy, 0) / 3;
      if (avgRecent < 0.55) {
        list.push({ level: 'warning', message: 'Précision en baisse sur les 3 dernières sessions. Vérifiez les conditions ou accordez une pause.' });
      }
    }

    // Inactivité — utilise le vrai champ date
    const lastDate = sorted.at(-1)?.date ?? sorted.at(-1)?.month;
    if (lastDate) {
      const today = new Date().toISOString().slice(0, 10);
      const days = daysBetween(lastDate, today);
      if (days > 14) {
        list.push({ level: 'warning', message: `Aucune session depuis ${days} jours (dernière : ${fmtDate(lastDate)}). Reprenez la routine !` });
      } else if (days > 7) {
        list.push({ level: 'info', message: `Dernière session il y a ${days} jours. Essayez de jouer 3 à 5× par semaine.` });
      }
    }

    if (list.length === 0) {
      list.push({ level: 'info', message: '✅ Aucune alerte. Tout se passe bien !' });
    }

    return list;
  }, [sorted]);

  return (
    <div className="alerts-list">
      {alerts.map((alert, i) => (
        <div key={i} className={`alert-item alert-${alert.level}`}>{alert.message}</div>
      ))}
    </div>
  );
}
