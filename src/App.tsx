import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder';
import DataAudit from './components/DataAudit';

const AppContent: React.FC = () => {
  const { user, loading, project, isEmbedded } = useAuth();

  if (loading) {
    return <AuthScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Dynamic Styles from Project
  const brandColors = project?.brandColors || ['#3b82f6', '#1e40af'];
  const primaryColor = brandColors[0];

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ '--primary': primaryColor } as React.CSSProperties}>
      <Routes>
        <Route path="/builder" element={<Builder />} />
        <Route path="*" element={
          <>
            {!isEmbedded && <Sidebar />}
            <main className={cn("flex-1 min-h-screen", !isEmbedded && "ml-64")}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/data" element={<DataAudit />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
