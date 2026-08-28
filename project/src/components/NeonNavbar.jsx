import React from 'react';

export default function NeonNavbar({ onOpenModal }) {
  return (
    <header className="neon-navbar">
      <a href="#" className="neon-brand-logo">
        NEON
      </a>

      <ul className="neon-nav-links">
        <li><a href="#card">Card</a></li>
        <li><a href="#app">App</a></li>
        <li><a href="#plans">Plans</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
      </ul>

      <div className="neon-nav-tagline">
        Mobile banking that throws out the rules.
      </div>
    </header>
  );
}
