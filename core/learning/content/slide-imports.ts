/**
 * AUTO-GENERATED — do not edit by hand.
 * Regenerate via `npm run gen:assets`.
 * Maps web image_url strings to bundled require() handles.
 */

import React from 'react';

const Png0 = require('@assets/lessons/presentations/Splash-Springs-Lesson/10.png');
const Png1 = require('@assets/lessons/presentations/Splash-Springs-Lesson/11.png');
import Svg2 from '@assets/lessons/presentations/Splash-Springs-Lesson/12.svg';
const Png3 = require('@assets/lessons/presentations/Splash-Springs-Lesson/13.png');
const Png4 = require('@assets/lessons/presentations/Splash-Springs-Lesson/14.png');
const Png5 = require('@assets/lessons/presentations/Splash-Springs-Lesson/15.png');
const Png6 = require('@assets/lessons/presentations/Splash-Springs-Lesson/16.png');
const Png7 = require('@assets/lessons/presentations/Splash-Springs-Lesson/17.png');
const Png8 = require('@assets/lessons/presentations/Splash-Springs-Lesson/18.png');
import Svg9 from '@assets/lessons/presentations/Splash-Springs-Lesson/7.svg';
const Png10 = require('@assets/lessons/presentations/Splash-Springs-Lesson/8.png');
const Png11 = require('@assets/lessons/presentations/Splash-Springs-Lesson/9.png');

export type LessonAsset = { kind: 'svg'; component: React.FC<any> } | { kind: 'png'; source: number };

export const ASSET_MAP: Record<string, LessonAsset> = {
  "/lessons/presentations/Splash-Springs-Lesson/10.png": { kind: 'png', source: Png0 },
  "/lessons/presentations/Splash-Springs-Lesson/11.png": { kind: 'png', source: Png1 },
  "/lessons/presentations/Splash-Springs-Lesson/12.svg": { kind: 'svg', component: Svg2 },
  "/lessons/presentations/Splash-Springs-Lesson/13.png": { kind: 'png', source: Png3 },
  "/lessons/presentations/Splash-Springs-Lesson/14.png": { kind: 'png', source: Png4 },
  "/lessons/presentations/Splash-Springs-Lesson/15.png": { kind: 'png', source: Png5 },
  "/lessons/presentations/Splash-Springs-Lesson/16.png": { kind: 'png', source: Png6 },
  "/lessons/presentations/Splash-Springs-Lesson/17.png": { kind: 'png', source: Png7 },
  "/lessons/presentations/Splash-Springs-Lesson/18.png": { kind: 'png', source: Png8 },
  "/lessons/presentations/Splash-Springs-Lesson/7.svg": { kind: 'svg', component: Svg9 },
  "/lessons/presentations/Splash-Springs-Lesson/8.png": { kind: 'png', source: Png10 },
  "/lessons/presentations/Splash-Springs-Lesson/9.png": { kind: 'png', source: Png11 },
};

export function resolveAsset(webUrl: string | null | undefined): LessonAsset | null {
  if (!webUrl) return null;
  // Direct hit (most common path).
  const direct = ASSET_MAP[webUrl];
  if (direct) return direct;
  // Extension fallback: a Canva SVG export may have been replaced by
  // a compressed .png/.jpg in the bundle while the fixture URL still
  // points to .svg (or vice-versa). Try common extension swaps.
  const swaps = ['.png', '.jpg', '.svg'];
  for (const ext of swaps) {
    const swapped: string = webUrl.replace(/\.(svg|png|jpg|jpeg)$/i, ext);
    if (swapped !== webUrl && ASSET_MAP[swapped]) return ASSET_MAP[swapped];
  }
  return null;
}
