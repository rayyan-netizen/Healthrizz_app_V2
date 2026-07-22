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
        // Match web tailwind config — kid-friendly palette
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
      },
      borderRadius: {
        'kid': '24px',
        'kid-lg': '32px',
      },
    },
  },
  plugins: [],
};
