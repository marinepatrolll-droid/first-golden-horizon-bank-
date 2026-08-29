import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Navbar({ theme, onToggleTheme, onStartOnboarding, onOpenAdmin, activeSection }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  const scrollTo = (id) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAccount = () => {
    setIsMobileMenuOpen(false);
    onStartOnboarding();
  };

  const handleOpenAdmin = () => {
    setIsMobileMenuOpen(false);
    onOpenAdmin();
  };

  // Mobile Drawer Portal Component (rendered directly at document.body for instant, glitch-free iOS & Android rendering)
  const mobileDrawer = mounted && isMobileMenuOpen ? (
    createPortal(
      <div className="mobile-menu-portal-wrapper">
        {/* Backdrop overlay */}
        <div 
          className="mobile-nav-backdrop open"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Navigation Drawer */}
        <div 
          className="mobile-nav-drawer open" 
          role="dialog" 
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="mobile-nav-content">
            {/* Header / Brand & Close Button */}
            <div className="mobile-nav-header-row">
              <div className="mobile-nav-brand">
                <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
                <div>
                  <span className="brand-name" style={{ fontSize: '1.05rem', display: 'block', lineHeight: 1.1 }}>FIRST GOLDEN HORIZON</span>
                  <span className="brand-tagline" style={{ fontSize: '0.62rem' }}>PRIVATE BANKING</span>
                </div>
              </div>

              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation Links */}
            <div className="mobile-nav-list">
              <button 
                type="button" 
                className="mobile-nav-link highlighted"
                onClick={handleOpenAccount}
              >
                <div className="mobile-nav-icon gold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7.5" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-title">Open Account</span>
                  <span className="mobile-nav-sub">KYC / AML Registration in 3 Mins</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button 
                type="button" 
                className="mobile-nav-link"
                onClick={() => scrollTo('solutions')}
              >
                <div className="mobile-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-title">Wealth Solutions</span>
                  <span className="mobile-nav-sub">Bespoke Portfolios & Treasury</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button 
                type="button" 
                className="mobile-nav-link"
                onClick={() => scrollTo('security')}
              >
                <div className="mobile-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-title">Security Architecture</span>
                  <span className="mobile-nav-sub">Zero-Knowledge Enclaves & MPC</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button 
                type="button" 
                className="mobile-nav-link"
                onClick={() => scrollTo('portal')}
              >
                <div className="mobile-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-title">Portal Preview</span>
                  <span className="mobile-nav-sub">Simulated Holdings & Analytics</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button 
                type="button" 
                className="mobile-nav-link"
                onClick={() => scrollTo('faq')}
              >
                <div className="mobile-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-title">Client FAQ</span>
                  <span className="mobile-nav-sub">Custody & Compliance Answers</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mobile-nav-footer">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleOpenAccount}
                style={{ width: '100%', padding: '0.9rem', marginBottom: '0.75rem' }}
              >
                <span>Begin Account Opening</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <div className="mobile-quick-actions">
                <button 
                  type="button" 
                  className="mobile-quick-btn"
                  onClick={onToggleTheme}
                >
                  {theme === 'dark' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                      </svg>
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  className="mobile-quick-btn"
                  onClick={handleOpenAdmin}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Admin Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <header className="navbar">
        <div className="container navbar-container">
          {/* Brand Link */}
          <div className="brand-link" onClick={() => scrollTo('hero')}>
            <div className="brand-icon-box" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="brand-titles">
              <span className="brand-name">FIRST GOLDEN HORIZON</span>
              <span className="brand-tagline">BANK & WEALTH MANAGEMENT</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" className="desktop-nav">
            <ul className="nav-links">
              <li>
                <button 
                  type="button" 
                  className="nav-link-item"
                  onClick={handleOpenAccount}
                >
                  Open Account
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link-item ${activeSection === 'solutions' ? 'active' : ''}`}
                  onClick={() => scrollTo('solutions')}
                >
                  Wealth Solutions
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link-item ${activeSection === 'security' ? 'active' : ''}`}
                  onClick={() => scrollTo('security')}
                >
                  Security Architecture
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link-item ${activeSection === 'portal' ? 'active' : ''}`}
                  onClick={() => scrollTo('portal')}
                >
                  Portal Preview
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link-item ${activeSection === 'faq' ? 'active' : ''}`}
                  onClick={() => scrollTo('faq')}
                >
                  FAQ
                </button>
              </li>
            </ul>
          </nav>

          {/* Actions & Hamburger Button */}
          <div className="nav-actions">
            <button 
              type="button" 
              className="theme-toggle-btn" 
              onClick={onToggleTheme} 
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <button 
              type="button" 
              className="btn btn-primary btn-sm desktop-cta-btn"
              onClick={handleOpenAccount}
            >
              <span>Open Account</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            {/* Mobile Hamburger Button with Instant Touch Trigger */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(prev => !prev);
              }}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Render Portal Drawer */}
      {mobileDrawer}
    </>
  );
}
