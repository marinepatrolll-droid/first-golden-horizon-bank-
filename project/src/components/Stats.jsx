import React from 'react';

export default function Stats() {
  return (
    <section className="features-section" id="metrics" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="metric-box" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="metric-value" style={{ fontSize: '38px', color: 'var(--accent-primary)' }}>99.99%</div>
            <div className="metric-title" style={{ fontSize: '14px', marginTop: '8px' }}>Uptime SLA Guarantee</div>
          </div>
          <div className="metric-box" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="metric-value" style={{ fontSize: '38px', color: 'var(--accent-emerald)' }}>&lt; 1.2s</div>
            <div className="metric-title" style={{ fontSize: '14px', marginTop: '8px' }}>Avg. Onboarding Latency</div>
          </div>
          <div className="metric-box" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="metric-value" style={{ fontSize: '38px', color: 'var(--accent-cyan)' }}>500K+</div>
            <div className="metric-title" style={{ fontSize: '14px', marginTop: '8px' }}>Verified Registrations</div>
          </div>
          <div className="metric-box" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="metric-value" style={{ fontSize: '38px', color: 'var(--accent-secondary)' }}>0</div>
            <div className="metric-title" style={{ fontSize: '14px', marginTop: '8px' }}>Plaintext PII Retention</div>
          </div>
        </div>
      </div>
    </section>
  );
}
