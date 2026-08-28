import React from 'react';

export default function Navbar({ theme, onToggleTheme, onStartOnboarding, onOpenAdmin, activeSection }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
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

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <button 
                type="button" 
                className="nav-link-item"
                onClick={onStartOnboarding}
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
            className="btn btn-primary btn-sm"
            onClick={onStartOnboarding}
          >
            <span>Open Account</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
