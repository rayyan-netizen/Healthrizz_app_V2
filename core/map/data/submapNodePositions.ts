/**
 * Sub-map node positions per topic
 * Each topic has its own Learn, Quiz, Game positions (x, y as % of container)
 * Order: [Learn, Quiz, Game]
 */

import type { TopicKey } from './canonicalSessions';

export type NodePositions = readonly [
  { x: number; y: number }, // Learn
  { x: number; y: number }, // Quiz
  { x: number; y: number }, // Game
];

const DEFAULT_POSITIONS: NodePositions = [
  { x: 25, y: 60 },  // Learn - left
  { x: 50, y: 30 },  // Quiz - top center
  { x: 75, y: 60 },  // Game - right
];

/**
 * Per-topic node positions for submap backgrounds.
 * Customize each topic to align with its background image.
 */
export const SUBMAP_NODE_POSITIONS: Partial<Record<TopicKey, NodePositions>> = {
  water: [
    { x: 17.9, y: 57 },  // Left - near waterfall base (Learn)
    { x: 59.6, y: 48 },  // Center-left - in river (Quiz)
    { x: 75, y: 25 },    // Right - upper river path (Game)
  ],
  phytonutrients: [
    { x: 14, y: 68.7 },    // Learn - lower left
    { x: 60.5, y: 52 },    // Quiz - top center
    { x: 77.4, y: 26.7 },    // Game - right
  ],
  protein: [
    { x: 20, y: 72 },   // Learn - bottom-left (tents & gym equipment)
    { x: 47, y: 40 },   // Quiz - middle (weightlifting platform)
    { x: 70, y: 17 },   // Game - top (glowing barbell peak)
  ],
  carbohydrates: [
    { x: 25, y: 68 },   // Learn - water mill & barn (lower-left)
    { x: 50, y: 45 },   // Quiz - central threshing hub (mid-left)
    { x: 73, y: 19 },   // Game - windmill plateau (upper-right)
  ],
  fats: [
    { x: 24, y: 68 },   // Learn - bottom-left (avocados, coconuts, seeds)
    { x: 54.5, y: 46 },   // Quiz - center-right (olives, nuts, barrels)
    { x: 72.5, y: 12 },   // Game - top-right (elevated island, fish statue)
  ],
  'balanced-nutrition': [
    { x: 24, y: 67 },   // Learn - lower-left (outdoor kitchen)
    { x: 31.5, y: 28 },   // Quiz - lower-right (market stalls)
    { x: 69, y: 25 },   // Game - upper-right (library/elevated study area)
  ],
  'reading-labels': [
    { x: 19.5, y: 65 },   // Learn - center (Nutrition Facts desk)
    { x: 47, y: 43 },   // Quiz - lower-left (fresh produce section)
    { x: 74, y: 18 },   // Game - upper-right (elevated checkout/health monitors)
  ],
  'fiber-prebiotics-probiotics': DEFAULT_POSITIONS,
  'recap-habits': [
    { x: 27, y: 65 },   // Learn - bottom-left (yoga platforms)
    { x: 50, y: 40 },   // Quiz - top-left (forested exercise area)
    { x: 74, y: 15 },   // Game - top-right (elevated platform, telescope & calendar)
  ],
};

export function getSubmapNodePositions(topicKey: TopicKey | string): NodePositions {
  return SUBMAP_NODE_POSITIONS[topicKey as TopicKey] ?? DEFAULT_POSITIONS;
}
