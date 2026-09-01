// Lightweight IndexedDB & In-Memory Photo Storage for high-reliability KYC image preservation
const DB_NAME = 'FGH_PhotoStore_v1';
const STORE_NAME = 'photos';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

const memoryStore = {};

export const photoStore = {
  savePhoto: async (refId, fieldName, dataUrl) => {
    if (!refId || !fieldName || !dataUrl) return;
    const key = `${refId}_${fieldName}`;
    memoryStore[key] = dataUrl;
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(dataUrl, key);
      }
    } catch (e) {
      console.warn('[PhotoStore] IndexedDB save notice:', e);
    }
  },

  getPhoto: (appIdOrRefId, fieldName) => {
    if (!appIdOrRefId || !fieldName) return null;
    const key = `${appIdOrRefId}_${fieldName}`;
    if (memoryStore[key]) return memoryStore[key];
    return null;
  },

  loadAllToMemory: async () => {
    try {
      const db = await getDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          memoryStore[cursor.key] = cursor.value;
          cursor.continue();
        }
      };
    } catch (e) {}
  }
};

// Auto-load saved IndexedDB photos into memory cache on boot
if (typeof window !== 'undefined') {
  photoStore.loadAllToMemory();
}
