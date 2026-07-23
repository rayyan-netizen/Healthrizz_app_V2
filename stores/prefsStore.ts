/**
 * User preferences (haptics, sound, reduced motion).
 * Persisted via AsyncStorage; read at module level by helpers so call sites
 * don't need to thread an `enabled` flag.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrefsState {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  hydrated: boolean;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      soundEnabled: true,
      reducedMotion: false,
      hydrated: false,
      setHaptics: (v) => set({ hapticsEnabled: v }),
      setSound: (v) => set({ soundEnabled: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
    }),
    {
      name: 'hr.prefs',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist the hydrated flag — it's session-local
      partialize: (s) => ({
        hapticsEnabled: s.hapticsEnabled,
        soundEnabled: s.soundEnabled,
        reducedMotion: s.reducedMotion,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

/** Synchronous getter for non-React callers (haptic/speech wrappers). */
export const getPrefs = () => usePrefsStore.getState();
