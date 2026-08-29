import React from 'react';

export default function SecurityArchitecture({ onOpenIdentityModal, onOpenPlaidModal }) {
  return (
    <section id="security" className="security-section container">
      <div className="section-header">
        <span className="section-kicker">Security & Governance</span>
        <h2 className="section-title">Zero-Sensitive-Data Architecture</h2>
        <p className="section-subtitle">
          How modern institutional fintech isolates sensitive operations using certified hosted enclaves.
        </p>
      </div>

      <div className="security-cards-grid">
        {/* Card 1: What First Golden Horizon Bank Stores */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="security-icon-box security-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="security-card-title">
                Non-Sensitive Profile Data
              </h3>
              <span className="security-card-badge green">Stored Securely by First Golden Horizon Bank</span>
            </div>
          </div>

          <p className="security-card-desc">
            Only operational client records are captured to establish account registration:
          </p>

          <ul className="security-items-list">
            <li>
              <span className="security-check-icon green">✓</span> Legal Full Name & Contact Email
            </li>
            <li>
              <span className="security-check-icon green">✓</span> Contact Phone Number
            </li>
            <li>
              <span className="security-check-icon green">✓</span> Residential & Domicile Address
            </li>
            <li>
              <span className="security-check-icon green">✓</span> Date of Birth (Age Eligibility Verification)
            </li>
            <li>
              <span className="security-check-icon green">✓</span> Portfolio Strategy & Currency Preferences
            </li>
          </ul>
        </div>

        {/* Card 2: What First Golden Horizon Bank Excludes */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="security-icon-box security-icon-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div>
              <h3 className="security-card-title">
                Sensitive Data Excluded
              </h3>
              <span className="security-card-badge red">Never Collected or Stored</span>
            </div>
          </div>

          <p className="security-card-desc">
            The following items are strictly quarantined from our web forms and application servers:
          </p>

          <ul className="security-items-list">
            <li>
              <span className="security-check-icon red">✕</span> Social Security Numbers (SSNs) / Tax IDs
            </li>
            <li>
              <span className="security-check-icon red">✕</span> Passport / Driver’s License Photo Uploads
            </li>
            <li>
              <span className="security-check-icon red">✕</span> Credit / Debit Card PANs & CVVs
            </li>
            <li>
              <span className="security-check-icon red">✕</span> Bank Routing & Account Numbers
            </li>
            <li>
              <span className="security-check-icon red">✕</span> Passwords, PINs, or Security Questions
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Enclave Explainer Cards */}
      <div className="enclave-box">
        <h3 className="enclave-title">
          Certified Third-Party Hosted Handshakes
        </h3>
        <p className="enclave-subtitle">
          Click below to test the interactive sandbox simulators explaining how tokens and webhooks eliminate sensitive data collection risks.
        </p>

        <div className="enclave-grid">
          <div className="enclave-card">
            <div className="enclave-card-header">
              <div className="enclave-icon-box purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7.5" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <div>
                <strong className="enclave-card-name">Stripe Identity</strong>
                <span className="enclave-card-tag">Hosted KYC / AML Verification</span>
              </div>
            </div>
            <p className="enclave-card-text">
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

          <div className="enclave-card">
            <div className="enclave-card-header">
              <div className="enclave-icon-box blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="21" x2="21" y2="21"></line>
                  <polyline points="5 6 12 3 19 6"></polyline>
                </svg>
              </div>
              <div>
                <strong className="enclave-card-name">Plaid Link Open Banking</strong>
                <span className="enclave-card-tag">OAuth 2.0 Account Linking</span>
              </div>
            </div>
            <p className="enclave-card-text">
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
