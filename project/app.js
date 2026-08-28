/**
 * APEX WEALTH & CAPITAL - CLIENT ONBOARDING APPLICATION
 * 
 * Strict Non-Sensitive Data Architecture:
 * - Collects only standard profile, contact, address, and preference details.
 * - Sensitive KYC identity proofing and bank account linking are strictly
 *   architected as hosted third-party vendor enclaves (Stripe Identity / Plaid).
 */

(function () {
  'use strict';

  // --- APPLICATION STATE ---
  const STATE = {
    currentStep: 1,
    totalSteps: 6,
    maxCompletedStep: 1,
    draftKey: 'apex_onboarding_draft_v1',
    themeKey: 'apex_theme_pref',
    data: {
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
      termsConsent: false,
      identityVerificationStatus: 'pending',
      bankLinkingStatus: 'pending',
      referenceId: ''
    }
  };

  // --- DOM ELEMENTS ---
  const form = document.getElementById('onboarding-form');
  const stepPanels = document.querySelectorAll('.step-panel');
  const stepItems = document.querySelectorAll('.step-item');
  const stepButtons = document.querySelectorAll('.step-btn');
  const progressFill = document.getElementById('progress-fill');
  const stepCountText = document.getElementById('step-count-text');
  const progressPercentText = document.getElementById('progress-percent-text');
  const progressBarContainer = document.getElementById('stepper-progress-bar');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const resetDraftBtn = document.getElementById('reset-draft-btn');
  const draftSaveIndicator = document.getElementById('draft-save-indicator');
  const toastContainer = document.getElementById('toast-container');
  const srAnnouncer = document.getElementById('sr-announcements');

  // Modals & Vendor Sims
  const modalIdentity = document.getElementById('modal-identity');
  const modalPlaid = document.getElementById('modal-plaid');
  const btnDemoIdentity = document.getElementById('btn-demo-identity');
  const btnDemoPlaid = document.getElementById('btn-demo-plaid');
  const btnCompleteIdentitySim = document.getElementById('btn-complete-identity-sim');
  const btnCompletePlaidSim = document.getElementById('btn-complete-plaid-sim');
  const identityStatusPill = document.getElementById('identity-status-pill');
  const plaidStatusPill = document.getElementById('plaid-status-pill');

  // Success view elements
  const generatedRefId = document.getElementById('generated-ref-id');
  const successUserEmail = document.getElementById('success-user-email');
  const btnCopyRef = document.getElementById('btn-copy-ref');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const btnStartNew = document.getElementById('btn-start-new');

  // --- INITIALIZATION ---
  function init() {
    initTheme();
    loadDraft();
    bindEvents();
    updateUIForStep(STATE.currentStep);
  }

  // --- THEME MANAGEMENT ---
  function initTheme() {
    const savedTheme = localStorage.getItem(STATE.themeKey) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STATE.themeKey, next);
    showToast(`Switched to ${next} theme mode`, 'info');
  }

  // --- EVENT BINDINGS ---
  function bindEvents() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Reset draft button
    resetDraftBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all form fields and reset this application?')) {
        localStorage.removeItem(STATE.draftKey);
        location.reload();
      }
    });

    // Form inputs change/blur for live validation & draft save
    form.addEventListener('input', handleFormInput);
    form.addEventListener('change', handleFormChange);

    // Stepper navigation clicks
    stepButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetStep = parseInt(btn.getAttribute('data-step-target'), 10);
        if (targetStep && (targetStep <= STATE.maxCompletedStep || targetStep < STATE.currentStep)) {
          // If moving forward, validate current step first
          if (targetStep > STATE.currentStep) {
            if (validateStep(STATE.currentStep)) {
              goToStep(targetStep);
            }
          } else {
            goToStep(targetStep);
          }
        }
      });
    });

    // Next / Prev Action Buttons
    form.addEventListener('click', (e) => {
      const nextBtn = e.target.closest('[data-action="next"]');
      const prevBtn = e.target.closest('[data-action="prev"]');
      const editStepBtn = e.target.closest('.btn-edit-step');

      if (nextBtn) {
        e.preventDefault();
        const targetStep = parseInt(nextBtn.getAttribute('data-next-step'), 10);
        if (validateStep(STATE.currentStep)) {
          goToStep(targetStep);
        }
      }

      if (prevBtn) {
        e.preventDefault();
        const targetStep = parseInt(prevBtn.getAttribute('data-prev-step'), 10);
        goToStep(targetStep);
      }

      if (editStepBtn) {
        e.preventDefault();
        const targetStep = parseInt(editStepBtn.getAttribute('data-step-target'), 10);
        goToStep(targetStep);
      }
    });

    // Form Final Submission
    form.addEventListener('submit', handleFinalSubmit);

    // Modal simulators
    btnDemoIdentity.addEventListener('click', () => openModal(modalIdentity));
    btnDemoPlaid.addEventListener('click', () => openModal(modalPlaid));

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Modal backdrop click
    [modalIdentity, modalPlaid].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Modal simulation actions
    btnCompleteIdentitySim.addEventListener('click', () => {
      STATE.data.identityVerificationStatus = 'verified_simulated';
      identityStatusPill.className = 'integration-status-pill verified';
      identityStatusPill.innerHTML = '<span class="status-icon-pending"></span> Identity Handshake Verified (Sandbox Token)';
      closeModal(modalIdentity);
      saveDraft();
      showToast('Identity verification simulated successfully via hosted token.', 'success');
    });

    btnCompletePlaidSim.addEventListener('click', () => {
      STATE.data.bankLinkingStatus = 'linked_simulated';
      plaidStatusPill.className = 'integration-status-pill verified';
      plaidStatusPill.innerHTML = '<span class="status-icon-pending"></span> Financial Institution Linked (OAuth Token)';
      closeModal(modalPlaid);
      saveDraft();
      showToast('Open Banking OAuth handshake simulated successfully.', 'success');
    });

    // Success Screen actions
    btnCopyRef.addEventListener('click', copyReferenceId);
    btnDownloadJson.addEventListener('click', downloadProfileJson);
    btnStartNew.addEventListener('click', () => {
      localStorage.removeItem(STATE.draftKey);
      location.reload();
    });
  }

  // --- MODAL UTILITIES ---
  function openModal(modal) {
    if (!modal) return;
    modal.removeAttribute('hidden');
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('hidden', '');
  }

  // --- FORM INPUT & STATE HANDLING ---
  function handleFormInput(e) {
    const target = e.target;
    if (!target.name) return;

    // Collect data
    if (target.type !== 'checkbox' && target.type !== 'radio') {
      STATE.data[target.name] = target.value.trim();
      validateField(target);
    }
    debouncedSaveDraft();
  }

  function handleFormChange(e) {
    const target = e.target;
    if (!target.name) return;

    if (target.type === 'checkbox') {
      if (target.name === 'commChannels') {
        const checkedChannels = Array.from(
          form.querySelectorAll('input[name="commChannels"]:checked')
        ).map(cb => cb.value);
        STATE.data.commChannels = checkedChannels;
      } else {
        STATE.data[target.name] = target.checked;
        validateField(target);
      }
    } else if (target.type === 'radio') {
      STATE.data[target.name] = target.value;
    } else {
      STATE.data[target.name] = target.value;
      validateField(target);
    }
    debouncedSaveDraft();
  }

  // --- STEP NAVIGATION ---
  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > STATE.totalSteps) return;

    STATE.currentStep = stepNumber;
    if (stepNumber > STATE.maxCompletedStep) {
      STATE.maxCompletedStep = stepNumber;
    }

    updateUIForStep(stepNumber);

    // If entering review step, generate review summaries
    if (stepNumber === 6) {
      populateReviewData();
    }

    // Scroll smoothly to form container
    window.scrollTo({
      top: form.getBoundingClientRect().top + window.scrollY - 90,
      behavior: 'smooth'
    });

    // Screen reader announcement
    announceToSR(`Navigated to Step ${stepNumber} of ${STATE.totalSteps}: ${getStepTitle(stepNumber)}`);
  }

  function getStepTitle(step) {
    const titles = [
      'Personal Profile',
      'Residential Address',
      'Account & Investment Preferences',
      'Communication & Governance',
      'Compliant Third-Party Integrations',
      'Review & Verification'
    ];
    return titles[step - 1] || 'Application Step';
  }

  function updateUIForStep(step) {
    // Update step panels visibility
    stepPanels.forEach(panel => {
      const panelNum = parseInt(panel.getAttribute('data-panel'), 10);
      if (panelNum === step) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update progress bar
    const percent = Math.round((step / STATE.totalSteps) * 100);
    progressFill.style.width = `${percent}%`;
    progressBarContainer.setAttribute('aria-valuenow', percent);
    stepCountText.textContent = `Step ${step} of ${STATE.totalSteps}`;
    progressPercentText.textContent = `${percent}% Completed`;

    // Update stepper list items
    stepItems.forEach(item => {
      const itemStep = parseInt(item.getAttribute('data-step'), 10);
      const btn = item.querySelector('.step-btn');
      item.classList.remove('active', 'completed');
      btn.removeAttribute('aria-current');

      if (itemStep === step) {
        item.classList.add('active');
        btn.setAttribute('aria-current', 'step');
      } else if (itemStep < step) {
        item.classList.add('completed');
      }
    });
  }

  // --- VALIDATION ENGINE ---
  function validateField(field) {
    const id = field.id;
    const value = (field.value || '').trim();
    const errorEl = document.getElementById(`${id}-error`);
    let isValid = true;
    let errorMsg = '';

    switch (id) {
      case 'firstName':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your first legal name.';
        } else if (value.length < 2) {
          isValid = false;
          errorMsg = 'First name must be at least 2 characters.';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          isValid = false;
          errorMsg = 'First name contains invalid characters.';
        }
        break;

      case 'lastName':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your last legal name.';
        } else if (value.length < 2) {
          isValid = false;
          errorMsg = 'Last name must be at least 2 characters.';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          isValid = false;
          errorMsg = 'Last name contains invalid characters.';
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your primary email address.';
        } else if (!emailRegex.test(value)) {
          isValid = false;
          errorMsg = 'Please enter a valid email address (e.g. name@domain.com).';
        }
        break;

      case 'phone':
        const cleanedPhone = value.replace(/\D/g, '');
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your contact phone number.';
        } else if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
          isValid = false;
          errorMsg = 'Please enter a valid phone number (7–15 digits).';
        }
        break;

      case 'dob':
        if (!value) {
          isValid = false;
          errorMsg = 'Please select your date of birth.';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (isNaN(birthDate.getTime())) {
            isValid = false;
            errorMsg = 'Please enter a valid calendar date.';
          } else if (age < 18) {
            isValid = false;
            errorMsg = 'You must be at least 18 years of age to open an account.';
          } else if (age > 120) {
            isValid = false;
            errorMsg = 'Please enter a valid birth year.';
          }
        }
        break;

      case 'streetAddress':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your street address.';
        } else if (value.length < 4) {
          isValid = false;
          errorMsg = 'Please enter a complete street address.';
        }
        break;

      case 'city':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your city of residence.';
        } else if (value.length < 2) {
          isValid = false;
          errorMsg = 'City name is too short.';
        }
        break;

      case 'stateRegion':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your State, Province, or Region.';
        }
        break;

      case 'postalCode':
        if (!value) {
          isValid = false;
          errorMsg = 'Please enter your postal or ZIP code.';
        } else if (value.length < 3) {
          isValid = false;
          errorMsg = 'Postal code is invalid.';
        }
        break;

      case 'country':
        if (!value) {
          isValid = false;
          errorMsg = 'Please select your country of residence.';
        }
        break;

      case 'termsConsent':
        if (!field.checked) {
          isValid = false;
          errorMsg = 'You must acknowledge the platform terms to proceed.';
        }
        break;

      default:
        break;
    }

    if (errorEl) {
      errorEl.textContent = errorMsg;
    }

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  function validateStep(step) {
    let stepValid = true;
    let firstInvalidField = null;

    if (step === 1) {
      const step1Fields = ['firstName', 'lastName', 'email', 'phone', 'dob'];
      step1Fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateField(el)) {
          stepValid = false;
          if (!firstInvalidField) firstInvalidField = el;
        }
      });
    } else if (step === 2) {
      const step2Fields = ['streetAddress', 'city', 'stateRegion', 'postalCode', 'country'];
      step2Fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateField(el)) {
          stepValid = false;
          if (!firstInvalidField) firstInvalidField = el;
        }
      });
    } else if (step === 3) {
      // Radio & select are prefilled with defaults, always valid
      stepValid = true;
    } else if (step === 4) {
      const termsConsent = document.getElementById('termsConsent');
      if (!validateField(termsConsent)) {
        stepValid = false;
        firstInvalidField = termsConsent;
      }
    } else if (step === 5) {
      // Step 5 is informational & third-party integrations
      stepValid = true;
    }

    if (!stepValid && firstInvalidField) {
      firstInvalidField.focus();
      showToast('Please correct the highlighted fields before proceeding.', 'error');
    }

    return stepValid;
  }

  // --- REVIEW DATA POPULATION ---
  function populateReviewData() {
    const d = STATE.data;
    
    // Step 1: Personal Profile
    const salutationPrefix = d.preferredSalutation && d.preferredSalutation !== 'Prefer not to say' ? `${d.preferredSalutation} ` : '';
    document.getElementById('rev-fullName').textContent = `${salutationPrefix}${d.firstName} ${d.lastName}`.trim() || '—';
    document.getElementById('rev-email').textContent = d.email || '—';
    document.getElementById('rev-phone').textContent = `${d.phoneCountryCode} ${d.phone}`.trim() || '—';
    document.getElementById('rev-dob').textContent = d.dob ? formatDate(d.dob) : '—';

    // Step 2: Address
    const unitText = d.addressUnit ? `, ${d.addressUnit}` : '';
    const fullAddr = `${d.streetAddress}${unitText}, ${d.city}, ${d.stateRegion} ${d.postalCode}`;
    document.getElementById('rev-fullAddress').textContent = fullAddr.trim() || '—';
    document.getElementById('rev-country').textContent = d.country || '—';

    // Step 3: Account & Strategy
    document.getElementById('rev-accountType').textContent = d.accountType || '—';
    document.getElementById('rev-investmentGoal').textContent = d.investmentGoal || '—';
    document.getElementById('rev-baseCurrency').textContent = d.baseCurrency || '—';
    document.getElementById('rev-expHorizon').textContent = `${d.experienceLevel} • ${d.investmentHorizon}`;

    // Step 4: Communication
    document.getElementById('rev-delivery').textContent = d.paperlessDelivery 
      ? 'Electronic Delivery (Paperless Vault)' 
      : 'Standard Postal Delivery';
    
    const channelsList = d.commChannels && d.commChannels.length > 0
      ? d.commChannels.join(', ')
      : 'No active notification subscriptions';
    document.getElementById('rev-channels').textContent = channelsList;
  }

  function formatDate(dateString) {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return dateString;
    } catch {
      return dateString;
    }
  }

  // --- FINAL SUBMISSION ---
  function handleFinalSubmit(e) {
    e.preventDefault();

    // Revalidate all preceding steps
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        goToStep(s);
        return;
      }
    }

    const submitBtn = document.getElementById('btn-submit-form');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call with 1.2s realistic network delay
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Generate Reference Code
      const random1 = Math.floor(1000 + Math.random() * 9000);
      const random2 = Math.floor(1000 + Math.random() * 9000);
      const refId = `APX-${random1}-${random2}`;
      STATE.data.referenceId = refId;
      STATE.data.submittedAt = new Date().toISOString();

      // Show Success View
      generatedRefId.textContent = refId;
      successUserEmail.textContent = STATE.data.email || 'your email';

      // Hide all panels & show success panel
      stepPanels.forEach(p => p.classList.remove('active'));
      const successPanel = document.getElementById('panel-step-success');
      if (successPanel) successPanel.classList.add('active');

      // Update stepper to 100%
      progressFill.style.width = '100%';
      stepCountText.textContent = 'Application Completed';
      progressPercentText.textContent = '100% Completed';
      stepItems.forEach(item => item.classList.add('completed'));

      // Clear local draft from storage
      localStorage.removeItem(STATE.draftKey);

      // Trigger celebratory notification
      showToast('Registration profile successfully generated and secured!', 'success');
      announceToSR(`Registration completed successfully. Your reference identifier is ${refId}`);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  // --- DRAFT LOCAL STORAGE ---
  let saveTimeout;
  function debouncedSaveDraft() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveDraft();
    }, 500);
  }

  function saveDraft() {
    try {
      localStorage.setItem(STATE.draftKey, JSON.stringify(STATE.data));
      if (draftSaveIndicator) {
        draftSaveIndicator.style.opacity = '1';
        setTimeout(() => {
          draftSaveIndicator.style.opacity = '0.7';
        }, 1500);
      }
    } catch (e) {
      console.warn('Unable to save local draft', e);
    }
  }

  function loadDraft() {
    try {
      const saved = localStorage.getItem(STATE.draftKey);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      STATE.data = { ...STATE.data, ...parsed };

      // Populate text/select inputs
      const textFields = [
        'firstName', 'lastName', 'email', 'phoneCountryCode', 'phone', 'dob',
        'preferredSalutation', 'streetAddress', 'addressUnit', 'city', 'stateRegion',
        'postalCode', 'country', 'investmentGoal', 'baseCurrency', 'experienceLevel',
        'investmentHorizon'
      ];

      textFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el && STATE.data[fieldId] !== undefined && STATE.data[fieldId] !== '') {
          el.value = STATE.data[fieldId];
        }
      });

      // Populate Radio accountType
      if (STATE.data.accountType) {
        const radio = form.querySelector(`input[name="accountType"][value="${STATE.data.accountType}"]`);
        if (radio) radio.checked = true;
      }

      // Populate checkboxes for commChannels
      if (Array.isArray(STATE.data.commChannels)) {
        form.querySelectorAll('input[name="commChannels"]').forEach(cb => {
          cb.checked = STATE.data.commChannels.includes(cb.value);
        });
      }

      // Populate paperlessDelivery & termsConsent
      const paperlessEl = document.getElementById('paperlessDelivery');
      if (paperlessEl && STATE.data.paperlessDelivery !== undefined) {
        paperlessEl.checked = STATE.data.paperlessDelivery;
      }

      const termsEl = document.getElementById('termsConsent');
      if (termsEl && STATE.data.termsConsent !== undefined) {
        termsEl.checked = STATE.data.termsConsent;
      }

      // Update simulation badges if previously verified in draft
      if (STATE.data.identityVerificationStatus === 'verified_simulated') {
        identityStatusPill.className = 'integration-status-pill verified';
        identityStatusPill.innerHTML = '<span class="status-icon-pending"></span> Identity Handshake Verified (Sandbox Token)';
      }

      if (STATE.data.bankLinkingStatus === 'linked_simulated') {
        plaidStatusPill.className = 'integration-status-pill verified';
        plaidStatusPill.innerHTML = '<span class="status-icon-pending"></span> Financial Institution Linked (OAuth Token)';
      }

    } catch (e) {
      console.warn('Could not restore draft', e);
    }
  }

  // --- ACTIONS & UTILITIES ---
  function copyReferenceId() {
    const text = generatedRefId.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const statusText = document.getElementById('copy-status-text');
      if (statusText) statusText.textContent = 'Copied!';
      showToast('Reference ID copied to clipboard.', 'info');
      setTimeout(() => {
        if (statusText) statusText.textContent = 'Copy';
      }, 2000);
    });
  }

  function downloadProfileJson() {
    // Generate clean, sanitized non-sensitive export object
    const exportRecord = {
      platform: "Apex Wealth & Capital",
      schemaVersion: "2026.1-non-sensitive",
      referenceId: STATE.data.referenceId || "APX-DEMO-RECORD",
      submittedAt: STATE.data.submittedAt || new Date().toISOString(),
      privacyCompliance: {
        nonSensitiveOnly: true,
        zeroKnowledgeStorage: true,
        sensitiveDataVendorDelegation: {
          kycVerification: "Stripe Identity / Hosted Enclave",
          bankFunding: "Plaid / Open Banking OAuth 2.0"
        }
      },
      clientProfile: {
        legalName: `${STATE.data.preferredSalutation ? STATE.data.preferredSalutation + ' ' : ''}${STATE.data.firstName} ${STATE.data.lastName}`,
        email: STATE.data.email,
        phone: `${STATE.data.phoneCountryCode} ${STATE.data.phone}`,
        dateOfBirth: STATE.data.dob,
        residentialAddress: {
          street: STATE.data.streetAddress,
          unit: STATE.data.addressUnit || "N/A",
          city: STATE.data.city,
          stateRegion: STATE.data.stateRegion,
          postalCode: STATE.data.postalCode,
          country: STATE.data.country
        }
      },
      accountPreferences: {
        accountType: STATE.data.accountType,
        primaryGoal: STATE.data.investmentGoal,
        baseCurrency: STATE.data.baseCurrency,
        experienceLevel: STATE.data.experienceLevel,
        investmentHorizon: STATE.data.investmentHorizon
      },
      governanceAndCommunications: {
        deliveryMethod: STATE.data.paperlessDelivery ? "Electronic Paperless Vault" : "Standard Mail",
        subscriptions: STATE.data.commChannels,
        termsConsentTimestamp: STATE.data.submittedAt || new Date().toISOString()
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Apex_Onboarding_${STATE.data.referenceId || 'Record'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Downloaded non-sensitive profile record (JSON)', 'success');
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function announceToSR(message) {
    if (srAnnouncer) {
      srAnnouncer.textContent = message;
    }
  }

  // --- BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', init);

})();
