import React, { useState } from 'react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does the platform handle sensitive customer identifiers?",
      a: "Customer identification data is encrypted in-flight with TLS 1.3 and at-rest using Field-Level Envelope Encryption (KMS AES-256). Sensitive documents are processed through tokenized, certified KYC pipelines."
    },
    {
      q: "Can I connect external funding accounts securely?",
      a: "Yes. The platform utilizes tokenized Open Banking aggregators (e.g. Plaid, MX) using secure OAuth 2.0 flows, meaning our servers never handle or store raw external login credentials."
    },
    {
      q: "What client-side validation methods are included in the onboarding wizard?",
      a: "The onboarding wizard features real-time telephone and date format masking, email pattern validation, step-by-step state preservation, and accessible keyboard navigation."
    },
    {
      q: "How is compliance reporting and audit logging managed?",
      a: "All state transitions and verification actions create immutable, timestamped audit events conforming to SOC-2 Type II and GLBA recordkeeping standards."
    }
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Frequently Asked Questions</span>
          <h2>Everything You Need to Know</h2>
          <p>Common questions about architecture, compliance, and user workflows.</p>
        </div>

        <div className="accordion">
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <button 
                className="accordion-header" 
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              >
                <span>{faq.q}</span>
                <span>{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <div className="accordion-body">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
