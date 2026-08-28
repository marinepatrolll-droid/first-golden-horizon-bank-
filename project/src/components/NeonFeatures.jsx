import React from 'react';

export default function NeonFeatures() {
  const features = [
    {
      icon: '⚡',
      title: 'Zero FX Fees Abroad',
      desc: 'Spend anywhere globally in 150+ currencies with real interbank exchange rates and zero hidden markups.'
    },
    {
      icon: '🛡️',
      title: 'Real-time Fraud Shield',
      desc: 'Instant biometric authorization, disposable virtual card numbers, and automatic suspicious charge locking.'
    },
    {
      icon: '📈',
      title: 'Automated Roundups',
      desc: 'Turn your spare change into high-yield savings pots with up to 4.85% APY compounding daily.'
    }
  ];

  return (
    <section id="features" className="neon-section">
      <div className="neon-section-row">
        <div className="section-index">
          <span>03</span>
          <div className="section-index-line"></div>
        </div>

        <div style={{ gridColumn: '2 / -1' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '28px', 
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            BUILT DIFFERENTLY
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '520px' }}>
            Engineered from the ground up for total financial clarity, transparency, and speed.
          </p>

          <div className="neon-features-grid">
            {features.map((f, i) => (
              <div key={i} className="neon-feature-card">
                <div className="feature-icon-badge">{f.icon}</div>
                <h3 className="feature-heading">{f.title}</h3>
                <p className="feature-text">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
