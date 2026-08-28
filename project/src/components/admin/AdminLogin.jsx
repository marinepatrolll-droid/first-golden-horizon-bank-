import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function AdminLogin({ onClose }) {
  const { loginAdmin } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid administrator email or master password.');
      }
    }, 400);
  };

  return (
    <div className="admin-overlay-wrapper" role="dialog" aria-modal="true" aria-label="First Golden Horizon Bank Admin Gateway">
      <div className="admin-backdrop" onClick={onClose}></div>

      <div className="admin-login-card" style={{ maxWidth: '440px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="admin-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
                FIRST GOLDEN HORIZON BANK
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                Admin Command Center
              </span>
            </div>
          </div>

          <button type="button" className="admin-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Security Badge */}
        <div className="admin-login-security-badge" style={{ marginBottom: '1.25rem' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Restricted Access • Administrator Credentials Required</span>
        </div>

        {errorMsg && (
          <div className="admin-login-error-alert" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label className="form-field-label">Administrator Email *</label>
            <div className="input-container">
              <input
                type="email"
                required
                autoFocus
                className="form-input"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-field-label" style={{ margin: 0 }}>Master Passcode *</label>
              <button 
                type="button" 
                className="btn btn-ghost btn-xs"
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !email || !password}
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>Sign In to Admin Page</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
