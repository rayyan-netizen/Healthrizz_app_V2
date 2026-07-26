/**
 * Map-node completion, backed by the real Supabase `child_map_progress`
 * table (child_id + node_id, unique per pair). No local/demo fallback —
 * a child row must exist first (created at onboarding completion, see
 * app/onboarding/persona.tsx + stores/childStore.ts).
 *
 * The live table's columns are narrower than the webapp's migration file
 * describes (checked via the PostgREST OpenAPI schema): only id, child_id,
 * node_id, completed_at, stars_earned actually exist — no xp_earned,
 * started_at, is_practice, or practice_count. xp is tracked client-side
 * only for now (the celebration modal's xpEarned prop), not persisted.
 *
 * node_id also has a real FK to map_nodes.id, which is NOT the fixture
 * slug ('water-lesson') the rest of this app uses for content lookup —
 * it's `node-<lessons.id-uuid>`, following the webapp's own seed-map.ts
 * convention. map_nodes was completely empty in production (its seed
 * script's hardcoded lesson slug doesn't match any real lesson row), so
 * two rows were inserted by hand for Splash Springs only, matching that
 * convention against the real `lessons` rows (slugs water-lesson /
 * water-quiz). REAL_NODE_ID below is the fixture-slug -> real-id lookup;
 * add an entry here (and matching map_nodes rows) for each session as
 * it gets real content.
 */
import { supabase } from '@core/supabase/client';

const REAL_NODE_ID: Record<string, string> = {
  'water-lesson': 'node-d142f583-f6e8-475e-b19f-680c336f5d1c',
  'water-quiz': 'node-d142f583-f6e8-475e-b19f-680c336f5d1c-quiz',
};

function resolveNodeId(fixtureNodeId: string): string {
  return REAL_NODE_ID[fixtureNodeId] ?? fixtureNodeId;
}

export async function completeNode(
  childId: string,
  nodeId: string,
  starsEarned: number
): Promise<void> {
  const { error } = await supabase.from('child_map_progress').upsert(
    {
      child_id: childId,
      node_id: resolveNodeId(nodeId),
      completed_at: new Date().toISOString(),
      stars_earned: starsEarned,
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
  const realIds = nodeIds.map(resolveNodeId);
  const { data, error } = await supabase
    .from('child_map_progress')
    .select('node_id')
    .eq('child_id', childId)
    .in('node_id', realIds)
    .not('completed_at', 'is', null);
  if (error) {
    console.warn('Failed to fetch node completion:', error.message);
    return new Set();
  }
  const completedReal = new Set((data ?? []).map((r: { node_id: string }) => r.node_id));
  return new Set(nodeIds.filter((id) => completedReal.has(resolveNodeId(id))));
}
