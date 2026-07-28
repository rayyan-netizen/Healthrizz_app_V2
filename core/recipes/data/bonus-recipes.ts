/**
 * Bonus recipes from the Kids Recipe Book. No unlock gate — there's no coin
 * economy in this app yet, so these are just always-available extra content.
 * Ported from HealthRizz-Mobile's core/recipes/data/bonus-recipes.ts.
 */

export interface BonusRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const BONUS_RECIPES: BonusRecipe[] = [
  { id: 'krb-grilled-chicken-skewers', title: 'Grilled Chicken Skewers', description: 'Tasty grilled chicken skewers with colorful veggies.', emoji: '🍗' },
  { id: 'krb-banana-oat-pancakes', title: 'Banana Oat Pancakes', description: 'Fluffy pancakes made with oats and banana.', emoji: '🥞' },
  { id: 'krb-whole-grain-pasta', title: 'Whole Grain Pasta Bowl', description: 'Whole grain pasta with a veggie-packed sauce.', emoji: '🍝' },
  { id: 'krb-avocado-toast', title: 'Avocado Toast Bites', description: 'Crunchy avocado toast topped with seeds.', emoji: '🥑' },
  { id: 'krb-trail-mix', title: 'Brain Boost Trail Mix', description: 'A mix of nuts, seeds, and dark chocolate.', emoji: '🥜' },
  { id: 'krb-bento-box', title: 'My Perfect Bento Box', description: 'A balanced lunch box with protein, grains, veggies, and fruit.', emoji: '🍱' },
  { id: 'krb-rainbow-stir-fry', title: 'Rainbow Stir-Fry', description: 'Colorful stir-fry with balanced macros.', emoji: '🥘' },
  { id: 'krb-smart-snack-plate', title: 'Smart Snack Plate', description: 'A snack plate built by reading labels wisely.', emoji: '📋' },
];

export function getBonusRecipeById(recipeId: string): BonusRecipe | undefined {
  return BONUS_RECIPES.find((r) => r.id === recipeId);
}
