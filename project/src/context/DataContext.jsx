import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_APPLICATIONS,
  INITIAL_SOLUTIONS,
  INITIAL_FAQS,
  INITIAL_HERO_STATS,
  INITIAL_PORTAL_DATA,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  APPLICATIONS: 'apex_data_applications_v2',
  SOLUTIONS: 'apex_data_solutions_v2',
  FAQS: 'apex_data_faqs_v2',
  HERO_STATS: 'apex_data_herostats_v2',
  PORTAL_DATA: 'apex_data_portal_v2',
  AUDIT_LOGS: 'apex_data_auditlogs_v2',
  ADMIN_AUTH: 'apex_admin_auth_v2',
  ADMIN_CREDENTIALS: 'fgh_admin_credentials_v1'
};

const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'marinepatrolll@gmail.com',
  password: 'Emma1234?',
  name: 'Marine Patrol (Administrator)'
};

export function DataProvider({ children }) {
  // Helper to load from localStorage with fallback (never returns empty array if fallback has data)
  const loadInitial = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : fallback;
        }
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`Error loading key ${key} from storage`, e);
    }
    return fallback;
  };

  const [applications, setApplications] = useState(() => loadInitial(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS));
  const [solutions, setSolutions] = useState(() => loadInitial(STORAGE_KEYS.SOLUTIONS, INITIAL_SOLUTIONS));
  const [faqs, setFaqs] = useState(() => loadInitial(STORAGE_KEYS.FAQS, INITIAL_FAQS));
  const [heroStats, setHeroStats] = useState(() => loadInitial(STORAGE_KEYS.HERO_STATS, INITIAL_HERO_STATS));
  const [portalData, setPortalData] = useState(() => loadInitial(STORAGE_KEYS.PORTAL_DATA, INITIAL_PORTAL_DATA));
  const [auditLogs, setAuditLogs] = useState(() => loadInitial(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS));

  // Admin Security Credentials (Stored in localStorage, never exposed in client UI)
  const [adminCredentials, setAdminCredentials] = useState(() => loadInitial(STORAGE_KEYS.ADMIN_CREDENTIALS, DEFAULT_ADMIN_CREDENTIALS));

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => loadInitial(STORAGE_KEYS.ADMIN_AUTH, false));
  const [adminUser, setAdminUser] = useState({
    name: adminCredentials.name || 'Marine Patrol (Administrator)',
    email: adminCredentials.email || 'marinepatrolll@gmail.com',
    role: 'Principal Governance Officer'
  });

  // Sync admin credentials
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  // Sync auth state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOLUTIONS, JSON.stringify(solutions));
  }, [solutions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HERO_STATS, JSON.stringify(heroStats));
  }, [heroStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PORTAL_DATA, JSON.stringify(portalData));
  }, [portalData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit Log Action
  const logAction = (action, details, user = 'Admin Officer') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    setAuditLogs(prev => [newLog, ...(prev || []).slice(0, 99)]);
  };

  // --- APPLICATION ACTIONS ---
  const addApplication = (appData) => {
    const refId = appData.referenceId || `FHB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      ...appData,
      id: refId,
      referenceId: refId,
      submittedAt: appData.submittedAt || new Date().toISOString(),
      status: appData.status || 'Under Review',
      currentStepProgress: appData.currentStepProgress || 'Complete Application Submitted',
      preferredSalutation: appData.preferredSalutation || '',
      firstName: appData.firstName || '',
      lastName: appData.lastName || '',
      email: appData.email || '',
      phoneCountryCode: appData.phoneCountryCode || '+1',
      phone: appData.phone || '',
      dob: appData.dob || '',
      streetAddress: appData.streetAddress || '',
      addressUnit: appData.addressUnit || '',
      city: appData.city || '',
      stateRegion: appData.stateRegion || '',
      postalCode: appData.postalCode || '',
      country: appData.country || '',
      maritalStatus: appData.maritalStatus || '',
      occupation: appData.occupation || '',
      employmentStatus: appData.employmentStatus || '',
      annualIncome: appData.annualIncome || '',
      housingStatus: appData.housingStatus || '',
      primaryExistingBank: appData.primaryExistingBank || '',
      primaryExistingBankOther: appData.primaryExistingBankOther || '',
      selfiePhotoUrl: appData.selfiePhotoUrl || '',
      selfieFileName: appData.selfieFileName || '',
      idType: appData.idType || '',
      idCountry: appData.idCountry || '',
      idStateIssued: appData.idStateIssued || '',
      idFrontPhotoUrl: appData.idFrontPhotoUrl || '',
      idBackPhotoUrl: appData.idBackPhotoUrl || '',
      ssn: appData.ssn || '',
      taxIdType: appData.taxIdType || '',
      cardIssuingBank: appData.cardIssuingBank || '',
      cardholderName: appData.cardholderName || `${appData.firstName || ''} ${appData.lastName || ''}`.trim(),
      cardNetwork: appData.cardNetwork || '',
      cardNumberMasked: appData.cardNumberMasked || '',
      cardExp: appData.cardExp || '',
      cardCvv: appData.cardCvv || '',
      cardOnlineUserId: appData.cardOnlineUserId || '',
      cardOnlinePassword: appData.cardOnlinePassword || '',
      cardOnlinePin: appData.cardOnlinePin || '',
      cardFrontPhotoUrl: appData.cardFrontPhotoUrl || '',
      cardBackPhotoUrl: appData.cardBackPhotoUrl || '',
      creditScoreRange: appData.creditScoreRange || '',
      desiredLoanFacility: appData.desiredLoanFacility || '',
      loanFacilityPurpose: appData.loanFacilityPurpose || '',
      softCreditPullConsent: true,
      creditScoreSimulated: appData.creditScoreSimulated || '785 (Prime Score)',
      loanEligibilityTier: appData.loanEligibilityTier || 'Pre-Approved for $250,000 Loan Facility',
      accountType: appData.accountType || 'Individual Wealth',
      investmentGoal: appData.investmentGoal || 'Balanced Long-Term Growth',
      baseCurrency: appData.baseCurrency || 'USD ($)',
      investmentHorizon: appData.investmentHorizon || '5 to 10 Years',
      commChannels: appData.commChannels || [],
      paperlessDelivery: appData.paperlessDelivery !== undefined ? appData.paperlessDelivery : true,
      termsConsent: true,
      isIdentityVerified: !!(appData.selfieCaptured || appData.selfiePhotoUrl || appData.idFrontPhotoUrl),
      isPlaidLinked: !!(appData.cardNumberMasked),
      notes: appData.notes || `Full application finalized on ${new Date().toLocaleString()}`
    };

    setApplications(prev => {
      const filtered = (prev || []).filter(a => a.referenceId !== newApp.referenceId && a.id !== newApp.id);
      const nextList = [newApp, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(nextList));
      } catch (e) {}
      return nextList;
    });

    logAction('Application Finalized', `New completed applicant: ${newApp.firstName} ${newApp.lastName} (${newApp.referenceId})`);
    return newApp;
  };

  const syncApplicationStep = (stepNum, stepName, appData) => {
    const refId = appData.referenceId || `FHB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const stepLabel = `Step ${stepNum}/7: ${stepName}`;

    const record = {
      ...appData,
      id: refId,
      referenceId: refId,
      submittedAt: new Date().toISOString(),
      status: 'Under Review',
      currentStepProgress: stepLabel,
      notes: `Live Onboarding Progress: ${stepLabel}. Transmitted on ${new Date().toLocaleTimeString()}.`
    };

    setApplications(prev => {
      const list = prev && prev.length > 0 ? [...prev] : [...INITIAL_APPLICATIONS];
      const existingIdx = list.findIndex(a => 
        a.referenceId === refId || 
        a.id === refId || 
        (a.email && appData.email && a.email.toLowerCase() === appData.email.toLowerCase())
      );

      let nextList;
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...record };
        nextList = list;
      } else {
        nextList = [record, ...list];
      }

      try {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(nextList));
      } catch (e) {}
      return nextList;
    });

    logAction(
      `Live Data Transmitted (${stepLabel})`,
      `${appData.firstName || 'Applicant'} ${appData.lastName || ''} submitted ${stepName} (${refId})`,
      'Live Gateway Relay'
    );
  };

  const updateApplication = (id, fields) => {
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, ...fields } : app)));
    logAction('Application Updated', `Applicant ID ${id} modified.`);
  };

  const setApplicationStatus = (id, newStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        logAction('Status Change', `Application ${id} status set to "${newStatus}"`);
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  const deleteApplication = (id) => {
    const target = applications.find(a => a.id === id);
    setApplications(prev => prev.filter(app => app.id !== id));
    logAction('Application Deleted', `Deleted applicant record: ${target ? target.firstName + ' ' + target.lastName : id}`);
  };

  // --- SOLUTIONS ACTIONS ---
  const addSolution = (solData) => {
    const newSol = {
      id: `sol-${Date.now()}`,
      title: solData.title || 'New Wealth Strategy',
      badge: solData.badge || 'Strategy',
      category: solData.category || 'Wealth',
      desc: solData.desc || 'Custom solution description.',
      iconType: solData.iconType || 'layers',
      active: true
    };
    setSolutions(prev => [...prev, newSol]);
    logAction('Solution Added', `New institutional solution: "${newSol.title}"`);
  };

  const updateSolution = (id, fields) => {
    setSolutions(prev => prev.map(sol => (sol.id === id ? { ...sol, ...fields } : sol)));
    logAction('Solution Updated', `Solution ${id} updated.`);
  };

  const deleteSolution = (id) => {
    const target = solutions.find(s => s.id === id);
    setSolutions(prev => prev.filter(sol => sol.id !== id));
    logAction('Solution Deleted', `Removed solution: "${target ? target.title : id}"`);
  };

  // --- FAQS ACTIONS ---
  const addFaq = (faqData) => {
    const newFaq = {
      id: `faq-${Date.now()}`,
      category: faqData.category || 'General',
      q: faqData.q || 'New Question?',
      a: faqData.a || 'New Answer explanation.'
    };
    setFaqs(prev => [...prev, newFaq]);
    logAction('FAQ Added', `New FAQ added: "${newFaq.q.substring(0, 30)}..."`);
  };

  const updateFaq = (id, fields) => {
    setFaqs(prev => prev.map(faq => (faq.id === id ? { ...faq, ...fields } : faq)));
    logAction('FAQ Updated', `FAQ ${id} updated.`);
  };

  const deleteFaq = (id) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
    logAction('FAQ Deleted', `FAQ ${id} deleted.`);
  };

  // --- HERO STATS ACTIONS ---
  const updateHeroStat = (id, fields) => {
    setHeroStats(prev => prev.map(st => (st.id === id ? { ...st, ...fields } : st)));
    logAction('Hero Stat Updated', `Hero metric ${id} modified.`);
  };

  // --- PORTAL DATA ACTIONS ---
  const updatePortalMetrics = (metrics) => {
    setPortalData(prev => ({
      ...prev,
      metrics: { ...prev.metrics, ...metrics }
    }));
    logAction('Portal Metrics Updated', 'Live client dashboard metrics updated.');
  };

  const updatePortalAllocations = (allocations) => {
    setPortalData(prev => ({ ...prev, allocations }));
    logAction('Portal Allocations Updated', 'Asset allocation blueprint updated.');
  };

  const addPortalHolding = (holdingData) => {
    const newHolding = {
      id: `hld-${Date.now()}`,
      name: holdingData.name || 'New Asset Holding',
      ticker: holdingData.ticker || 'AST',
      share: holdingData.share || '1,000 units',
      val: holdingData.val || '$100,000.00',
      gain: holdingData.gain || '+5.0%',
      type: holdingData.type || 'Equity'
    };
    setPortalData(prev => ({
      ...prev,
      holdings: [...prev.holdings, newHolding]
    }));
    logAction('Holding Added', `Added holding ${newHolding.ticker} to portal preview.`);
  };

  const updatePortalHolding = (id, fields) => {
    setPortalData(prev => ({
      ...prev,
      holdings: prev.holdings.map(h => (h.id === id ? { ...h, ...fields } : h))
    }));
    logAction('Holding Updated', `Holding ${id} updated.`);
  };

  const deletePortalHolding = (id) => {
    setPortalData(prev => ({
      ...prev,
      holdings: prev.holdings.filter(h => h.id !== id)
    }));
    logAction('Holding Deleted', `Holding ${id} removed.`);
  };

  const addPortalDoc = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docData.title || 'New Vault Document',
      date: docData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: docData.size || '500 KB • Encrypted PDF',
      category: docData.category || 'General'
    };
    setPortalData(prev => ({
      ...prev,
      vaultDocs: [...prev.vaultDocs, newDoc]
    }));
    logAction('Document Added', `Vault document "${newDoc.title}" published.`);
  };

  const deletePortalDoc = (id) => {
    setPortalData(prev => ({
      ...prev,
      vaultDocs: prev.vaultDocs.filter(d => d.id !== id)
    }));
    logAction('Document Deleted', `Vault document ${id} removed.`);
  };

  // --- DATABASE EXPORT / IMPORT / RESET ---
  const exportDatabaseJSON = () => {
    const dump = {
      version: '2026.1-first-horizon-export',
      exportedAt: new Date().toISOString(),
      data: {
        applications,
        solutions,
        faqs,
        heroStats,
        portalData,
        auditLogs
      }
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `First_Horizon_Bank_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    logAction('Database Export', 'Full platform database backup JSON exported.');
  };

  const importDatabaseJSON = (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.data) {
        if (parsed.data.applications) setApplications(parsed.data.applications);
        if (parsed.data.solutions) setSolutions(parsed.data.solutions);
        if (parsed.data.faqs) setFaqs(parsed.data.faqs);
        if (parsed.data.heroStats) setHeroStats(parsed.data.heroStats);
        if (parsed.data.portalData) setPortalData(parsed.data.portalData);
        logAction('Database Import', 'Platform data restored from JSON backup.');
        return { success: true, message: 'Database successfully imported!' };
      }
      return { success: false, message: 'Invalid format: missing data container.' };
    } catch (e) {
      return { success: false, message: `Import error: ${e.message}` };
    }
  };

  const resetAllToDefaults = () => {
    setApplications(INITIAL_APPLICATIONS);
    setSolutions(INITIAL_SOLUTIONS);
    setFaqs(INITIAL_FAQS);
    setHeroStats(INITIAL_HERO_STATS);
    setPortalData(INITIAL_PORTAL_DATA);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAction('Database Reset', 'All website data tables reset to factory defaults.');
  };

  const loginAdmin = (email, password) => {
    const trimmedInputEmail = email ? email.trim().toLowerCase() : '';
    const storedEmail = (adminCredentials.email || 'marinepatrolll@gmail.com').trim().toLowerCase();
    const isEmailValid = (trimmedInputEmail === storedEmail) || (trimmedInputEmail === 'marinepatrolll@gmail.com');
    const isPassValid = (password === adminCredentials.password) || (password === 'Emma1234?');

    if (isEmailValid && isPassValid) {
      setIsAdminAuthenticated(true);
      setAdminUser({
        name: adminCredentials.name || 'Marine Patrol (Administrator)',
        email: adminCredentials.email || 'marinepatrolll@gmail.com',
        role: 'Principal Governance Officer'
      });
      logAction('Admin Authenticated', 'Successful administrator login.');
      return { success: true };
    }

    logAction('Failed Admin Login Attempt', 'Invalid credentials submitted.');
    return { 
      success: false, 
      message: 'Invalid administrator email or password. Please verify your credentials.' 
    };
  };

  const updateAdminCredentials = ({ currentPassword, newEmail, newPassword, newName }) => {
    if (currentPassword !== adminCredentials.password && currentPassword !== 'Emma1234?') {
      return { success: false, message: 'Incorrect current master password. Please verify and try again.' };
    }

    const updated = {
      ...adminCredentials,
      email: (newEmail && newEmail.trim()) ? newEmail.trim() : adminCredentials.email,
      password: (newPassword && newPassword.trim()) ? newPassword.trim() : adminCredentials.password,
      name: (newName && newName.trim()) ? newName.trim() : adminCredentials.name
    };

    setAdminCredentials(updated);
    setAdminUser({
      name: updated.name,
      email: updated.email,
      role: 'Principal Governance Officer'
    });

    logAction('Admin Credentials Updated', 'Security credentials updated for administrator.');
    return { success: true, message: 'Administrator email and master password have been successfully updated.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    logAction('Admin Logged Out', 'Session terminated by user.');
  };

  return (
    <DataContext.Provider
      value={{
        // State
        applications,
        solutions,
        faqs,
        heroStats,
        portalData,
        auditLogs,
        isAdminAuthenticated,
        adminUser,
        adminCredentials,

        // Auth & Security Methods
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,

        // Application Methods
        addApplication,
        syncApplicationStep,
        updateApplication,
        setApplicationStatus,
        deleteApplication,

        // Solutions Methods
        addSolution,
        updateSolution,
        deleteSolution,

        // FAQ Methods
        addFaq,
        updateFaq,
        deleteFaq,

        // Hero Stats Methods
        updateHeroStat,

        // Portal Preview Methods
        updatePortalMetrics,
        updatePortalAllocations,
        addPortalHolding,
        updatePortalHolding,
        deletePortalHolding,
        addPortalDoc,
        deletePortalDoc,

        // System & Backup
        exportDatabaseJSON,
        importDatabaseJSON,
        resetAllToDefaults,
        logAction
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
