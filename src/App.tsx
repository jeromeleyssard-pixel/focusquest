import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AgeSelector } from './components/AgeSelector';
import { ProfileCreator } from './components/ProfileCreator';
import { ProfileResume } from './components/ProfileResume';
import { MainMenu } from './components/MainMenu';
import { useProfileStore } from './store/profileStore';

import { SessionWrapper } from './components/SessionWrapper';
import { Dashboard } from './components/Dashboard';
import { ReferencesPage } from './components/ReferencesPage';
import { ParentsPage } from './components/ParentsPage';

export default function App() {
  const activeProfile = useProfileStore((s) => s.activeProfile);
  useRegisterSW({
    onNeedRefresh() {
      window.location.reload();
    },
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgeSelector />} />
        <Route path="/profile/new/:version" element={<ProfileCreator />} />
        <Route path="/profile/resume" element={<ProfileResume />} />
        <Route
          path="/menu"
          element={activeProfile ? <MainMenu /> : <Navigate to="/" replace />}
        />
        <Route
          path="/play/:moduleId"
          element={
            activeProfile ? (
              <SessionWrapper />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            activeProfile ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/references" element={<ReferencesPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
