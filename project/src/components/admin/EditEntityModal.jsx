import React, { useState } from 'react';

export default function EditEntityModal({ type, initialData, onSave, onClose }) {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const getTitle = () => {
    const isEdit = !!initialData?.id;
    if (type === 'solution') return isEdit ? 'Edit Wealth Solution' : 'Add New Wealth Solution';
    if (type === 'faq') return isEdit ? 'Edit FAQ Item' : 'Add New FAQ Item';
    if (type === 'holding') return isEdit ? 'Edit Portfolio Holding' : 'Add New Portfolio Holding';
    if (type === 'application') return isEdit ? 'Edit Client Application' : 'Create Client Application Record';
    if (type === 'vaultDoc') return isEdit ? 'Edit Vault Document' : 'Publish New Vault Document';
    return 'Edit Item';
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {getTitle()}
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ================= SOLUTION FORM ================= */}
          {type === 'solution' && (
            <>
              <div>
                <label className="form-field-label">Solution Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Individual Wealth Management"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Badge / Pill Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value)}
                    placeholder="e.g. Core Solution"
                  />
                </div>
                <div>
                  <label className="form-field-label">Category</label>
                  <select
                    className="form-dropdown"
                    value={formData.category || 'Wealth'}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="Wealth">Wealth</option>
                    <option value="Treasury">Treasury</option>
                    <option value="ESG">ESG / Impact</option>
                    <option value="Custody">Custody</option>
                    <option value="Advisory">Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-field-label">Description *</label>
                <textarea
                  required
                  rows="3"
                  className="form-input"
                  value={formData.desc || ''}
                  onChange={(e) => handleChange('desc', e.target.value)}
                  placeholder="Describe the solution architecture and target client fit..."
                ></textarea>
              </div>
            </>
          )}

          {/* ================= FAQ FORM ================= */}
          {type === 'faq' && (
            <>
              <div>
                <label className="form-field-label">FAQ Question *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.q || ''}
                  onChange={(e) => handleChange('q', e.target.value)}
                  placeholder="e.g. How does Apex protect my data?"
                />
              </div>

              <div>
                <label className="form-field-label">Category Tag</label>
                <select
                  className="form-dropdown"
                  value={formData.category || 'Security'}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <option value="Security">Security & Privacy</option>
                  <option value="Banking">Banking & Plaid</option>
                  <option value="Process">Onboarding Process</option>
                  <option value="Compliance">Regulatory & Compliance</option>
                  <option value="Features">Platform Features</option>
                </select>
              </div>

              <div>
                <label className="form-field-label">FAQ Detailed Answer *</label>
                <textarea
                  required
                  rows="4"
                  className="form-input"
                  value={formData.a || ''}
                  onChange={(e) => handleChange('a', e.target.value)}
                  placeholder="Provide comprehensive, institutional-level clarification..."
                ></textarea>
              </div>
            </>
          )}

          {/* ================= HOLDING FORM ================= */}
          {type === 'holding' && (
            <>
              <div>
                <label className="form-field-label">Asset / Fund Legal Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. US Treasury 3-Month Sovereign Bills (TB3M)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Ticker Symbol *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.ticker || ''}
                    onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
                    placeholder="e.g. TBILL"
                  />
                </div>
                <div>
                  <label className="form-field-label">Units / Shares Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.share || ''}
                    onChange={(e) => handleChange('share', e.target.value)}
                    placeholder="e.g. 370,737 units"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Market Value ($) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.val || ''}
                    onChange={(e) => handleChange('val', e.target.value)}
                    placeholder="e.g. $370,737.50"
                  />
                </div>
                <div>
                  <label className="form-field-label">Gain / Yield Return</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gain || ''}
                    onChange={(e) => handleChange('gain', e.target.value)}
                    placeholder="e.g. +5.18%"
                  />
                </div>
              </div>
            </>
          )}

          {/* ================= VAULT DOC FORM ================= */}
          {type === 'vaultDoc' && (
            <>
              <div>
                <label className="form-field-label">Document Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. 2026 Q3 Wealth Advisory Review"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Date Published</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    placeholder="e.g. August 27, 2026"
                  />
                </div>
                <div>
                  <label className="form-field-label">File Size & Format</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.size || ''}
                    onChange={(e) => handleChange('size', e.target.value)}
                    placeholder="e.g. 1.2 MB • Encrypted PDF"
                  />
                </div>
              </div>
            </>
          )}

          {/* ================= APPLICATION FORM ================= */}
          {type === 'application' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-field-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-field-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Account Category</label>
                  <select
                    className="form-dropdown"
                    value={formData.accountType || 'Individual Wealth'}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                  >
                    <option value="Individual Wealth">Individual Wealth</option>
                    <option value="High-Yield Treasury">High-Yield Treasury</option>
                    <option value="Sustainable ESG">Sustainable ESG</option>
                    <option value="Corporate & Family Office">Corporate / Family Office</option>
                  </select>
                </div>
                <div>
                  <label className="form-field-label">Base Currency</label>
                  <select
                    className="form-dropdown"
                    value={formData.baseCurrency || 'USD ($)'}
                    onChange={(e) => handleChange('baseCurrency', e.target.value)}
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="CHF (Fr)">CHF (Fr)</option>
                    <option value="SGD (S$)">SGD (S$)</option>
                    <option value="CAD (C$)">CAD (C$)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-field-label">Compliance Status</label>
                  <select
                    className="form-dropdown"
                    value={formData.status || 'Pending'}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="form-field-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.country || 'United States'}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
