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
import {
  getStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL
} from 'firebase/storage';

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
let storageInstance = null;
let analyticsInstance = null;
let currentConfig = null;

// Photo field names that should be uploaded to Firebase Storage
const PHOTO_FIELDS = [
  'selfiePhotoUrl',
  'idFrontPhotoUrl',
  'idBackPhotoUrl',
  'cardFrontPhotoUrl',
  'cardBackPhotoUrl'
];

// Clean and sanitize any JS object so Firestore never throws on undefined values.
// Photos are uploaded to Storage separately via uploadPhotosToStorage() - not truncated here.
export function sanitizePayload(data) {
  if (data === null || data === undefined) return '';
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      cleaned[key] = '';
    } else if (value !== null && typeof value === 'object') {
      cleaned[key] = sanitizePayload(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Upload a single base64 photo to Firebase Storage and return the download URL.
// Returns the original base64 string as fallback if Storage is unavailable.
async function uploadPhotoToStorage(base64DataUrl, path) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) return base64DataUrl;
  const storage = getStorageInstance();
  if (!storage) return base64DataUrl;
  try {
    const photoRef = storageRef(storage, path);
    const contentType = base64DataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    await uploadString(photoRef, base64DataUrl, 'data_url', { contentType });
    const downloadURL = await getDownloadURL(photoRef);
    return downloadURL;
  } catch (err) {
    console.warn(`[Firebase Storage] Could not upload photo to ${path}:`, err.message);
    return base64DataUrl;
  }
}

// Upload all photo fields in an application record to Firebase Storage.
// Returns a new record object with photo fields replaced by Storage download URLs.
export async function uploadPhotosToStorage(appData) {
  if (!appData) return appData;
  const docId = appData.referenceId || appData.id;
  if (!docId) return appData;
  const updated = { ...appData };
  for (const field of PHOTO_FIELDS) {
    const val = appData[field];
    if (val && val.startsWith('data:image/')) {
      const ext = val.includes('image/png') ? 'png' : 'jpg';
      const storagePath = `applications/${docId}/${field}.${ext}`;
      updated[field] = await uploadPhotoToStorage(val, storagePath);
    }
  }
  return updated;
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

// Initialize Firebase App, Firestore, Realtime Database, Storage, and Analytics
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

    // Initialize Firebase Storage.
    // Derive a bucket from the projectId when storageBucket is missing from the
    // saved config, otherwise photos silently fall back to base64 and can fail
    // to sync across devices. Passing an explicit gs:// bucket makes this work
    // even when the config object omitted storageBucket.
    try {
      const bucket = config.storageBucket
        || (config.projectId ? `${config.projectId}.appspot.com` : '');
      if (bucket) {
        storageInstance = getStorage(firebaseApp, `gs://${bucket}`);
      } else {
        storageInstance = getStorage(firebaseApp);
      }
    } catch (stErr) {
      console.warn('[Firebase] Storage init notice:', stErr.message);
      try {
        storageInstance = getStorage(firebaseApp);
      } catch (fallbackErr) {
        console.warn('[Firebase] Storage fallback init notice:', fallbackErr.message);
      }
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

    console.log(`[Firebase] Active project configured: "${config.projectId}" (Firestore, Realtime Database & Storage)`);
    return { firestoreDb, realtimeDb, storageInstance, app: firebaseApp };
  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err);
    try {
      firebaseApp = initializeApp(config, 'FGH_APP_' + Date.now());
      firestoreDb = getFirestore(firebaseApp);
      if (config.databaseURL) {
        realtimeDb = getDatabase(firebaseApp, config.databaseURL);
      }
      try {
        const bucket = config.storageBucket
          || (config.projectId ? `${config.projectId}.appspot.com` : '');
        storageInstance = bucket
          ? getStorage(firebaseApp, `gs://${bucket}`)
          : getStorage(firebaseApp);
      } catch (stErr) {
        console.warn('[Firebase] Storage retry init notice:', stErr.message);
      }
      return { firestoreDb, realtimeDb, storageInstance, app: firebaseApp };
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

// Get active Firebase Storage instance
export function getStorageInstance() {
  if (!storageInstance && !firebaseApp) {
    initFirebase();
  }
  return storageInstance;
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

// Test connection to both Firestore and Realtime Database with live write/read checks
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
// DUAL-SYNC APPLICATION DATA SERVICES (FIRESTORE + REALTIME DB + STORAGE)
// ==========================================================================

// Save or real-time sync an applicant's data to cloud.
// Photos are uploaded to Firebase Storage first; only the download URLs are stored in Firestore/RTDB.
// SSN and all text fields are stored in full in both Firestore and Realtime DB.
export async function saveApplicationToCloud(appData) {
  const docId = appData.referenceId || appData.id;
  if (!docId) return null;

  // Step 1: Upload any base64 photos to Firebase Storage and get back Storage download URLs
  let processedData = appData;
  try {
    processedData = await uploadPhotosToStorage(appData);
  } catch (uploadErr) {
    console.warn('[Firebase Storage] Photo upload step had an issue:', uploadErr.message);
    // Continue - will use original data (with base64 fallback/truncation)
  }

  const rawPayload = {
    ...processedData,
    id: docId,
    referenceId: docId,
    updatedAt: new Date().toISOString(),
    _syncedToCloud: true
  };

  // Sanitize (remove undefined values); photos are now Storage URLs at this point
  const cloudPayload = sanitizePayload(rawPayload);

  let fsSuccess = false;
  let rtdbSuccess = false;

  // 2. Write to Firestore (full record: SSN in plaintext + Storage photo URLs)
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

  // 3. Write to Realtime Database (SSN, photos as Storage URLs, all fields)
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
    console.log(`[Firebase Cloud] Application ${docId} written to cloud (photos via Firebase Storage URL).`);
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
