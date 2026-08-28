import React from 'react';
import NeonCard3D from './NeonCard3D.jsx';

export default function NeonHero({ onOpenModal }) {
  return (
    <section id="card" className="neon-section">
      <div className="neon-section-row">
        {/* Section 01 Index */}
        <div className="section-index">
          <span>01</span>
          <div className="section-index-line"></div>
        </div>

        {/* Center: Main Headline & Circular CTA */}
        <div className="hero-text-col">
          <h1 className="hero-main-title">
            GET MORE FROM<br />
            YOUR MONEY
          </h1>

          <p className="hero-description">
            Rewards and benefits without the downsides of a credit card.
          </p>

          <button 
            className="neon-circle-btn" 
            onClick={onOpenModal}
            aria-label="Apply for Neon Card"
          >
            Apply ↗
          </button>
        </div>

        {/* Right: 3D Interactive Frosted Glass Card */}
        <div>
          <NeonCard3D cardHolder="JOHN STONE" onApply={onOpenModal} />
        </div>
      </div>
    </section>
  );
}
