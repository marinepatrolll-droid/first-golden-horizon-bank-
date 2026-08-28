import React from 'react';

export default function Footer({ onStartOnboarding, onOpenAdmin }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #fef08a 0%, #fbbf24 30%, #f59e0b 65%, #b45309 100%)', color: '#1c1405', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)', border: '1px solid rgba(254, 240, 138, 0.6)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 40%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', lineHeight: 1 }}>FIRST GOLDEN HORIZON</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>BANK & WEALTH MANAGEMENT</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              First Golden Horizon Bank operates a premier institutional wealth and private banking platform. Non-sensitive profile data is vaulted with zero-knowledge architecture, separating identity proofing into certified hosted enclaves.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'rgba(var(--accent-primary-rgb), 0.1)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(var(--accent-primary-rgb), 0.25)' }}>
              <span>Member FDIC • Equal Housing Lender • SOC-2 Type II</span>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Platform & Solutions</div>
            <ul className="footer-links-list">
              <li><a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Individual Wealth</a></li>
              <li><a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>High-Yield Treasury</a></li>
              <li><a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Sustainable ESG</a></li>
              <li><a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Global Custody</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Security & Governance</div>
            <ul className="footer-links-list">
              <li><a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Zero-Knowledge Principles</a></li>
              <li><a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Stripe Identity Enclave</a></li>
              <li><a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Plaid Open Banking OAuth</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>Privacy Disclosures</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Client & Operations</div>
            <ul className="footer-links-list">
              <li><a href="#onboarding-app" onClick={(e) => { e.preventDefault(); onStartOnboarding(); }}>Open New Account</a></li>
              <li><a href="#portal" onClick={(e) => { e.preventDefault(); scrollTo('portal'); }}>Portal Demonstration</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>Onboarding FAQ</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); onOpenAdmin(); }}>Admin Command Center</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 First Golden Horizon Bank. All rights reserved. Member FDIC. Equal Housing Lender. Registered Investment Platform.
          </div>

          <div className="footer-bottom-actions">
            <span>Non-Sensitive Architecture • Terms • Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
