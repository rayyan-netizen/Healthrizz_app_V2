import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@core/supabase/client';

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

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, initializing: false });
  });

  supabase.auth.onAuthStateChange((event, session) => {
    set({ session });
    if (event === 'SIGNED_IN' && session) {
      ensureProfile(session.user.id, session.user.email);
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
      return { error: null, needsEmailConfirmation: !data.session };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
});
