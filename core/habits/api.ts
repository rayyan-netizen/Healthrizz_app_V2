import { supabase } from '@core/supabase/client';

export type HabitType = 'hydro' | 'phyto' | 'pro';

export interface HabitDef {
  id: HabitType;
  title: string;
  emoji: string;
  goalLabel: string;
  bgColor: string;
  rizzlerImageKey: 'hydro' | 'phyto' | 'pro';
}

export const HABIT_DEFS: HabitDef[] = [
  {
    id: 'hydro',
    title: 'Hydro Rizzler',
    emoji: '💧',
    goalLabel: 'Drink water',
    bgColor: '#DBEAFE',
    rizzlerImageKey: 'hydro',
  },
  {
    id: 'phyto',
    title: 'Phyto Rizzler',
    emoji: '🌈',
    goalLabel: 'Eat colorful plants',
    bgColor: '#DCFCE7',
    rizzlerImageKey: 'phyto',
  },
  {
    id: 'pro',
    title: 'Pro Rizzler',
    emoji: '💪',
    goalLabel: 'Power up with protein',
    bgColor: '#FFEDD5',
    rizzlerImageKey: 'pro',
  },
];

function todayDate(): string {
  return dateString(new Date());
}

/** DB stores `hydro_rizzler` / `phyto_rizzler` / `pro_rizzler`; client uses short keys. */
const TO_DB: Record<HabitType, string> = {
  hydro: 'hydro_rizzler',
  phyto: 'phyto_rizzler',
  pro: 'pro_rizzler',
};
const FROM_DB: Record<string, HabitType> = {
  hydro_rizzler: 'hydro',
  phyto_rizzler: 'phyto',
  pro_rizzler: 'pro',
  // Tolerate already-short rows (older seeds).
  hydro: 'hydro',
  phyto: 'phyto',
  pro: 'pro',
};

function dateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface HabitDay {
  hydro: boolean;
  phyto: boolean;
  pro: boolean;
  date: string;
}

export interface HabitLog {
  habit_type: HabitType;
  tracked_date: string;
  completed: boolean;
}

export async function fetchTodayHabits(childId: string): Promise<HabitDay> {
  const date = todayDate();
  const { data, error } = await supabase
    .from('habit_tracking')
    .select('habit_type, completed')
    .eq('child_id', childId)
    .eq('tracked_date', date);

  if (error) {
    console.warn('fetchTodayHabits error', error.message);
    return { hydro: false, phyto: false, pro: false, date };
  }

  const map: Record<HabitType, boolean> = { hydro: false, phyto: false, pro: false };
  (data ?? []).forEach((row: { habit_type: string; completed: boolean }) => {
    const key = FROM_DB[row.habit_type];
    if (key) map[key] = row.completed;
  });
  return { hydro: map.hydro, phyto: map.phyto, pro: map.pro, date };
}

export async function fetchHabitLogs(
  childId: string,
  daysBack: number = 60
): Promise<HabitLog[]> {
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  const { data, error } = await supabase
    .from('habit_tracking')
    .select('habit_type, tracked_date, completed')
    .eq('child_id', childId)
    .gte('tracked_date', dateString(start));
  if (error) return [];
  return (data ?? [])
    .map((row: { habit_type: string; tracked_date: string; completed: boolean }) => {
      const habit = FROM_DB[row.habit_type];
      if (!habit) return null;
      return { habit_type: habit, tracked_date: row.tracked_date, completed: row.completed };
    })
    .filter((r): r is HabitLog => r !== null);
}

/** Returns whether the write succeeded, so callers can roll back optimistic state. */
export async function setHabit(
  childId: string,
  habit: HabitType,
  completed: boolean
): Promise<boolean> {
  const date = todayDate();
  const { error } = await supabase.from('habit_tracking').upsert(
    {
      child_id: childId,
      habit_type: TO_DB[habit],
      tracked_date: date,
      completed,
    },
    { onConflict: 'child_id,habit_type,tracked_date' }
  );
  if (error) {
    console.warn('setHabit error', error.message);
    return false;
  }
  return true;
}

/** Which habits this child picked as goals during onboarding (drives the "My Goal" badge). */
export async function fetchActiveGoals(childId: string): Promise<HabitType[]> {
  const { data, error } = await supabase
    .from('children')
    .select('active_goals')
    .eq('id', childId)
    .maybeSingle();
  if (error || !data?.active_goals) return [];
  const goals: string[] = data.active_goals;
  return goals
    .map((g) => FROM_DB[g] ?? FROM_DB[g.replace(/_rizzler$/, '')])
    .filter((g): g is HabitType => !!g);
}

export interface HabitStats {
  streaks: Record<HabitType, number>;
  longestStreak: number;
  totalDaysTracked: number;
}

/**
 * Compute current/longest streaks + total days from a flat array of logs.
 * Mirrors web's `computeStreaksFromRows`.
 */
export function computeHabitStats(logs: HabitLog[]): HabitStats {
  const streaks: Record<HabitType, number> = {
    hydro: 0,
    phyto: 0,
    pro: 0,
  };
  let maxLongest = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byType = new Map<HabitType, Map<string, boolean>>();
  for (const row of logs) {
    if (!byType.has(row.habit_type)) byType.set(row.habit_type, new Map());
    byType.get(row.habit_type)!.set(row.tracked_date, row.completed);
  }

  for (const ht of ['hydro', 'phyto', 'pro'] as HabitType[]) {
    const dateMap = byType.get(ht);
    if (!dateMap) continue;

    let cur = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dateMap.get(dateString(d))) cur++;
      else break;
    }
    streaks[ht] = cur;

    const sortedDates = [...dateMap.entries()]
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort();
    let temp = 0;
    let prev: Date | null = null;
    for (const ds of sortedDates) {
      const cur2 = new Date(ds + 'T00:00:00');
      if (prev && cur2.getTime() - prev.getTime() === 86400000) temp++;
      else temp = 1;
      maxLongest = Math.max(maxLongest, temp);
      prev = cur2;
    }
  }

  const uniqueCompletedDates = new Set<string>();
  for (const log of logs) {
    if (log.completed) uniqueCompletedDates.add(log.tracked_date);
  }

  return {
    streaks,
    longestStreak: maxLongest,
    totalDaysTracked: uniqueCompletedDates.size,
  };
}

/**
 * Given habit logs, derive per-day completion map for calendar rendering.
 * Returns map of YYYY-MM-DD → array of completed habit types.
 */
export function logsByDay(logs: HabitLog[]): Map<string, HabitType[]> {
  const out = new Map<string, HabitType[]>();
  for (const log of logs) {
    if (!log.completed) continue;
    if (!out.has(log.tracked_date)) out.set(log.tracked_date, []);
    out.get(log.tracked_date)!.push(log.habit_type);
  }
  return out;
}
