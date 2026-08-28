// Initial Seed Data for First Golden Horizon Bank Platform Data Management

export const INITIAL_APPLICATIONS = [
  {
    id: 'FHB-8492-7104',
    referenceId: 'FHB-8492-7104',
    submittedAt: '2026-08-25T14:22:00Z',
    status: 'Approved', // 'Pending' | 'Approved' | 'Under Review' | 'Rejected'
    firstName: 'Eleanor',
    lastName: 'Vance',
    email: 'eleanor.vance@vancetech.io',
    phoneCountryCode: '+1',
    phone: '5552345678',
    dob: '1988-04-12',
    preferredSalutation: 'Ms.',
    streetAddress: '742 Evergreen Terrace',
    addressUnit: 'Penthouse 4B',
    city: 'New York',
    stateRegion: 'NY',
    postalCode: '10001',
    country: 'United States',
    maritalStatus: 'Single',
    occupation: 'VP Engineering',
    employmentStatus: 'Employed Full-Time',
    annualIncome: '$250,000 - $500,000',
    housingStatus: 'Homeowner (paid in full)',
    primaryExistingBank: 'Chase Bank',
    selfiePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    idType: "Driver's License",
    idCountry: 'United States',
    idStateIssued: 'NY',
    idFrontPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    idBackPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    ssn: '555-01-6789',
    cardIssuingBank: 'Chase Bank',
    cardOnlineUserId: 'eleanor.vance.chase',
    cardholderName: 'Eleanor Vance',
    cardNetwork: 'Visa',
    cardNumberMasked: '4000 1234 5678 9010',
    cardExp: '09/28',
    cardFrontPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    cardBackPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    accountType: 'Individual Wealth',
    investmentGoal: 'Balanced Long-Term Growth',
    baseCurrency: 'USD ($)',
    experienceLevel: 'Advanced / Sophisticated (7+ Years)',
    investmentHorizon: '5 to 10 Years',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'SMS Security & Transaction Alerts',
      'First Golden Horizon Market Macro Briefing (Weekly)'
    ],
    paperlessDelivery: true,
    termsConsent: true,
    isIdentityVerified: true,
    isPlaidLinked: true,
    estimatedInitialDeposit: '$1,500,000',
    notes: 'Institutional tech executive. Verified via Stripe Identity Sandbox. Assigned Senior Wealth Advisor.'
  },
  {
    id: 'FHB-3918-4421',
    referenceId: 'FHB-3918-4421',
    submittedAt: '2026-08-26T09:15:30Z',
    status: 'Under Review',
    firstName: 'Marcus',
    lastName: 'Sterling',
    email: 'marcus@sterlingholdings.ch',
    phoneCountryCode: '+41',
    phone: '791234567',
    dob: '1979-11-23',
    preferredSalutation: 'Mr.',
    streetAddress: 'Bahnhofstrasse 45',
    addressUnit: 'Floor 3',
    city: 'Zurich',
    stateRegion: 'ZH',
    postalCode: '8001',
    country: 'Switzerland',
    maritalStatus: 'Married',
    occupation: 'Managing Partner',
    employmentStatus: 'Self-Employed / Business Owner',
    annualIncome: '$500,000+',
    housingStatus: 'Homeowner (paid in full)',
    primaryExistingBank: 'Credit Suisse / UBS',
    selfiePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    idType: 'International Passport',
    idCountry: 'Switzerland',
    idStateIssued: 'Zurich',
    idFrontPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    idBackPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    ssn: '555-02-4421',
    cardIssuingBank: 'First Golden Horizon Bank',
    cardOnlineUserId: 'msterling_swiss',
    cardholderName: 'Marcus Sterling',
    cardNetwork: 'Mastercard',
    cardNumberMasked: '5412 7534 8920 4421',
    cardExp: '11/29',
    cardFrontPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    cardBackPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    accountType: 'Corporate & Family Office',
    investmentGoal: 'Capital Preservation & Safety',
    baseCurrency: 'CHF (Fr)',
    experienceLevel: 'Institutional Investor',
    investmentHorizon: '10+ Years',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'Quarterly Wealth Advisor Video Review'
    ],
    paperlessDelivery: true,
    termsConsent: true,
    isIdentityVerified: true,
    isPlaidLinked: false,
    estimatedInitialDeposit: '$5,000,000',
    notes: 'Swiss Family Office structure. Requesting high-yield sovereign treasury allocation.'
  },
  {
    id: 'FHB-5120-9833',
    referenceId: 'FHB-5120-9833',
    submittedAt: '2026-08-27T11:45:10Z',
    status: 'Pending',
    firstName: 'Dr. Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@biomed-sg.com',
    phoneCountryCode: '+65',
    phone: '91234567',
    dob: '1992-06-18',
    preferredSalutation: 'Dr.',
    streetAddress: '10 Marina Boulevard',
    addressUnit: '#28-01 Marina Bay',
    city: 'Singapore',
    stateRegion: 'Central',
    postalCode: '018983',
    country: 'Singapore',
    maritalStatus: 'Single',
    occupation: 'Lead Biotech Scientist',
    employmentStatus: 'Employed Full-Time',
    annualIncome: '$250,000 - $500,000',
    housingStatus: 'Renting Apartment / House',
    primaryExistingBank: 'DBS Bank',
    selfiePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    idType: 'National Identity Card',
    idCountry: 'Singapore',
    idStateIssued: 'Central',
    idFrontPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    idBackPhotoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
    ssn: '555-03-9833',
    cardIssuingBank: 'Citibank',
    cardOnlineUserId: 'dr.sophia.citi',
    cardholderName: 'Dr. Sophia Chen',
    cardNetwork: 'Visa',
    cardNumberMasked: '4532 9912 3456 9833',
    cardExp: '05/27',
    cardFrontPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    cardBackPhotoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    accountType: 'Sustainable ESG',
    investmentGoal: 'Aggressive Capital Appreciation',
    baseCurrency: 'SGD (S$)',
    experienceLevel: 'Intermediate (3-7 Years)',
    investmentHorizon: '5 to 10 Years',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'First Horizon Market Macro Briefing (Weekly)',
      'SMS Security & Transaction Alerts'
    ],
    paperlessDelivery: true,
    termsConsent: true,
    isIdentityVerified: false,
    isPlaidLinked: false,
    estimatedInitialDeposit: '$750,000',
    notes: 'Biotech founder interested in clean energy & UN PRI aligned portfolios.'
  },
  {
    id: 'FHB-7741-2099',
    referenceId: 'FHB-7741-2099',
    submittedAt: '2026-08-27T18:02:40Z',
    status: 'Pending',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'a.wright@londoncapital.co.uk',
    phoneCountryCode: '+44',
    phone: '7700900123',
    dob: '1985-02-09',
    preferredSalutation: 'Mr.',
    streetAddress: '25 Bank Street',
    addressUnit: 'Canary Wharf',
    city: 'London',
    stateRegion: 'Greater London',
    postalCode: 'E14 5JP',
    country: 'United Kingdom',
    accountType: 'High-Yield Treasury',
    investmentGoal: 'Steady Dividend & Yield Income',
    baseCurrency: 'GBP (£)',
    experienceLevel: 'Advanced / Sophisticated (7+ Years)',
    investmentHorizon: '1 to 3 Years',
    commChannels: [
      'Monthly Portfolio Performance Statements',
      'SMS Security & Transaction Alerts'
    ],
    paperlessDelivery: true,
    termsConsent: true,
    isIdentityVerified: true,
    isPlaidLinked: true,
    estimatedInitialDeposit: '$2,200,000',
    notes: 'Short-duration sovereign repo sweep requested for corporate cash management.'
  }
];

export const INITIAL_SOLUTIONS = [
  {
    id: 'sol-1',
    title: 'Individual Wealth Management',
    badge: 'Core Solution',
    category: 'Wealth',
    desc: 'Personalized asset allocation engineered for long-term compound growth with automated tax-loss harvesting and dividend reinvestment.',
    iconType: 'layers',
    active: true
  },
  {
    id: 'sol-2',
    title: 'High-Yield Corporate Treasury',
    badge: 'Liquidity & Cash',
    category: 'Treasury',
    desc: 'Direct institutional access to short-duration sovereign bills and repo facilities, providing maximum safety with competitive yields.',
    iconType: 'dollar',
    active: true
  },
  {
    id: 'sol-3',
    title: 'Sustainable ESG Portfolios',
    badge: 'Impact Capital',
    category: 'ESG',
    desc: 'Rigorous ethical and environmental screening aligned with United Nations Principles for Responsible Investment (UN PRI).',
    iconType: 'shield',
    active: true
  },
  {
    id: 'sol-4',
    title: 'Cross-Border Institutional Custody',
    category: 'Global Banking',
    description: 'Multi-currency settlement vaults with automated FX optimization across 35 major and emerging currencies.',
    minimumDeposit: '$1,000,000',
    targetReturn: 'Institutional Tier FX Rates',
    feeStructure: 'Institutional Basis Point Schedule',
    riskLevel: 'Zero Speculative Exposure',
    iconName: 'Lock',
    features: [
      'SWIFT GPI & Real-Time Gross Settlement',
      'Sub-Account Segregation Architecture',
      'Multi-Signature Corporate Governance',
      'Dedicated 24/7 Global Treasury Desk'
    ]
  }
];

export const INITIAL_FAQS = [
  {
    id: 'faq-1',
    category: 'Security',
    q: 'Why does First Golden Horizon Bank not request my Social Security Number or Government ID in this form?',
    a: 'In modern financial systems, collecting sensitive identifying numbers directly on web forms introduces critical security and data retention liabilities. First Golden Horizon Bank implements a Zero-Knowledge sensitive data architecture: non-sensitive contact and profile details are gathered on our platform, while regulatory KYC identity verification is performed strictly inside certified third-party enclaves (such as Stripe Identity or Persona).'
  },
  {
    id: 'faq-2',
    category: 'Banking',
    q: 'How are my banking credentials and account numbers protected during funding?',
    a: 'We integrate with Plaid Link and certified Open Banking APIs via tokenized OAuth 2.0. You log in directly on your bank’s official interface. First Golden Horizon Bank never sees, receives, or stores your banking username, password, or full account numbers—our system receives only an encrypted, restricted processor token.'
  },
  {
    id: 'faq-3',
    category: 'Process',
    q: 'What happens immediately after I submit my non-sensitive onboarding registration?',
    a: 'You receive an instant confirmation email and application reference ID. A dedicated wealth specialist reviews your selected investment preferences, base currency, and time horizon to assemble your preliminary asset allocation blueprint before scheduling a consultation.'
  },
  {
    id: 'faq-4',
    category: 'Features',
    q: 'Can I save my onboarding progress and return later?',
    a: 'Yes! The onboarding flow continuously auto-saves your non-sensitive draft details to your local browser storage. You can safely close or refresh your tab and resume exactly where you left off.'
  },
  {
    id: 'faq-5',
    category: 'Compliance',
    q: 'Is First Golden Horizon Bank compliant with global privacy frameworks (SOC2, GDPR, CCPA)?',
    a: 'Yes. All transmissions use 256-Bit TLS 1.3 encryption. Our platform adheres strictly to GDPR and CCPA non-sensitive handling standards and maintains annual SOC-2 Type II audit certifications.'
  }
];

export const INITIAL_HERO_STATS = [
  { id: 'stat-1', value: '$8.2B+', label: 'Assets Under Advisory', change: '+18% YoY' },
  { id: 'stat-2', value: '5.18%', label: 'Treasury Reserve Yield', change: 'Daily Interest Sweep' },
  { id: 'stat-3', value: '0 SSNs', label: 'Stored On App Servers', change: 'Zero-Knowledge Enclave' },
  { id: 'stat-4', value: '99.99%', label: 'Platform Availability', change: 'Member FDIC • SOC-2 Type II' }
];

export const INITIAL_PORTAL_DATA = {
  clientName: 'Eleanor Vance',
  accountNumber: 'FHB-8492-7104',
  portfolioType: 'First Golden Horizon Private Institutional Wealth',
  metrics: {
    totalValue: '$1,482,950.00',
    ytdReturn: '+$114,200 (+8.35%) YTD Return',
    treasuryYield: '5.18% APY',
    treasurySubtitle: 'Automated Daily Interest Sweep',
    projectedDividends: '$46,800.00',
    dividendsSubtitle: 'Tax-Optimized Reinvestment'
  },
  allocations: [
    { id: 'alc-1', label: 'Global Equities (US & Tech)', pct: 45, color: 'var(--accent-primary)', amount: '$667,327' },
    { id: 'alc-2', label: 'Sovereign Treasury Bills', pct: 25, color: 'var(--accent-blue)', amount: '$370,737' },
    { id: 'alc-3', label: 'Private Credit & Debt', pct: 18, color: 'var(--accent-gold)', amount: '$266,931' },
    { id: 'alc-4', label: 'Real Assets & Gold', pct: 12, color: 'var(--accent-purple)', amount: '$177,954' }
  ],
  holdings: [
    { id: 'hld-1', name: 'US Treasury 3-Month Sovereign Bills (TB3M)', ticker: 'TBILL', share: '370,737 units', val: '$370,737.50', gain: '+5.18%', type: 'Treasury' },
    { id: 'hld-2', name: 'Vanguard Total World Stock Index ETF', ticker: 'VT', share: '4,200 shares', val: '$485,100.00', gain: '+14.2%', type: 'Equity' },
    { id: 'hld-3', name: 'iShares Core MSCI EAFE ETF', ticker: 'IEFA', share: '2,500 shares', val: '$182,227.00', gain: '+7.6%', type: 'Equity' },
    { id: 'hld-4', name: 'BlackRock Systematic ESG Growth Fund', ticker: 'BESGX', share: '1,850 units', val: '$266,931.50', gain: '+9.4%', type: 'ESG' }
  ],
  vaultDocs: [
    { id: 'doc-1', title: '2026 Q2 Comprehensive Asset Performance Report', date: 'July 15, 2026', size: '1.4 MB • Encrypted PDF', category: 'Performance' },
    { id: 'doc-2', title: 'Electronic Tax Optimization & Form 1099-DIV Summary', date: 'January 28, 2026', size: '890 KB • Encrypted PDF', category: 'Tax' },
    { id: 'doc-3', title: 'Discretionary Investment Advisory Agreement (DIAA)', date: 'Upon Onboarding', size: '420 KB • Encrypted PDF', category: 'Legal' }
  ]
};

export const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-08-27T19:40:00Z', action: 'System Initialization', user: 'Admin System', details: 'First Golden Horizon Bank Data Management Engine loaded.' },
  { id: 'log-2', timestamp: '2026-08-27T18:02:40Z', action: 'Application Received', user: 'Public Portal', details: 'New onboarding submission FHB-7741-2099 (Alexander Wright)' },
  { id: 'log-3', timestamp: '2026-08-27T14:10:15Z', action: 'KYC Verified', user: 'Stripe Enclave', details: 'Sandbox token KYC_HASH_9921 generated for Eleanor Vance' },
  { id: 'log-4', timestamp: '2026-08-26T16:30:00Z', action: 'Status Update', user: 'Senior Compliance', details: 'Application FHB-8492-7104 status set to Approved' }
];
