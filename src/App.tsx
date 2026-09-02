import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { SessionsPage } from './pages/Sessions';
import { SessionDetailPage } from './pages/SessionDetail';
import { LapAnalysisPage } from './pages/LapAnalysis';
import { ComparisonPage } from './pages/Comparison';
import { TracksPage } from './pages/Tracks';
import { TrackDetailPage } from './pages/Tracks/TrackDetail';
import { CarsPage } from './pages/Cars';
import { CarDetailPage } from './pages/Cars/CarDetail';
import { ProgressPage } from './pages/Progress';
import { GoalsPage } from './pages/Goals';
import { ImportPage } from './pages/Import';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/analysis" element={<LapAnalysisPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/tracks/:id" element={<TrackDetailPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
