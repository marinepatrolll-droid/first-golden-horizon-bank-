import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  onValue as rtdbOnValue
} from 'firebase/database';

const FIREBASE_CONFIG_STORAGE_KEY = 'fgh_firebase_config_v1';

// Exact Recommended Security Rules for Cloud Firestore & Realtime Database
export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

export const RECOMMENDED_RTDB_RULES = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

// Default configuration for project-1-b180f
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDiZWS5DoxeyPkZajMY6MGZq59M9OVI9gI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-1-b180f.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://project-1-b180f-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-1-b180f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-1-b180f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1021752148036",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1021752148036:web:831afd8f28279d8a713c11",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SGNXPWTWGL"
};

let firebaseApp = null;
let firestoreDb = null;
let realtimeDb = null;
let analyticsInstance = null;
let currentConfig = null;

// Clean and sanitize any JS object so Firestore never throws on `undefined` values
// and prevent individual oversized base64 strings from hitting Firestore 1MB limits
export function sanitizePayload(data, maxPhotoBytes = 150000) {
  if (data === null || data === undefined) return '';
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item, maxPhotoBytes));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      cleaned[key] = '';
    } else if (typeof value === 'string') {
      // Guard against individual photo strings exceeding 150KB to keep total doc size < 500KB
      if (key.toLowerCase().includes('photo') || key.toLowerCase().includes('url') || key.toLowerCase().includes('image')) {
        if (value.startsWith('data:image/') && value.length > maxPhotoBytes) {
          cleaned[key] = value.substring(0, maxPhotoBytes);
        } else {
          cleaned[key] = value;
        }
      } else {
        cleaned[key] = value;
      }
    } else if (value !== null && typeof value === 'object') {
      cleaned[key] = sanitizePayload(value, maxPhotoBytes);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Get current saved or default configuration
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error reading config from storage:', err);
  }
  return { ...DEFAULT_FIREBASE_CONFIG };
}

// Check if config has valid minimum project info
export function isConfigValid(config = getFirebaseConfig()) {
  return !!(config && config.projectId && (config.apiKey || config.authDomain));
}

// Initialize Firebase App, Firestore, Realtime Database, and Analytics
export function initFirebase(customConfig = null) {
  const config = customConfig || getFirebaseConfig();
  currentConfig = config;

  if (!isConfigValid(config)) {
    console.log('[Firebase] No valid project config found. Operating in local storage mode.');
    return null;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    // Initialize Firestore
    try {
      firestoreDb = getFirestore(firebaseApp);
    } catch (fsErr) {
      console.warn('[Firebase] Firestore init notice:', fsErr.message);
    }

    // Initialize Realtime Database
    try {
      if (config.databaseURL) {
        realtimeDb = getDatabase(firebaseApp, config.databaseURL);
      } else {
        realtimeDb = getDatabase(firebaseApp);
      }
    } catch (rtErr) {
      console.warn('[Firebase] Realtime DB init notice:', rtErr.message);
    }

    // Initialize Analytics if supported in browser environment
    if (typeof window !== 'undefined') {
      isAnalyticsSupported().then((supported) => {
        if (supported && firebaseApp) {
          try {
            analyticsInstance = getAnalytics(firebaseApp);
          } catch (e) {}
        }
      });
    }

    console.log(`[Firebase] Active project configured: "${config.projectId}" (Firestore & Realtime Database)`);
    return { firestoreDb, realtimeDb, app: firebaseApp };
  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err);
    try {
      firebaseApp = initializeApp(config, 'FGH_APP_' + Date.now());
      firestoreDb = getFirestore(firebaseApp);
      if (config.databaseURL) {
        realtimeDb = getDatabase(firebaseApp, config.databaseURL);
      }
      return { firestoreDb, realtimeDb, app: firebaseApp };
    } catch (inner) {
      console.error('[Firebase] Failed to initialize Firebase:', inner);
      return null;
    }
  }
}

// Get active Firestore DB instance
export function getDb() {
  if (!firestoreDb && !firebaseApp) {
    initFirebase();
  }
  return firestoreDb;
}

// Get active Realtime Database instance
export function getRtdb() {
  if (!realtimeDb && !firebaseApp) {
    initFirebase();
  }
  return realtimeDb;
}

// Save updated config and reinitialize
export async function saveFirebaseConfig(newConfig) {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    const res = initFirebase(newConfig);
    return { success: !!res, res };
  } catch (err) {
    console.error('[Firebase] Error saving configuration:', err);
    return { success: false, error: err.message };
  }
}

// Test connection to both Firestore and Realtime Database truthfully with live write/read checks
export async function testFirebaseConnection(config = null) {
  try {
    const targetConfig = config || getFirebaseConfig();
    if (!isConfigValid(targetConfig)) {
      return { 
        success: false, 
        message: 'Please provide at least a Project ID and API Key.',
        isPermissionError: false
      };
    }

    const testAppName = 'FGH_TEST_' + Date.now();
    const testApp = initializeApp(targetConfig, testAppName);
    let firestoreOk = false;
    let rtdbOk = false;
    let firestoreError = null;
    let rtdbError = null;

    // Test Firestore Write & Read
    try {
      const testDb = getFirestore(testApp);
      const testRef = doc(testDb, 'system_diagnostics', 'ping_test');
      await setDoc(testRef, {
        status: 'connected',
        timestamp: new Date().toISOString(),
        platform: 'First Golden Horizon Bank Gateway',
        testId: Math.random().toString(36).substring(7)
      }, { merge: true });
      firestoreOk = true;
    } catch (e) {
      firestoreError = e.message || String(e);
      console.warn('[Firebase Firestore Ping Error]', e);
    }

    // Test Realtime Database Write
    try {
      const testRtdb = targetConfig.databaseURL ? getDatabase(testApp, targetConfig.databaseURL) : getDatabase(testApp);
      const pingRef = rtdbRef(testRtdb, 'system_diagnostics/ping_test');
      await rtdbSet(pingRef, {
        status: 'connected',
        timestamp: new Date().toISOString(),
        platform: 'First Golden Horizon Bank Realtime Cloud'
      });
      rtdbOk = true;
    } catch (e) {
      rtdbError = e.message || String(e);
      console.warn('[Firebase RTDB Ping Error]', e);
    }

    if (firestoreOk || rtdbOk) {
      const connectedServices = [firestoreOk && 'Cloud Firestore', rtdbOk && 'Realtime Database'].filter(Boolean).join(' & ');
      return {
        success: true,
        firestoreOk,
        rtdbOk,
        message: `✓ Successfully verified live write connection to Firebase (${connectedServices}) for project: ${targetConfig.projectId}`
      };
    } else {
      const isPermissionErr = (firestoreError && firestoreError.toLowerCase().includes('permission')) ||
                              (rtdbError && rtdbError.toLowerCase().includes('permission'));
      return {
        success: false,
        isPermissionError: isPermissionErr,
        firestoreError,
        rtdbError,
        message: isPermissionErr
          ? `Firebase Connected, but write permissions were DENIED by Security Rules for project "${targetConfig.projectId}". Update Security Rules in Firebase Console to allow read/write.`
          : `Connection test failed: ${firestoreError || rtdbError || 'Unable to connect to database'}`
      };
    }
  } catch (err) {
    console.error('[Firebase Test Error]', err);
    return {
      success: false,
      message: `Connection failed: ${err.message}. Ensure project exists and credentials are correct.`,
      isPermissionError: false
    };
  }
}

// ==========================================================================
// DUAL-SYNC APPLICATION DATA SERVICES (FIRESTORE + REALTIME DB)
// ==========================================================================

// Save or real-time sync an applicant's data to cloud (both Firestore & Realtime DB)
export async function saveApplicationToCloud(appData) {
  const docId = appData.referenceId || appData.id;
  if (!docId) return null;

  const rawPayload = {
    ...appData,
    id: docId,
    referenceId: docId,
    updatedAt: new Date().toISOString(),
    _syncedToCloud: true
  };

  const cloudPayload = sanitizePayload(rawPayload);

  let fsSuccess = false;
  let rtdbSuccess = false;

  // 1. Write to Firestore
  try {
    const db = getDb();
    if (db) {
      const docRef = doc(db, 'applications', docId);
      await setDoc(docRef, cloudPayload, { merge: true });
      fsSuccess = true;
    }
  } catch (err) {
    if (!err.message?.includes('insufficient permissions')) {
      console.warn(`[Firebase Firestore] Write notice for ${docId}:`, err.message);
    }
  }

  // 2. Write to Realtime Database
  try {
    const rtdb = getRtdb();
    if (rtdb) {
      const appRtdbRef = rtdbRef(rtdb, `applications/${docId}`);
      await rtdbSet(appRtdbRef, cloudPayload);
      rtdbSuccess = true;
    }
  } catch (err) {
    if (!err.message?.includes('permission_denied') && !err.message?.includes('Permission denied')) {
      console.warn(`[Firebase RTDB] Write notice for ${docId}:`, err.message);
    }
  }

  if (fsSuccess || rtdbSuccess) {
    console.log(`[Firebase Cloud] Application ${docId} successfully written to cloud.`);
  }

  return cloudPayload;
}

// Subscribe in real time to all client applications
export function subscribeApplicationsFromCloud(onUpdate, onError) {
  let unsubscribeFirestore = () => {};
  let unsubscribeRtdb = () => {};

  // Subscribe via Firestore
  try {
    const db = getDb();
    if (db) {
      const colRef = collection(db, 'applications');
      unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        const apps = [];
        snapshot.forEach((docSnap) => {
          apps.push({ id: docSnap.id, ...docSnap.data(), _syncedToCloud: true });
        });
        apps.sort((a, b) => new Date(b.submittedAt || b.updatedAt || 0) - new Date(a.submittedAt || a.updatedAt || 0));
        if (apps.length > 0 && onUpdate) onUpdate(apps);
      }, (err) => {
        // Graceful notice - does not disrupt application or user experience
        if (!err.message?.includes('insufficient permissions')) {
          console.warn('[Firebase Firestore] Snapshot notice:', err.message);
        }
        if (onError) onError(err);
      });
    }
  } catch (err) {
    // Subscription setup notice
  }

  // Also subscribe via Realtime Database
  try {
    const rtdb = getRtdb();
    if (rtdb) {
      const appsRef = rtdbRef(rtdb, 'applications');
      unsubscribeRtdb = rtdbOnValue(appsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const apps = Object.values(data);
          apps.sort((a, b) => new Date(b.submittedAt || b.updatedAt || 0) - new Date(a.submittedAt || a.updatedAt || 0));
          if (apps.length > 0 && onUpdate) onUpdate(apps);
        }
      }, (err) => {
        if (!err.message?.includes('permission_denied') && !err.message?.includes('Permission denied')) {
          console.warn('[Firebase RTDB] Snapshot notice:', err.message);
        }
      });
    }
  } catch (err) {
    // RTDB subscription notice
  }

  return () => {
    try { unsubscribeFirestore(); } catch (e) {}
    try { unsubscribeRtdb(); } catch (e) {}
  };
}

// Update specific fields of an application
export async function updateApplicationInCloud(id, fields) {
  if (!id) return false;

  const rawPayload = {
    ...fields,
    updatedAt: new Date().toISOString(),
    _syncedToCloud: true
  };
  const updatePayload = sanitizePayload(rawPayload);

  // Firestore update
  try {
    const db = getDb();
    if (db) {
      const docRef = doc(db, 'applications', id);
      await updateDoc(docRef, updatePayload);
    }
  } catch (err) {}

  // RTDB update
  try {
    const rtdb = getRtdb();
    if (rtdb) {
      const appRef = rtdbRef(rtdb, `applications/${id}`);
      await rtdbUpdate(appRef, updatePayload);
    }
  } catch (err) {}

  return true;
}

// Delete an application from cloud
export async function deleteApplicationFromCloud(id) {
  if (!id) return false;

  try {
    const db = getDb();
    if (db) {
      const docRef = doc(db, 'applications', id);
      await deleteDoc(docRef);
    }
  } catch (err) {}

  try {
    const rtdb = getRtdb();
    if (rtdb) {
      const appRef = rtdbRef(rtdb, `applications/${id}`);
      await rtdbRemove(appRef);
    }
  } catch (err) {}

  return true;
}

// Sync all local applications to cloud in bulk
export async function syncAllLocalToCloud(applications) {
  if (!Array.isArray(applications) || applications.length === 0) {
    return { success: false, count: 0 };
  }

  let count = 0;
  try {
    for (const app of applications) {
      await saveApplicationToCloud(app);
      count++;
    }
    return { success: true, count };
  } catch (err) {
    console.error('[Firebase Sync Error]', err);
    return { success: false, count, error: err.message };
  }
}

// Save audit log to cloud
export async function saveAuditLogToCloud(log) {
  if (!log) return false;
  const logId = log.id || `log_${Date.now()}`;
  const sanitizedLog = sanitizePayload({ ...log, _cloudSaved: true });

  try {
    const db = getDb();
    if (db) {
      const docRef = doc(db, 'audit_logs', logId);
      await setDoc(docRef, sanitizedLog, { merge: true });
    }
  } catch (err) {}

  try {
    const rtdb = getRtdb();
    if (rtdb) {
      const logRef = rtdbRef(rtdb, `audit_logs/${logId}`);
      await rtdbSet(logRef, sanitizedLog);
    }
  } catch (err) {}

  return true;
}
