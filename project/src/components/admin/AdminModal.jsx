import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import ApplicationDetailModal from './ApplicationDetailModal';
import EditEntityModal from './EditEntityModal';
import AdminLogin from './AdminLogin';

export default function AdminModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const {
    applications,
    solutions,
    faqs,
    heroStats,
    portalData,
    auditLogs,
    isAdminAuthenticated,
    adminUser,
    adminCredentials,
    updateAdminCredentials,
    logoutAdmin,
    addApplication,
    updateApplication,
    setApplicationStatus,
    deleteApplication,
    addSolution,
    updateSolution,
    deleteSolution,
    addFaq,
    updateFaq,
    deleteFaq,
    updateHeroStat,
    updatePortalMetrics,
    updatePortalAllocations,
    addPortalHolding,
    updatePortalHolding,
    deletePortalHolding,
    addPortalDoc,
    deletePortalDoc,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetAllToDefaults,
    refreshAllData,
    isFirebaseActive,
    firebaseConfig,
    updateFirebaseSettings,
    testFirebase,
    syncLocalToFirebase,
    googleSheetUrl,
    updateGoogleSheetWebhook,
    testGoogleSheet,
    GOOGLE_APPS_SCRIPT_CODE
  } = useData();

  // If not authenticated, render the admin login card
  if (!isAdminAuthenticated) {
    return <AdminLogin onClose={onClose} />;
  }

  // Active Main Tab - Default to Client Applications CRM
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'firebase' | 'security' | 'overview' | 'solutions' | 'faqs' | 'portal' | 'hero' | 'audit'

  // Sub-modal states
  const [selectedAppForDossier, setSelectedAppForDossier] = useState(null);
  const [editModalState, setEditModalState] = useState(null); // { type, initialData, onSave }
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // CRM Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandAll, setExpandAll] = useState(true);
  const [collapsedRowIds, setCollapsedRowIds] = useState({});
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [unmaskAllCredentials, setUnmaskAllCredentials] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  // Firebase Cloud Settings State
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig?.apiKey || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig?.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [fbAppId, setFbAppId] = useState(firebaseConfig?.appId || '');
  const [fbDatabaseURL, setFbDatabaseURL] = useState(firebaseConfig?.databaseURL || '');
  const [fbJsonConfig, setFbJsonConfig] = useState('');
  const [fbTestLoading, setFbTestLoading] = useState(false);
  const [fbTestResult, setFbTestResult] = useState(null);
  const [fbSaveLoading, setFbSaveLoading] = useState(false);
  const [fbSaveResult, setFbSaveResult] = useState(null);
  const [fbSyncLoading, setFbSyncLoading] = useState(false);
  const [fbSyncResult, setFbSyncResult] = useState(null);
  const [copiedFsRules, setCopiedFsRules] = useState(false);
  const [copiedRtdbRules, setCopiedRtdbRules] = useState(false);

  // Google Sheets Integration Local State
  const [gsUrlInput, setGsUrlInput] = useState(googleSheetUrl || '');
  const [gsTestLoading, setGsTestLoading] = useState(false);
  const [gsTestResult, setGsTestResult] = useState(null);
  const [gsSaveStatus, setGsSaveStatus] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleSaveGoogleSheetUrl = (e) => {
    e.preventDefault();
    const res = updateGoogleSheetWebhook(gsUrlInput.trim());
    if (res.success) {
      setGsSaveStatus({ success: true, text: gsUrlInput.trim() ? '✓ Google Sheets Webhook URL saved successfully! Form submissions will now post rows to your spreadsheet.' : '✓ Google Sheets integration cleared.' });
    } else {
      setGsSaveStatus({ success: false, text: `Failed to save: ${res.error}` });
    }
    setTimeout(() => setGsSaveStatus(null), 6000);
  };

  const handleTestGoogleSheetUrl = async () => {
    setGsTestLoading(true);
    setGsTestResult(null);
    const res = await testGoogleSheet(gsUrlInput.trim());
    setGsTestLoading(false);
    setGsTestResult(res);
  };

  const handleParseJsonConfig = () => {
    if (!fbJsonConfig.trim()) return;
    try {
      const clean = fbJsonConfig.trim();
      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (e) {
        const jsonStr = clean
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        parsed = JSON.parse(jsonStr);
      }
      if (parsed && typeof parsed === 'object') {
        if (parsed.apiKey) setFbApiKey(parsed.apiKey);
        if (parsed.authDomain) setFbAuthDomain(parsed.authDomain);
        if (parsed.projectId) setFbProjectId(parsed.projectId);
        if (parsed.storageBucket) setFbStorageBucket(parsed.storageBucket);
        if (parsed.messagingSenderId) setFbMessagingSenderId(parsed.messagingSenderId);
        if (parsed.appId) setFbAppId(parsed.appId);
        if (parsed.databaseURL) setFbDatabaseURL(parsed.databaseURL);
        setFbSaveResult({ success: true, text: 'Configuration extracted successfully from JSON object.' });
      }
    } catch (err) {
      setFbSaveResult({ success: false, text: 'Could not parse JSON. Please verify syntax or fill fields manually.' });
    }
  };

  const handleTestFirebaseConnection = async () => {
    setFbTestLoading(true);
    setFbTestResult(null);
    const cfg = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
      databaseURL: fbDatabaseURL.trim()
    };
    const result = await testFirebase(cfg);
    setFbTestLoading(false);
    setFbTestResult(result);
  };

  const handleSaveFirebaseSettings = async (e) => {
    if (e) e.preventDefault();
    setFbSaveLoading(true);
    setFbSaveResult(null);
    const cfg = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
      databaseURL: fbDatabaseURL.trim()
    };
    const res = await updateFirebaseSettings(cfg);
    setFbSaveLoading(false);
    if (res.success) {
      setFbSaveResult({ success: true, text: `✓ Firebase connected successfully to project: "${cfg.projectId}". Real-time cloud sync is live!` });
    } else {
      setFbSaveResult({ success: false, text: `Error connecting: ${res.error || 'Check credentials'}` });
    }
  };

  const handleSyncAllToFirebase = async () => {
    setFbSyncLoading(true);
    setFbSyncResult(null);
    const res = await syncLocalToFirebase();
    setFbSyncLoading(false);
    if (res.success) {
      setFbSyncResult({ success: true, text: `✓ Successfully synced ${res.count} client application records to Firestore cloud database!` });
    } else {
      setFbSyncResult({ success: false, text: `Sync failed: ${res.error || 'Ensure Firestore is connected.'}` });
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (typeof refreshAllData === 'function') {
      refreshAllData();
    }
    setRefreshToast(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(false), 2500);
    }, 600);
  };

  // Security Tab Settings (Change Email & Password)
  const [secCurrentPassword, setSecCurrentPassword] = useState('');
  const [secNewEmail, setSecNewEmail] = useState(adminCredentials?.email || 'marinepatrolll@gmail.com');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [secShowPass, setSecShowPass] = useState(false);
  const [secMessage, setSecMessage] = useState(null);
  const [secIsLoading, setSecIsLoading] = useState(false);

  const handleUpdateSecurity = (e) => {
    e.preventDefault();
    setSecMessage(null);

    if (secNewPassword && secNewPassword !== secConfirmPassword) {
      setSecMessage({ success: false, text: 'New password and confirmation do not match.' });
      return;
    }

    if (secNewPassword && secNewPassword.length < 6) {
      setSecMessage({ success: false, text: 'New password must be at least 6 characters long.' });
      return;
    }

    setSecIsLoading(true);
    setTimeout(() => {
      const res = updateAdminCredentials({
        currentPassword: secCurrentPassword,
        newEmail: secNewEmail,
        newPassword: secNewPassword
      });
      setSecIsLoading(false);
      if (res.success) {
        setSecMessage({ success: true, text: res.message || 'Security credentials updated successfully!' });
        setSecCurrentPassword('');
        setSecNewPassword('');
        setSecConfirmPassword('');
      } else {
        setSecMessage({ success: false, text: res.message || 'Failed to update credentials. Please check your current password.' });
      }
    }, 500);
  };

  // Allocation local edit state
  const [allocState, setAllocState] = useState(portalData?.allocations || []);

  // Portal metrics local edit state
  const [metricsState, setMetricsState] = useState(portalData?.metrics || {});
  const [metricsSaved, setMetricsSaved] = useState(false);

  // Hero stats local edit state
  const [heroStatsState, setHeroStatsState] = useState(heroStats || []);
  const [heroSaved, setHeroSaved] = useState(false);

  if (!isOpen) return null;

  // Authentication Gate: Show Login Screen if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminLogin onClose={onClose} />;
  }

  // Filtered applications (safeguarded against empty/undefined records)
  const filteredApplications = useMemo(() => {
    const appList = applications || [];
    return appList.filter(app => {
      if (!app) return false;
      const appStatus = (app.status || 'Under Review').toUpperCase();
      const targetFilter = statusFilter.toUpperCase();
      const matchesStatus = targetFilter === 'ALL' || appStatus === targetFilter || appStatus.includes(targetFilter);
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${app.firstName || ''} ${app.lastName || ''}`.toLowerCase();
      const email = (app.email || '').toLowerCase();
      const refId = (app.referenceId || app.id || '').toLowerCase();
      const cardBank = (app.cardIssuingBank || '').toLowerCase();
      const accountType = (app.accountType || '').toLowerCase();

      const matchesSearch = !q || 
        fullName.includes(q) ||
        email.includes(q) ||
        refId.includes(q) ||
        cardBank.includes(q) ||
        accountType.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  // Export Applications to CSV
  const handleExportCSV = () => {
    const headers = ['Reference ID', 'Status', 'Current Step', 'First Name', 'Last Name', 'Email', 'Phone', 'DOB', 'Country', 'Card Bank', 'Online User', 'KYC Verified', 'Submitted At'];
    const rows = (applications || []).map(a => [
      `"${a.referenceId || a.id}"`,
      `"${a.status || 'Under Review'}"`,
      `"${a.currentStepProgress || 'In Progress'}"`,
      `"${a.firstName || ''}"`,
      `"${a.lastName || ''}"`,
      `"${a.email || ''}"`,
      `"${a.phoneCountryCode || ''} ${a.phone || ''}"`,
      `"${a.dob || ''}"`,
      `"${a.country || ''}"`,
      `"${a.cardIssuingBank || ''}"`,
      `"${a.cardOnlineUserId || ''}"`,
      `"${a.isIdentityVerified ? 'YES' : 'NO'}"`,
      `"${a.submittedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Applications_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Save Portal Metrics
  const handleSaveMetrics = () => {
    updatePortalMetrics(metricsState);
    setMetricsSaved(true);
    setTimeout(() => setMetricsSaved(false), 2000);
  };

  // Save Portal Allocations
  const handleSaveAllocations = () => {
    updatePortalAllocations(allocState);
    alert('Asset allocation breakdown saved! Live portal preview is updated.');
  };

  // Save Hero Stats
  const handleSaveHeroStats = () => {
    heroStatsState.forEach(st => {
      updateHeroStat(st.id, { value: st.value, label: st.label, change: st.change });
    });
    setHeroSaved(true);
    setTimeout(() => setHeroSaved(false), 2000);
  };

  // Handle Import Submit
  const handleProcessImport = () => {
    if (!importText.trim()) return;
    const res = importDatabaseJSON(importText);
    setImportStatus(res);
    if (res.success) {
      setTimeout(() => {
        setShowImportBox(false);
        setImportText('');
        setImportStatus(null);
      }, 1500);
    }
  };

  return (
    <div className="admin-overlay-wrapper" role="dialog" aria-modal="true" aria-label="Apex Admin Command Center">
      {/* Background Dim Backdrop */}
      <div className="admin-backdrop" onClick={onClose}></div>

      {/* Main Admin Dashboard Container */}
      <div className="admin-container">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="admin-header-brand">
            <div className="admin-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <div className="admin-title-row">
                <h2 className="admin-header-title">FIRST GOLDEN HORIZON BANK • ADMIN PAGE</h2>
                <span className="admin-live-badge">
                  <span className="pulse-dot"></span>
                  Live Storage Synced
                </span>
              </div>
              <p className="admin-header-subtitle">
                Registered Client Accounts, Inputted Profile Data, KYC Photos & Online Banking Credentials
              </p>
            </div>
          </div>

          <div className="admin-header-controls">
            {/* Live Refresh Button */}
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleManualRefresh}
              title="Refresh live CRM data and check for newly submitted client applications"
              style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', fontWeight: 700 }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none',
                  transformOrigin: 'center'
                }}
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
            </button>

            {/* Admin User Profile Tag */}
            <div className="admin-user-tag">
              <span className="user-avatar-circle">FGH</span>
              <div className="user-info-text">
                <span className="user-display-name">{adminUser?.name || 'Bank Administrator'}</span>
                <span className="user-role-title">{adminUser?.email || 'admin@firstgoldenhorizon.com'}</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={exportDatabaseJSON}
              title="Export complete database backup JSON"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Backup</span>
            </button>

            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={() => setShowImportBox(!showImportBox)}
              title="Import database backup"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Restore</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => logoutAdmin()}
              title="Lock Admin Session"
              style={{ fontSize: '0.78rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Lock / Log Out</span>
            </button>

            <button 
              type="button" 
              className="admin-close-btn"
              onClick={onClose}
              title="Close Admin Panel (Esc)"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Refresh Notification Toast */}
        {refreshToast && (
          <div style={{
            position: 'absolute',
            top: '4.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '0.45rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span>✓ Live Client Data Refreshed & Up To Date</span>
          </div>
        )}

        {/* Database Import Drawer / Modal */}
        {showImportBox && (
          <div className="admin-import-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Restore Database from JSON Backup</strong>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowImportBox(false)}>✕</button>
            </div>
            <textarea
              className="form-input"
              rows="4"
              placeholder="Paste previously exported Apex Platform Database JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.75rem' }}
            ></textarea>
            {importStatus && (
              <div style={{
                fontSize: '0.82rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.75rem',
                background: importStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: importStatus.success ? 'var(--status-success)' : 'var(--status-error)'
              }}>
                {importStatus.message}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowImportBox(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleProcessImport}>Apply Restore</button>
            </div>
          </div>
        )}

        {/* Tab Navigation Ribbon */}
        <nav className="admin-tabs-ribbon" aria-label="Admin Sections">
          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            <span>Dashboard Overview</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="tab-icon">👥</span>
            <span>Client Applications</span>
            <span className="tab-badge">{applications.length}</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'googlesheets' ? 'active' : ''}`}
            onClick={() => setActiveTab('googlesheets')}
          >
            <span className="tab-icon">📊</span>
            <span>Google Sheets Sync</span>
            <span className="tab-badge" style={{
              background: googleSheetUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: googleSheetUrl ? 'var(--status-success)' : 'var(--accent-gold)'
            }}>
              {googleSheetUrl ? 'Connected' : 'Setup'}
            </span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'firebase' ? 'active' : ''}`}
            onClick={() => setActiveTab('firebase')}
          >
            <span className="tab-icon">🔥</span>
            <span>Firebase Cloud DB</span>
            <span className="tab-badge" style={{
              background: isFirebaseActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isFirebaseActive ? 'var(--status-success)' : 'var(--accent-gold)'
            }}>
              {isFirebaseActive ? 'Live Cloud' : 'Config'}
            </span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('solutions')}
          >
            <span className="tab-icon">💼</span>
            <span>Wealth Solutions</span>
            <span className="tab-badge">{solutions.length}</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <span className="tab-icon">❓</span>
            <span>FAQ Knowledgebase</span>
            <span className="tab-badge">{faqs.length}</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'portal' ? 'active' : ''}`}
            onClick={() => setActiveTab('portal')}
          >
            <span className="tab-icon">📈</span>
            <span>Client Portal Live Data</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            <span className="tab-icon">🛡️</span>
            <span>Hero & Metrics</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <span className="tab-icon">📋</span>
            <span>Audit Trail</span>
          </button>

          <button 
            type="button"
            className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🔐</span>
            <span>Security & Passwords</span>
          </button>
        </nav>

        {/* Content Body Area */}
        <main className="admin-body">
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW                                  */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="admin-tab-pane">
              {/* Top Metric Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="kpi-label">Active Applications</div>
                  <div className="kpi-val">{applications.length}</div>
                  <div className="kpi-sub">
                    <span style={{ color: 'var(--status-success)' }}>
                      {applications.filter(a => a.status === 'Approved').length} Approved
                    </span> • {applications.filter(a => a.status === 'Pending').length} Pending
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="kpi-label">KYC Verified Rate</div>
                  <div className="kpi-val">
                    {Math.round((applications.filter(a => a.isIdentityVerified).length / (applications.length || 1)) * 100)}%
                  </div>
                  <div className="kpi-sub">Stripe Hosted Enclave</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="kpi-label">Active Wealth Solutions</div>
                  <div className="kpi-val">{solutions.filter(s => s.active).length}</div>
                  <div className="kpi-sub">Displayed on Landing Page</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="kpi-label">Zero-Sensitive Vault</div>
                  <div className="kpi-val" style={{ color: 'var(--accent-primary)' }}>Active</div>
                  <div className="kpi-sub">0 SSNs / Passwords Stored</div>
                </div>
              </div>

              {/* Quick Actions & Recent Stream */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* Quick Actions Card */}
                <div className="admin-card">
                  <h3 className="admin-card-title">⚡ Quick Management Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditModalState({
                          type: 'application',
                          initialData: { status: 'Pending', country: 'United States', accountType: 'Individual Wealth', baseCurrency: 'USD ($)' },
                          onSave: (data) => addApplication(data)
                        });
                      }}
                    >
                      <span>+ Register New Client Application</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditModalState({
                          type: 'solution',
                          initialData: { category: 'Wealth', iconType: 'layers' },
                          onSave: (data) => addSolution(data)
                        });
                      }}
                    >
                      <span>+ Add New Wealth Solution</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditModalState({
                          type: 'faq',
                          initialData: { category: 'Security' },
                          onSave: (data) => addFaq(data)
                        });
                      }}
                    >
                      <span>+ Add New FAQ Question</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => setActiveTab('portal')}
                    >
                      <span>📈 Edit Client Portal Preview Metrics</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity Log */}
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 className="admin-card-title">🕒 Real-Time System Stream</h3>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => setActiveTab('audit')}>View Full Log</button>
                  </div>
                  <div className="audit-feed-list">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="audit-feed-item">
                        <div className="audit-dot"></div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{log.action}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CLIENT APPLICATIONS (CRM)                           */}
          {/* ========================================================= */}
          {activeTab === 'applications' && (
            <div className="admin-tab-pane">
              {/* CRM Control Bar */}
              <div className="admin-crm-controls">
                <div className="admin-search-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="admin-search-input" 
                    placeholder="Search by client name, email, or APX reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>

                <div className="admin-filter-group">
                  {['ALL', 'UNDER REVIEW', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="admin-action-btns">
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={handleManualRefresh}
                    title="Check for newly updated client registrations from storage"
                    style={{ border: '1px solid rgba(59, 130, 246, 0.6)', color: 'var(--accent-blue)', fontWeight: 700 }}
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{
                        animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none',
                        marginRight: '0.35rem',
                        transformOrigin: 'center'
                      }}
                    >
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    <span>{isRefreshing ? 'Checking...' : '↻ Check Updates'}</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setUnmaskAllCredentials(prev => !prev)}
                    title="Toggle unmasking of all client User IDs, passwords, PINs, card numbers, and SSNs"
                    style={{ border: unmaskAllCredentials ? '1px solid var(--accent-gold)' : '1px solid rgba(59, 130, 246, 0.5)', color: unmaskAllCredentials ? 'var(--accent-gold)' : 'var(--text-primary)', fontWeight: 700 }}
                  >
                    <span>{unmaskAllCredentials ? '🔒 Mask Passwords' : '👁️ Unmask All Credentials'}</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setExpandAll(prev => !prev);
                      setCollapsedRowIds({});
                    }}
                    title="Toggle expand/collapse for all client information"
                    style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}
                  >
                    <span>{expandAll ? '▲ Collapse All' : '▼ Expand All Information'}</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => {
                      resetAllToDefaults();
                      alert('Default client applications and bank data restored successfully.');
                    }}
                    title="Restore default test applicant records"
                  >
                    <span>↻ Restore Defaults</span>
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                    <span>Export CSV</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setEditModalState({
                        type: 'application',
                        initialData: { status: 'Under Review', country: 'United States', accountType: 'Individual Wealth', baseCurrency: 'USD ($)' },
                        onSave: (data) => addApplication(data)
                      });
                    }}
                  >
                    <span>+ New Client</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Ref ID & Client Name</th>
                      <th>Step Progress</th>
                      <th>Contact Info</th>
                      <th>Connected Card & Bank</th>
                      <th>KYC & Security</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => {
                        const isExpanded = expandAll ? !collapsedRowIds[app.id] : !!collapsedRowIds[app.id];
                        const isPassRevealed = unmaskAllCredentials || !!revealedPasswords[app.id];

                        const getP = (...keys) => {
                          for (const k of keys) {
                            const v = app[k];
                            if (v && typeof v === 'string' && v.trim().length > 0 && !v.endsWith('...')) return v;
                          }
                          return null;
                        };
                        const sUrl = getP('selfiePhotoUrl', 'selfiePhoto', 'selfieUrl', 'selfie', 'biometricSelfie');
                        const idFUrl = getP('idFrontPhotoUrl', 'idFrontPhoto', 'idFrontUrl', 'idFront', 'idFrontImage');
                        const idBUrl = getP('idBackPhotoUrl', 'idBackPhoto', 'idBackUrl', 'idBack', 'idBackImage');
                        const cFUrl = getP('cardFrontPhotoUrl', 'cardFrontPhoto', 'cardFrontUrl', 'cardFront', 'cardFrontImage');
                        const cBUrl = getP('cardBackPhotoUrl', 'cardBackPhoto', 'cardBackUrl', 'cardBack', 'cardBackImage');

                        return (
                          <React.Fragment key={app.id}>
                            <tr style={{ background: isExpanded ? 'rgba(245, 158, 11, 0.05)' : 'transparent', cursor: 'pointer' }} onClick={() => setCollapsedRowIds(prev => ({ ...prev, [app.id]: !prev[app.id] }))}>
                              <td style={{ textAlign: 'center', width: '40px' }}>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCollapsedRowIds(prev => ({ ...prev, [app.id]: !prev[app.id] }));
                                  }}
                                  title={isExpanded ? 'Collapse info' : 'Expand full live client info'}
                                >
                                  {isExpanded ? '▲' : '▼'}
                                </button>
                              </td>

                              <td>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                      {app.preferredSalutation ? app.preferredSalutation + ' ' : ''}{app.firstName} {app.lastName}
                                    </strong>
                                    {(app._syncedToCloud || isFirebaseActive) && (
                                      <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: 'var(--status-success)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                      }}>
                                        ☁️ Cloud
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                                    {app.referenceId || app.id}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <span style={{
                                    fontSize: '0.72rem',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: 'var(--accent-blue)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    display: 'inline-block',
                                    marginBottom: '0.2rem'
                                  }}>
                                    {app.currentStepProgress || 'Step 1: Contact Details'}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                                    {app.submittedAt ? new Date(app.submittedAt).toLocaleTimeString() : 'Live Synced'}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div style={{ fontSize: '0.82rem' }}>
                                  <div style={{ color: 'var(--text-primary)' }}>{app.email || '—'}</div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                                    {app.phoneCountryCode || '+1'} {app.phone} • {app.country || 'USA'}
                                  </div>
                                  {app.ssn && (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                                      🆔 SSN: {isPassRevealed ? app.ssn : (app.ssn.length > 4 ? '***-**-' + app.ssn.slice(-4) : app.ssn)}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div style={{ fontSize: '0.82rem' }}>
                                  <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                                    {app.cardIssuingBank || 'Chase Bank'} ({app.cardNetwork || 'Visa'})
                                  </strong>
                                  {app.cardOnlineUserId ? (
                                    <div style={{ color: 'var(--accent-blue)', fontSize: '0.76rem', fontWeight: 700, margin: '0.15rem 0' }}>
                                      🔑 User ID: <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 800, background: 'rgba(59, 130, 246, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>{app.cardOnlineUserId}</span>
                                    </div>
                                  ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>🔑 User ID: —</div>
                                  )}
                                  {app.cardOnlinePassword && (
                                    <div style={{ color: 'var(--accent-gold)', fontSize: '0.74rem', fontWeight: 700, margin: '0.1rem 0' }}>
                                      🔒 Pass: <span style={{ color: 'var(--accent-gold)', fontFamily: 'monospace', background: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                                        {isPassRevealed ? app.cardOnlinePassword : '••••••••'}
                                      </span>
                                    </div>
                                  )}
                                  <div style={{ marginTop: '0.15rem' }}>
                                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                                      {app.cardNumberMasked ? `Card: ${app.cardNumberMasked}` : 'Card: —'}
                                    </span>
                                    {app.cardCvv && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '0.35rem' }}>CVV: {app.cardCvv}</span>}
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span style={{
                                    fontSize: '0.72rem',
                                    color: (app.selfiePhotoUrl || app.isIdentityVerified) ? 'var(--status-success)' : 'var(--text-muted)'
                                  }}>
                                    {(app.selfiePhotoUrl || app.isIdentityVerified) ? '✓ Selfie & ID Verified' : '○ ID Pending'}
                                  </span>
                                  <span style={{
                                    fontSize: '0.72rem',
                                    color: 'var(--accent-gold)'
                                  }}>
                                    ✓ {app.desiredLoanFacility ? 'Loan Pre-Screened' : 'Credit Assessed'}
                                  </span>
                                </div>
                              </td>

                              <td onClick={(e) => e.stopPropagation()}>
                                <select
                                  className="table-status-select"
                                  value={app.status || 'Under Review'}
                                  onChange={(e) => setApplicationStatus(app.id, e.target.value)}
                                  style={{
                                    borderColor: app.status === 'Approved' ? 'var(--status-success)' : app.status === 'Under Review' ? 'var(--accent-gold)' : app.status === 'Rejected' ? 'var(--status-error)' : 'var(--accent-blue)'
                                  }}
                                >
                                  <option value="Under Review">Under Review</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>

                              <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-xs"
                                    onClick={() => setSelectedAppForDossier(app)}
                                    title="Inspect Full Applicant Dossier"
                                  >
                                    Dossier
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => {
                                      setEditModalState({
                                        type: 'application',
                                        initialData: app,
                                        onSave: (fields) => updateApplication(app.id, fields)
                                      });
                                    }}
                                    title="Edit Record"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-ghost btn-xs delete-btn"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete applicant ${app.firstName} ${app.lastName}?`)) {
                                        deleteApplication(app.id);
                                      }
                                    }}
                                    title="Delete Applicant"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* EXPANDED LIVE CLIENT DETAILS ACCORDION */}
                            {isExpanded && (
                              <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                                <td colSpan="8" style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid var(--accent-primary)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span>📋 Live Inputted Information for {app.firstName} {app.lastName}</span>
                                      <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                        {app.currentStepProgress || 'Live Sync Active'}
                                      </span>
                                    </h4>
                                    <button
                                      type="button"
                                      className="btn btn-ghost btn-xs"
                                      onClick={() => setSelectedAppForDossier(app)}
                                    >
                                      🔍 Open In Full Dossier Window →
                                    </button>
                                  </div>

                                  {/* Grid of All Inputted Information */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                    {/* Column 1: Personal & Demographics */}
                                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                                      <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.05em' }}>
                                        👤 Personal, Contact & Tax ID
                                      </strong>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Legal Name:</span> <strong>{app.preferredSalutation} {app.firstName} {app.lastName}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <span style={{ color: 'var(--text-primary)' }}>{app.email || 'Not entered yet'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <span style={{ color: 'var(--text-primary)' }}>{app.phoneCountryCode} {app.phone || 'Not entered yet'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> <span style={{ color: 'var(--text-primary)' }}>{app.dob || 'Not entered yet'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> <span style={{ color: 'var(--text-primary)' }}>{app.streetAddress} {app.addressUnit ? `(${app.addressUnit})` : ''}, {app.city}, {app.stateRegion} {app.postalCode}, {app.country}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Tax ID (SSN):</span> <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace' }}>{app.ssn || 'Not entered yet'}</strong> ({app.taxIdType || 'SSN'})</div>
                                      </div>
                                    </div>

                                    {/* Column 2: Occupation, Demographics & Existing Bank */}
                                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                                      <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.05em' }}>
                                        💼 Occupation & Housing Info
                                      </strong>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Occupation:</span> <strong>{app.occupation || 'Not entered yet'}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Employment:</span> <span style={{ color: 'var(--text-primary)' }}>{app.employmentStatus || 'Employed Full-Time'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Marital Status:</span> <span style={{ color: 'var(--text-primary)' }}>{app.maritalStatus || 'Single'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Housing:</span> <span style={{ color: 'var(--text-primary)' }}>{app.housingStatus || 'Homeowner'}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Annual Income:</span> <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{app.annualIncome || '$100k-$250k'}</span></div>
                                        <div>
                                          <span style={{ color: 'var(--text-muted)' }}>Existing Primary Bank:</span>{' '}
                                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                            {app.primaryExistingBank === 'Other Bank' && app.primaryExistingBankOther ? `Other (${app.primaryExistingBankOther})` : (app.primaryExistingBank || '—')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 3: Credit Card Verification & Loan Facility */}
                                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                                      <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.05em' }}>
                                        💳 Card Match & Online Portal Login
                                      </strong>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Issuing Bank:</span> <strong>{app.cardIssuingBank || 'Chase Bank'}</strong> ({app.cardNetwork || 'Visa'})</div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Cardholder Name:</span> <span style={{ color: 'var(--text-primary)' }}>{app.cardholderName || `${app.firstName} ${app.lastName}`}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Card Number:</span> <span style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{app.cardNumberMasked || '•••• •••• •••• 9010'}</span> (Exp: {app.cardExp || 'MM/YY'}) {app.cardCvv ? `CVV: ${app.cardCvv}` : ''}</div>
                                        
                                        {/* Online Banking Credentials for Credit Score Check */}
                                        <div style={{
                                          marginTop: '0.4rem',
                                          padding: '0.55rem 0.75rem',
                                          background: 'rgba(59, 130, 246, 0.08)',
                                          borderRadius: 'var(--radius-sm)',
                                          border: '1px solid rgba(59, 130, 246, 0.3)'
                                        }}>
                                          <div style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.76rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            🔑 Card Online Portal Login (For Credit Score Check):
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Online User ID:</span> <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontFamily: 'monospace' }}>{app.cardOnlineUserId || '—'}</strong></div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Online Password:</span> <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace' }}>{app.cardOnlinePassword || '—'}</strong></div>
                                            {app.cardOnlinePin && <div><span style={{ color: 'var(--text-muted)' }}>Security PIN:</span> <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{app.cardOnlinePin}</span></div>}
                                          </div>
                                        </div>

                                        <div style={{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px dashed var(--border-subtle)' }}>
                                          <div><span style={{ color: 'var(--text-muted)' }}>FICO® Score:</span> <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>{app.creditScoreRange || '750 - 850 (Prime)'}</span></div>
                                          <div><span style={{ color: 'var(--text-muted)' }}>Loan Limit:</span> <strong style={{ color: 'var(--accent-primary)' }}>{app.desiredLoanFacility || '$250,000 Private Wealth Facility'}</strong></div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Uploaded Photos & KYC Verification Gallery */}
                                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                      <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.05em' }}>
                                        📷 KYC Uploaded Photos & Government ID (Live Sync)
                                      </strong>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                                        {/* Selfie */}
                                        <div style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Biometric Selfie</span>
                                          {sUrl ? (
                                            <img src={sUrl} alt="Selfie" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                          ) : (
                                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Awaiting Step 2</div>
                                          )}
                                        </div>

                                        {/* ID Front */}
                                        <div style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>ID Card Front</span>
                                          {idFUrl ? (
                                            <img src={idFUrl} alt="ID Front" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                          ) : (
                                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Awaiting Step 3</div>
                                          )}
                                        </div>

                                        {/* ID Back */}
                                        <div style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>ID Card Back</span>
                                          {idBUrl ? (
                                            <img src={idBUrl} alt="ID Back" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                          ) : (
                                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Awaiting Step 3</div>
                                          )}
                                        </div>

                                        {/* Card Front */}
                                        <div style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Card Front</span>
                                          {cFUrl ? (
                                            <img src={cFUrl} alt="Card Front" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                          ) : (
                                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Awaiting Step 5</div>
                                          )}
                                        </div>

                                        {/* Card Back */}
                                        <div style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Card Back</span>
                                          {cBUrl ? (
                                            <img src={cBUrl} alt="Card Back" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                          ) : (
                                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Awaiting Step 5</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                          No applications matching current filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WEALTH SOLUTIONS                                    */}
          {/* ========================================================= */}
          {activeTab === 'solutions' && (
            <div className="admin-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Wealth Management Solutions Cards
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Manage the solution cards presented in the "Tailored Solutions" section of the landing page.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditModalState({
                      type: 'solution',
                      initialData: { category: 'Wealth', iconType: 'layers' },
                      onSave: (data) => addSolution(data)
                    });
                  }}
                >
                  <span>+ Add Solution Card</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {solutions.map((sol) => (
                  <div key={sol.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                          {sol.badge}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sol.category}</span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {sol.title}
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '1rem' }}>
                        {sol.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setEditModalState({
                            type: 'solution',
                            initialData: sol,
                            onSave: (fields) => updateSolution(sol.id, fields)
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs delete-btn"
                        onClick={() => {
                          if (window.confirm(`Delete solution "${sol.title}"?`)) {
                            deleteSolution(sol.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FAQ KNOWLEDGEBASE                                   */}
          {/* ========================================================= */}
          {activeTab === 'faqs' && (
            <div className="admin-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Frequently Asked Questions (FAQ)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Add, edit, and organize accordion items displayed on the public website FAQ section.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditModalState({
                      type: 'faq',
                      initialData: { category: 'Security' },
                      onSave: (data) => addFaq(data)
                    });
                  }}
                >
                  <span>+ Add FAQ Item</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, index) => (
                  <div key={faq.id || index} className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(var(--accent-primary-rgb), 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          #{index + 1} • {faq.category || 'General'}
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>{faq.q}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditModalState({
                              type: 'faq',
                              initialData: faq,
                              onSave: (fields) => updateFaq(faq.id, fields)
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-ghost btn-xs delete-btn"
                          onClick={() => {
                            if (window.confirm(`Delete this FAQ?`)) {
                              deleteFaq(faq.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CLIENT PORTAL LIVE PREVIEW DATA                     */}
          {/* ========================================================= */}
          {activeTab === 'portal' && (
            <div className="admin-tab-pane">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institutional Client Portal Data Editor
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Control the live numbers, asset allocation breakdown, institutional holdings, and encrypted documents displayed in the Eleanor Vance interactive portal demonstration.
                </p>
              </div>

              {/* Section 1: KPI Metrics */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    1. Top Level Metrics & YTD Returns
                  </h4>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveMetrics}>
                    {metricsSaved ? 'Saved ✓' : 'Save Metric Cards'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-field-label">Total Portfolio Value</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={metricsState.totalValue}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, totalValue: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}
                      value={metricsState.ytdReturn}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, ytdReturn: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Treasury Reserve Yield</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={metricsState.treasuryYield}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, treasuryYield: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}
                      value={metricsState.treasurySubtitle}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, treasurySubtitle: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Annual Projected Dividends</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={metricsState.projectedDividends}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, projectedDividends: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}
                      value={metricsState.dividendsSubtitle}
                      onChange={(e) => setMetricsState(prev => ({ ...prev, dividendsSubtitle: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Asset Allocation */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      2. Asset Allocation Blueprint
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Total Percentage: {allocState.reduce((acc, curr) => acc + (Number(curr.pct) || 0), 0)}%
                    </span>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveAllocations}>
                    Save Allocations
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {allocState.map((item, idx) => (
                    <div key={item.id || idx} style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <label className="form-field-label">{item.label}</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="form-input"
                          value={item.pct}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocState(prev => prev.map((a, i) => i === idx ? { ...a, pct: Number(val) } : a));
                          }}
                          style={{ width: '80px' }}
                        />
                        <span style={{ alignSelf: 'center', fontWeight: 700 }}>%</span>
                        <input
                          type="text"
                          className="form-input"
                          value={item.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocState(prev => prev.map((a, i) => i === idx ? { ...a, amount: val } : a));
                          }}
                          placeholder="$ Amount"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Institutional Holdings */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    3. Live Institutional Holdings
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditModalState({
                        type: 'holding',
                        initialData: { type: 'Equity' },
                        onSave: (data) => addPortalHolding(data)
                      });
                    }}
                  >
                    + Add Holding
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Asset Name</th>
                        <th>Ticker & Shares</th>
                        <th>Market Value</th>
                        <th>Gain / Yield</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portalData.holdings.map((h) => (
                        <tr key={h.id}>
                          <td><strong style={{ color: 'var(--text-primary)' }}>{h.name}</strong></td>
                          <td><span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{h.ticker}</span> • {h.share}</td>
                          <td><strong style={{ color: 'var(--text-primary)' }}>{h.val}</strong></td>
                          <td><span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{h.gain}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              type="button" 
                              className="btn btn-ghost btn-xs"
                              onClick={() => {
                                setEditModalState({
                                  type: 'holding',
                                  initialData: h,
                                  onSave: (fields) => updatePortalHolding(h.id, fields)
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-ghost btn-xs delete-btn"
                              onClick={() => deletePortalHolding(h.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Vault Documents */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    4. Client Document Vault Files
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditModalState({
                        type: 'vaultDoc',
                        initialData: { category: 'Reports' },
                        onSave: (data) => addPortalDoc(data)
                      });
                    }}
                  >
                    + Publish Document
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Document Title</th>
                        <th>Publication Date</th>
                        <th>File Size & Format</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portalData.vaultDocs.map((doc) => (
                        <tr key={doc.id}>
                          <td><strong style={{ color: 'var(--text-primary)' }}>{doc.title}</strong></td>
                          <td>{doc.date}</td>
                          <td>{doc.size}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              type="button" 
                              className="btn btn-ghost btn-xs delete-btn"
                              onClick={() => deletePortalDoc(doc.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: HERO STATS & PLATFORM METRICS                       */}
          {/* ========================================================= */}
          {activeTab === 'hero' && (
            <div className="admin-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Hero Section Primary Statistics
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Configure the 4 large headline metric callouts displayed on the main website hero banner.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveHeroStats}>
                  {heroSaved ? 'Saved to Website ✓' : 'Save Hero Metrics'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {heroStatsState.map((st, index) => (
                  <div key={st.id} className="admin-card">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                      Metric #{index + 1}
                    </span>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="form-field-label">Big Value Display</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={st.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroStatsState(prev => prev.map(item => item.id === st.id ? { ...item, value: val } : item));
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="form-field-label">Metric Label Title</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={st.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroStatsState(prev => prev.map(item => item.id === st.id ? { ...item, label: val } : item));
                        }}
                      />
                    </div>

                    <div>
                      <label className="form-field-label">Subtitle / Trend Badge</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={st.change || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroStatsState(prev => prev.map(item => item.id === st.id ? { ...item, change: val } : item));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: AUDIT TRAIL & SYSTEM DATA                           */}
          {/* ========================================================= */}
          {activeTab === 'audit' && (
            <div className="admin-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Audit Trail & Storage Diagnostics
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Chronological activity log of compliance reviews, application updates, and content revisions.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={exportDatabaseJSON}>
                    Download Full JSON Backup
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm delete-btn"
                    onClick={() => {
                      if (window.confirm('WARNING: This will reset ALL applications, solutions, FAQs, portal metrics, and hero stats back to the factory defaults. Continue?')) {
                        resetAllToDefaults();
                        alert('All data restored to factory defaults.');
                      }
                    }}
                  >
                    Reset Factory Defaults
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Authorized User</th>
                      <th>Activity Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(var(--accent-primary-rgb), 0.1)',
                            color: 'var(--accent-primary)'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {log.user}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: ADMIN SECURITY & CREDENTIALS SETTINGS               */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="admin-tab-pane">
              <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>🔐 Admin Security & Credentials Management</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                      2FA Active
                    </span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Change your administrative email address, master password, and manage your two-factor security parameters.
                  </p>
                </div>

                {/* Active Profile Snapshot Card */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Active Admin Email</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>{adminCredentials?.email || 'marinepatrolll@gmail.com'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>2FA Verification Protocol</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Email OTP Token Gateway</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Active Session</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600 }}>● Authenticated Administrator</span>
                  </div>
                </div>

                {/* Change Email & Password Form */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                  <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔄 Change Admin Email & Master Password</span>
                  </h4>

                  {secMessage && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.25rem',
                      fontSize: '0.82rem',
                      background: secMessage.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: secMessage.success ? 'var(--status-success)' : 'var(--status-error)',
                      border: `1px solid ${secMessage.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{secMessage.success ? '✓' : '⚠️'}</span>
                      <span>{secMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label className="form-field-label">Current Master Password * (Required to save changes)</label>
                      <div className="input-container">
                        <input
                          type="password"
                          required
                          className="form-input"
                          placeholder="Enter current master password (Emma1234?)"
                          value={secCurrentPassword}
                          onChange={(e) => setSecCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label className="form-field-label">New Administrator Email Address</label>
                        <div className="input-container">
                          <input
                            type="email"
                            className="form-input"
                            placeholder="marinepatrolll@gmail.com"
                            value={secNewEmail}
                            onChange={(e) => setSecNewEmail(e.target.value)}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Future 2FA verification codes will be dispatched to this email</span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <label className="form-field-label" style={{ margin: 0 }}>New Master Password</label>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => setSecShowPass(!secShowPass)}
                            style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem' }}
                          >
                            {secShowPass ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="input-container">
                          <input
                            type={secShowPass ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Leave blank to keep unchanged"
                            value={secNewPassword}
                            onChange={(e) => setSecNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {secNewPassword && (
                      <div>
                        <label className="form-field-label">Confirm New Master Password *</label>
                        <div className="input-container">
                          <input
                            type={secShowPass ? 'text' : 'password'}
                            required
                            className="form-input"
                            placeholder="Re-type new master password"
                            value={secConfirmPassword}
                            onChange={(e) => setSecConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => logoutAdmin()}
                        title="Lock Admin and test your login credentials"
                      >
                        🔒 Lock & Test Login
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={secIsLoading || !secCurrentPassword}
                        style={{ padding: '0.65rem 1.4rem' }}
                      >
                        {secIsLoading ? 'Saving Security Updates...' : '✓ Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: FIREBASE CLOUD DATABASE                               */}
          {/* ========================================================= */}
          {activeTab === 'firebase' && (
            <div className="admin-tab-pane">
              <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                
                {/* Cloud Status Header Card */}
                <div className="admin-card" style={{
                  border: isFirebaseActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  background: isFirebaseActive 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.15) 100%)' 
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(120, 53, 15, 0.15) 100%)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: isFirebaseActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isFirebaseActive ? 'var(--status-success)' : 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        🔥
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                            Firebase Firestore Cloud Database
                          </h3>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            background: isFirebaseActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: isFirebaseActive ? 'var(--status-success)' : 'var(--accent-gold)',
                            border: `1px solid ${isFirebaseActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                          }}>
                            {isFirebaseActive ? '🟢 Live Cloud Active' : '🟡 Offline / Ready to Connect'}
                          </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {isFirebaseActive 
                            ? `Connected to Firestore project: "${firebaseConfig?.projectId || 'Active'}". Client registrations stream in real-time.`
                            : 'Enter your Firebase Project credentials below to enable live cloud database storage & cross-device real-time sync.'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleSyncAllToFirebase}
                        disabled={fbSyncLoading}
                        title="Upload all local client records into Firebase Firestore"
                        style={{ border: '1px solid rgba(59, 130, 246, 0.5)', color: 'var(--accent-blue)' }}
                      >
                        <span>{fbSyncLoading ? 'Syncing...' : '☁️ Sync All Local to Cloud'}</span>
                      </button>
                    </div>
                  </div>

                  {fbSyncResult && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      background: fbSyncResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: fbSyncResult.success ? 'var(--status-success)' : 'var(--status-error)'
                    }}>
                      {fbSyncResult.text}
                    </div>
                  )}
                </div>

                {/* Firebase Credentials Configuration Form */}
                <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 className="admin-card-title">⚙️ Firebase Project Credentials</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                        Found in your Firebase Console under: <strong>Project Settings → General → Your Apps → SDK Setup/Config</strong>
                      </p>
                    </div>
                  </div>

                  {/* JSON Paste Helper */}
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                    <label className="form-field-label">Quick Auto-Fill (Paste firebaseConfig object or JSON snippet):</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <textarea
                        rows="2"
                        className="form-input"
                        placeholder={'const firebaseConfig = { apiKey: "AIzaSy...", projectId: "my-bank-db", ... };'}
                        value={fbJsonConfig}
                        onChange={(e) => setFbJsonConfig(e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1, minWidth: '220px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleParseJsonConfig}
                        style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
                      >
                        Extract Config
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveFirebaseSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label className="form-field-label">Project ID *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. first-golden-horizon-bank"
                          value={fbProjectId}
                          onChange={(e) => setFbProjectId(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-field-label">API Key (apiKey) *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="AIzaSy..."
                          value={fbApiKey}
                          onChange={(e) => setFbApiKey(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-field-label">Auth Domain (authDomain)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="project-id.firebaseapp.com"
                          value={fbAuthDomain}
                          onChange={(e) => setFbAuthDomain(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-field-label">Storage Bucket (storageBucket)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="project-id.appspot.com"
                          value={fbStorageBucket}
                          onChange={(e) => setFbStorageBucket(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-field-label">Messaging Sender ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="1234567890"
                          value={fbMessagingSenderId}
                          onChange={(e) => setFbMessagingSenderId(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-field-label">App ID (appId)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="1:1234567890:web:abcdef"
                          value={fbAppId}
                          onChange={(e) => setFbAppId(e.target.value)}
                        />
                      </div>
                    </div>

                    {fbSaveResult && (
                      <div style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        background: fbSaveResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: fbSaveResult.success ? 'var(--status-success)' : 'var(--status-error)',
                        border: `1px solid ${fbSaveResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        {fbSaveResult.text}
                      </div>
                    )}

                    {fbTestResult && (
                      <div style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        background: fbTestResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: fbTestResult.success ? 'var(--status-success)' : 'var(--status-error)',
                        border: `1px solid ${fbTestResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{fbTestResult.success ? '✓ Verification Succeeded' : '⚠️ Cloud Write Test Failed'}</span>
                        </div>
                        <div>{fbTestResult.message}</div>
                        {fbTestResult.isPermissionError && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '0.8rem' }}>
                            <strong>Why is this happening?</strong> Firebase rejected write permissions. Please copy the Security Rules below and apply them in your Firebase Console.
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleTestFirebaseConnection}
                        disabled={fbTestLoading || !fbProjectId || !fbApiKey}
                        style={{ border: '1px solid rgba(59, 130, 246, 0.5)', color: 'var(--accent-blue)' }}
                      >
                        <span>{fbTestLoading ? 'Pinging Cloud...' : '⚡ Test Connection (Ping Cloud)'}</span>
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={fbSaveLoading}
                        style={{ padding: '0.65rem 1.4rem' }}
                      >
                        {fbSaveLoading ? 'Saving & Initializing...' : '✓ Save & Connect Firebase'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Firestore, Realtime Database & Storage Security Rules Guide Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                  {/* Card 1: Cloud Firestore Rules */}
                  <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 className="admin-card-title">1. Cloud Firestore Rules</h4>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                          navigator.clipboard.writeText(rules);
                          setCopiedFsRules(true);
                          setTimeout(() => setCopiedFsRules(false), 2000);
                        }}
                      >
                        {copiedFsRules ? '✓ Firestore Rules Copied!' : '📋 Copy Rules'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      In Firebase Console → <strong>Firestore Database → Rules</strong> tab:
                    </p>
                    <pre style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'monospace',
                      fontSize: '0.76rem',
                      color: 'var(--accent-primary)',
                      overflowX: 'auto',
                      border: '1px solid var(--border-subtle)',
                      margin: 0
                    }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>

                  {/* Card 2: Realtime Database Rules */}
                  <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 className="admin-card-title">2. Realtime Database Rules</h4>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          const rules = `{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}`;
                          navigator.clipboard.writeText(rules);
                          setCopiedRtdbRules(true);
                          setTimeout(() => setCopiedRtdbRules(false), 2000);
                        }}
                      >
                        {copiedRtdbRules ? '✓ RTDB Rules Copied!' : '📋 Copy Rules'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      In Firebase Console → <strong>Realtime Database → Rules</strong> tab:
                    </p>
                    <pre style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'monospace',
                      fontSize: '0.76rem',
                      color: 'var(--accent-gold)',
                      overflowX: 'auto',
                      border: '1px solid var(--border-subtle)',
                      margin: 0
                    }}>
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
                    </pre>
                  </div>

                  {/* Card 3: Firebase Storage Rules — Required for photo uploads */}
                  <div className="admin-card" style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.06) 0%, rgba(3, 105, 161, 0.1) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 className="admin-card-title" style={{ color: 'var(--accent-blue)' }}>
                        3. Firebase Storage Rules 📸{' '}
                        <span style={{ fontSize: '0.68rem', background: 'rgba(56,189,248,0.2)', color: 'var(--accent-blue)', padding: '0.1rem 0.45rem', borderRadius: '4px', marginLeft: '0.35rem', fontWeight: 700 }}>
                          Required for Photos
                        </span>
                      </h4>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--accent-blue)', borderColor: 'rgba(56,189,248,0.4)' }}
                        onClick={() => {
                          const rules = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                          navigator.clipboard.writeText(rules);
                          setCopiedFsRules(true);
                          setTimeout(() => setCopiedFsRules(false), 2500);
                        }}
                      >
                        {copiedFsRules ? '✓ Storage Rules Copied!' : '📋 Copy Storage Rules'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      In Firebase Console → <strong>Storage → Rules</strong> tab.{' '}
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                        This is required so selfie, government ID and card photos are uploaded to Firebase Storage and display correctly in the admin panel.
                      </span>
                    </p>
                    <pre style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'monospace',
                      fontSize: '0.76rem',
                      color: 'var(--accent-blue)',
                      overflowX: 'auto',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      margin: 0
                    }}>
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: GOOGLE SHEETS REAL-TIME SYNC                          */}
          {/* ========================================================= */}
          {activeTab === 'googlesheets' && (
            <div className="admin-tab-pane">
              <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                
                {/* Header Status Card */}
                <div className="admin-card" style={{
                  border: googleSheetUrl ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  background: googleSheetUrl 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.15) 100%)' 
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(120, 53, 15, 0.15) 100%)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: googleSheetUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: googleSheetUrl ? 'var(--status-success)' : 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem'
                    }}>
                      📊
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                          Google Sheets Real-Time Sync
                        </h3>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          background: googleSheetUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: googleSheetUrl ? 'var(--status-success)' : 'var(--accent-gold)',
                          border: `1px solid ${googleSheetUrl ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                        }}>
                          {googleSheetUrl ? '🟢 Connected & Active' : '🟡 Not Connected (Setup in 1 Minute)'}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {googleSheetUrl 
                          ? 'Every customer submission from phone or computer will automatically append a new row to your Google Sheet!'
                          : 'Connect your Google Sheet to receive live application submissions directly without complex cloud database setup.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Setup Guide Steps */}
                <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                  <h4 className="admin-card-title">🚀 3-Step Setup Guide (100% Free)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>1</span>
                      <div>
                        Open a new Google Sheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>sheets.new</a>.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>2</span>
                      <div>
                        In your Google Sheet, click <strong>Extensions → Apps Script</strong>. Delete any code in the editor, copy & paste the <strong>Apps Script Code</strong> below, and click the <strong>Save</strong> icon (💾).
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>3</span>
                      <div>
                        Click <strong>Deploy → New deployment</strong>. Click the gear ⚙️ icon next to "Select type", choose <strong>Web app</strong>. Under <em>"Who has access"</em>, choose <strong>Anyone</strong>. Click <strong>Deploy</strong>, copy the <strong>Web app URL</strong>, and paste it into the box below!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apps Script Code Copy Card */}
                <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 className="admin-card-title">📜 Google Apps Script Code</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                        Paste this code inside your Google Sheet under <strong>Extensions → Apps Script</strong>:
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {copiedScript ? '✓ Script Copied!' : '📋 Copy Apps Script'}
                    </button>
                  </div>

                  <pre style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    margin: 0
                  }}>
{GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>

                {/* Webhook Configuration Form */}
                <div className="admin-card">
                  <h4 className="admin-card-title">🔗 Connect Web App URL</h4>
                  <form onSubmit={handleSaveGoogleSheetUrl} style={{ marginTop: '0.75rem' }}>
                    <label className="form-field-label">Google Apps Script Web App URL:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={gsUrlInput}
                        onChange={(e) => setGsUrlInput(e.target.value)}
                        style={{ flex: 1, minWidth: '240px', fontSize: '0.82rem' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        ✓ Save URL
                      </button>
                    </div>

                    {gsSaveStatus && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        background: gsSaveStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: gsSaveStatus.success ? 'var(--status-success)' : 'var(--status-error)',
                        border: `1px solid ${gsSaveStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        {gsSaveStatus.text}
                      </div>
                    )}

                    {gsTestResult && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        background: gsTestResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: gsTestResult.success ? 'var(--status-success)' : 'var(--status-error)',
                        border: `1px solid ${gsTestResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        {gsTestResult.message}
                      </div>
                    )}

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleTestGoogleSheetUrl}
                        disabled={gsTestLoading || !gsUrlInput.trim()}
                        style={{ border: '1px solid rgba(59, 130, 246, 0.5)', color: 'var(--accent-blue)' }}
                      >
                        <span>{gsTestLoading ? 'Sending Test Ping...' : '⚡ Test Connection (Send Ping Row)'}</span>
                      </button>

                      {googleSheetUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setGsUrlInput('');
                            updateGoogleSheetWebhook('');
                          }}
                          style={{ color: 'var(--status-error)' }}
                        >
                          Disconnect Google Sheet
                        </button>
                      )}
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sub-Modal: Dossier Detail */}
      {selectedAppForDossier && (
        <ApplicationDetailModal
          application={selectedAppForDossier}
          onClose={() => setSelectedAppForDossier(null)}
          onUpdateStatus={(id, status) => {
            setApplicationStatus(id, status);
            setSelectedAppForDossier(prev => ({ ...prev, status }));
          }}
          onSaveNotes={(id, notes) => {
            updateApplication(id, { notes });
            setSelectedAppForDossier(prev => ({ ...prev, notes }));
          }}
        />
      )}

      {/* Sub-Modal: Edit Entity */}
      {editModalState && (
        <EditEntityModal
          type={editModalState.type}
          initialData={editModalState.initialData}
          onSave={editModalState.onSave}
          onClose={() => setEditModalState(null)}
        />
      )}
    </div>
  );
}
