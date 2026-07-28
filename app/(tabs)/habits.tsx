import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useChildStore } from '@stores/childStore';
import {
  HABIT_DEFS,
  fetchTodayHabits,
  fetchHabitLogs,
  fetchActiveGoals,
  setHabit,
  computeHabitStats,
  type HabitType,
  type HabitDay,
  type HabitLog,
  type HabitStats,
  type HabitDef,
} from '@core/habits/api';
import { HabitCalendar } from '@components/habits/HabitCalendar';
import { DayDetailPanel } from '@components/habits/DayDetailPanel';
import { ASSETS } from '@lib/assets';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  BG,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
} from '@lib/theme';
import { hapticSuccess, hapticLight, hapticError } from '@lib/haptic';

export default function HabitsScreen() {
  const childId = useChildStore((s) => s.childId);

  const [activeGoalIds, setActiveGoalIds] = useState<Set<HabitType>>(new Set());
  const [habits, setHabits] = useState<HabitDay | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    const [h, l, goals] = await Promise.all([
      fetchTodayHabits(childId),
      fetchHabitLogs(childId, 60),
      fetchActiveGoals(childId),
    ]);
    setHabits(h);
    setLogs(l);
    setActiveGoalIds(new Set(goals));
    setLoading(false);
    setRefreshing(false);
  }, [childId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const stats: HabitStats = useMemo(() => computeHabitStats(logs), [logs]);

  const toggle = async (habit: HabitType) => {
    if (!habits || !childId) return;
    const prevHabits = habits;
    const prevLogs = logs;
    const next = !habits[habit];

    setHabits({ ...habits, [habit]: next });
    if (next) hapticSuccess();
    else hapticLight();

    // Optimistically update logs for streak recompute
    const todayStr = habits.date;
    const idx = logs.findIndex(
      (l) => l.habit_type === habit && l.tracked_date === todayStr
    );
    setLogs(
      idx >= 0
        ? logs.map((l, i) => (i === idx ? { ...l, completed: next } : l))
        : [...logs, { habit_type: habit, tracked_date: todayStr, completed: next }]
    );

    const ok = await setHabit(childId, habit, next);
    if (!ok) {
      // Write failed — roll back to pre-toggle state instead of drifting from the server.
      setHabits(prevHabits);
      setLogs(prevLogs);
      hapticError();
    }
  };

  if (!childId || loading || !habits) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </SafeAreaView>
    );
  }

  const completedCount = HABIT_DEFS.filter((d) => habits[d.id]).length;
  const total = HABIT_DEFS.length;
  const allDone = completedCount === total;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.LG,
          paddingBottom: SPACING.XXL * 2,
          gap: SPACING.LG,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today header */}
        <View>
          <Text style={styles.title}>Today's habits</Text>
          <Text style={styles.subtitle}>
            {completedCount} of {total} done
            {allDone ? ' — way to go!' : ''}
          </Text>
        </View>

        {/* All-done banner */}
        {allDone && (
          <View style={styles.allDoneBanner}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.allDoneTitle}>All done today!</Text>
              <Text style={styles.allDoneBody}>
                Tap a date below to see past days.
              </Text>
            </View>
          </View>
        )}

        {/* All 3 habit cards — chosen ones get a "My Goal" badge */}
        <View style={styles.habitsList}>
          {HABIT_DEFS.map((def) => (
            <HabitToggleCard
              key={def.id}
              def={def}
              done={habits[def.id]}
              streak={stats.streaks[def.id]}
              isGoal={activeGoalIds.has(def.id)}
              onToggle={() => toggle(def.id)}
            />
          ))}
        </View>

        {/* Calendar section */}
        <View style={styles.calendarHeader}>
          <View style={styles.calendarDivider} />
          <Text style={styles.calendarTitle}>📅 History</Text>
          <View style={styles.calendarDivider} />
        </View>

        <HabitCalendar
          logs={logs}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            hapticLight();
            setSelectedDate(d === selectedDate ? null : d);
          }}
        />

        {/* Day detail panel */}
        {selectedDate && (
          <DayDetailPanel
            date={selectedDate}
            logs={logs}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Streak pip config ---
const CYCLE = 5;
const PIP_ICON: Record<HabitType, string> = {
  hydro: '💧',
  phyto: '🌿',
  pro: '⚡',
};
const PIP_COLOR: Record<HabitType, string> = {
  hydro: '#3B82F6',
  phyto: '#22C55E',
  pro: '#F97316',
};

interface ToggleCardProps {
  def: HabitDef;
  done: boolean;
  streak: number;
  isGoal: boolean;
  onToggle: () => void;
}

function HabitToggleCard({ def, done, streak, isGoal, onToggle }: ToggleCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const img =
    def.rizzlerImageKey === 'hydro'
      ? ASSETS.brand.mascots.hydro
      : def.rizzlerImageKey === 'phyto'
      ? ASSETS.brand.mascots.phyto
      : ASSETS.brand.mascots.pro;

  // Pips fill up to 5 and stay full — never reset
  const pipsActive = Math.min(streak, CYCLE);
  const pipColor = PIP_COLOR[def.id];

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={() => {
        scale.value = withSpring(1.04, undefined, () => {
          scale.value = withSpring(1);
        });
        onToggle();
      }}
    >
      <Animated.View
        style={[
          styles.habitCard,
          { backgroundColor: def.bgColor },
          done && styles.habitCardDone,
          animStyle,
          SHADOW.CARD,
        ]}
      >
        {/* Top row: mascot + title + check */}
        <View style={styles.habitTop}>
          <Image source={img} style={styles.habitMascot} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <View style={styles.habitTitleRow}>
              <Text style={styles.habitTitle}>{def.title}</Text>
              {isGoal && (
                <View style={styles.goalBadge}>
                  <Text style={styles.goalBadgeText}>⭐ My Goal</Text>
                </View>
              )}
            </View>
            <Text style={styles.habitGoal}>{def.goalLabel}</Text>
          </View>
          <View style={[styles.checkbox, done && styles.checkboxDone]}>
            {done && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.habitDivider} />

        {/* Bottom row: pips + streak label */}
        <View style={styles.habitBottom}>
          {/* 5 pips */}
          <View style={styles.pipRow}>
            {Array.from({ length: CYCLE }).map((_, i) => {
              const filled = i < pipsActive;
              return (
                <View
                  key={i}
                  style={[
                    styles.pip,
                    filled
                      ? { backgroundColor: pipColor, borderColor: pipColor }
                      : { backgroundColor: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.12)' },
                  ]}
                >
                  <Text style={[styles.pipIcon, !filled && { opacity: 0.35 }]}>
                    {PIP_ICON[def.id]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Streak info */}
          <View style={styles.streakInfo}>
            {streak === 0 ? (
              <Text style={styles.streakLabel}>Start today!</Text>
            ) : (
              <Text style={styles.streakCount}>🔥 {streak} day{streak !== 1 ? 's' : ''}</Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG.warm,
  },
  title: {
    fontFamily: FONT.brand,
    fontSize: 28,
    color: TEXT.DEFAULT,
  },
  subtitle: {
    fontFamily: FONT.body,
    color: TEXT.tertiary,
    fontSize: 16,
    marginTop: 2,
  },
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    backgroundColor: '#DCFCE7',
    borderColor: SECONDARY[300],
    borderWidth: 2,
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.MD,
  },
  allDoneEmoji: { fontSize: 32 },
  allDoneTitle: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: SECONDARY[700],
  },
  allDoneBody: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: SECONDARY[600],
    marginTop: 2,
  },
  habitsList: { gap: SPACING.SM },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  calendarDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  calendarTitle: {
    fontFamily: FONT.brand,
    fontSize: 16,
    color: TEXT.tertiary,
  },
  habitCard: {
    padding: SPACING.MD,
    borderRadius: BORDERS.RADIUS.XL,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.SM,
  },
  habitCardDone: {
    borderColor: SECONDARY[500],
  },
  habitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  habitMascot: {
    width: 52,
    height: 52,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    flexWrap: 'wrap',
  },
  goalBadge: {
    backgroundColor: '#FEF9C3',
    borderRadius: BORDERS.RADIUS.FULL,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  goalBadgeText: {
    fontFamily: FONT.bodyBold,
    fontSize: 10,
    color: '#854D0E',
  },
  habitTitle: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: TEXT.DEFAULT,
  },
  habitGoal: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 2,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: BORDERS.RADIUS.MEDIUM,
    borderWidth: 3,
    borderColor: TEXT.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: SECONDARY[500],
    borderColor: SECONDARY[700],
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: FONT.brand,
  },
  habitDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginHorizontal: 2,
  },
  habitBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  pipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipIcon: {
    fontSize: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  streakCount: {
    fontFamily: FONT.bodyBold,
    fontSize: 13,
    color: TEXT.DEFAULT,
  },
  streakLabel: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: TEXT.tertiary,
    fontStyle: 'italic',
  },
});
