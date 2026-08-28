import React, { useState, useRef } from 'react';

export default function NeonCard3D({ cardHolder = "JOHN STONE", onApply }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [selectedTheme, setSelectedTheme] = useState('crimson');

  const themes = {
    crimson: {
      name: 'Crimson Glow',
      gradient: 'linear-gradient(145deg, rgba(32, 38, 52, 0.8) 0%, rgba(16, 20, 30, 0.9) 55%, rgba(217, 20, 56, 0.45) 100%)',
      color: '#d91438'
    },
    onyx: {
      name: 'Onyx Black',
      gradient: 'linear-gradient(145deg, rgba(40, 44, 56, 0.85) 0%, rgba(12, 14, 20, 0.95) 70%, rgba(30, 36, 48, 0.5) 100%)',
      color: '#2a2f3d'
    },
    emerald: {
      name: 'Aurora Emerald',
      gradient: 'linear-gradient(145deg, rgba(20, 45, 40, 0.8) 0%, rgba(10, 24, 22, 0.9) 60%, rgba(16, 185, 129, 0.4) 100%)',
      color: '#10b981'
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rX = ((y - centerY) / centerY) * -14;
    const rY = ((x - centerX) / centerX) * 14;
    
    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        className="card-visual-col"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={cardRef}
          className="neon-card-3d"
          onClick={onApply}
          style={{
            background: themes[selectedTheme].gradient,
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
          }}
        >
          {/* Dynamic Light Gloss Overlay */}
          <div 
            className="card-gloss-overlay"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.02) 60%, transparent 80%)`
            }}
          />

          {/* Card Top Row */}
          <div className="card-top-row">
            <span className="card-brand-text">NEON</span>
            
            {/* Contactless Wave Icon */}
            <svg className="card-rfid-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
              <path d="M12 19a8.5 8.5 0 0 1 0-14" strokeLinecap="round" />
              <path d="M15.5 21.5a12 12 0 0 1 0-19" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card Bottom Row */}
          <div className="card-bottom-row">
            <div className="card-holder-name">{cardHolder}</div>
            <div className="card-footer-icons">
              {/* Mastercard Logo Double Circles */}
              <div className="mastercard-circles">
                <div className="mc-circle mc-red"></div>
                <div className="mc-circle mc-orange"></div>
              </div>

              {/* EMV Microchip Graphic */}
              <div className="card-chip-icon" title="EMV Smart Chip"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Theme Picker */}
      <div className="card-theme-selector">
        {Object.entries(themes).map(([key, item]) => (
          <button
            key={key}
            className={`color-dot-btn ${selectedTheme === key ? 'active' : ''}`}
            style={{ background: item.color }}
            onClick={() => setSelectedTheme(key)}
            title={item.name}
            aria-label={`Select ${item.name} card`}
          />
        ))}
      </div>
    </div>
  );
}
