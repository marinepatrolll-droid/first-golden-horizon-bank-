import React from 'react';

export default function CTA({ onOpenModal }) {
  return (
    <section className="features-section" style={{ textAlign: 'center', padding: '60px 0 100px 0' }}>
      <div className="container">
        <div className="dashboard-card" style={{ padding: '60px 24px', background: 'var(--gradient-surface)' }}>
          <h2 style={{ fontSize: '34px', marginBottom: '16px' }}>Ready to Experience Modern Onboarding?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 30px auto' }}>
            Test the live multi-step customer registration wizard directly in your browser.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onOpenModal}>
            Launch Onboarding Flow →
          </button>
        </div>
      </div>
    </section>
  );
}
