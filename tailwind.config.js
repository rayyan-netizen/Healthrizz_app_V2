/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './core/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Real brand palette — ported from HealthRizz-Mobile's lib/theme.ts
        // (the source of truth; distinct from the shorthand `brand.*` below).
        primary: {
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
        },
        secondary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warm: {
          DEFAULT: '#FFFBF0',
          secondary: '#FFFEF8',
          tertiary: '#FFF9E6',
        },
        ink: {
          DEFAULT: '#1F2937',
          secondary: '#374151',
          tertiary: '#6B7280',
        },
        // Shorthand aliases used by existing screens — kept for simplicity.
        brand: {
          yellow: '#FACC15',
          green: '#22C55E',
          blue: '#3B82F6',
          orange: '#F97316',
        },
        topic: {
          water: '#3B82F6',
          veg: '#22C55E',
          protein: '#F97316',
          grain: '#EAB308',
          dairy: '#FEF3C7',
        },
        node: {
          locked: '#9CA3AF',
          available: '#22C55E',
          current: '#EAB308',
          completed: '#16A34A',
        },
      },
      fontFamily: {
        nunito: ['Nunito_400Regular'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
      },
      borderRadius: {
        'kid': '24px',
        'kid-lg': '32px',
      },
    },
  },
  plugins: [],
};
