import React, { useState } from 'react';
import { LogOut, Search, Download, ShieldCheck, HelpCircle, Sun, Moon, Globe, X, LogIn, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal3D } from './AuthModal3D';

interface HeaderProps {
  onExportSession: () => void;
  onOpenPlayground: () => void;
  vectorDbStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  onExportSession,
  onOpenPlayground,
  vectorDbStatus,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#355C5D] dark:bg-[#1a2e2f] text-white shadow-sm border-b border-[#7EBAC0]/20 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7EBAC0] to-[#254D4E] flex items-center justify-center shadow-inner border border-white/20">
              <span className="font-bold text-white text-base tracking-wider">J</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-headline">
                  JOGI Ayu AI
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#7EBAC0]/20 text-[#7EBAC0] border border-[#7EBAC0]/30 hidden sm:inline-block">
                  {t('admin.dashboard') || 'Intelligence Center'}
                </span>
              </div>
              <p className="text-[10px] text-white/70 font-medium -mt-0.5 hidden xs:block">
                Clinical Ayurvedic RAG Engine
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center space-x-2.5">
            {/* 3D Vaidya Access / User Badge Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Open 3D Ayurvedic Jungle Auth Modal"
            >
              {isAuthenticated ? <User className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              <span className="hidden md:inline max-w-[120px] truncate">
                {isAuthenticated ? (user?.displayName || user?.email?.split('@')[0] || 'Vaidya Active') : 'Vaidya Access (3D)'}
              </span>
            </button>

            {/* Vector DB Live Status Pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-black/20 border border-white/10 px-3 py-1.5 rounded-full text-xs">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                vectorDbStatus === 'Online' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                vectorDbStatus === 'Checking...' ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' :
                'bg-rose-400 shadow-[0_0_8px_#fb7185]'
              }`}></span>
              <span className="text-white/80 font-mono text-[11px]">
                Pinecone DB: <strong className={
                  vectorDbStatus === 'Online' ? 'text-emerald-300' :
                  vectorDbStatus === 'Checking...' ? 'text-yellow-300' :
                  'text-rose-300'
                }>{vectorDbStatus}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 border-l border-white/20 pl-2 sm:pl-3">
              {/* Language Toggle */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer border border-white/15"
              >
                <option value="en" className="text-gray-900 bg-white dark:bg-[#051919] dark:text-white font-medium">EN</option>
                <option value="hin" className="text-gray-900 bg-white dark:bg-[#051919] dark:text-white font-medium">HIN</option>
                <option value="guj" className="text-gray-900 bg-white dark:bg-[#051919] dark:text-white font-medium">GUJ</option>
              </select>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowHelpDrawer(true)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-all"
                title="Help & Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* RAG Query Playground Button */}
            <button
              onClick={onOpenPlayground}
              className="hidden md:flex items-center space-x-1.5 bg-[#7EBAC0]/20 hover:bg-[#7EBAC0]/30 text-[#7EBAC0] hover:text-white px-3 py-1.5 rounded-lg border border-[#7EBAC0]/40 text-xs font-semibold transition-all duration-200"
              title="Test Vector DB Search & Gemini RAG"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('nav.playground')}</span>
            </button>

            {/* Export Session JSON Button */}
            <button
              onClick={onExportSession}
              className="hidden lg:flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold transition-all duration-200"
              title="Export Current User Session Data to JSON file"
            >
              <Download className="w-3.5 h-3.5 text-[#7EBAC0]" />
              <span>{t('nav.export')}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center space-x-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 hover:text-rose-100 px-3 py-1.5 rounded-lg border border-rose-500/30 text-xs font-bold transition-all duration-200"
              title="Logout from Admin Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3D Auth Modal */}
      <AuthModal3D isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />


      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] dark:bg-[#1a202c] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#355C5D]/20 text-[#2D3748] dark:text-gray-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">
              Confirm Admin Logout
            </h3>
            <p className="text-xs text-center mb-6 opacity-80">
              Are you sure you want to log out of the JOGI Ayu AI Admin Intelligence Center?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-current opacity-70 hover:opacity-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Drawer */}
      {showHelpDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowHelpDrawer(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1a202c] shadow-2xl z-50 p-6 overflow-y-auto border-l border-[#355C5D]/20 text-[#2D3748] dark:text-gray-200 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#355C5D] dark:text-[#7EBAC0]" />
                Help & Shortcuts
              </h2>
              <button onClick={() => setShowHelpDrawer(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#355C5D] dark:text-[#7EBAC0] mb-3 uppercase tracking-wider">Quick Start Guide</h3>
                <ul className="text-xs space-y-2 opacity-80 list-disc pl-4">
                  <li>Upload PDF/TXT documents in the ingestion zone.</li>
                  <li>Click 'Re-index' to process chunks into vectors.</li>
                  <li>Use 'RAG Playground' to test embeddings live.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#355C5D] dark:text-[#7EBAC0] mb-3 uppercase tracking-wider">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span>Search Knowledge Base</span>
                    <kbd className="font-mono bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm border border-gray-300 dark:border-gray-600">Cmd + K</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span>Open RAG Playground</span>
                    <kbd className="font-mono bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm border border-gray-300 dark:border-gray-600">Cmd + P</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span>Export JSON</span>
                    <kbd className="font-mono bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm border border-gray-300 dark:border-gray-600">Cmd + E</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
