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
    /**
     * Per-island action-pose Rizzler mascots (match canonicalSessions[i].rizzlerImage).
     * Only Splash Springs' pose is bundled so far — add the rest alongside
     * their sessions' content.
     */
    rizzlers: {
      hydroPool: require('@assets/brand/mascots/rizzler-hydro-pool.png'),
    },
    /** Walking companion characters (selected during onboarding; defaults to apple) */
    companions: {
      apple: require('@assets/brand/mascots/companion-apple.jpg'),
      banana: require('@assets/brand/mascots/companion-banana.jpg'),
    },
  },
  map: {
    overworld: require('@assets/map/backgrounds/nutrition-island-map.png'),
    /** Only water's submap background is bundled so far. */
    submap: {
      water: require('@assets/map/backgrounds/water-submap.png'),
    },
  },
} as const;

/** Falls back to the water background — only that submap is bundled so far. */
export function submapFor(topicKey: string): number {
  const map = ASSETS.map.submap as Record<string, number>;
  return map[topicKey] ?? map.water;
}

/**
 * Per-topic Rizzler mascot for the submap top-left corner.
 * Only 'water' is mapped so far — add entries as other sessions are ported.
 */
export function rizzlerForTopic(topicKey: string) {
  if (topicKey === 'water') return ASSETS.brand.rizzlers.hydroPool;
  return ASSETS.brand.mascots.main;
}

/**
 * Resolve a web mascot path (e.g. '/brand/mascots/Hydro Rizzler_1.png')
 * to the bundled mobile mascot.
 */
export function mascotForPath(webPath: string | null | undefined) {
  if (!webPath) return ASSETS.brand.mascots.main;
  const p = webPath.toLowerCase();
  if (p.includes('hydro')) return ASSETS.brand.mascots.hydro;
  if (p.includes('phyto')) return ASSETS.brand.mascots.phyto;
  if (p.includes('pro rizzler') || p.includes('pro_rizzler')) return ASSETS.brand.mascots.pro;
  return ASSETS.brand.mascots.main;
}

/** Zone icon emoji per topic (used in slide zone tab). Generic — works for all 9 sessions. */
export function zoneIconFor(zoneLabel: string | null | undefined): string {
  if (!zoneLabel) return '⭐';
  const z = zoneLabel.toLowerCase();
  if (z.includes('splash') || z.includes('water')) return '💧';
  if (z.includes('rainbow') || z.includes('garden') || z.includes('phyto')) return '🌈';
  if (z.includes('peak') || z.includes('protein')) return '💪';
  if (z.includes('flour') || z.includes('field') || z.includes('grain')) return '🌾';
  if (z.includes('forest') || z.includes('fat')) return '🥑';
  if (z.includes('plate') || z.includes('plaza')) return '🍽️';
  if (z.includes('aisle') || z.includes('label')) return '📋';
  if (z.includes('microbe') || z.includes('mine')) return '🦠';
  if (z.includes('habit') || z.includes('haven')) return '⏰';
  return '⭐';
}
