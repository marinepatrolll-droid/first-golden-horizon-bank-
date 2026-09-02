import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'fgh_supabase_config_v1';
const BUCKET_NAME = 'kyc-photos';

// Default Supabase Configuration (can be updated via Admin Panel or .env)
export const DEFAULT_SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://wtvimwsieokjsxhiqgoq.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ulco7YOnlDv2KDlECAxQ9w_6KXHKtTf'
};

let supabaseClient = null;

// Retrieve saved or default configuration
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SUPABASE_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.warn('[Supabase] Error reading config from storage:', err);
  }
  return { ...DEFAULT_SUPABASE_CONFIG };
}

// Save configuration to localStorage
export function saveSupabaseConfig(config) {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    supabaseClient = null; // Reset client on config change
  } catch (err) {
    console.warn('[Supabase] Error saving config:', err);
  }
}

// Check if configuration is valid
export function isSupabaseConfigured() {
  const cfg = getSupabaseConfig();
  return !!(cfg && cfg.url && cfg.anonKey && cfg.url.startsWith('https://'));
}

// Initialize Supabase Client
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.url.startsWith('https://')) {
    return null;
  }
  try {
    supabaseClient = createClient(cfg.url, cfg.anonKey);
    return supabaseClient;
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err);
    return null;
  }
}

// Convert base64 data URL to Uint8Array Uint8Array for binary upload
function base64ToUint8Array(dataUrl) {
  const base64Str = dataUrl.split(',')[1] || dataUrl;
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

// Upload a single photo to Supabase Storage bucket 'kyc-photos' and return the public URL
export async function uploadPhotoToSupabase(base64DataUrl, filePath) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
    return base64DataUrl;
  }
  const client = getSupabaseClient();
  if (!client) return base64DataUrl;

  try {
    const contentType = base64DataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    const bytes = base64ToUint8Array(base64DataUrl);

    // Upload object to 'kyc-photos' bucket
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, {
        contentType,
        upsert: true
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error for ${filePath}:`, error.message);
      return base64DataUrl;
    }

    // Retrieve public CDN URL
    const { data: publicUrlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (publicUrlData && publicUrlData.publicUrl) {
      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn(`[Supabase Storage] Unexpected error uploading ${filePath}:`, err.message);
  }
  return base64DataUrl;
}

// Upload all KYC photo fields (selfie, idFront, idBack, cardFront, cardBack) to Supabase Storage
export async function uploadPhotosToSupabase(appData) {
  if (!appData) return appData;
  const docId = appData.referenceId || appData.id;
  if (!docId) return appData;
  if (!isSupabaseConfigured()) return appData;

  const photoFields = [
    'selfiePhotoUrl',
    'idFrontPhotoUrl',
    'idBackPhotoUrl',
    'cardFrontPhotoUrl',
    'cardBackPhotoUrl'
  ];

  const updated = { ...appData };
  for (const field of photoFields) {
    const val = appData[field];
    if (val && val.startsWith('data:image/')) {
      const ext = val.includes('image/png') ? 'png' : 'jpg';
      const filePath = `applications/${docId}/${field}.${ext}`;
      updated[field] = await uploadPhotoToSupabase(val, filePath);
    }
  }
  return updated;
}
