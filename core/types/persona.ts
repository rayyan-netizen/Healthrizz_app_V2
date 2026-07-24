/**
 * Persona, onboarding, and goal types.
 * Ported from web src/domains/onboarding/onboarding.ts.
 */

export type PrimaryLane =
  | 'safety'
  | 'selectivity'
  | 'sugar_ultra_processed'
  | 'performance'
  | 'gi_hydration'
  | 'typical';

export type SecondaryTag =
  | 'texture_sensitivity'
  | 'low_fruit_veg_exposure'
  | 'low_water_routine'
  | 'routine_rigidity'
  | 'distracted_eating'
  | 'emotional_reward_snacking'
  | 'sleep_stressed_schedule_overload';

export type PersonaId =
  | 'texture_troubler'
  | 'swap_seeker'
  | 'mini_muscle'
  | 'sensory_star'
  | 'gut_guardian'
  | 'sugar_sprinter'
  | 'dry_dino'
  | 'balanced_buddy'
  | 'rushed_muncher'
  | 'lunchbox_influencer'
  | 'anxious_eater';

export type GoalType = 'hydro_rizzler' | 'phyto_rizzler' | 'pro_rizzler';

export interface LaneAndTagsResult {
  primaryLane: PrimaryLane;
  secondaryTags: SecondaryTag[];
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'multi_select' | 'slider';
  options?: Array<{
    value: string;
    label: string;
    persona_weight?: Record<PersonaId, number>;
  }>;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  required: boolean;
  category: 'eating_habits' | 'activity' | 'preferences' | 'challenges';
}

export interface OnboardingResponse {
  question_id: string;
  response: string | number | string[];
  response_data?: Record<string, unknown>;
}

export interface OnboardingData {
  nickname: string;
  avatar_url?: string;
  responses: OnboardingResponse[];
  privacy_accepted: boolean;
  privacy_accepted_at: string;
}

export interface PersonaMatch {
  persona_id: PersonaId;
  score: number;
  is_primary: boolean;
}

export interface GoalSuggestion {
  goal_type: GoalType;
  title: string;
  description: string;
  persona_reason: string;
}

export interface ChildProfile {
  id: string;
  parent_id: string;
  nickname: string;
  avatar_url?: string;
  primary_persona: PersonaId;
  secondary_persona?: PersonaId;
  active_goals: GoalType[];
  stars_earned: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const PERSONA_DISPLAY: Record<
  PersonaId,
  { title: string; tagline: string; emoji: string }
> = {
  texture_troubler: {
    title: 'Texture Explorer',
    tagline: 'Building food bravery, one bite at a time',
    emoji: '🌟',
  },
  swap_seeker: {
    title: 'Swap Seeker',
    tagline: 'Smart swaps for sensitive tummies',
    emoji: '🔄',
  },
  mini_muscle: {
    title: 'Mini Muscle',
    tagline: 'Power up with protein and play',
    emoji: '💪',
  },
  sensory_star: {
    title: 'Sensory Star',
    tagline: 'Routines, colors, and comfort foods',
    emoji: '✨',
  },
  gut_guardian: {
    title: 'Gut Guardian',
    tagline: 'Fiber, hydration, and happy tummies',
    emoji: '🛡️',
  },
  sugar_sprinter: {
    title: 'Sugar Sprinter',
    tagline: 'Steady energy beats sugar crashes',
    emoji: '⚡',
  },
  dry_dino: {
    title: 'Hydro Hero',
    tagline: 'Water rituals for big focus',
    emoji: '💧',
  },
  balanced_buddy: {
    title: 'Balanced Buddy',
    tagline: 'Already crushing healthy habits',
    emoji: '🌈',
  },
  rushed_muncher: {
    title: 'Mindful Muncher',
    tagline: 'Slow down, fuel up',
    emoji: '🍎',
  },
  lunchbox_influencer: {
    title: 'Lunchbox Leader',
    tagline: 'Cool, healthy, and confident',
    emoji: '🥪',
  },
  anxious_eater: {
    title: 'Calm Eater',
    tagline: 'Low-pressure food adventures',
    emoji: '🌸',
  },
};
