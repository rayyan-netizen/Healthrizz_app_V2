/**
 * Persisted companion (walking buddy) choice from onboarding.
 * Mirrors web's `avatar_config.base` field. Defaults to 'apple'.
 */
import { create } from 'zustand';
import { KV } from '@lib/storage';

export type Companion = 'apple' | 'banana';

const STORAGE_KEY = 'hr.companion';

interface CompanionState {
  companion: Companion;
  hydrated: boolean;
  setCompanion: (c: Companion) => void;
  hydrate: () => Promise<void>;
}

export const useCompanionStore = create<CompanionState>((set) => ({
  companion: 'apple',
  hydrated: false,
  setCompanion: (c) => {
    set({ companion: c });
    void KV.set(STORAGE_KEY, c);
  },
  hydrate: async () => {
    const stored = await KV.get<Companion>(STORAGE_KEY);
    if (stored === 'apple' || stored === 'banana') {
      set({ companion: stored, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
}));
