/**
 * Zustand store for in-flight onboarding state.
 * Resets when child profile is created or user signs out.
 */
import { create } from 'zustand';
import type { OnboardingResponse, GoalType } from '@core/types/persona';

export type Companion = 'apple' | 'banana';

export interface ConsentRecord {
  agreed: boolean;
  privacyPolicyVersion: string;
  termsVersion: string;
  consentedAt: string; // ISO timestamp
}

interface OnboardingState {
  nickname: string;
  age: number | null;
  companion: Companion;
  privacyAccepted: boolean;
  consent: ConsentRecord | null;
  responses: OnboardingResponse[];
  selectedGoals: GoalType[];

  setNickname: (n: string) => void;
  setAge: (a: number) => void;
  setCompanion: (c: Companion) => void;
  acceptPrivacy: () => void;
  setConsent: (c: ConsentRecord) => void;
  setResponse: (
    questionId: string,
    response: string | number | string[]
  ) => void;
  setGoals: (g: GoalType[]) => void;
  reset: () => void;
}

const initial = {
  nickname: '',
  age: null as number | null,
  companion: 'apple' as Companion,
  privacyAccepted: false,
  consent: null as ConsentRecord | null,
  responses: [] as OnboardingResponse[],
  selectedGoals: [] as GoalType[],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setNickname: (n) => set({ nickname: n }),
  setAge: (a) => set({ age: a }),
  setCompanion: (c) => set({ companion: c }),
  acceptPrivacy: () => set({ privacyAccepted: true }),
  setConsent: (c) => set({ consent: c, privacyAccepted: c.agreed }),
  setResponse: (questionId, response) =>
    set((s) => {
      const others = s.responses.filter((r) => r.question_id !== questionId);
      return { responses: [...others, { question_id: questionId, response }] };
    }),
  setGoals: (g) => set({ selectedGoals: g }),
  reset: () => set(initial),
}));
