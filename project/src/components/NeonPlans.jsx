import React from 'react';

export default function NeonPlans({ onOpenModal }) {
  const plans = [
    {
      name: 'NEON Classic',
      price: '$0',
      period: '/month',
      desc: 'Essential digital banking with standard contactless card and smart budgeting tools.',
      features: ['Free virtual card', 'Fee-free ATM withdrawals up to $400/mo', 'Standard customer support', 'Apple & Google Pay']
    },
    {
      name: 'NEON Crimson Plus',
      price: '$9',
      period: '/month',
      popular: true,
      desc: 'Elevated lifestyle rewards, higher yield on savings, and travel insurance.',
      features: ['Custom frosted crimson card', '4.85% APY on Savings', 'Zero foreign transaction fees', 'Priority 24/7 concierge']
    },
    {
      name: 'NEON Metal Black',
      price: '$19',
      period: '/month',
      desc: 'Precision crafted 18g solid stainless steel card with maximum cashback benefits.',
      features: ['18g CNC Engraved Steel Card', 'Unlimited fee-free FX', '1.5% universal cashback', 'Airport lounge pass access']
    }
  ];

  return (
    <section id="plans" className="neon-section">
      <div className="neon-section-row">
        <div className="section-index">
          <span>04</span>
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
            MEMBERSHIP TIERS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '520px', marginBottom: '32px' }}>
            Choose the plan that fits your financial goals. Upgrade or cancel anytime.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {plans.map((p, i) => (
              <div 
                key={i} 
                className="neon-feature-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  borderColor: p.popular ? 'var(--neon-crimson)' : 'rgba(255,255,255,0.08)',
                  background: p.popular ? 'linear-gradient(180deg, rgba(217, 20, 56, 0.08) 0%, rgba(255,255,255,0.02) 100%)' : 'rgba(255,255,255,0.02)'
                }}
              >
                {p.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    background: 'var(--neon-crimson)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}>
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '14px 0' }}>
                    <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{p.price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.period}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                    {p.desc}
                  </p>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {p.features.map((feat, idx) => (
                      <li key={idx} style={{ fontSize: '13px', color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--neon-crimson-light)' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={p.popular ? 'btn-primary' : 'btn-secondary'} 
                  onClick={onOpenModal}
                  style={{ width: '100%' }}
                >
                  Choose {p.name.split(' ')[1]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
