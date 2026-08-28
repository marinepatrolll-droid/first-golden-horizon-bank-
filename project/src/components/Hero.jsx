import React from 'react';
import { useData } from '../context/DataContext';

export default function Hero({ onStartOnboarding, onExploreSecurity }) {
  const { heroStats } = useData();

  return (
    <section id="hero" className="hero-section">
      <div className="container">
        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Zero-Knowledge Non-Sensitive Data Architecture • SOC-2 Type II Certified</span>
        </div>

        <h1 className="hero-title">
          Institutional-Grade Wealth Management for <span className="hero-title-highlight">Modern Capital</span>.
        </h1>

        <p className="hero-subtitle">
          Bespoke multi-asset portfolios, high-yield treasury optimization, and frictionless client onboarding. Register in 3 minutes with strict privacy-preserving non-sensitive data standards.
        </p>

        <div className="hero-cta-group">
          <button 
            type="button" 
            className="btn btn-primary btn-lg"
            onClick={onStartOnboarding}
          >
            <span>Begin Secure Onboarding</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary btn-lg"
            onClick={onExploreSecurity}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Explore Security Model</span>
          </button>
        </div>

        <div className="hero-stats-grid">
          {heroStats && heroStats.length > 0 ? (
            heroStats.map((st) => (
              <div key={st.id} className="hero-stat-item">
                <span className="stat-value">{st.value}</span>
                <span className="stat-label">{st.label}</span>
                {st.change && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '0.2rem', display: 'block' }}>
                    {st.change}
                  </span>
                )}
              </div>
            ))
          ) : (
            <>
              <div className="hero-stat-item">
                <span className="stat-value">$5.4B+</span>
                <span className="stat-label">Assets Under Advisory</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-value">5.18%</span>
                <span className="stat-label">Treasury Reserve Yield</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-value">0 SSNs</span>
                <span className="stat-label">Stored On App Servers</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-value">99.99%</span>
                <span className="stat-label">Platform Availability</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
