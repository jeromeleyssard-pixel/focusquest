import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../store/profileStore';
import type { SessionSummary } from '../types/session';
import type { PlayerProfile } from '../types/profile';
import '../styles/parent-report.css';

/**
 * Parent/Teacher Reports Dashboard
 * Shows: Progress trajectories, cognitive strengths, recommendations, alerts
 */
export function ParentReportDashboard() {
  const { t } = useTranslation();
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) {
    return <div>{t('parentReport.noData')}</div>;
  }

  return (
    <div className="parent-report-dashboard">
      <div className="report-header">
        <h1>{t('parentReport.title')} — {activeProfile.pseudo}</h1>
        <span className="report-date">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Executive Summary */}
      <section className="report-section executive-summary">
        <h2>📊 {t('parentReport.title')}</h2>
        <ReportSummary profile={activeProfile} />
      </section>

      {/* Progress Trajectory */}
      <section className="report-section">
        <h2>📈 {t('parentReport.accuracyChart')} (4 weeks)</h2>
        <TrajectoryChart sessions={activeProfile.sessions} />
      </section>

      {/* Cognitive Strengths */}
      <section className="report-section">
        <h2>🧠 {t('parentReport.cognitiveAssessment')}</h2>
        <CognitiveAssessment sessions={activeProfile.sessions} />
      </section>

      {/* Recommendations */}
      <section className="report-section">
        <h2>💡 Personalized Recommendations</h2>
        <Recommendations profile={activeProfile} />
      </section>

      {/* Alerts */}
      <section className="report-section alerts">
        <h2>⚠️ Alerts</h2>
        <Alerts sessions={activeProfile.sessions} />
      </section>

      {/* Printable note */}
      <p className="print-note">💻 {t('parentReport.printNote')}</p>
    </div>
  );
}

/**
 * Executive summary overview
 */
function ReportSummary({ profile }: { profile: PlayerProfile }) {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const totalSessions = profile.sessions.length;
    const avgAccuracy =
      totalSessions > 0
        ? profile.sessions.reduce((sum: number, s: SessionSummary) => sum + s.accuracy, 0) /
          totalSessions
        : 0;
    const latestLevel = profile.sessions[0]?.level || 1;
    const totalMinutes = Math.round(
      profile.sessions.reduce((sum: number, s: SessionSummary) => sum + s.durationSeconds, 0) /
        60
    );

    return { totalSessions, avgAccuracy, latestLevel, totalMinutes };
  }, [profile]);

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span className="summary-label">{t('parentReport.totalSessions')}</span>
        <span className="summary-value">{stats.totalSessions}</span>
        <span className="summary-subtext">
          {stats.totalMinutes} {t('parentReport.minutesInvested')}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-label">{t('parentReport.averageAccuracy')}</span>
        <span className="summary-value" style={{ color: getAccuracyColor(stats.avgAccuracy) }}>
          {Math.round(stats.avgAccuracy * 100)}%
        </span>
        <span className="summary-subtext">{t('parentReport.wcagStandard')}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">{t('parentReport.currentLevel')}</span>
        <span className="summary-value">{stats.latestLevel}/10</span>
        <span className="summary-subtext">{t('parentReport.adaptiveDifficulty')}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">{t('parentReport.engagement')}</span>
        <span className="summary-value">
          {stats.totalSessions > 10 ? '✅ Excellent' : stats.totalSessions > 5 ? '🟡 Good' : '🔴 Needs boost'}
        </span>
        <span className="summary-subtext">
          {t('parentReport.lastSession')}{getLastSessionDate(profile.sessions)}
        </span>
      </div>
    </div>
  );
}

function TrajectoryChart({ sessions }: { sessions: SessionSummary[] }) {
  const { t } = useTranslation();
  const trajectory = useMemo(() => {
    const last4weeks = sessions
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // 12 sessions max

    return {
      weeks: last4weeks.map((s) => s.month.slice(-2)),
      accuracy: last4weeks.map((s) => Math.round(s.accuracy * 100)),
      levels: last4weeks.map((s) => s.level),
    };
  }, [sessions]);

  return (
    <div className="trajectory-container">
      <div className="trajectory-row">
        <div className="trajectory-label">{t('parentReport.accuracyChart')}</div>
        <div className="trajectory-data">
          {trajectory.accuracy.map((acc, i) => (
            <div key={i} className="trajectory-item">
              <div
                className="trajectory-bar"
                style={{
                  height: `${acc}%`,
                  backgroundColor: getAccuracyColor(acc / 100),
                }}
                role="img"
                aria-label={`${t('parentReport.accuracyChart')} Semaine ${i + 1}: ${acc}%`}
              />
              <span className="trajectory-value">{acc}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="trajectory-row">
        <div className="trajectory-label">{t('parentReport.levelChart')}</div>
        <div className="trajectory-data">
          {trajectory.levels.map((level, i) => (
            <div key={i} className="trajectory-item">
              <span className="level-badge">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CognitiveAssessment({ sessions }: { sessions: SessionSummary[] }) {
  const { t } = useTranslation();
  // Map modules to domains
  const domainMap: Record<string, string> = {
    gonogo: 'Inhibition',
    oneback: 'Working Memory',
    dccs: 'Switching',
    cpt: 'Attention',
    nback: 'Working Memory',
    stopsignal: 'Inhibition',
    taskswitch: 'Switching',
  };

  const assessment = useMemo(() => {
    const domains: Record<string, { count: number; totalAccuracy: number }> = {
      Attention: { count: 0, totalAccuracy: 0 },
      'Working Memory': { count: 0, totalAccuracy: 0 },
      Inhibition: { count: 0, totalAccuracy: 0 },
      Switching: { count: 0, totalAccuracy: 0 },
    };

    sessions.forEach((session) => {
      const domain = domainMap[session.moduleId] || 'Unknown';
      if (domain in domains) {
        domains[domain].count++;
        domains[domain].totalAccuracy += session.accuracy;
      }
    });

    return Object.entries(domains).map(([name, data]) => ({
      name,
      accuracy: data.count > 0 ? data.totalAccuracy / data.count : 0,
      count: data.count,
    }));
  }, [sessions]);

  const translateDomain = (domainName: string) => {
    switch (domainName) {
      case 'Inhibition':
        return t('parentReport.domains.inhibition');
      case 'Working Memory':
        return t('parentReport.domains.workingMemory');
      case 'Attention':
        return t('parentReport.domains.attention');
      case 'Switching':
        return t('parentReport.domains.switching');
      default:
        return domainName;
    }
  };

  return (
    <div className="cognitive-assessment">
      {assessment.map(({ name, accuracy, count }) => (
        <div key={name} className="assessment-row">
          <span className="domain-name">{translateDomain(name)}</span>
          <div className="domain-bar">
            <div
              className="domain-fill"
              style={{
                width: `${accuracy * 100}%`,
                backgroundColor: getAccuracyColor(accuracy),
              }}
            />
          </div>
          <span className="domain-stats">
            {Math.round(accuracy * 100)}% ({count} sessions)
          </span>
        </div>
      ))}
    </div>
  );
}

function Recommendations({ profile }: { profile: PlayerProfile }) {
  const recommendations = useMemo(() => {
    const recs: string[] = [];

    const avgAccuracy =
      profile.sessions.length > 0
        ? profile.sessions.reduce((sum: number, s: SessionSummary) => sum + s.accuracy, 0) /
          profile.sessions.length
        : 0;

    if (avgAccuracy < 0.6) {
      recs.push(
        '⚠️ Accuracy is below 60%. Consider shorter sessions or simpler paradigms.'
      );
    } else if (avgAccuracy > 0.8) {
      recs.push('🌟 Excellent accuracy! Child is ready for increased difficulty.');
    }

    if (profile.sessions.length < 5) {
      recs.push('🎯 Encourage more frequent sessions (3-5x per week recommended).');
    }

    const maxLevel = Math.max(...profile.sessions.map((s: SessionSummary) => s.level));
    if (maxLevel >= 8) {
      recs.push('🚀 High difficulty level achieved! Consider adding new modules.');
    }

    if (recs.length === 0) {
      recs.push('✅ Progress is on track. Continue current routine.');
    }

    return recs;
  }, [profile]);

  return (
    <div className="recommendations-list">
      {recommendations.map((rec, i) => (
        <div key={i} className="recommendation-item">
          {rec}
        </div>
      ))}
    </div>
  );
}

function Alerts({ sessions }: { sessions: SessionSummary[] }) {
  const alerts = useMemo(() => {
    const alerts: Array<{ level: 'warning' | 'info'; message: string }> = [];

    // Check for low accuracy trend
    const recent3 = sessions.slice(0, 3);
    const avgRecent = recent3.reduce((sum, s) => sum + s.accuracy, 0) / recent3.length;
    if (avgRecent < 0.55 && recent3.length >= 3) {
      alerts.push({
        level: 'warning',
        message: 'Accuracy declining. Check session conditions or take a break.',
      });
    }

    // Check for gaps
    if (sessions.length > 0) {
      const lastDate = new Date(sessions[0].month);
      const daysSince = Math.floor(
        (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 7) {
        alerts.push({
          level: 'info',
          message: `No sessions in ${daysSince} days. Consider resuming the routine.`,
        });
      }
    }

    if (alerts.length === 0) {
      alerts.push({ level: 'info', message: '✅ No alerts. Everything looks good!' });
    }

    return alerts;
  }, [sessions]);

  return (
    <div className="alerts-list">
      {alerts.map((alert, i) => (
        <div key={i} className={`alert-item alert-${alert.level}`}>
          {alert.message}
        </div>
      ))}
    </div>
  );
}

function getAccuracyColor(accuracy: number | number): string {
  const acc = typeof accuracy === 'number' ? accuracy : 0.5;
  if (acc >= 0.75) return '#10b981'; // green
  if (acc >= 0.6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getLastSessionDate(sessions: SessionSummary[]): string {
  if (sessions.length === 0) return 'Never';
  const date = new Date(sessions[0].month);
  return date.toLocaleDateString();
}
