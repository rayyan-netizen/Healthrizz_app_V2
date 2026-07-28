/**
 * Island -> signature recipe mapping, one per island, in curriculum order.
 * Ported from HealthRizz-Mobile's core/recipes/data/island-recipes.ts, trimmed
 * to what V2 actually has: no bundled recipe artwork yet (source SVGs are
 * multi-MB raster exports, not worth bundling for a first pass) and no coin
 * economy, so these use an emoji hero and unlock by completing the island's
 * game node instead of being purchased.
 */
import { CANONICAL_SESSIONS, type TopicKey } from '@core/map/data/canonicalSessions';

export interface IslandRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  topicKey: TopicKey;
  islandName: string;
}

const RECIPE_BY_TOPIC: Record<TopicKey, { id: string; title: string; description: string; emoji: string }> = {
  water: {
    id: 'water-splash-springs',
    title: 'Health Rizz Soda',
    description: 'Bubbly sparkling water with fresh lemon and a little sweetener — like soda, but you made it!',
    emoji: '🫧',
  },
  phytonutrients: {
    id: 'phyto-rainbow-garden',
    title: 'Rainbow Berry Parfait',
    description: 'Layers of coconut yogurt, strawberries, and blueberries — top with granola for crunch.',
    emoji: '🌈',
  },
  protein: {
    id: 'protein-peaks',
    title: 'Chicken Parm Meatballs',
    description: 'Savory chicken meatballs baked with sauce and Parmesan — packed with protein and big flavor.',
    emoji: '💪',
  },
  carbohydrates: {
    id: 'carb-flour-fields',
    title: 'Health Rizz Pizza',
    description: 'Quick personal pizza on a crispy tortilla with marinara and melty cheese — bake until golden.',
    emoji: '🍕',
  },
  fats: {
    id: 'fats-forest',
    title: 'Avocado Toast',
    description: 'Toasty bread spread with mashed avocado, citrus, and a drizzle of good olive oil.',
    emoji: '🥑',
  },
  'balanced-nutrition': {
    id: 'balanced-plate-plaza',
    title: 'Rainbow Wraps',
    description: 'A wrap loaded with colorful veggies, hummus or avocado, and a tangy dressing.',
    emoji: '🌯',
  },
  'reading-labels': {
    id: 'labels-aisle-adventure',
    title: 'My Perfect Sandwich',
    description: 'Stack bread, cheese, protein, and greens your way — use label smarts to pick ingredients you trust.',
    emoji: '🥪',
  },
  'fiber-prebiotics-probiotics': {
    id: 'gut-microbe-mines',
    title: 'Health Rizz Pickles',
    description: 'Crispy refrigerator pickles with cucumber and onion — tangy, crunchy, and great for your gut buddies.',
    emoji: '🥒',
  },
  'recap-habits': {
    id: 'habits-habit-haven',
    title: 'Germ Buster Smoothie',
    description: 'Strawberry, mango, banana, and yogurt blended smooth.',
    emoji: '🥤',
  },
};

/** One recipe per island, ordered to match the map's curriculum order (Splash Springs first). */
export const ISLAND_RECIPES: IslandRecipe[] = CANONICAL_SESSIONS.map((session) => ({
  ...RECIPE_BY_TOPIC[session.topicKey],
  topicKey: session.topicKey,
  islandName: session.sessionTitle,
}));

export function getIslandRecipeByTopic(topicKey: TopicKey): IslandRecipe | undefined {
  return ISLAND_RECIPES.find((r) => r.topicKey === topicKey);
}

export function getIslandRecipeById(recipeId: string): IslandRecipe | undefined {
  return ISLAND_RECIPES.find((r) => r.id === recipeId);
}
