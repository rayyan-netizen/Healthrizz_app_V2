/**
 * Canonical Lesson Order (Source of Truth) — LOCKED
 * Nutrition Island – curriculum-aligned 9-session learning order.
 *
 * Order is visible and suggested, not enforced. All content remains explorable.
 * Language: "session", "practice", "explore" — avoid "level", "stage", "locked".
 */

export type TopicKey =
  | 'water'
  | 'phytonutrients'
  | 'protein'
  | 'carbohydrates'
  | 'fats'
  | 'balanced-nutrition'
  | 'reading-labels'
  | 'fiber-prebiotics-probiotics'
  | 'recap-habits';

export type RizzlerId = 'hydro' | 'phyto' | 'pro' | 'health';

export interface CanonicalSessionConfig {
  /** 1–9 */
  sessionNumber: number;
  /** Kid-friendly title (6–11). Use in map UI. */
  sessionTitle: string;
  /** Short subtext for cards/tooltips. */
  subtext: string;
  /** Used for routing/content lookup */
  topicKey: TopicKey;
  /** True for Session 6 (Putting it all together) and Session 9 (What you'll keep doing) */
  isMilestone: boolean;
  /** True for Session 9 only */
  isRecap: boolean;
  /** Default true; do not lock. */
  isAvailable: boolean;
  /** Emoji or icon for hub */
  icon: string;
  /** Hex color for hub/detail UI */
  color: string;
  /** Hub position (%). For suggested grouping only. */
  position: { x: number; y: number };
  /** Which rizzler character guides this island */
  rizzler: RizzlerId;
  /** Public path to this island's specific rizzler image */
  rizzlerImage: string;
}

/** Default start session. UI uses this; later overridable by recommendedNextSession from onboarding. */
export const DEFAULT_START_SESSION = 1;

/**
 * Authoritative 9-session order. Single source of truth.
 * Kid-friendly copy set (6–11): short, positive, no jargon, no test vibes.
 */
export const CANONICAL_SESSIONS: CanonicalSessionConfig[] = [
  {
    sessionNumber: 1,
    sessionTitle: 'Splash Springs',
    subtext: 'Helps your body stay refreshed',
    topicKey: 'water',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '💧',
    color: '#2196F3',
    position: { x: 6.6, y: 44.7 },
    rizzler: 'hydro',
    rizzlerImage: '/brand/mascots/hydro-pool.png',
  },
  {
    sessionNumber: 2,
    sessionTitle: 'Rainbow Garden',
    subtext: 'Helps your body stay strong and colorful',
    topicKey: 'phytonutrients',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '🌈',
    color: '#4CAF50',
    position: { x: 23.4, y: 24.7 },
    rizzler: 'phyto',
    rizzlerImage: '/brand/mascots/phyto-sword.png',
  },
  {
    sessionNumber: 3,
    sessionTitle: 'Protein Peaks',
    subtext: 'Helps your muscles grow strong',
    topicKey: 'protein',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '💪',
    color: '#E91E63',
    position: { x: 64.5, y: 24.7 },
    rizzler: 'pro',
    rizzlerImage: '/brand/mascots/pro-football.png',
  },
  {
    sessionNumber: 4,
    sessionTitle: 'Flour Fields',
    subtext: 'Gives your body energy to play',
    topicKey: 'carbohydrates',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '🌾',
    color: '#FF9800',
    position: { x: 46.5, y: 21.5 },
    rizzler: 'health',
    rizzlerImage: '/brand/mascots/health-skating.png',
  },
  {
    sessionNumber: 5,
    sessionTitle: 'Fats Forest',
    subtext: 'Helps your body and brain work well',
    topicKey: 'fats',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '🥑',
    color: '#8BC34A',
    position: { x: 85, y: 30.6 },
    rizzler: 'health',
    rizzlerImage: '/brand/mascots/health-rizzler.png',
  },
  {
    sessionNumber: 6,
    sessionTitle: 'Plate Plaza',
    subtext: 'Putting it all together!',
    topicKey: 'balanced-nutrition',
    isMilestone: true,
    isRecap: false,
    isAvailable: true,
    icon: '🍽️',
    color: '#00BCD4',
    position: { x: 48.6, y: 61.4 },
    rizzler: 'phyto',
    rizzlerImage: '/brand/mascots/phyto-tennis.png',
  },
  {
    sessionNumber: 7,
    sessionTitle: 'Aisle Adventures',
    subtext: 'Learn what\'s inside your food',
    topicKey: 'reading-labels',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '📋',
    color: '#9C27B0',
    position: { x: 25.6, y: 67.2 },
    rizzler: 'phyto',
    rizzlerImage: '/brand/mascots/phyto-running.png',
  },
  {
    sessionNumber: 8,
    sessionTitle: 'Microbe Mines',
    subtext: 'Helps your tummy feel good',
    topicKey: 'fiber-prebiotics-probiotics',
    isMilestone: false,
    isRecap: false,
    isAvailable: true,
    icon: '🦠',
    color: '#607D8B',
    position: { x: 70.5, y: 57.9 },
    rizzler: 'health',
    rizzlerImage: '/brand/mascots/health-rizzler.png',
  },
  {
    sessionNumber: 9,
    sessionTitle: 'Habit Haven',
    subtext: 'What you\'ll keep doing every day',
    topicKey: 'recap-habits',
    isMilestone: true,
    isRecap: true,
    isAvailable: true,
    icon: '⭐',
    color: '#FFC107',
    position: { x: 87.9, y: 69.1 },
    rizzler: 'hydro',
    rizzlerImage: '/brand/mascots/hydro-standing.png',
  },
];

export function getCanonicalSessionByNumber(n: number): CanonicalSessionConfig | undefined {
  return CANONICAL_SESSIONS.find((s) => s.sessionNumber === n);
}

export function getCanonicalSessionByTopicKey(key: TopicKey): CanonicalSessionConfig | undefined {
  return CANONICAL_SESSIONS.find((s) => s.topicKey === key);
}

export function getAllCanonicalSessions(): CanonicalSessionConfig[] {
  return [...CANONICAL_SESSIONS];
}

/**
 * Recommended session to start with. Default: Session 1 (Water).
 * Future: driven by onboarding; UI consumes this. No logic sets it yet.
 */
export function getRecommendedStartSession(): number {
  return DEFAULT_START_SESSION;
}
