import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export default function OnboardingFlow({ onOpenIdentityModal, onOpenPlaidModal, isIdentityVerified, isPlaidLinked }) {
  const { addApplication } = useData();
  const DRAFT_KEY = 'apex_react_onboarding_draft_v1';

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [copied, setCopied] = useState(false);

  // Form Fields Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+1',
    phone: '',
    dob: '',
    preferredSalutation: '',
    streetAddress: '',
    addressUnit: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: 'United States',
    accountType: 'Individual Wealth',
    investmentGoal: 'Balanced Long-Term Growth',
    baseCurrency: 'USD ($)',
    experienceLevel: 'Intermediate (3-7 Years)',
    investmentHorizon: '5 to 10 Years',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'SMS Security & Transaction Alerts',
      'Apex Market Macro Briefing (Weekly)'
    ],
    paperlessDelivery: true,
    termsConsent: false
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Auto-load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Could not read draft', e);
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    if (!isCompleted) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch (e) {
        console.warn('Could not save draft', e);
      }
    }
  }, [formData, isCompleted]);

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => {
      const exists = prev.commChannels.includes(channel);
      const updated = exists 
        ? prev.commChannels.filter(c => c !== channel)
        : [...prev.commChannels, channel];
      return { ...prev, commChannels: updated };
    });
  };

  // Validation
  const validateCurrentStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
      else if (formData.firstName.trim().length < 2) errs.firstName = 'Minimum 2 characters.';

      if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
      else if (formData.lastName.trim().length < 2) errs.lastName = 'Minimum 2 characters.';

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.email.trim()) errs.email = 'Email address is required.';
      else if (!emailRegex.test(formData.email.trim())) errs.email = 'Enter a valid email address.';

      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
      else if (cleanPhone.length < 7 || cleanPhone.length > 15) errs.phone = 'Valid phone number (7–15 digits) required.';

      if (!formData.dob) {
        errs.dob = 'Date of birth is required.';
      } else {
        const bDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - bDate.getFullYear();
        const m = today.getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--;

        if (isNaN(bDate.getTime())) errs.dob = 'Invalid date.';
        else if (age < 18) errs.dob = 'You must be at least 18 years of age.';
      }
    } else if (step === 2) {
      if (!formData.streetAddress.trim()) errs.streetAddress = 'Street address is required.';
      if (!formData.city.trim()) errs.city = 'City is required.';
      if (!formData.stateRegion.trim()) errs.stateRegion = 'State or Province is required.';
      if (!formData.postalCode.trim()) errs.postalCode = 'Postal / ZIP code is required.';
      if (!formData.country) errs.country = 'Country is required.';
    } else if (step === 4) {
      if (!formData.termsConsent) errs.termsConsent = 'You must accept the platform terms to continue.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (nextStep) => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(nextStep);
      if (nextStep > maxCompletedStep) {
        setMaxCompletedStep(nextStep);
      }
      scrollToForm();
    }
  };

  const handlePrev = (prevStep) => {
    setCurrentStep(prevStep);
    scrollToForm();
  };

  const scrollToForm = () => {
    const el = document.getElementById('onboarding-app');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateCurrentStep(4)) {
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const random1 = Math.floor(1000 + Math.random() * 9000);
      const random2 = Math.floor(1000 + Math.random() * 9000);
      const generated = `APX-${random1}-${random2}`;
      setReferenceId(generated);
      
      // Store in DataContext CRM
      addApplication({
        ...formData,
        referenceId: generated,
        isIdentityVerified,
        isPlaidLinked,
        status: 'Pending',
        submittedAt: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsCompleted(true);
      localStorage.removeItem(DRAFT_KEY);
      scrollToForm();
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const exportRecord = {
      platform: "Apex Wealth & Capital",
      schemaVersion: "2026.1-non-sensitive",
      referenceId: referenceId || "APX-DEMO-RECORD",
      submittedAt: new Date().toISOString(),
      privacyCompliance: {
        nonSensitiveOnly: true,
        zeroKnowledgeStorage: true,
        hostedEnclaves: {
          kycIdentity: isIdentityVerified ? "Verified (Sandbox Token)" : "Delegated to Stripe Identity Hosted Enclave",
          bankFunding: isPlaidLinked ? "Linked (Sandbox Token)" : "Delegated to Plaid Open Banking OAuth"
        }
      },
      clientProfile: {
        legalName: `${formData.preferredSalutation ? formData.preferredSalutation + ' ' : ''}${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: `${formData.phoneCountryCode} ${formData.phone}`,
        dateOfBirth: formData.dob,
        residentialAddress: {
          street: formData.streetAddress,
          unit: formData.addressUnit || "N/A",
          city: formData.city,
          stateRegion: formData.stateRegion,
          postalCode: formData.postalCode,
          country: formData.country
        }
      },
      accountPreferences: {
        accountType: formData.accountType,
        primaryGoal: formData.investmentGoal,
        baseCurrency: formData.baseCurrency,
        experienceLevel: formData.experienceLevel,
        investmentHorizon: formData.investmentHorizon
      },
      governanceAndCommunications: {
        deliveryMethod: formData.paperlessDelivery ? "Electronic Paperless Vault" : "Standard Postal",
        subscriptions: formData.commChannels
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Apex_Onboarding_${referenceId || 'Record'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const stepsMeta = [
    { num: 1, title: 'Personal Profile', desc: 'Name, email, phone & DOB' },
    { num: 2, title: 'Residential Address', desc: 'Mailing & tax domicile' },
    { num: 3, title: 'Account Preferences', desc: 'Strategy, goals & currency' },
    { num: 4, title: 'Communications', desc: 'Alerts & paperless consent' },
    { num: 5, title: 'Secure Integrations', desc: 'Hosted Identity & Plaid' },
    { num: 6, title: 'Review & Submit', desc: 'Verify non-sensitive data' }
  ];

  const progressPercent = isCompleted ? 100 : Math.round((currentStep / 6) * 100);

  return (
    <section id="onboarding-app" className="onboarding-section container">
      <div className="section-header">
        <span className="section-kicker">Interactive Registration Flow</span>
        <h2 className="section-title">Client Onboarding Portal</h2>
        <p className="section-subtitle">
          Complete your non-sensitive profile. Zero sensitive documents or passwords required.
        </p>
      </div>

      <div className="onboarding-layout">
        {/* Sidebar Stepper */}
        <aside className="stepper-sidebar" aria-label="Application Progress">
          <div className="stepper-progress-box">
            <div className="stepper-header-flex">
              <span className="stepper-step-count">
                {isCompleted ? 'Application Completed' : `Step ${currentStep} of 6`}
              </span>
              <span className="stepper-percent">{progressPercent}%</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <ol className="step-nav-list">
            {stepsMeta.map((s) => {
              const isActive = !isCompleted && currentStep === s.num;
              const isPassed = isCompleted || currentStep > s.num;
              const canClick = s.num <= maxCompletedStep && !isCompleted;

              return (
                <li 
                  key={s.num} 
                  className={`step-nav-item ${isActive ? 'active' : ''} ${isPassed ? 'completed' : ''}`}
                >
                  <button
                    type="button"
                    className="step-nav-button"
                    disabled={!canClick && s.num > currentStep}
                    onClick={() => {
                      if (canClick) {
                        if (s.num > currentStep) {
                          if (validateCurrentStep(currentStep)) setCurrentStep(s.num);
                        } else {
                          setCurrentStep(s.num);
                        }
                      }
                    }}
                  >
                    <span className="step-nav-badge">
                      {isPassed && !isActive ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        s.num
                      )}
                    </span>
                    <div className="step-nav-info">
                      <span className="step-nav-title">{s.title}</span>
                      <span className="step-nav-desc">{s.desc}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="privacy-sidebar-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <div className="privacy-sidebar-title">Privacy Safeguard</div>
              <p className="privacy-sidebar-desc">
                We never ask for SSNs, ID uploads, card numbers, or bank passwords. Sensitive operations use certified third-party hosted vaults.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Form Viewport */}
        <div className="form-panel-viewport">
          {/* ============================================================ */}
          {/* STEP 1: PERSONAL PROFILE                                     */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 1 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 1 of 6</span>
                <h3 className="panel-heading">Personal Profile</h3>
                <p className="panel-description">
                  Please provide your legal name and primary contact details for your wealth management record.
                </p>
              </div>

              <div className="callout-box info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div className="callout-text">
                  <strong>Non-Sensitive Profile Registration</strong>
                  <p>Passwords, SSNs, and identity documents are never requested or stored during this onboarding phase.</p>
                </div>
              </div>

              <div className="form-grid-layout">
                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    First Name <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.firstName ? 'error' : (formData.firstName.length >= 2 ? 'valid' : '')}`}
                      placeholder="e.g. Eleanor"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                    {formData.firstName.length >= 2 && (
                      <span className="valid-icon">✓</span>
                    )}
                  </div>
                  {errors.firstName && <span className="field-error-msg">{errors.firstName}</span>}
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    Last Name <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.lastName ? 'error' : (formData.lastName.length >= 2 ? 'valid' : '')}`}
                      placeholder="e.g. Vance"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                    {formData.lastName.length >= 2 && (
                      <span className="valid-icon">✓</span>
                    )}
                  </div>
                  {errors.lastName && <span className="field-error-msg">{errors.lastName}</span>}
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    Email Address <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="email" 
                      className={`form-input ${errors.email ? 'error' : (formData.email.includes('@') ? 'valid' : '')}`}
                      placeholder="eleanor.vance@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    {formData.email.includes('@') && (
                      <span className="valid-icon">✓</span>
                    )}
                  </div>
                  {errors.email ? (
                    <span className="field-error-msg">{errors.email}</span>
                  ) : (
                    <span className="field-help-text">Used for statement delivery and security alerts.</span>
                  )}
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    Phone Number <span className="req-star">*</span>
                  </label>
                  <div className="phone-group">
                    <select 
                      className="form-dropdown phone-code-dropdown"
                      value={formData.phoneCountryCode}
                      onChange={(e) => handleInputChange('phoneCountryCode', e.target.value)}
                    >
                      <option value="+1">🇺🇸 +1 (US/CA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+41">🇨🇭 +41 (CH)</option>
                      <option value="+49">🇩🇪 +49 (DE)</option>
                      <option value="+33">🇫🇷 +33 (FR)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                      <option value="+61">🇦🇺 +61 (AU)</option>
                      <option value="+81">🇯🇵 +81 (JP)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                    </select>
                    <div className="input-container" style={{ flex: 1 }}>
                      <input 
                        type="tel" 
                        className={`form-input ${errors.phone ? 'error' : (formData.phone.length >= 7 ? 'valid' : '')}`}
                        placeholder="(555) 234-5678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                      {formData.phone.length >= 7 && (
                        <span className="valid-icon">✓</span>
                      )}
                    </div>
                  </div>
                  {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    Date of Birth <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="date" 
                      className={`form-input ${errors.dob ? 'error' : (formData.dob ? 'valid' : '')}`}
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                  </div>
                  {errors.dob ? (
                    <span className="field-error-msg">{errors.dob}</span>
                  ) : (
                    <span className="field-help-text">Required for age eligibility check (Must be 18+).</span>
                  )}
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">
                    Preferred Title <span className="opt-text">(Optional)</span>
                  </label>
                  <select 
                    className="form-dropdown"
                    value={formData.preferredSalutation}
                    onChange={(e) => handleInputChange('preferredSalutation', e.target.value)}
                  >
                    <option value="">Select salutation</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-actions">
                <div></div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleNext(2)}
                >
                  <span>Continue to Address</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: RESIDENTIAL ADDRESS                                  */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 2 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 2 of 6</span>
                <h3 className="panel-heading">Residential Address</h3>
                <p className="panel-description">
                  Provide your primary residential and tax domicile address for regulatory statement correspondence.
                </p>
              </div>

              <div className="form-grid-layout">
                <div className="form-field-group form-col-6">
                  <label className="form-field-label">
                    Street Address <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.streetAddress ? 'error' : (formData.streetAddress.length >= 4 ? 'valid' : '')}`}
                      placeholder="e.g. 742 Evergreen Terrace"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    />
                    {formData.streetAddress.length >= 4 && (
                      <span className="valid-icon">✓</span>
                    )}
                  </div>
                  {errors.streetAddress && <span className="field-error-msg">{errors.streetAddress}</span>}
                </div>

                <div className="form-field-group form-col-6">
                  <label className="form-field-label">
                    Apartment, Suite, Unit, or Floor <span className="opt-text">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Penthouse 4B / Suite 1200"
                    value={formData.addressUnit}
                    onChange={(e) => handleInputChange('addressUnit', e.target.value)}
                  />
                </div>

                <div className="form-field-group form-col-2">
                  <label className="form-field-label">
                    City <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.city ? 'error' : (formData.city ? 'valid' : '')}`}
                      placeholder="e.g. New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  {errors.city && <span className="field-error-msg">{errors.city}</span>}
                </div>

                <div className="form-field-group form-col-2">
                  <label className="form-field-label">
                    State / Province / Region <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.stateRegion ? 'error' : (formData.stateRegion ? 'valid' : '')}`}
                      placeholder="e.g. NY"
                      value={formData.stateRegion}
                      onChange={(e) => handleInputChange('stateRegion', e.target.value)}
                    />
                  </div>
                  {errors.stateRegion && <span className="field-error-msg">{errors.stateRegion}</span>}
                </div>

                <div className="form-field-group form-col-2">
                  <label className="form-field-label">
                    ZIP / Postal Code <span className="req-star">*</span>
                  </label>
                  <div className="input-container">
                    <input 
                      type="text" 
                      className={`form-input ${errors.postalCode ? 'error' : (formData.postalCode ? 'valid' : '')}`}
                      placeholder="e.g. 10001"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    />
                  </div>
                  {errors.postalCode && <span className="field-error-msg">{errors.postalCode}</span>}
                </div>

                <div className="form-field-group form-col-6">
                  <label className="form-field-label">
                    Country of Residence <span className="req-star">*</span>
                  </label>
                  <select 
                    className="form-dropdown"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Canada">Canada</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-actions">
                <button type="button" className="btn btn-ghost" onClick={() => handlePrev(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleNext(3)}>
                  <span>Continue to Preferences</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: ACCOUNT & PORTFOLIO PREFERENCES                      */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 3 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 3 of 6</span>
                <h3 className="panel-heading">Account & Strategy Preferences</h3>
                <p className="panel-description">
                  Customize your wealth management structure, base reporting currency, and investment objectives.
                </p>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'block' }}>
                  Select Account Category <span className="req-star">*</span>
                </label>
                <div className="selection-card-grid">
                  {[
                    { id: 'Individual Wealth', title: 'Individual Wealth', desc: 'Bespoke personal portfolio management with automated tax-efficient rebalancing.' },
                    { id: 'High-Yield Treasury', title: 'High-Yield Treasury', desc: 'Optimized sovereign bills and short cash liquidity yielding top institutional rates.' },
                    { id: 'Sustainable ESG', title: 'Sustainable ESG Portfolio', desc: 'Impact-driven ethical screening aligned with strict global sustainability criteria.' },
                    { id: 'Corporate & Family Office', title: 'Corporate / Family Office', desc: 'Multi-entity governance, fiduciary trusts, and consolidated institutional reporting.' }
                  ].map((card) => (
                    <div 
                      key={card.id}
                      className={`option-card ${formData.accountType === card.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('accountType', card.id)}
                    >
                      <div className="option-radio-dot"></div>
                      <div>
                        <div className="option-card-title">{card.title}</div>
                        <div className="option-card-desc">{card.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid-layout">
                <div className="form-field-group form-col-3">
                  <label className="form-field-label">Primary Investment Goal</label>
                  <select 
                    className="form-dropdown"
                    value={formData.investmentGoal}
                    onChange={(e) => handleInputChange('investmentGoal', e.target.value)}
                  >
                    <option value="Balanced Long-Term Growth">Balanced Long-Term Growth</option>
                    <option value="Capital Preservation & Safety">Capital Preservation & Safety</option>
                    <option value="Aggressive Capital Appreciation">Aggressive Capital Appreciation</option>
                    <option value="Steady Dividend & Yield Income">Steady Dividend & Yield Income</option>
                  </select>
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">Base Reporting Currency</label>
                  <select 
                    className="form-dropdown"
                    value={formData.baseCurrency}
                    onChange={(e) => handleInputChange('baseCurrency', e.target.value)}
                  >
                    <option value="USD ($)">USD - US Dollar ($)</option>
                    <option value="EUR (€)">EUR - Euro (€)</option>
                    <option value="GBP (£)">GBP - British Pound (£)</option>
                    <option value="CHF (Fr)">CHF - Swiss Franc (Fr)</option>
                    <option value="SGD (S$)">SGD - Singapore Dollar (S$)</option>
                    <option value="CAD (C$)">CAD - Canadian Dollar (C$)</option>
                  </select>
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">Investment Experience Level</label>
                  <select 
                    className="form-dropdown"
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  >
                    <option value="Intermediate (3-7 Years)">Intermediate (3–7 Years Experience)</option>
                    <option value="Novice / Foundations (< 3 Years)">Novice / Building Foundation (&lt; 3 Years)</option>
                    <option value="Advanced / Sophisticated (7+ Years)">Advanced / Sophisticated (7+ Years)</option>
                    <option value="Institutional Investor">Institutional Market Participant</option>
                  </select>
                </div>

                <div className="form-field-group form-col-3">
                  <label className="form-field-label">Anticipated Horizon</label>
                  <select 
                    className="form-dropdown"
                    value={formData.investmentHorizon}
                    onChange={(e) => handleInputChange('investmentHorizon', e.target.value)}
                  >
                    <option value="5 to 10 Years">5 to 10 Years (Recommended)</option>
                    <option value="1 to 3 Years">1 to 3 Years (Short Term / Liquid)</option>
                    <option value="3 to 5 Years">3 to 5 Years (Medium Term)</option>
                    <option value="10+ Years">10+ Years / Intergenerational</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-actions">
                <button type="button" className="btn btn-ghost" onClick={() => handlePrev(2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleNext(4)}>
                  <span>Continue to Communications</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: COMMUNICATIONS & GOVERNANCE                          */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 4 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 4 of 6</span>
                <h3 className="panel-heading">Communication & Governance</h3>
                <p className="panel-description">
                  Select your preferred notification channels, paperless statement vault, and platform terms consent.
                </p>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'block' }}>
                  Subscription & Advisory Channels
                </label>
                <div className="checkbox-card-grid">
                  {[
                    { id: 'Monthly Portfolio Performance Statements', title: 'Monthly Portfolio Holding Reports', desc: 'Asset breakdown, dividend statements, and benchmark comparisons.' },
                    { id: 'SMS Security & Transaction Alerts', title: 'Real-Time SMS Security & Trade Alerts', desc: 'Instant text alerts for account rebalances and security notices.' },
                    { id: 'Apex Market Macro Briefing (Weekly)', title: 'Weekly Macroeconomic Insights', desc: 'Curated executive market briefings from Chief Investment Officers.' },
                    { id: 'Quarterly Wealth Advisor Video Review', title: 'Quarterly Advisor Video Consultation', desc: 'Invitations to schedule one-on-one reviews with portfolio managers.' }
                  ].map((chan) => {
                    const isChecked = formData.commChannels.includes(chan.id);
                    return (
                      <div 
                        key={chan.id}
                        className={`checkbox-card ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleChannelToggle(chan.id)}
                      >
                        <div className="custom-box">{isChecked ? '✓' : ''}</div>
                        <div>
                          <div className="checkbox-title">{chan.title}</div>
                          <div className="checkbox-desc">{chan.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="switch-row-card">
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    Paperless Delivery & Electronic Vault
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Receive official tax summaries and trade confirmations electronically in your client vault.
                  </div>
                </div>
                <div 
                  className={`switch-toggle ${formData.paperlessDelivery ? 'on' : ''}`}
                  onClick={() => handleInputChange('paperlessDelivery', !formData.paperlessDelivery)}
                >
                  <div className="switch-handle"></div>
                </div>
              </div>

              <div 
                className={`checkbox-card ${formData.termsConsent ? 'checked' : ''}`}
                style={{ borderLeft: '3px solid var(--accent-primary)', marginBottom: '1rem' }}
                onClick={() => handleInputChange('termsConsent', !formData.termsConsent)}
              >
                <div className="custom-box">{formData.termsConsent ? '✓' : ''}</div>
                <div>
                  <div className="checkbox-title">
                    Non-Sensitive Data Processing & Platform Terms Agreement <span className="req-star">*</span>
                  </div>
                  <div className="checkbox-desc">
                    I confirm that the personal details provided are accurate. I acknowledge that sensitive verification steps (such as KYC identity proofing or bank linking) are handled strictly through secure third-party hosted providers under zero-knowledge transmission.
                  </div>
                </div>
              </div>
              {errors.termsConsent && <span className="field-error-msg">{errors.termsConsent}</span>}

              <div className="form-footer-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => handlePrev(3)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleNext(5)}>
                  <span>Continue to Secure Integrations</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: COMPLIANT THIRD-PARTY INTEGRATIONS                   */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 5 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 5 of 6</span>
                <h3 className="panel-heading">Compliant Third-Party Integrations</h3>
                <p className="panel-description">
                  How our platform architecture protects sensitive data using compliant hosted enclaves.
                </p>
              </div>

              <div className="callout-box success">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <div className="callout-text">
                  <strong>Zero-Sensitive-Data Architecture Principle</strong>
                  <p>Apex Wealth never asks for or stores government IDs, SSNs, or bank account credentials on our application servers. Sensitive operations are delegated to SOC2/PCI-certified hosted enclaves.</p>
                </div>
              </div>

              <div className="third-party-list">
                {/* Stripe Identity Card */}
                <div className="vendor-enclave-card">
                  <div className="vendor-tag-badge">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                    <span>Hosted KYC / AML Service</span>
                  </div>
                  <div className="vendor-info-top">
                    <div className="vendor-icon-circle stripe">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <polyline points="17 11 19 13 23 9"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="vendor-name">Identity Verification (KYC/AML)</div>
                      <div className="vendor-provider-label">Powered by Stripe Identity / Persona</div>
                    </div>
                  </div>

                  <p className="vendor-description">
                    When required by regulatory banking rules, document scanning and biometric liveness checks occur entirely inside an encrypted sandbox session. Apex receives only an opaque verification token.
                  </p>

                  <div className="vendor-chips-row">
                    <span className="vendor-chip">SOC-2 Type II Certified</span>
                    <span className="vendor-chip">No ID Photos Stored On Apex Servers</span>
                    <span className="vendor-chip">ISO 27001 Vaulted</span>
                  </div>

                  <div className="vendor-action-row">
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={onOpenIdentityModal}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Verify Identity Securely (Hosted Flow)</span>
                    </button>
                    <span className={`status-pill ${isIdentityVerified ? 'verified' : ''}`}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isIdentityVerified ? 'var(--status-success)' : 'var(--text-muted)' }}></span>
                      {isIdentityVerified ? 'Identity Handshake Verified (Sandbox Token)' : 'Ready for Secure Handshake'}
                    </span>
                  </div>
                </div>

                {/* Plaid Open Banking Card */}
                <div className="vendor-enclave-card">
                  <div className="vendor-tag-badge">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                    <span>Open Banking OAuth Protocol</span>
                  </div>
                  <div className="vendor-info-top">
                    <div className="vendor-icon-circle plaid">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="21" x2="21" y2="21"></line>
                        <polyline points="5 6 12 3 19 6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="vendor-name">Bank Funding & Account Linking</div>
                      <div className="vendor-provider-label">Powered by Plaid Link / Open Banking API</div>
                    </div>
                  </div>

                  <p className="vendor-description">
                    Bank credentials and account numbers are never entered into or stored by Apex. Account linking happens via direct end-to-end OAuth with your bank, returning a single-use processor token.
                  </p>

                  <div className="vendor-chips-row">
                    <span className="vendor-chip">Tokenized OAuth 2.0</span>
                    <span className="vendor-chip">Zero Account Numbers Stored</span>
                    <span className="vendor-chip">End-to-End Encryption</span>
                  </div>

                  <div className="vendor-action-row">
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={onOpenPlaidModal}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      <span>Connect to Secure Payment Provider (Plaid Flow)</span>
                    </button>
                    <span className={`status-pill ${isPlaidLinked ? 'verified' : ''}`}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPlaidLinked ? 'var(--status-success)' : 'var(--text-muted)' }}></span>
                      {isPlaidLinked ? 'Financial Institution Linked (OAuth Token)' : 'Ready for Secure Handshake'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-footer-actions">
                <button type="button" className="btn btn-ghost" onClick={() => handlePrev(4)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleNext(6)}>
                  <span>Continue to Review</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 6: REVIEW & FINAL CONFIRMATION                          */}
          {/* ============================================================ */}
          {!isCompleted && currentStep === 6 && (
            <div className="form-panel-card">
              <div className="panel-header">
                <span className="panel-step-tag">Step 6 of 6</span>
                <h3 className="panel-heading">Review & Verification</h3>
                <p className="panel-description">
                  Confirm your profile details and preferences are accurate prior to generating your client profile.
                </p>
              </div>

              <div className="review-card-stack">
                <div className="review-block">
                  <div className="review-block-header">
                    <div className="review-block-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Personal Profile</span>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(1)}>
                      Edit
                    </button>
                  </div>
                  <dl className="review-grid">
                    <div className="review-item">
                      <dt>Legal Full Name</dt>
                      <dd>{`${formData.preferredSalutation ? formData.preferredSalutation + ' ' : ''}${formData.firstName} ${formData.lastName}`.trim() || '—'}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Email Address</dt>
                      <dd>{formData.email || '—'}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Phone Number</dt>
                      <dd>{`${formData.phoneCountryCode} ${formData.phone}`.trim() || '—'}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Date of Birth</dt>
                      <dd>{formData.dob || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="review-block">
                  <div className="review-block-header">
                    <div className="review-block-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span>Residential Address</span>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(2)}>
                      Edit
                    </button>
                  </div>
                  <dl className="review-grid">
                    <div className="review-item" style={{ gridColumn: 'span 2' }}>
                      <dt>Street Address</dt>
                      <dd>{`${formData.streetAddress}${formData.addressUnit ? ', ' + formData.addressUnit : ''}, ${formData.city}, ${formData.stateRegion} ${formData.postalCode}`.trim() || '—'}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Country of Domicile</dt>
                      <dd>{formData.country || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="review-block">
                  <div className="review-block-header">
                    <div className="review-block-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span>Account Strategy & Communications</span>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(3)}>
                      Edit
                    </button>
                  </div>
                  <dl className="review-grid">
                    <div className="review-item">
                      <dt>Account Category</dt>
                      <dd>{formData.accountType}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Primary Goal</dt>
                      <dd>{formData.investmentGoal}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Base Reporting Currency</dt>
                      <dd>{formData.baseCurrency}</dd>
                    </div>
                    <div className="review-item">
                      <dt>Delivery Preference</dt>
                      <dd>{formData.paperlessDelivery ? 'Electronic Paperless Vault' : 'Standard Mail'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div style={{
                background: 'rgba(var(--accent-primary-rgb), 0.08)',
                border: '1px solid rgba(var(--accent-primary-rgb), 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '2rem',
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Non-Sensitive Guarantee: Only non-sensitive profile configuration data will be transmitted.</span>
              </div>

              <div className="form-footer-actions">
                <button type="button" className="btn btn-ghost" onClick={() => handlePrev(5)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                >
                  {isSubmitting ? (
                    <span>Encrypting & Registering Profile...</span>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SUCCESS SCREEN                                               */}
          {/* ============================================================ */}
          {isCompleted && (
            <div className="form-panel-card success-screen-wrapper">
              <div className="success-icon-badge">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Registration Profile Created!
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                Your non-sensitive onboarding record has been registered. Your unique reference identifier is:
              </p>

              <div className="ref-code-card">
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reference ID</span>
                <span className="ref-code-text">{referenceId}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div style={{ textAlign: 'left', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  Next Steps in Your Wealth Journey
                </h4>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(var(--accent-primary-rgb), 0.15)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>Email Confirmation</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>Dispatched to <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{formData.email || 'your email'}</span>.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(var(--accent-primary-rgb), 0.15)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>Portfolio Review</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>An investment director will review your preferences to formulate your strategy.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(var(--accent-primary-rgb), 0.15)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>Hosted Funding Handshake</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>Initiate bank transfers securely when ready using your client portal token.</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={handleDownloadJSON}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download Profile Record (JSON)</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentStep(1);
                    setMaxCompletedStep(1);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phoneCountryCode: '+1',
                      phone: '',
                      dob: '',
                      preferredSalutation: '',
                      streetAddress: '',
                      addressUnit: '',
                      city: '',
                      stateRegion: '',
                      postalCode: '',
                      country: 'United States',
                      accountType: 'Individual Wealth',
                      investmentGoal: 'Balanced Long-Term Growth',
                      baseCurrency: 'USD ($)',
                      experienceLevel: 'Intermediate (3-7 Years)',
                      investmentHorizon: '5 to 10 Years',
                      commChannels: [
                        'Monthly Portfolio Performance Statements',
                        'SMS Security & Transaction Alerts'
                      ],
                      paperlessDelivery: true,
                      termsConsent: false
                    });
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span>Start New Application</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
