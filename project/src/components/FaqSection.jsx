import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const { faqs } = useData();

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="faq-section container">
      <div className="section-header">
        <span className="section-kicker">Frequently Asked Questions</span>
        <h2 className="section-title">Privacy, Security & Onboarding</h2>
        <p className="section-subtitle">
          Everything you need to know about our compliance standards and client account setup.
        </p>
      </div>

      <div className="faq-accordion">
        {faqs && faqs.map((faq, idx) => (
          <div key={faq.id || idx} className="faq-item">
            <button 
              type="button" 
              className="faq-question-btn"
              onClick={() => toggle(idx)}
              aria-expanded={openIndex === idx}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', transition: 'transform 0.2s', transform: openIndex === idx ? 'rotate(45deg)' : 'rotate(0)' }}>
                +
              </span>
            </button>
            {openIndex === idx && (
              <div className="faq-answer-content">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
