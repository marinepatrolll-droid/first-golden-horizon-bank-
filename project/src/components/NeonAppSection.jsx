import React from 'react';

export default function NeonAppSection({ onOpenModal }) {
  return (
    <section id="app" className="neon-section">
      <div className="neon-section-row">
        {/* Section 02 Index */}
        <div className="section-index">
          <span>02</span>
          <div className="section-index-line"></div>
        </div>

        {/* Center: App Headline & Interactive Donut Chart Mockup */}
        <div className="app-screen-col">
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(28px, 3.5vw, 44px)', 
            fontWeight: 800, 
            letterSpacing: '0.04em',
            marginBottom: '20px'
          }}>
            APP
          </h2>

          <div className="app-phone-mockup">
            <div className="chart-visual-wrapper">
              {/* Dynamic Donut Chart */}
              <svg className="donut-chart-svg" viewBox="0 0 100 100">
                <circle className="donut-bg" cx="50" cy="50" r="38" />
                <circle className="donut-segment-blue" cx="50" cy="50" r="38" />
                <circle className="donut-segment-crimson" cx="50" cy="50" r="38" />
              </svg>

              <div className="app-mockup-stats">
                <span className="app-mockup-date">August 2026</span>
                <span className="app-mockup-balance">$13,678</span>
                <div className="app-mockup-sub">
                  Travel <span>$4,678 / 34%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Wave of the Future & Apple/Google Pay badges */}
        <div className="wave-text-col">
          <h3 className="wave-title">WAVE OF<br />THE FUTURE</h3>
          <div className="wave-divider"></div>
          
          <p className="wave-description">
            Revid Card features an RFID transponder in its core that enables you to pay with a touch-free wave.
          </p>

          <div className="pay-badges-row">
            <div className="pay-pill-badge">
              <span></span> Pay
            </div>
            <div className="pay-pill-badge">
              <span>G</span> Pay
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
