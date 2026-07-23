/**
 * Supabase client for React Native.
 * - Polyfills URL/structuredClone via react-native-url-polyfill
 * - Persists session in expo-secure-store (encrypted)
 * - Disables URL session detection (RN doesn't have window.location)
 */
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '@lib/env';

const SECURE_STORE_OPTIONS = {
  keychainService: 'healthrizz.supabase.session',
};

const ExpoSecureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS),
  removeItem: (key: string) =>
    SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS),
};

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    auth: {
      storage: ExpoSecureStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}

export const supabase = getSupabase();
