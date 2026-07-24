/**
 * Design tokens — full faithful port of web tailwind.config.ts + tokens.ts.
 * RN uses numeric pixel values directly (no 'px' suffix).
 *
 * The web app's primary color is GOLDEN YELLOW (#FFD700) — kid-friendly warmth.
 * Secondary is vibrant green. Accent is cyan. Each Rizzler has its own scale.
 */

// =========================================================================
// PALETTE — full Tailwind 50–900 scales matching the web app
// =========================================================================

export const PRIMARY = {
  50: '#FFFEF0',
  100: '#FFFCE0',
  200: '#FFF9C2',
  300: '#FFF59D',
  400: '#FFF176',
  500: '#FFD700',
  600: '#FFC107',
  700: '#FFB300',
  800: '#FF8F00',
  900: '#FF6F00',
  950: '#E65100',
} as const;

export const SECONDARY = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
} as const;

export const ACCENT = {
  50: '#E0F7FF',
  100: '#B3EBFF',
  200: '#80DEFF',
  300: '#4DD1FF',
  400: '#26C7FF',
  500: '#00D4FF',
  600: '#00B8E6',
  700: '#0099CC',
  800: '#007AB3',
  900: '#004D80',
} as const;

export const HYDRO = {
  50: '#F0FDFF',
  100: '#E0F8FD',
  200: '#B8E6ED',
  300: '#93D5DE',
  400: '#6FC4D1',
  500: '#4DB3C4',
  600: '#3A9DB0',
  700: '#2E8394',
  800: '#26697A',
  900: '#1F5360',
} as const;

export const PHYTO = {
  50: '#F5FAF3',
  100: '#E8F5E3',
  200: '#C8E8C0',
  300: '#A8DB9D',
  400: '#8FB569',
  500: '#7BA056',
  600: '#688947',
  700: '#577239',
  800: '#465C2E',
  900: '#374825',
} as const;

export const PRO = {
  50: '#FFFEF5',
  100: '#FFFAEB',
  200: '#FFF4D1',
  300: '#FFEDB3',
  400: '#FFE591',
  500: '#F4C430',
  600: '#E0AF1C',
  700: '#C79615',
  800: '#A87D11',
  900: '#89640E',
} as const;

export const SUCCESS = {
  50: '#E6FFF5',
  500: '#00FF88',
  600: '#00E67A',
  700: '#00CC6C',
} as const;

export const WARNING = {
  50: '#FFFBE6',
  100: '#FFF6B3',
  500: '#FFD93D',
  600: '#E6C337',
} as const;

export const ERROR = {
  50: '#FFE6E9',
  500: '#FF4757',
  600: '#E63F4F',
  700: '#CC3747',
} as const;

export const BG = {
  DEFAULT: '#FFFFFF',
  secondary: '#FFFEF8',
  tertiary: '#FFF9E6',
  muted: '#F5F5F0',
  warm: '#FFFBF0',
} as const;

export const TEXT = {
  DEFAULT: '#1F2937',
  secondary: '#374151',
  tertiary: '#6B7280',
  muted: '#9CA3AF',
  inverse: '#FFFFFF',
  onYellow: '#1F2937',
  onGreen: '#FFFFFF',
} as const;

// =========================================================================
// LEGACY TOKENS — kept for compat with already-shipped components
// =========================================================================

export const SPACING = {
  NODE_SIZE: 96,
  NODE_SIZE_LARGE: 112,
  TOUCH_TARGET_MIN: 48,
  TOUCH_TARGET_LG: 56,
  TOUCH_TARGET_XL: 64,
  TOUCH_TARGET_2XL: 72,
  MAP_PADDING: 24,
  NODE_GAP: 80,
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const COLORS = {
  // Node types
  NODE_LESSON: { bg: SECONDARY[500], border: SECONDARY[600], text: '#FFFFFF' },
  NODE_QUIZ: { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF' },
  NODE_GAME: { bg: '#F97316', border: '#EA580C', text: '#FFFFFF' },
  NODE_BOSS: { bg: PRO[500], border: PRO[600], text: TEXT.DEFAULT },

  // Topics
  TOPIC_WATER: ACCENT[500],
  TOPIC_VEGETABLES: SECONDARY[500],
  TOPIC_PROTEIN: '#F97316',
  TOPIC_GRAINS: PRO[500],
  TOPIC_DAIRY: '#FEF3C7',

  // States
  STATE_LOCKED: '#9CA3AF',
  STATE_AVAILABLE: SECONDARY[500],
  STATE_CURRENT: PRIMARY[500],
  STATE_COMPLETED: SECONDARY[600],

  // Backgrounds + text (legacy aliases — prefer BG/TEXT objects)
  BACKGROUND_PRIMARY: BG.warm,
  BACKGROUND_SECONDARY: BG.DEFAULT,
  TEXT_PRIMARY: TEXT.DEFAULT,
  TEXT_SECONDARY: TEXT.tertiary,

  BRAND_YELLOW: PRIMARY[500],
  BRAND_GREEN: SECONDARY[500],
  BRAND_BLUE: ACCENT[500],
  BRAND_ORANGE: '#F97316',

  SUCCESS: SECONDARY[500],
  WARNING: WARNING[500],
  ERROR: ERROR[500],
} as const;

export const TYPOGRAPHY = {
  // Display sizes (kid-friendly larger sizes than standard tailwind defaults)
  H1: { fontSize: 32, fontWeight: '900' as const, lineHeight: 38, letterSpacing: -0.5 },
  H2: { fontSize: 24, fontWeight: '800' as const, lineHeight: 30, letterSpacing: -0.3 },
  H3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  BODY: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  BODY_BOLD: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24 },
  CAPTION: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.2 },
  NODE_TITLE: { fontSize: 14, fontWeight: '700' as const, lineHeight: 18 },
  NODE_ICON: { fontSize: 64 },
  HEADER_TITLE: { fontSize: 24, fontWeight: '700' as const },
} as const;

export const ANIMATION = {
  DURATION: {
    INSTANT: 0,
    FAST: 150,
    NORMAL: 200,
    SLOW: 300,
    CELEBRATION: 500,
  },
} as const;

export const BORDERS = {
  RADIUS: {
    XS: 4,
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    XL: 24,
    XL2: 32,
    XL3: 48,
    FULL: 9999,
  },
  WIDTH: { DEFAULT: 2, THICK: 4 },
} as const;

// =========================================================================
// SHADOWS — branded glow shadows (RN uses shadowColor + shadowOpacity, not box-shadow strings)
// =========================================================================

export const SHADOW = {
  NODE: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  CARD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  CARD_LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  MODAL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 48,
    elevation: 16,
  },
  BRAND_YELLOW: {
    shadowColor: PRIMARY[600],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  BRAND_YELLOW_LG: {
    shadowColor: PRIMARY[600],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 14,
  },
  BRAND_GREEN: {
    shadowColor: SECONDARY[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  GLOW_PRIMARY: {
    shadowColor: PRIMARY[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// =========================================================================
// GRADIENTS — used with expo-linear-gradient
// =========================================================================

export const GRADIENT = {
  /** App background — soft yellow-green gradient (login, onboarding) */
  appBackground: ['#FFFEF0', '#F0FDF4', '#FFFCE0'] as const,
  /** Primary button — yellow-to-deep-yellow */
  primaryButton: [PRIMARY[400], PRIMARY[500], PRIMARY[600]] as const,
  /** Secondary button — green */
  secondaryButton: [SECONDARY[400], SECONDARY[500], SECONDARY[600]] as const,
  /** Accent button — cyan */
  accentButton: [ACCENT[400], ACCENT[500], ACCENT[600]] as const,
  /** Hydro Rizzler hero */
  hydro: [HYDRO[200], HYDRO[300], HYDRO[400]] as const,
  /** Phyto Rizzler hero */
  phyto: [PHYTO[200], PHYTO[300], PHYTO[400]] as const,
  /** Pro Rizzler hero */
  pro: [PRO[300], PRO[400], PRO[500]] as const,
} as const;

export const FONT = {
  brand: 'Nunito_800ExtraBold',
  heading: 'Nunito_700Bold',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_600SemiBold',
} as const;

// =========================================================================
// HELPERS
// =========================================================================

export function getNodeColorByType(
  type: 'lesson' | 'quiz' | 'game' | 'boss'
): { bg: string; border: string; text: string } {
  switch (type) {
    case 'lesson':
      return COLORS.NODE_LESSON;
    case 'quiz':
      return COLORS.NODE_QUIZ;
    case 'game':
      return COLORS.NODE_GAME;
    case 'boss':
      return COLORS.NODE_BOSS;
  }
}

export function getTopicColor(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('water') || t.includes('hydro')) return COLORS.TOPIC_WATER;
  if (t.includes('veg') || t.includes('phyto')) return COLORS.TOPIC_VEGETABLES;
  if (t.includes('protein') || t.includes('pro')) return COLORS.TOPIC_PROTEIN;
  if (t.includes('grain') || t.includes('carb')) return COLORS.TOPIC_GRAINS;
  if (t.includes('dairy') || t.includes('fat')) return COLORS.TOPIC_DAIRY;
  return COLORS.BRAND_BLUE;
}

export function topicGradient(topic: string): readonly [string, string, string] {
  const t = topic.toLowerCase();
  if (t.includes('water') || t.includes('hydro')) return GRADIENT.hydro;
  if (t.includes('veg') || t.includes('phyto')) return GRADIENT.phyto;
  if (t.includes('protein') || t.includes('pro')) return GRADIENT.pro;
  if (t.includes('grain') || t.includes('carb')) return [PRO[200], PRO[300], PRO[400]] as const;
  return [HYDRO[200], HYDRO[300], HYDRO[400]] as const;
}
