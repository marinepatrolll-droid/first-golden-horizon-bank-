import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SecurityArchitecture from './components/SecurityArchitecture';
import DashboardPreview from './components/DashboardPreview';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import OpenAccountModal from './components/onboarding/OpenAccountModal';
import StripeIdentityModal from './components/modals/StripeIdentityModal';
import PlaidModal from './components/modals/PlaidModal';
import AdminModal from './components/admin/AdminModal';

function AppContent() {
  const THEME_KEY = 'apex_theme_pref';
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('hero');

  // Modals state
  const [isOpenAccountOpen, setIsOpenAccountOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isPlaidLinked, setIsPlaidLinked] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize theme
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  // Hash Routing Support for #admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Keyboard shortcut (Ctrl/Cmd + Shift + A or Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (isAdminOpen) setIsAdminOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, isOpenAccountOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  };

  const handleStartOnboarding = () => {
    setIsOpenAccountOpen(true);
  };

  const handleExploreSecurity = () => {
    const el = document.getElementById('security');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      {/* Background ambient lighting effects */}
      <div className="ambient-glow-container" aria-hidden="true">
        <div className="glow-orb glow-1"></div>
        <div className="glow-orb glow-2"></div>
        <div className="glow-orb glow-3"></div>
      </div>

      {/* Navigation Header */}
      <Navbar 
        theme={theme}
        onToggleTheme={toggleTheme}
        onStartOnboarding={handleStartOnboarding}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Website Content */}
      <main>
        {/* 1. Hero Section */}
        <Hero 
          onStartOnboarding={handleStartOnboarding}
          onExploreSecurity={handleExploreSecurity}
        />

        {/* 2. Wealth Solutions & Platform Features */}
        <Features 
          onStartOnboarding={handleStartOnboarding}
        />

        {/* 3. Zero-Knowledge Security Architecture */}
        <SecurityArchitecture 
          onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
          onOpenPlaidModal={() => setIsPlaidModalOpen(true)}
        />

        {/* 4. Client Portal & Dashboard Demonstration */}
        <DashboardPreview 
          onStartOnboarding={handleStartOnboarding}
        />

        {/* 5. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer with Admin Trigger */}
      <Footer 
        onStartOnboarding={handleStartOnboarding}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Clean Client Account Opening Modal (Shown ONLY when Open Account is clicked) */}
      <OpenAccountModal
        isOpen={isOpenAccountOpen}
        onClose={() => setIsOpenAccountOpen(false)}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onOpenPlaidModal={() => setIsPlaidModalOpen(true)}
      />

      {/* Third-Party Hosted Simulation Modals */}
      <StripeIdentityModal 
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        onSimulateSuccess={() => {
          setIsIdentityVerified(true);
          setIsIdentityModalOpen(false);
        }}
      />

      <PlaidModal 
        isOpen={isPlaidModalOpen}
        onClose={() => setIsPlaidModalOpen(false)}
        onSimulateSuccess={() => {
          setIsPlaidLinked(true);
          setIsPlaidModalOpen(false);
        }}
      />

      {/* Admin Command Center Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
