import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { MaterialAnalysis } from './pages/MaterialAnalysis';
import { GraphDiscovery } from './pages/GraphDiscovery';
import { Resources } from './pages/Resources';
import { Opportunities } from './pages/Opportunities';
import { Marketplace } from './pages/Marketplace';
import { Exchanges } from './pages/Exchanges';
import { IndustrialDashboard } from './pages/IndustrialDashboard';
import { LoopHunter } from './pages/LoopHunter';
import { IndustrialGIS } from './pages/IndustrialGIS';
import DriverLogistics from './pages/DriverLogistics';
import { LiveLogistics } from './pages/LiveLogistics';
import { MaterialPassportView } from './pages/MaterialPassportView';
import { FutureRadar } from './pages/FutureRadar';
import { StagnationMonitor } from './pages/StagnationMonitor';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            {/* Future placeholders for navigation items */}
            <Route path="map" element={<IndustrialGIS />} />
            <Route path="resources" element={<Resources />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="exchanges" element={<Exchanges />} />
            <Route path="logistics" element={<DriverLogistics />} />
            <Route path="live-logistics" element={<LiveLogistics />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="industrial" element={<IndustrialDashboard />} />
            <Route path="material-passport" element={<MaterialPassportView />} />
            <Route path="material-passport/:id" element={<MaterialPassportView />} />
            <Route path="ai-advisor" element={<div className="p-4">AI Advisor (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
            <Route path="graph-discovery" element={<GraphDiscovery />} />
            <Route path="loop-hunter" element={<LoopHunter />} />
            <Route path="future-radar" element={<FutureRadar />} />
            <Route path="stagnation" element={<StagnationMonitor />} />
          </Route>
          
          <Route path="/ai/material-analysis" element={
            <ProtectedRoute>
              <MaterialAnalysis />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
