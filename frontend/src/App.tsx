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
            <Route path="map" element={<div className="p-4">Industrial Map (Coming Soon)</div>} />
            <Route path="resources" element={<div className="p-4">Resources (Coming Soon)</div>} />
            <Route path="opportunities" element={<div className="p-4">Opportunities (Coming Soon)</div>} />
            <Route path="marketplace" element={<div className="p-4">Marketplace (Coming Soon)</div>} />
            <Route path="exchanges" element={<div className="p-4">Exchanges (Coming Soon)</div>} />
            <Route path="logistics" element={<div className="p-4">Logistics (Coming Soon)</div>} />
            <Route path="analytics" element={<div className="p-4">Analytics (Coming Soon)</div>} />
            <Route path="industrial" element={<div className="p-4">Industrial Dashboard (Coming Soon)</div>} />
            <Route path="material-passport" element={<div className="p-4">Material Passport (Coming Soon)</div>} />
            <Route path="ai-advisor" element={<div className="p-4">AI Advisor (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
            <Route path="graph-discovery" element={<GraphDiscovery />} />
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
