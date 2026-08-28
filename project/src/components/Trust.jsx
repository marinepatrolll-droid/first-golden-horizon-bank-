import React from 'react';

export default function Trust() {
  const badges = [
    { icon: "🛡️", label: "SOC 2 Type II Certified" },
    { icon: "💳", label: "PCI-DSS Level 1 Ready" },
    { icon: "🔐", label: "AES-256 Bit Field Encryption" },
    { icon: "🌐", label: "GDPR & CCPA Compliant" },
    { icon: "⚡", label: "FIPS 140-2 Validated KMS" }
  ];

  return (
    <section className="trust-section" id="security">
      <div className="container">
        <h3 className="trust-heading">Bank-Grade Compliance & Enterprise Standards</h3>
        <div className="trust-badges">
          {badges.map((b, idx) => (
            <div key={idx} className="trust-item">
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
