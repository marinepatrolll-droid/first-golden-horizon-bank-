import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function DashboardPreview({ onStartOnboarding }) {
  const [selectedTab, setSelectedTab] = useState('allocation');
  const { portalData } = useData();

  const metrics = portalData?.metrics || {
    totalValue: '$1,482,950.00',
    ytdReturn: '▲ +$114,200 (+8.35%) YTD Return',
    treasuryYield: '5.18% APY',
    treasurySubtitle: 'Automated Daily Interest Sweep',
    projectedDividends: '$46,800.00',
    dividendsSubtitle: 'Tax-Optimized Reinvestment'
  };

  const allocations = portalData?.allocations || [
    { label: 'Global Equities (US & Tech)', pct: 45, color: 'var(--accent-primary)', amount: '$667,327' },
    { label: 'Sovereign Treasury Bills', pct: 25, color: 'var(--accent-blue)', amount: '$370,737' },
    { label: 'Private Credit & Debt', pct: 18, color: 'var(--accent-gold)', amount: '$266,931' },
    { label: 'Real Assets & Gold', pct: 12, color: 'var(--accent-purple)', amount: '$177,954' }
  ];

  const holdings = portalData?.holdings || [];
  const vaultDocs = portalData?.vaultDocs || [];

  return (
    <section id="portal" className="portal-section container">
      <div className="section-header">
        <span className="section-kicker">Client Experience</span>
        <h2 className="section-title">Institutional Client Portal Preview</h2>
        <p className="section-subtitle">
          Experience the refined digital command center accessible to registered First Golden Horizon Bank clients.
        </p>
      </div>

      <div className="portal-dashboard-mockup">
        {/* Mockup Top Header */}
        <div className="mockup-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef08a 0%, #fbbf24 30%, #f59e0b 65%, #b45309 100%)',
              color: '#1c1405',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              border: '1px solid rgba(254, 240, 138, 0.6)'
            }}>
              EV
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {portalData?.clientName || 'Eleanor Vance'} • Private Portfolio
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Account #{portalData?.accountNumber || 'APX-8492-7104'} • Zero Sensitive Credentials Stored
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              ● Hosted Enclave Synced
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={onStartOnboarding}>
              Open Real Account
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="mockup-grid-3">
          <div className="metric-card">
            <div className="metric-label">Total Portfolio Value</div>
            <div className="metric-number">{metrics.totalValue}</div>
            <div className="metric-trend">{metrics.ytdReturn}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Treasury Reserve Yield</div>
            <div className="metric-number">{metrics.treasuryYield}</div>
            <div className="metric-trend">{metrics.treasurySubtitle}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Annual Projected Dividends</div>
            <div className="metric-number">{metrics.projectedDividends}</div>
            <div className="metric-trend">{metrics.dividendsSubtitle}</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}>
          <button 
            type="button" 
            className={`btn btn-sm ${selectedTab === 'allocation' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setSelectedTab('allocation')}
          >
            Asset Allocation Blueprint
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${selectedTab === 'holdings' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setSelectedTab('holdings')}
          >
            Institutional Holdings ({holdings.length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${selectedTab === 'vault' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setSelectedTab('vault')}
          >
            Paperless Document Vault ({vaultDocs.length})
          </button>
        </div>

        {/* Tab 1: Allocation */}
        {selectedTab === 'allocation' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {allocations.map((item, i) => (
              <div key={item.id || i} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color || 'var(--accent-primary)' }}>{item.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: item.color || 'var(--accent-primary)' }}></div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.amount}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Holdings */}
        {selectedTab === 'holdings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {holdings.map((holding, i) => (
              <div key={holding.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem' }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>{holding.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{holding.ticker} • {holding.share}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{holding.val}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{holding.gain}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Vault */}
        {selectedTab === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {vaultDocs.map((doc, i) => (
              <div key={doc.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{doc.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.date} • {doc.size}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => alert(`Simulated secure download of ${doc.title}`)}>
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
