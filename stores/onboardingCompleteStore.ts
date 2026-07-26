/**
 * Tracks whether onboarding has been completed on this device.
 * Device-local by itself, but authStore's syncChildId() re-derives it from
 * Supabase on every sign-in — if the signed-in account already has a
 * `children` row, this gets flipped back to true even on a fresh install,
 * so onboarding isn't repeated for a returning account.
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
