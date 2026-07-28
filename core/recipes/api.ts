/**
 * Recipes are static fixture data (island-recipes.ts + bonus-recipes.ts) —
 * same pattern as core/map/data/canonicalSessions.ts. There's no `recipes`
 * table backing this yet.
 *
 * Unlock rule: a bonus recipe is always unlocked (no coin economy exists in
 * this app). An island recipe unlocks the moment that island's game node is
 * completed — reuses the same `child_map_progress` completion check the
 * submap screen already uses, so today only Splash Springs' "Health Rizz
 * Soda" can actually unlock; the other 8 islands' recipes stay locked until
 * their map content is built (their game nodes can't ever complete).
 */
import { fetchNodeCompletion } from '@core/map/progress';
import { ISLAND_RECIPES, getIslandRecipeById } from './data/island-recipes';
import { BONUS_RECIPES, getBonusRecipeById } from './data/bonus-recipes';

export interface RecipeRow {
  id: string;
  title: string;
  description: string;
  emoji: string;
  islandName: string | null;
  isBonus: boolean;
}

function gameNodeId(topicKey: string): string {
  return `${topicKey}-game`;
}

export function getAllRecipes(): RecipeRow[] {
  const island: RecipeRow[] = ISLAND_RECIPES.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    emoji: r.emoji,
    islandName: r.islandName,
    isBonus: false,
  }));
  const bonus: RecipeRow[] = BONUS_RECIPES.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    emoji: b.emoji,
    islandName: null,
    isBonus: true,
  }));
  return [...island, ...bonus];
}

export function getRecipeById(recipeId: string): RecipeRow | undefined {
  const island = getIslandRecipeById(recipeId);
  if (island) {
    return {
      id: island.id,
      title: island.title,
      description: island.description,
      emoji: island.emoji,
      islandName: island.islandName,
      isBonus: false,
    };
  }
  const bonus = getBonusRecipeById(recipeId);
  if (bonus) {
    return {
      id: bonus.id,
      title: bonus.title,
      description: bonus.description,
      emoji: bonus.emoji,
      islandName: null,
      isBonus: true,
    };
  }
  return undefined;
}

/** Which island a locked recipe belongs to, so the UI can point back at the right map node. */
export function getRecipeTopicKey(recipeId: string): string | undefined {
  return getIslandRecipeById(recipeId)?.topicKey;
}

export async function fetchUnlockedRecipeIds(childId: string): Promise<Set<string>> {
  const gameNodeIds = ISLAND_RECIPES.map((r) => gameNodeId(r.topicKey));
  const completed = await fetchNodeCompletion(childId, gameNodeIds);

  const unlocked = new Set<string>(BONUS_RECIPES.map((b) => b.id));
  for (const r of ISLAND_RECIPES) {
    if (completed.has(gameNodeId(r.topicKey))) unlocked.add(r.id);
  }
  return unlocked;
}
