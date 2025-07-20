import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';

function AppContent() {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <AuthPage />;
  }

  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;