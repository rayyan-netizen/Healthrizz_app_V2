/**
 * Tracks the Supabase `children` row created for this device at onboarding
 * completion. child_map_progress writes are keyed off this id.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChildState {
  childId: string | null;
  setChildId: (id: string | null) => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set) => ({
      childId: null,
      setChildId: (id) => set({ childId: id }),
    }),
    {
      name: 'hr.childId',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
