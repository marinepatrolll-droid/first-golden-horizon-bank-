import React, { useState } from 'react';

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    
    // Step 2: Address
    streetAddress: '',
    unitApt: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    housingStatus: 'rent',

    // Step 3: Preferences
    accountType: 'plus',
    bankingPurpose: 'everyday',
    occupation: '',
    commEmail: true,
    commSms: true,
    commPush: false,

    // Step 4: Verification & Consent
    mockKycHandshake: false,
    termsAccepted: false,
    privacyAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [isVerifyingThirdParty, setIsVerifyingThirdParty] = useState(false);

  // Field change handler with masks
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;

    // Phone format masking (10 digits)
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').substring(0, 10);
      let formatted = '';
      if (digits.length > 0) formatted = '(' + digits.substring(0, 3);
      if (digits.length >= 4) formatted += ') ' + digits.substring(3, 6);
      if (digits.length >= 7) formatted += '-' + digits.substring(6, 10);
      finalVal = formatted;
    }

    // DOB format masking (MM/DD/YYYY)
    if (name === 'dob') {
      const digits = value.replace(/\D/g, '').substring(0, 8);
      let formatted = '';
      if (digits.length > 0) formatted = digits.substring(0, 2);
      if (digits.length >= 3) formatted += '/' + digits.substring(2, 4);
      if (digits.length >= 5) formatted += '/' + digits.substring(4, 8);
      finalVal = formatted;
    }

    setFormData(prev => ({ ...prev, [name]: finalVal }));

    // Clear error for field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Step Validation
  const validateStep = (currentStep) => {
    const errs = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
      if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
      if (formData.dob.length !== 10) errs.dob = 'Enter full date of birth (MM/DD/YYYY).';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) errs.email = 'A valid email address is required.';
      if (formData.phone.length < 14) errs.phone = 'A valid 10-digit mobile number is required.';
    }

    if (currentStep === 2) {
      if (!formData.streetAddress.trim()) errs.streetAddress = 'Street address is required.';
      if (!formData.city.trim()) errs.city = 'City is required.';
      if (!formData.state.trim()) errs.state = 'State / Region is required.';
      if (!formData.zip.trim()) errs.zip = 'Postal / ZIP code is required.';
    }

    if (currentStep === 3) {
      if (!formData.occupation.trim()) errs.occupation = 'Occupation or industry is required.';
    }

    if (currentStep === 4) {
      if (!formData.termsAccepted) errs.termsAccepted = 'You must accept the Terms of Service to continue.';
      if (!formData.privacyAccepted) errs.privacyAccepted = 'You must acknowledge the Privacy Policy.';
      if (!formData.mockKycHandshake) errs.mockKycHandshake = 'Please complete the secure verification simulation handshake.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSimulateThirdPartyKyc = () => {
    setIsVerifyingThirdParty(true);
    setTimeout(() => {
      setIsVerifyingThirdParty(false);
      setFormData(prev => ({ ...prev, mockKycHandshake: true }));
      if (errors.mockKycHandshake) {
        setErrors(prev => ({ ...prev, mockKycHandshake: '' }));
      }
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setReferenceId('NEON-' + Math.floor(100000 + Math.random() * 900000));
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        {/* Security & Privacy Notice */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12px',
          color: '#93c5fd',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '15px' }}>🔒</span>
          <span><strong>Secure Financial Onboarding:</strong> Only non-sensitive profile information is collected. Sensitive identity verification is handled via certified external hosted providers.</span>
        </div>

        {!isSubmitted ? (
          <div>
            <h2 id="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
              Open Your Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>
              Step {step} of 4 • Complete your profile to simulate your account registration.
            </p>

            {/* Accessible Progress Indicator */}
            <div className="wizard-stepper" aria-label="Onboarding Progress">
              <div className={`wizard-step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-num">{step > 1 ? '✓' : '1'}</div>
                <span>Profile</span>
              </div>
              <div className="wizard-divider"></div>
              <div className={`wizard-step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-num">{step > 2 ? '✓' : '2'}</div>
                <span>Address</span>
              </div>
              <div className="wizard-divider"></div>
              <div className={`wizard-step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-num">{step > 3 ? '✓' : '3'}</div>
                <span>Preferences</span>
              </div>
              <div className="wizard-divider"></div>
              <div className={`wizard-step ${step >= 4 ? 'active' : ''}`}>
                <div className="step-num">4</div>
                <span>Verify</span>
              </div>
            </div>

            {/* STEP 1: Personal Profile */}
            {step === 1 && (
              <section aria-labelledby="step1-heading">
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input 
                      id="firstName"
                      type="text" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange} 
                      placeholder="Alex" 
                      className={errors.firstName ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.firstName && <span className="error-text" role="alert">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="middleName">Middle Name (Optional)</label>
                    <input 
                      id="middleName"
                      type="text" 
                      name="middleName" 
                      value={formData.middleName} 
                      onChange={handleChange} 
                      placeholder="Jordan" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input 
                    id="lastName"
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="Morgan" 
                    className={errors.lastName ? 'input-error' : ''}
                    aria-required="true"
                  />
                  {errors.lastName && <span className="error-text" role="alert">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="dob">Date of Birth (MM/DD/YYYY) *</label>
                  <input 
                    id="dob"
                    type="text" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    placeholder="MM/DD/YYYY" 
                    maxLength="10"
                    className={errors.dob ? 'input-error' : ''}
                    aria-required="true"
                  />
                  {errors.dob && <span className="error-text" role="alert">{errors.dob}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="alex.morgan@example.com" 
                      className={errors.email ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.email && <span className="error-text" role="alert">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Mobile Phone *</label>
                    <input 
                      id="phone"
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="(555) 000-0000" 
                      maxLength="14"
                      className={errors.phone ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.phone && <span className="error-text" role="alert">{errors.phone}</span>}
                  </div>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Continue to Address →
                  </button>
                </div>
              </section>
            )}

            {/* STEP 2: Residential Address */}
            {step === 2 && (
              <section aria-labelledby="step2-heading">
                <div className="form-group">
                  <label htmlFor="streetAddress">Street Address *</label>
                  <input 
                    id="streetAddress"
                    type="text" 
                    name="streetAddress" 
                    value={formData.streetAddress} 
                    onChange={handleChange} 
                    placeholder="123 Innovation Way" 
                    className={errors.streetAddress ? 'input-error' : ''}
                    aria-required="true"
                  />
                  {errors.streetAddress && <span className="error-text" role="alert">{errors.streetAddress}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="unitApt">Apt / Suite / Unit (Optional)</label>
                    <input 
                      id="unitApt"
                      type="text" 
                      name="unitApt" 
                      value={formData.unitApt} 
                      onChange={handleChange} 
                      placeholder="Suite 400" 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input 
                      id="city"
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      placeholder="San Francisco" 
                      className={errors.city ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.city && <span className="error-text" role="alert">{errors.city}</span>}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="state">State / Province *</label>
                    <input 
                      id="state"
                      type="text" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleChange} 
                      placeholder="CA" 
                      className={errors.state ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.state && <span className="error-text" role="alert">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="zip">Postal / ZIP Code *</label>
                    <input 
                      id="zip"
                      type="text" 
                      name="zip" 
                      value={formData.zip} 
                      onChange={handleChange} 
                      placeholder="94105" 
                      maxLength="10"
                      className={errors.zip ? 'input-error' : ''}
                      aria-required="true"
                    />
                    {errors.zip && <span className="error-text" role="alert">{errors.zip}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="housingStatus">Housing Arrangement</label>
                  <select id="housingStatus" name="housingStatus" value={formData.housingStatus} onChange={handleChange}>
                    <option value="rent">Rented apartment / residence</option>
                    <option value="own">House of your own (Owner)</option>
                    <option value="other">Other living arrangement</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>← Back</button>
                  <button type="button" className="btn-primary" onClick={handleNext}>Continue to Preferences →</button>
                </div>
              </section>
            )}

            {/* STEP 3: Account & Communication Preferences */}
            {step === 3 && (
              <section aria-labelledby="step3-heading">
                <div className="form-group">
                  <label htmlFor="accountType">Selected Membership Tier</label>
                  <select id="accountType" name="accountType" value={formData.accountType} onChange={handleChange}>
                    <option value="classic">NEON Classic ($0/mo - Digital Essentials)</option>
                    <option value="plus">NEON Crimson Plus ($9/mo - 4.85% APY & Rewards)</option>
                    <option value="metal">NEON Metal Black ($19/mo - Solid Steel & Lounge Pass)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bankingPurpose">Primary Banking Purpose</label>
                  <select id="bankingPurpose" name="bankingPurpose" value={formData.bankingPurpose} onChange={handleChange}>
                    <option value="everyday">Everyday checking & contactless spending</option>
                    <option value="savings">High-Yield Savings & Automated Roundups</option>
                    <option value="travel">International Travel & Zero FX Transactions</option>
                    <option value="business">Freelance & Business Treasury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="occupation">Occupation / Industry *</label>
                  <input 
                    id="occupation"
                    type="text" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange} 
                    placeholder="e.g. Software Engineer, Healthcare, Marketing" 
                    className={errors.occupation ? 'input-error' : ''}
                    aria-required="true"
                  />
                  {errors.occupation && <span className="error-text" role="alert">{errors.occupation}</span>}
                </div>

                {/* Communication Preferences */}
                <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>
                    Communication Preferences
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" name="commEmail" checked={formData.commEmail} onChange={handleChange} />
                      <span>Email statements, monthly summaries, and product updates</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" name="commSms" checked={formData.commSms} onChange={handleChange} />
                      <span>SMS real-time transaction alerts and security warnings</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" name="commPush" checked={formData.commPush} onChange={handleChange} />
                      <span>Instant push notifications for card swipes and transfers</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>← Back</button>
                  <button type="button" className="btn-primary" onClick={handleNext}>Continue to Verification →</button>
                </div>
              </section>
            )}

            {/* STEP 4: Compliant Verification Gate & Terms */}
            {step === 4 && (
              <section aria-labelledby="step4-heading">
                {/* Compliant Hosted Verification Architecture Placeholder */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(217, 20, 56, 0.08) 0%, rgba(20, 26, 40, 0.8) 100%)',
                  border: '1px solid rgba(217, 20, 56, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🛡️</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Identity Verification Handshake</h3>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                    In production financial systems, identity documents and biometric verification are processed via dedicated, SOC2 & PCI-DSS compliant providers (e.g., <strong>Stripe Identity</strong> or <strong>Plaid IDV</strong>) through a secure hosted redirect or encrypted client SDK. Raw credentials never touch this application.
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Hosted IDV Gateway</div>
                      <div style={{ fontSize: '11px', color: formData.mockKycHandshake ? '#34d399' : 'var(--text-muted)' }}>
                        {formData.mockKycHandshake ? '✓ Simulated Handshake Verified (TLS 1.3)' : 'Pending simulation token'}
                      </div>
                    </div>

                    <button 
                      type="button"
                      className={formData.mockKycHandshake ? 'btn-secondary' : 'btn-primary'}
                      onClick={handleSimulateThirdPartyKyc}
                      disabled={isVerifyingThirdParty || formData.mockKycHandshake}
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      {isVerifyingThirdParty 
                        ? 'Simulating Handshake...' 
                        : formData.mockKycHandshake 
                        ? '✓ Verified Securely' 
                        : 'Verify Identity Securely ↗'}
                    </button>
                  </div>
                  {errors.mockKycHandshake && (
                    <span className="error-text" style={{ marginTop: '8px', display: 'block' }} role="alert">
                      {errors.mockKycHandshake}
                    </span>
                  )}
                </div>

                {/* Consent & Privacy Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="termsAccepted" 
                      checked={formData.termsAccepted} 
                      onChange={handleChange} 
                      style={{ marginTop: '3px' }}
                    />
                    <span>I have read and agree to the <a href="#terms" style={{ color: 'var(--neon-crimson-light)' }}>Terms of Service</a> and Electronic Fund Transfer Disclosure.</span>
                  </label>
                  {errors.termsAccepted && <span className="error-text" role="alert">{errors.termsAccepted}</span>}

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="privacyAccepted" 
                      checked={formData.privacyAccepted} 
                      onChange={handleChange} 
                      style={{ marginTop: '3px' }}
                    />
                    <span>I acknowledge the <a href="#privacy" style={{ color: 'var(--neon-crimson-light)' }}>Privacy Policy</a> regarding consumer financial data protections.</span>
                  </label>
                  {errors.privacyAccepted && <span className="error-text" role="alert">{errors.privacyAccepted}</span>}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>← Back</button>
                  <button type="button" className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting Application...' : 'Complete Registration'}
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : (
          /* STEP 5: Simulated Confirmation Screen */
          <div className="success-box" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div className="success-badge" style={{ margin: '0 auto 16px' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              Thanks for banking with us!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              We will send you an email once your account has been successfully created.
            </p>

            {/* Application Summary Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '13px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Application Reference:</span>
                <strong style={{ color: 'var(--neon-crimson-light)', fontFamily: 'var(--font-mono)' }}>{referenceId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Applicant:</span>
                <span>{formData.firstName} {formData.middleName ? formData.middleName + ' ' : ''}{formData.lastName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Notification Email:</span>
                <span>{formData.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Selected Tier:</span>
                <span style={{ textTransform: 'capitalize' }}>NEON {formData.accountType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Simulated Handshake Completed</span>
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Return to Platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
