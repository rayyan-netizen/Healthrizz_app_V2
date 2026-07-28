/**
 * Profile screen data. Deliberately does NOT read `children.stars_earned`,
 * `current_streak`, or `longest_streak` — those columns exist on the real
 * table (confirmed against the live schema) but no code path anywhere in
 * this app ever writes to them, so they'd just show stale zeros. Streaks
 * and totals are computed client-side from real habit logs instead (same
 * math the Habits tab already uses), and "islands completed" is derived
 * from the same child_map_progress completion check the submap and
 * Recipes tab use — no new Supabase surface, just the columns that are
 * actually kept up to date.
 */
import { supabase } from '@core/supabase/client';
import { fetchNodeCompletion } from '@core/map/progress';
import { CANONICAL_SESSIONS, type TopicKey } from '@core/map/data/canonicalSessions';
import type { PersonaId } from '@core/types/persona';

export interface ChildSummary {
  nickname: string;
  primaryPersona: PersonaId | null;
}

export async function fetchChildSummary(childId: string): Promise<ChildSummary | null> {
  const { data, error } = await supabase
    .from('children')
    .select('nickname, primary_persona')
    .eq('id', childId)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn('fetchChildSummary error', error.message);
    return null;
  }
  return { nickname: data.nickname, primaryPersona: data.primary_persona ?? null };
}

/** Which islands this child has finished (completed that island's game node). */
export async function fetchCompletedTopicKeys(childId: string): Promise<Set<TopicKey>> {
  const gameNodeIds = CANONICAL_SESSIONS.map((s) => `${s.topicKey}-game`);
  const completed = await fetchNodeCompletion(childId, gameNodeIds);
  const topics = new Set<TopicKey>();
  for (const s of CANONICAL_SESSIONS) {
    if (completed.has(`${s.topicKey}-game`)) topics.add(s.topicKey);
  }
  return topics;
}
