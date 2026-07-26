import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@core/supabase/client';
import { useOnboardingCompleteStore } from '@stores/onboardingCompleteStore';
import { useChildStore } from '@stores/childStore';

interface AuthState {
  session: Session | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

/**
 * No DB trigger creates a `profiles` row on signup (checked all migrations —
 * none exist), so the client has to do it. Runs on every SIGNED_IN event,
 * upsert-keyed on id, so it's a no-op once the row already exists.
 */
async function ensureProfile(userId: string, email: string | undefined) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, email }, { onConflict: 'id' });
  if (error) {
    console.warn('Failed to ensure profile row:', error.message);
  }
}

/**
 * childStore's childId is device-local (AsyncStorage) and never cleared on
 * sign-out, so it "survives" logout/login by accident on the same device —
 * but nothing re-derives it from the account on a fresh install, a
 * different device, or after switching accounts on one device. Re-sync it
 * from the server on every sign-in / session restore instead of only ever
 * setting it once at onboarding completion (see onboarding/persona.tsx).
 *
 * If a child is found, this account has already onboarded, so also mark
 * onboarding complete — otherwise app/index.tsx would still force a second
 * onboarding pass (and a duplicate `children` row) despite finding the
 * existing one here.
 */
async function syncChildId(userId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('Failed to sync child id:', error.message);
    return;
  }
  useChildStore.getState().setChildId(data?.id ?? null);
  if (data) {
    useOnboardingCompleteStore.setState({ completed: true });
  }
}

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, initializing: false });
    if (data.session) {
      void syncChildId(data.session.user.id);
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    set({ session });
    if (event === 'SIGNED_IN' && session) {
      ensureProfile(session.user.id, session.user.email);
      void syncChildId(session.user.id);
    }
  });

  return {
    session: null,
    initializing: true,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message, needsEmailConfirmation: false };
      // A brand-new account hasn't onboarded, regardless of whatever a
      // previous account on this device left behind — the completion flag
      // is device-local, not account-scoped (see onboardingCompleteStore).
      useOnboardingCompleteStore.setState({ completed: false });
      return { error: null, needsEmailConfirmation: !data.session };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
});
