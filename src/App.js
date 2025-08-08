import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PlaygroundPage from './pages/PlaygroundPage';

function AppContent() {
  const { user } = useAuth();

  return user ? <PlaygroundPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
