/**
 * Map-node completion, backed by the real Supabase `child_map_progress`
 * table (child_id + node_id, unique per pair). No local/demo fallback —
 * a child row must exist first (created at onboarding completion, see
 * app/onboarding/persona.tsx + stores/childStore.ts).
 */
import { supabase } from '@core/supabase/client';

export async function completeNode(
  childId: string,
  nodeId: string,
  starsEarned: number,
  xpEarned: number
): Promise<void> {
  const { error } = await supabase.from('child_map_progress').upsert(
    {
      child_id: childId,
      node_id: nodeId,
      completed_at: new Date().toISOString(),
      stars_earned: starsEarned,
      xp_earned: xpEarned,
    },
    { onConflict: 'child_id,node_id' }
  );
  if (error) {
    console.warn('Failed to record node completion:', error.message);
  }
}

export async function fetchNodeCompletion(
  childId: string,
  nodeIds: string[]
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('child_map_progress')
    .select('node_id')
    .eq('child_id', childId)
    .in('node_id', nodeIds)
    .not('completed_at', 'is', null);
  if (error) {
    console.warn('Failed to fetch node completion:', error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r: { node_id: string }) => r.node_id));
}
