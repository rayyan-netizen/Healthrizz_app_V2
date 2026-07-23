/**
 * Tracks whether onboarding has been completed on this device.
 * Stand-in for a real "does this user have a child profile" backend check —
 * Supabase is intentionally not wired into onboarding yet, so this is
 * device-local only. A fresh install (or app reinstall) will show
 * onboarding again even for a returning account; that's a known gap to
 * close once onboarding writes to the backend.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingCompleteState {
  completed: boolean;
  hydrated: boolean;
  markComplete: () => void;
}

export const useOnboardingCompleteStore = create<OnboardingCompleteState>()(
  persist(
    (set) => ({
      completed: false,
      hydrated: false,
      markComplete: () => set({ completed: true }),
    }),
    {
      name: 'hr.onboardingComplete',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
