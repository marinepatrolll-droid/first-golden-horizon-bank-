import React from 'react';

export default function StripeIdentityModal({ isOpen, onClose, onSimulateSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header-bar">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', fontWeight: 600, fontSize: '0.85rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Stripe Identity Hosted Session (Sandbox Enclave)</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-inner-body">
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
            <span>End-to-End Encrypted Third-Party Sandbox</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Hosted Identity Verification Architecture
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            In production, this button launches Stripe Identity’s hosted URL (<code style={{ background: 'var(--bg-surface-elevated)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--accent-primary)' }}>https://verify.stripe.com/session/...</code>). Passports, driver's licenses, and biometrics are processed solely by Stripe's certified enclave.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>1</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Zero-Knowledge Redirection</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Client is transferred to Stripe's SOC2/PCI-compliant enclave.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>2</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Encrypted ID Analysis</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Government ID photos & biometrics never touch or traverse Apex servers.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>3</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Cryptographic Verification Token</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Stripe sends a webhook with an opaque verification token to confirm KYC validity.</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Simulated Handshake Token:
            </span>
            <code style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
              tok_identity_verif_998492aef1803c_verified
            </code>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onSimulateSuccess}>
            <span>Simulate Successful Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
}
