import React from 'react';

export default function PlaidModal({ isOpen, onClose, onSimulateSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header-bar">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 600, fontSize: '0.85rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="21" x2="21" y2="21"></line>
              <polyline points="5 6 12 3 19 6"></polyline>
            </svg>
            <span>Plaid Link Hosted Session (Open Banking OAuth)</span>
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
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-blue)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></span>
            <span>OAuth 2.0 Direct Bank Handshake</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Open Banking Account Linking Architecture
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            In production, Plaid Link loads a sandboxed iframe or OAuth redirect directly to the client's financial institution (JPMorgan Chase, Citibank, HSBC, UBS).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>1</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Direct Bank OAuth 2.0</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Client authenticates inside their bank's encrypted portal.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>2</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Zero Credential Exposure</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Login passwords and full account numbers never reach our application servers.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>3</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Restricted Processor Token</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>Apex receives only an opaque token to coordinate authorized transfer instructions.</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Simulated Processor Token:
            </span>
            <code style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', wordBreak: 'break-all' }}>
              processor-sandbox-6e34ab9208f-plaid-link
            </code>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onSimulateSuccess}>
            <span>Simulate Successful Bank Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
