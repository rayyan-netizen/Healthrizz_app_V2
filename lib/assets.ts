/**
 * Local asset registry — bundled images.
 * Centralizes `require()` paths so screens just import a key.
 */

export const ASSETS = {
  brand: {
    mascots: {
      main: require('@assets/brand/mascots/main.png'),
      hydro: require('@assets/brand/mascots/hydro.png'),
      phyto: require('@assets/brand/mascots/phyto.png'),
      pro: require('@assets/brand/mascots/pro.png'),
    },
    /** Walking companion characters (selected during onboarding; defaults to apple) */
    companions: {
      apple: require('@assets/brand/mascots/companion-apple.jpg'),
      banana: require('@assets/brand/mascots/companion-banana.jpg'),
    },
  },
  map: {
    overworld: require('@assets/map/backgrounds/nutrition-island-map.png'),
  },
} as const;
