/**
 * Bottom-sheet style panel showing which habits were completed on a given day.
 * Mirrors web's `DayDetailPanel`. Read-only for past days, editable for today.
 */
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  HABIT_DEFS,
  logsByDay,
  type HabitLog,
  type HabitType,
} from '@core/habits/api';
import { ASSETS } from '@lib/assets';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
} from '@lib/theme';

interface Props {
  date: string;
  logs: HabitLog[];
  onClose: () => void;
}

function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function isToday(d: string): boolean {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return d === `${y}-${m}-${day}`;
}

export function DayDetailPanel({ date, logs, onClose }: Props) {
  const completedToday = useMemo(() => {
    const map = logsByDay(logs);
    return map.get(date) ?? [];
  }, [date, logs]);

  const total = HABIT_DEFS.length;
  const done = completedToday.length;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.panel}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{formatDate(date)}</Text>
          <Text style={styles.subtitle}>
            {done === total
              ? `🎉 All ${total} done!`
              : done === 0
              ? 'No habits logged.'
              : `${done} of ${total} done`}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {HABIT_DEFS.map((def) => {
          const completed = completedToday.includes(def.id as HabitType);
          const img =
            def.rizzlerImageKey === 'hydro'
              ? ASSETS.brand.mascots.hydro
              : def.rizzlerImageKey === 'phyto'
              ? ASSETS.brand.mascots.phyto
              : ASSETS.brand.mascots.pro;
          return (
            <View
              key={def.id}
              style={[
                styles.row,
                {
                  backgroundColor: completed ? def.bgColor : '#F9FAFB',
                  borderColor: completed ? SECONDARY[400] : '#E5E7EB',
                },
              ]}
            >
              <Image
                source={img}
                style={[styles.rowMascot, !completed && styles.rowMascotMuted]}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, !completed && styles.rowTitleMuted]}>
                  {def.title}
                </Text>
                <Text style={styles.rowGoal}>{def.goalLabel}</Text>
              </View>
              {completed ? (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              ) : (
                <Text style={styles.skipped}>—</Text>
              )}
            </View>
          );
        })}
      </View>

      {!isToday(date) && (
        <Text style={styles.helper}>
          Past days are read-only. Track today's habits above!
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.MD,
    marginTop: SPACING.SM,
    borderWidth: 1,
    borderColor: PRIMARY[100],
    ...SHADOW.CARD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  date: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: TEXT.DEFAULT,
  },
  subtitle: {
    fontFamily: FONT.bodyBold,
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 2,
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  closeText: {
    fontSize: 18,
    color: TEXT.tertiary,
  },
  list: { gap: SPACING.XS },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.SM,
    borderRadius: BORDERS.RADIUS.MEDIUM,
    borderWidth: 1,
    gap: SPACING.SM,
  },
  rowMascot: {
    width: 36,
    height: 36,
  },
  rowMascotMuted: {
    opacity: 0.4,
  },
  rowTitle: {
    fontFamily: FONT.brand,
    fontSize: 14,
    color: TEXT.DEFAULT,
  },
  rowTitleMuted: {
    color: TEXT.muted,
  },
  rowGoal: {
    fontFamily: FONT.body,
    fontSize: 11,
    color: TEXT.tertiary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SECONDARY[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontFamily: FONT.brand,
    fontSize: 16,
  },
  skipped: {
    fontSize: 16,
    color: TEXT.muted,
  },
  helper: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: TEXT.muted,
    textAlign: 'center',
    marginTop: SPACING.SM,
    fontStyle: 'italic',
  },
});
