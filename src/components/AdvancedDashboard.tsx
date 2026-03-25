import React, { useMemo } from 'react';
import { Line, Radar, Bar } from 'react-chartjs-2';
import { useProfileStore } from '../store/profileStore';
import type { ModuleId, AppVersion } from '../types/profile';

/**
 * Advanced dashboard with cognitive domain radar and learning curves
 * Shows: Module progression, cognitive domains, accuracy trends
 */
export function AdvancedDashboard() {
  const activeProfile = useProfileStore((s) => s.activeProfile);

  if (!activeProfile) {
    return <div>No active profile</div>;
  }

  const isJunior = activeProfile.version === 'junior';
  const modules = isJunior
    ? (['gonogo', 'oneback', 'dccs'] as ModuleId[])
    : (['cpt', 'nback', 'stopsignal', 'taskswitch'] as ModuleId[]);

  return (
    <div className="advanced-dashboard">
      <h1>Dashboard — {activeProfile.pseudo}</h1>

      {/* Cognitive domains radar */}
      <div className="dashboard-section">
        <h2>Cognitive Domains</h2>
        <CognitiveRadar modules={modules} sessions={activeProfile.sessions} />
      </div>

      {/* Module progression */}
      <div className="dashboard-section modules-grid">
        <h2>Modules Progress</h2>
        {modules.map((moduleId) => (
          <ModuleCard
            key={moduleId}
            moduleId={moduleId}
            level={activeProfile.currentLevels[moduleId] || 1}
            sessionData={activeProfile.sessions.filter((s) => s.moduleId === moduleId)}
          />
        ))}
      </div>

      {/* Learning curves */}
      <div className="dashboard-section">
        <h2>Learning Curves</h2>
        <LearningCurves modules={modules} sessions={activeProfile.sessions} />
      </div>

      {/* Observance chart (weekly activity) */}
      <div className="dashboard-section">
        <h2>Weekly Observance</h2>
        <WeeklyObservance sessions={activeProfile.sessions} />
      </div>
    </div>
  );
}

/**
 * Radar chart showing cognitive domain strengths
 * Domains: Attention, Working Memory, Inhibition, Switching
 */
function CognitiveRadar({
  modules,
  sessions,
}: {
  modules: ModuleId[];
  sessions: any[];
}) {
  const radarData = useMemo(() => {
    // Map modules to cognitive domains
    const domainMap: Record<ModuleId, string> = {
      gonogo: 'Inhibition', // Go/NoGo → inhibitory control
      oneback: 'Working Memory', // 1-Back → WM
      dccs: 'Switching', // DCCS → cognitive flexibility
      cpt: 'Attention', // CPT → sustained attention
      nback: 'Working Memory', // N-Back → WM
      stopsignal: 'Inhibition', // StopSignal → inhibition
      taskswitch: 'Switching', // TaskSwitch → flexibility
    };

    const domainScores: Record<string, { count: number; totalAccuracy: number }> = {
      Attention: { count: 0, totalAccuracy: 0 },
      'Working Memory': { count: 0, totalAccuracy: 0 },
      Inhibition: { count: 0, totalAccuracy: 0 },
      Switching: { count: 0, totalAccuracy: 0 },
    };

    // Aggregate accuracy by domain
    modules.forEach((moduleId) => {
      const domain = domainMap[moduleId];
      const moduleSessions = sessions.filter((s) => s.moduleId === moduleId);
      if (moduleSessions.length > 0) {
        const avgAccuracy =
          moduleSessions.reduce((sum, s) => sum + s.accuracy, 0) /
          moduleSessions.length;
        domainScores[domain].count += moduleSessions.length;
        domainScores[domain].totalAccuracy += avgAccuracy * moduleSessions.length;
      }
    });

    const labels = Object.keys(domainScores);
    const data = labels.map((domain) => {
      const score = domainScores[domain];
      return score.count > 0 ? (score.totalAccuracy / score.count) * 100 : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cognitive Strengths',
          data,
          borderColor: '#0D7377',
          backgroundColor: 'rgba(13, 115, 119, 0.15)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: '#0D7377',
        },
      ],
    };
  }, [modules, sessions]);

  return (
    <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
      <Radar data={radarData as any} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
}

/**
 * Card showing a single module's progression
 */
function ModuleCard({
  moduleId,
  level,
  sessionData,
}: {
  moduleId: ModuleId;
  level: number;
  sessionData: any[];
}) {
  const recentAccuracy = sessionData.length > 0
    ? sessionData[sessionData.length - 1].accuracy * 100
    : 0;

  const moduleLabels: Record<ModuleId, string> = {
    gonogo: 'Go/NoGo',
    oneback: '1-Back',
    dccs: 'DCCS',
    cpt: 'CPT-AX',
    nback: 'N-Back',
    stopsignal: 'Stop Signal',
    taskswitch: 'Task Switch',
  };

  return (
    <div className="module-card">
      <h3>{moduleLabels[moduleId]}</h3>
      <div className="module-stats">
        <div className="stat">
          <span className="label">Level</span>
          <span className="value">{level}/10</span>
        </div>
        <div className="stat">
          <span className="label">Sessions</span>
          <span className="value">{sessionData.length}</span>
        </div>
        <div className="stat">
          <span className="label">Accuracy</span>
          <span className="value">{recentAccuracy.toFixed(0)}%</span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mini-progress-bar">
        <div
          className="mini-progress-fill"
          style={{
            width: `${(level / 10) * 100}%`,
            backgroundColor: getProgressColor(recentAccuracy),
          }}
        />
      </div>
    </div>
  );
}

/**
 * Learning curves showing accuracy improvement over sessions
 */
function LearningCurves({
  modules,
  sessions,
}: {
  modules: ModuleId[];
  sessions: any[];
}) {
  const chartData = useMemo(() => {
    const moduleLabels: Record<ModuleId, string> = {
      gonogo: 'Go/NoGo',
      oneback: '1-Back',
      dccs: 'DCCS',
      cpt: 'CPT-AX',
      nback: 'N-Back',
      stopsignal: 'StopSig',
      taskswitch: 'TaskSwitch',
    };

    const colors = [
      '#2e7d32',
      '#1565c0',
      '#6a1b9a',
      '#d84315',
      '#0097a7',
      '#f57f17',
      '#c2185b',
    ];

    return {
      labels: Array.from({ length: Math.max(0, ...modules.map(
        (m) => sessions.filter((s) => s.moduleId === m).length
      )) }, (_, i) => `S${i + 1}`),
      datasets: modules.map((moduleId, idx) => {
        const moduleSessions = sessions
          .filter((s) => s.moduleId === moduleId)
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        return {
          label: moduleLabels[moduleId],
          data: moduleSessions.map((s) => s.accuracy * 100),
          borderColor: colors[idx],
          backgroundColor: `rgba(${hexToRgb(colors[idx]).join(',')}, 0.1)`,
          fill: true,
          tension: 0.4,
        };
      }),
    };
  }, [modules, sessions]);

  return (
    <div style={{ height: '300px' }}>
      <Line
        data={chartData as any}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const } },
        }}
      />
    </div>
  );
}

/**
 * Weekly activity chart
 */
function WeeklyObservance({ sessions }: { sessions: any[] }) {
  const weeklyData = useMemo(() => {
    const weekCounts = Array(7).fill(0);
    const today = new Date();

    sessions.forEach((session) => {
      const sessionDate = new Date(session.month);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7 && daysDiff >= 0) {
        weekCounts[6 - daysDiff]++;
      }
    });

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Sessions',
          data: weekCounts,
          backgroundColor: '#0D7377',
          borderColor: '#0D7377',
          borderRadius: 4,
        },
      ],
    };
  }, [sessions]);

  return (
    <div style={{ height: '200px' }}>
      <Bar
        data={weeklyData as any}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}

function getProgressColor(accuracy: number): string {
  if (accuracy >= 75) return '#10b981';
  if (accuracy >= 60) return '#f59e0b';
  return '#ef4444';
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}
