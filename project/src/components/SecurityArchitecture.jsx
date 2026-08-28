import React from 'react';

export default function SecurityArchitecture({ onOpenIdentityModal, onOpenPlaidModal }) {
  return (
    <section id="security" className="container" style={{ padding: '5rem 0' }}>
      <div className="section-header">
        <span className="section-kicker">Security & Governance</span>
        <h2 className="section-title">Zero-Sensitive-Data Architecture</h2>
        <p className="section-subtitle">
          How modern institutional fintech isolates sensitive operations using certified hosted enclaves.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Card 1: What Apex Stores */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(var(--accent-primary-rgb), 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Non-Sensitive Profile Data
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Stored Securely by First Golden Horizon Bank</span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Only operational client records are captured to establish account registration:
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✓</span> Legal Full Name & Contact Email
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✓</span> Contact Phone Number
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✓</span> Residential & Domicile Address
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✓</span> Date of Birth (Age Eligibility Verification)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✓</span> Portfolio Strategy & Currency Preferences
            </li>
          </ul>
        </div>

        {/* Card 2: What Apex Never Stores */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--status-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Sensitive Data Excluded
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--status-error)', fontWeight: 600 }}>Never Collected or Stored</span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            The following items are strictly quarantined from our web forms and application servers:
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-error)' }}>✕</span> Social Security Numbers (SSNs) / Tax IDs
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-error)' }}>✕</span> Passport / Driver’s License Photo Uploads
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-error)' }}>✕</span> Credit / Debit Card PANs & CVVs
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-error)' }}>✕</span> Bank Routing & Account Numbers
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-error)' }}>✕</span> Passwords, PINs, or Security Questions
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Enclave Explainer Cards */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Certified Third-Party Hosted Handshakes
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Click below to test the interactive sandbox simulators explaining how tokens and webhooks eliminate sensitive data collection risks.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>Stripe Identity</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hosted KYC / AML Verification</span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
              Biometric checks and ID scanning occur in Stripe's vaulted session. First Golden Horizon Bank receives an opaque cryptographic verification hash.
            </p>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onOpenIdentityModal}
              style={{ width: '100%' }}
            >
              <span>Launch Identity Simulator</span>
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="21" x2="21" y2="21"></line>
                  <polyline points="5 6 12 3 19 6"></polyline>
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>Plaid Link Open Banking</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OAuth 2.0 Account Linking</span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
              Bank logins are performed directly with your bank. First Golden Horizon Bank receives a restricted processor token with zero account number exposure.
            </p>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onOpenPlaidModal}
              style={{ width: '100%' }}
            >
              <span>Launch Plaid Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
