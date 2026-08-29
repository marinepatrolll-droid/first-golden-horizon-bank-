import React from 'react';
import { useData } from '../context/DataContext';

export default function Features({ onStartOnboarding }) {
  const { solutions } = useData();

  const renderIcon = (type) => {
    switch (type) {
      case 'dollar':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'shield':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"></path>
            <path d="M12 6v6l4 2"></path>
          </svg>
        );
      case 'globe':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        );
      case 'layers':
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        );
    }
  };

  return (
    <section id="solutions" className="solutions-section container">
      <div className="section-header">
        <span className="section-kicker">Tailored Solutions</span>
        <h2 className="section-title">Institutional Wealth Architecture</h2>
        <p className="section-subtitle">
          Constructed for high-net-worth individuals, tech executives, founders, and private family offices.
        </p>
      </div>

      <div className="solutions-grid">
        {solutions && solutions.map((item, index) => (
          <div key={item.id || index} className="solution-card">
            <div>
              <div className="solution-card-top">
                <div className="solution-icon-box">
                  {renderIcon(item.iconType)}
                </div>
                <span className="solution-badge">
                  {item.badge}
                </span>
              </div>

              <h3 className="solution-title">
                {item.title}
              </h3>
              <p className="solution-desc">
                {item.desc}
              </p>
            </div>

            <div className="solution-card-footer">
              <button 
                type="button" 
                className="btn btn-ghost btn-sm solution-apply-btn"
                onClick={onStartOnboarding}
              >
                <span>Apply for Strategy</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
