import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JungleAuthScreen } from './components/AuthModal3D';
import { SEOHandler } from './components/SEOHandler';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#051919] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#355C5D] border border-[#D4AF37]/40 flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <span className="font-extrabold text-[#D4AF37] text-2xl">J</span>
        </div>
        <div className="flex items-center space-x-2 text-[#7EBAC0] text-sm font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Authenticating JOGI Ayu Sanctuary Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <JungleAuthScreen />;
  }

  return <>{children}</>;
};

export default function App() {
  const dynamicBasename = typeof window !== 'undefined' && window.location.pathname.startsWith('/Jogi') ? '/Jogi' : undefined;

  return (
    <ErrorBoundary title="JOGI Ayu Platform System Recovery">
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter basename={dynamicBasename}>
              <SEOHandler />
              <Routes>
                <Route
                  path="/"
                  element={
                    <ErrorBoundary title="Chat Sanctuary Engine Recovery">
                      <ChatInterface />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary title="Vaidya Admin Pipeline Recovery">
                        <AdminDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <ErrorBoundary title="Auth Sanctuary Recovery">
                      <JungleAuthScreen />
                    </ErrorBoundary>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
