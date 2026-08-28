import React from 'react';

export default function NeonFooter({ onOpenModal }) {
  return (
    <footer id="about" style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      paddingTop: '40px',
      marginTop: '60px'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.1em' }}>NEON</span>
          <span style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>•</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Next-Generation Digital Banking Concept</span>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#card" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Card</a>
          <a href="#app" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>App</a>
          <a href="#plans" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Plans</a>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Features</a>
        </div>
      </div>

      <div style={{
        fontSize: '11px',
        color: 'var(--text-subtle)',
        lineHeight: '1.6',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        paddingTop: '20px'
      }}>
        <p>
          Educational Prototype Demo. Designed with modern React & CSS. No real or sensitive identity data is collected or stored.
          Revid Card™ and NEON™ are registered fictional concepts for web design prototyping.
        </p>
      </div>
    </footer>
  );
}
