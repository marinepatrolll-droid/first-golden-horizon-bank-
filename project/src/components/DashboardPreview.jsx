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
          <div className="mockup-user-info">
            <div className="mockup-avatar">
              EV
            </div>
            <div>
              <div className="mockup-client-name">
                {portalData?.clientName || 'Eleanor Vance'} • Private Portfolio
              </div>
              <div className="mockup-account-num">
                Account #{portalData?.accountNumber || 'APX-8492-7104'} • Zero Sensitive Credentials Stored
              </div>
            </div>
          </div>

          <div className="mockup-header-actions">
            <span className="enclave-status-badge">
              ● Hosted Enclave Synced
            </span>
            <button type="button" className="btn btn-primary btn-sm mockup-cta-btn" onClick={onStartOnboarding}>
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
        <div className="portal-tabs-scroller">
          <button 
            type="button" 
            className={`portal-tab-btn ${selectedTab === 'allocation' ? 'active' : ''}`}
            onClick={() => setSelectedTab('allocation')}
          >
            Asset Allocation Blueprint
          </button>
          <button 
            type="button" 
            className={`portal-tab-btn ${selectedTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setSelectedTab('holdings')}
          >
            Institutional Holdings ({holdings.length})
          </button>
          <button 
            type="button" 
            className={`portal-tab-btn ${selectedTab === 'vault' ? 'active' : ''}`}
            onClick={() => setSelectedTab('vault')}
          >
            Paperless Document Vault ({vaultDocs.length})
          </button>
        </div>

        {/* Tab 1: Allocation */}
        {selectedTab === 'allocation' && (
          <div className="allocations-grid">
            {allocations.map((item, i) => (
              <div key={item.id || i} className="allocation-card">
                <div className="allocation-card-top">
                  <span className="allocation-label">{item.label}</span>
                  <span className="allocation-pct" style={{ color: item.color || 'var(--accent-primary)' }}>{item.pct}%</span>
                </div>
                <div className="allocation-track">
                  <div className="allocation-bar" style={{ width: `${item.pct}%`, background: item.color || 'var(--accent-primary)' }}></div>
                </div>
                <div className="allocation-amount">{item.amount}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Holdings */}
        {selectedTab === 'holdings' && (
          <div className="holdings-list">
            {holdings.map((holding, i) => (
              <div key={holding.id || i} className="holding-row">
                <div className="holding-main-info">
                  <strong className="holding-name">{holding.name}</strong>
                  <span className="holding-ticker">{holding.ticker} • {holding.share}</span>
                </div>
                <div className="holding-financials">
                  <div className="holding-val">{holding.val}</div>
                  <span className="holding-gain">{holding.gain}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Vault */}
        {selectedTab === 'vault' && (
          <div className="vault-list">
            {vaultDocs.map((doc, i) => (
              <div key={doc.id || i} className="vault-row">
                <div className="vault-file-info">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div className="vault-text-wrap">
                    <strong className="vault-title">{doc.title}</strong>
                    <span className="vault-meta">{doc.date} • {doc.size}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm vault-download-btn" onClick={() => alert(`Simulated secure download of ${doc.title}`)}>
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
