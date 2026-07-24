/**
 * Storage abstraction.
 * - SecureStore for auth tokens (encrypted, OS keychain)
 * - AsyncStorage for general KV (preferences, cached state)
 * - SQLite (separate module) for offline relational data
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SecureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

export const KV = {
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T = unknown>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      // ignore
    }
  },
};

export const StorageKeys = {
  ACTIVE_CHILD_ID: 'hr.activeChildId',
  ONBOARDING_DRAFT: 'hr.onboardingDraft',
  ACCESSIBILITY_PREFS: 'hr.accessibilityPrefs',
  SOUND_ENABLED: 'hr.soundEnabled',
  HAPTICS_ENABLED: 'hr.hapticsEnabled',
  REDUCED_MOTION: 'hr.reducedMotion',
  DAILY_GOAL_DRAFT: 'hr.dailyGoalDraft',
  EVENT_QUEUE: 'hr.eventQueue',
  SESSION: 'hr.session',
} as const;
